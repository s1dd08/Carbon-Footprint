const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const carbonRoutes = require("./routes/carbonRoutes");
app.use("/api/carbon", carbonRoutes);   

app.get("/", (req, res) => {
  res.send("Carbon Footprint Backend Running 🚀");
});

// Test DB connection route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected successfully ✅",
      time: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database connection failed ❌" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});