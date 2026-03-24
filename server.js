const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────
app.use("/api/payment", require("./routes/payment"));

// Health check
app.get("/", (req, res) => res.json({ status: "BaujiXSensi Backend Running ✅" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
