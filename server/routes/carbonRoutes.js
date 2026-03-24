const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Add Monthly Record
router.post("/add-record", async (req, res) => {
  try {
    const {
      user_id,
      month,
      transport_emission = 0,
      electricity_emission = 0,
      food_emission = 0,
      lpg_emission = 0,
      eco_score = 0,
      estimated_spent = 0 
    } = req.body;

    const total_emission =
      transport_emission + electricity_emission + food_emission + lpg_emission;

    const newRecord = await pool.query(
      `INSERT INTO monthly_records 
      (user_id, month, transport_emission, electricity_emission, food_emission, lpg_emission, total_emission, estimated_spent, eco_score) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
      RETURNING *`,
      [
        user_id,
        month,
        transport_emission,
        electricity_emission,
        food_emission,
        lpg_emission,
        total_emission,
        estimated_spent,
        eco_score
      ]
    );

    res.json(newRecord.rows[0]);

  } catch (err) {
    console.error("Error in add-record:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI Suggestion Engine
router.post("/ai-suggest", (req, res) => {
  try {
    const {
      transport_emission,
      electricity_emission,
      food_emission,
      lpg_emission = 0, // Added LPG
      transport_cost,
      electricity_cost,
      food_cost,
      lpg_cost = 0 // Added LPG
    } = req.body;

    let suggestion = "";
    let potential_savings = 0;
    let category = "";

    // Identify the highest emission source. 
    // Excluded food_emission here to prevent the AI from constantly defaulting to diet reductions.
    const maxEmission = Math.max(transport_emission, electricity_emission, lpg_emission);

    if (maxEmission === transport_emission && transport_emission > 0) {
      category = "Transport";
      suggestion = "Switching to public transit or carpooling just twice a week can drastically cut your transport footprint.";
      potential_savings = transport_cost * 0.30; 
    } else if (maxEmission === electricity_emission && electricity_emission > 0) {
      category = "Electricity";
      suggestion = "Adjusting your AC by 2 degrees and unplugging idle electronics can significantly lower your grid reliance.";
      potential_savings = electricity_cost * 0.15; 
    } else if (maxEmission === lpg_emission && lpg_emission > 0) {
      // Added specific LPG suggestion
      category = "LPG Cooking";
      suggestion = "Using pressure cookers and keeping burner grates clean can optimize your LPG usage and reduce emissions.";
      potential_savings = lpg_cost * 0.15; 
    } else {
      category = "General";
      suggestion = "You have a very low carbon footprint! Keep maintaining your current eco-friendly habits.";
      potential_savings = 0;
    }

    res.json({
      category,
      suggestion,
      potential_savings
    });

  } catch (err) {
    console.error("Error in ai-suggest:", err);
    res.status(500).json({ error: "Error generating AI suggestion" });
  }
});

// Get ALL records
router.get("/all", async (req, res) => {
  try {
    // Kept DESC for dashboard table views if needed
    const result = await pool.query(
      "SELECT * FROM monthly_records ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Latest Record (Dashboard)
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      "SELECT * FROM monthly_records WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.json({ message: "No data found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get User History (Used by CarbonChart and UserHistory)
router.get("/records/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // CHANGED: ORDER BY created_at ASC. 
    // This ensures your Chart.js component plots the data left-to-right properly.
    const records = await pool.query(
      "SELECT * FROM monthly_records WHERE user_id = $1 ORDER BY created_at ASC",
      [user_id]
    );

    res.json(records.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Set Carbon Budget
router.post("/set-budget", async (req, res) => {
  try {
    const { user_id, monthly_limit } = req.body;
    const budget = await pool.query(
      `INSERT INTO carbon_budget (user_id, monthly_limit)
       VALUES ($1,$2) RETURNING *`,
      [user_id, monthly_limit]
    );
    res.json(budget.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get Budget
router.get("/budget/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const budget = await pool.query(
      "SELECT * FROM carbon_budget WHERE user_id = $1",
      [user_id]
    );
    res.json(budget.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;