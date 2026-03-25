const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const admin = require("../firebase/admin");
const { sendPackEmail } = require("../services/brevo");

// ─── CREATE ORDER (Cashfree) ─────────────────────────────
router.post("/create-order", async (req, res) => {
  try {
    const { amount, productId, customerEmail } = req.body;

    // ✅ Validation
    if (!amount || !customerEmail) {
      return res.status(400).json({ error: "amount aur email required hai" });
    }

    const orderId = "order_" + Date.now();

    // 🔹 Cashfree API call
    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01"
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: "user_" + Date.now(),
          customer_email: customerEmail,
          customer_phone: "9999999999"
        }
      })
    });

    const data = await response.json();

    if (!data.payment_session_id) {
      return res.status(500).json({ error: "Cashfree session failed" });
    }

    // ✅ Frontend ko session bhejo
    res.json({
      payment_session_id: data.payment_session_id
    });

  } catch (err) {
    console.error("Cashfree order error:", err);
    res.status(500).json({ error: "Order create failed" });
  }
});


// ─── OPTIONAL: PAYMENT SUCCESS (future use - webhook/redirect) ─────────
router.post("/payment-success", async (req, res) => {
  try {
    const { userId, userEmail, userName, pack } = req.body;

    const db = admin.firestore();
    const orderId = `ORDER_${Date.now()}_${pack.id}`;

    // ✅ Save purchase
    await db.collection("users").doc(userId).set(
      { purchases: admin.firestore.FieldValue.arrayUnion(pack.id) },
      { merge: true }
    );

    // ✅ Save order
    await db.collection("orders").doc(orderId).set({
      userId,
      userEmail,
      userName: userName || "",
      packId: pack.id,
      packName: `${pack.title} - ${pack.device}`,
      price: pack.price,
      paymentId: "cashfree_" + Date.now(),
      timestamp: new Date().toISOString(),
      status: "completed",
    });

    // ✅ Send email
    const emailSent = await sendPackEmail(userEmail, userName, pack);

    res.json({
      success: true,
      emailSent
    });

  } catch (err) {
    console.error("Payment success error:", err);
    res.status(500).json({ success: false });
  }
});


// ─── RESEND EMAIL ───────────────────────────────────────
router.post("/resend", async (req, res) => {
  try {
    const { userEmail, userName, pack } = req.body;
    const emailSent = await sendPackEmail(userEmail, userName, pack);
    res.json({ success: emailSent });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
