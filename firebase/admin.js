const admin = require("firebase-admin");

// ✅ Firebase Admin — serviceAccountKey.json se initialize hoga
// Yeh file KABHI bhi GitHub pe push mat karna!
if (!admin.apps.length) {
  const serviceAccount = require("../serviceAccountKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
const admin = require("firebase-admin");

// ✅ Firebase Admin — serviceAccountKey.json se initialize hoga
// Yeh file KABHI bhi GitHub pe push mat karna!
if (!admin.apps.length) {
  const serviceAccount = require("../serviceAccountKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
