import React, { useState } from "react";
import "./EmissionForm.css";

function EmissionForm() {
  const [formData, setFormData] = useState({
    transport_km: "",
    vehicle: "Car",
    electricity_kwh: "",
    diet_type: "Mixed",
    month: "may",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ Transport emission calculation (kg CO₂)
    let factor = 0.21; // default Car petrol
    if (formData.vehicle === "Car (Diesel)") factor = 0.27;
    if (formData.vehicle === "Bike") factor = 0.05;
    if (formData.vehicle === "Bus") factor = 0.05;
    if (formData.vehicle === "Train") factor = 0.04;

    const transport_emission = formData.transport_km * factor;

    // 2️⃣ Electricity emission calculation (kg CO₂)
    // Average India electricity emission factor ≈ 0.82 kg CO₂ per kWh
    const electricity_emission = formData.electricity_kwh * 0.82;

    // 3️⃣ Food emission based on diet type
    let food_emission = 0;
    switch (formData.diet_type) {
      case "Vegetarian":
        food_emission = 15;
        break;
      case "Mixed":
        food_emission = 25;
        break;
      case "High Meat":
        food_emission = 40;
        break;
      default:
        food_emission = 25;
    }

    // 4️⃣ Total
    const total_emission =
      transport_emission + electricity_emission + food_emission;

    // 5️⃣ Eco score
    let eco_score;
    if (total_emission < 50) eco_score = 90;
    else if (total_emission < 100) eco_score = 75;
    else eco_score = 50;

    // 6️⃣ Money saved
    const money_saved = total_emission < 100 ? 500 : 200;

    // 7️⃣ Prepare data for backend
    const data = {
      user_id: 1,
      month: formData.month,
      transport_emission,
      electricity_emission,
      food_emission,
      total_emission,
      money_saved,
      eco_score,
    };

    await fetch("http://localhost:5000/api/carbon/add-record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    alert("Record Added Successfully!");
  };

  return (
    <div className="form-container">
      <h2>Add Monthly Emission</h2>
      <form onSubmit={handleSubmit}>
        {/* Month */}
        <select name="month" value={formData.month} onChange={handleChange}>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>

        {/* Transport Input */}
        <input
          type="number"
          name="transport_km"
          placeholder="Transport Distance (km)"
          value={formData.transport_km}
          onChange={handleChange}
          required
        />

        <select
          name="vehicle"
          value={formData.vehicle}
          onChange={handleChange}
        >
          <option value="Car">Car (Petrol)</option>
          <option value="Car (Diesel)">Car (Diesel)</option>
          <option value="Bike">Bike</option>
          <option value="Bus">Bus</option>
          <option value="Train">Train</option>
        </select>

        {/* Electricity Input */}
        <input
          type="number"
          name="electricity_kwh"
          placeholder="Electricity Usage (kWh)"
          value={formData.electricity_kwh}
          onChange={handleChange}
          required
        />

        {/* Diet Type */}
        <select
          name="diet_type"
          value={formData.diet_type}
          onChange={handleChange}
        >
          <option value="Vegetarian">Vegetarian</option>
          <option value="Mixed">Mixed</option>
          <option value="High Meat">High Meat</option>
        </select>

        <button type="submit">Save Record</button>
      </form>
    </div>
  );
}

export default EmissionForm;