const admin = require("firebase-admin");

let adminInstance;

try {
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_KEY) {
      throw new Error("FIREBASE_KEY missing");
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

    adminInstance = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    adminInstance = admin.app();
  }
} catch (error) {
  console.error("Firebase Init Error:", error.message);
}

module.exports = admin;
