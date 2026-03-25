const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS FIX
app.use(cors({
  origin: "https://baujixsensi.netlify.app",
  methods: ["GET", "POST"],
}));

app.use(express.json());

// Routes
app.use("/api/payment", require("./routes/payment"));

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Backend Running ✅" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
