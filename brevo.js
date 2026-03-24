const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));

/**
 * Brevo se pack delivery email bhejo
 * @param {string} userEmail
 * @param {string} userName
 * @param {object} pack - { title, device, price, features, driveLink }
 */
async function sendPackEmail(userEmail, userName, pack) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,  // ✅ Ab .env mein hai — safe!
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "BaujiXSensi",
          email: process.env.BREVO_SENDER_EMAIL || "askbaujiff@gmail.com",
        },
        to: [{ email: userEmail, name: userName || "Player" }],
        subject: `🎮 Your ${pack.title} (${pack.device}) is Here! - BaujiXSensi`,
        htmlContent: buildEmailHTML(userName, pack),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Brevo error response:", errText);
      return false;
    }

    console.log(`✅ Email sent to ${userEmail}`);
    return true;
  } catch (err) {
    console.error("Brevo sendPackEmail error:", err);
    return false;
  }
}

function buildEmailHTML(userName, pack) {
  const featuresHTML = (pack.features || [])
    .map(
      (f) =>
        `<p style="color:#aab0cc;font-size:13px;margin:4px 0;">
          <span style="color:#00ff88;">✔</span> ${f}
        </p>`
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#050508;font-family:Arial,sans-serif;">
      <div style="max-width:560px;margin:20px auto;background:#0d0d1a;border:1px solid rgba(255,0,255,0.2);border-radius:12px;overflow:hidden;">

        <div style="background:linear-gradient(135deg,#1a001a,#0d0d2a);padding:30px;text-align:center;border-bottom:2px solid #ff00ff;">
          <h1 style="color:#ff00ff;font-size:28px;margin:0;letter-spacing:3px;">BAUJI✕SENSI</h1>
          <p style="color:#aab0cc;font-size:13px;margin:6px 0 0;">Free Fire Sensi Packs</p>
        </div>

        <div style="padding:30px;">
          <h2 style="color:white;font-size:20px;margin-bottom:8px;">Hey ${userName || "Player"}! 🎮</h2>
          <p style="color:#aab0cc;font-size:14px;line-height:1.7;margin-bottom:20px;">
            Your purchase was successful! Here is your Sensi Pack. Get ready to dominate!
          </p>

          <div style="background:rgba(255,0,255,0.08);border:1px solid rgba(255,0,255,0.3);border-radius:8px;padding:18px;margin-bottom:24px;">
            <p style="color:#ff00ff;font-size:18px;font-weight:bold;margin:0 0 6px;">${pack.title} — ${pack.device}</p>
            <p style="color:#00ff88;font-size:15px;margin:0;">Amount Paid: ₹${pack.price}</p>
          </div>

          <div style="text-align:center;margin-bottom:24px;">
            <a href="${pack.driveLink}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#ff00ff,#cc00cc);color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;letter-spacing:1px;">
              ⚡ DOWNLOAD YOUR PACK
            </a>
          </div>

          <div style="background:rgba(255,204,0,0.08);border:1px solid rgba(255,204,0,0.3);border-radius:6px;padding:12px;margin-bottom:20px;">
            <p style="color:#ffcc00;font-size:13px;margin:0;">
              ⚠️ This link is for <strong>personal use only</strong>. Do not share or distribute.
            </p>
          </div>

          <div style="margin-bottom:20px;">${featuresHTML}</div>

          <p style="color:#aab0cc;font-size:13px;line-height:1.7;">
            Having trouble? Contact us at
            <a href="mailto:baujisensi54@gmail.com" style="color:#ff00ff;">baujisensi54@gmail.com</a>
          </p>
        </div>

        <div style="background:rgba(0,0,0,0.3);padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
          <p style="color:#555577;font-size:12px;margin:0;">© BaujiXSensi | baujisensi54@gmail.com</p>
          <p style="color:#555577;font-size:11px;margin:6px 0 0;">Thank you for your purchase! Good luck! 🏆</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = { sendPackEmail };
