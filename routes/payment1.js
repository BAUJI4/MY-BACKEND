const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const admin = require("../firebase/admin");
const { sendPackEmail } = require("../services/brevo");

// ─── Razorpay Instance ────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── POST /api/payment/create-order ──────────────────────
// Frontend se pack ka price aata hai, Razorpay order create hota hai
router.post("/create-order", async (req, res) => {
  try {
    const { amount, packId, packTitle, packDevice } = req.body;

    // Basic validation
    if (!amount || !packId) {
      return res.status(400).json({ error: "amount aur packId required hai" });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay paise mein leta hai
      currency: "INR",
      receipt: `receipt_${packId}_${Date.now()}`,
      notes: {
        pack_id: packId,
        pack_title: packTitle || "",
        pack_device: packDevice || "",
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,       // Frontend ko yeh return karo
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Order create karne mein error aaya" });
  }
});

// ─── POST /api/payment/verify ────────────────────────────
// Payment ke baad Razorpay signature verify karo, tab email bhejo
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      userEmail,
      userName,
      pack,           // { id, title, device, price, features, driveLink }
    } = req.body;

    // ─── 1. Signature Verify ───────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Invalid payment signature!" });
    }

    // ─── 2. Firebase mein order save karo ─────────────────
    const db = admin.firestore();
    const orderId = `ORDER_${Date.now()}_${pack.id}`;

    // User ke purchases array mein pack ID add karo
    await db.collection("users").doc(userId).set(
      { purchases: admin.firestore.FieldValue.arrayUnion(pack.id) },
      { merge: true }
    );

    // Orders collection mein save karo
    await db.collection("orders").doc(orderId).set({
      userId,
      userEmail,
      userName: userName || "",
      packId: pack.id,
      packName: `${pack.title} - ${pack.device}`,
      price: pack.price,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      timestamp: new Date().toISOString(),
      status: "completed",
    });

    // ─── 3. Brevo se email bhejo ───────────────────────────
    const emailSent = await sendPackEmail(userEmail, userName, pack);

    res.json({
      success: true,
      emailSent,
      paymentId: razorpay_payment_id,
      message: emailSent
        ? "Payment verified! Pack email bhej diya."
        : "Payment verified! Email thodi der mein aayegi.",
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ success: false, error: "Verification mein error aaya" });
  }
});
// ─── POST /api/payment/resend ─────────────────────────────
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
