import React, { useState, useEffect } from "react";
import "./CarbonCalculator.css";

// NEW: Accept the onCalculationComplete prop
function CarbonCalculator({ onCalculationComplete }) {
  const [inputs, setInputs] = useState({
    month: "January",
    transport_km: "",
    vehicle: "Car (Petrol)",
    electricity_kwh: "",
    diet_type: "Mixed",
    lpg_cylinders: "", 
  });

  const transportFactors = {
    "Car (Petrol)": 0.19,
    "Car (Diesel)": 0.17,
    "Bike": 0.09,
    "Bus": 0.10,
    "Train": 0.04
  };

  const dietFactors = {
    "Vegetarian": 3.5,
    "Mixed": 5,
    "High Meat": 7
  };

  const transportCostsPerKm = {
    "Car (Petrol)": 10,
    "Car (Diesel)": 8,
    "Bike": 2.5,
    "Bus": 1.5,
    "Train": 1
  };
  
  const electricityCostPerKwh = 8;
  const dietMonthlyCosts = {
    "Vegetarian": 3000,
    "Mixed": 4500,
    "High Meat": 6000
  };
  const lpgCostPerCylinder = 900; 

  const [latestResult, setLatestResult] = useState(null);
  const [records, setRecords] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [whatIfInputs, setWhatIfInputs] = useState({
    vehicle: "Bus",
    electricity_reduction: 20,
    diet_type: "Vegetarian"
  });

  const [whatIfResult, setWhatIfResult] = useState(null);

  const user_id = 1; 

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/carbon/records/${user_id}`);
        const data = await res.json();
        setRecords(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    fetchRecords();
  }, []);

  const handleChange = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };

  const runWhatIfSimulation = () => {
    if (!latestResult) return;

    const km = Number(inputs.transport_km || 0);
    const kwh = Number(inputs.electricity_kwh || 0);

    const newTransportEmission = km * transportFactors[whatIfInputs.vehicle];
    const reducedElectricity = kwh * (1 - whatIfInputs.electricity_reduction / 100);
    const newElectricityEmission = reducedElectricity * 0.82;
    const newFoodEmission = dietFactors[whatIfInputs.diet_type] * 30;

    const newTotal =
      newTransportEmission +
      newElectricityEmission +
      newFoodEmission +
      latestResult.lpg_emission;

    const reduction = latestResult.total_emission - newTotal;

    const newTransportCost = km * transportCostsPerKm[whatIfInputs.vehicle];
    const newElectricityCost = reducedElectricity * electricityCostPerKwh;
    const newFoodCost = dietMonthlyCosts[whatIfInputs.diet_type];

    const newTotalCost =
      newTransportCost + newElectricityCost + newFoodCost;

    const moneySaved = latestResult.estimated_spent - newTotalCost;

    setWhatIfResult({
      newTotal,
      reduction,
      moneySaved
    });
  };

  const calculate = async () => {
    const km = Number(inputs.transport_km || 0);
    const kwh = Number(inputs.electricity_kwh || 0);
    const lpg = Number(inputs.lpg_cylinders || 0); 

    const transport_emission = km * transportFactors[inputs.vehicle];
    const electricity_emission = kwh * 0.82;
    const food_emission = dietFactors[inputs.diet_type] * 30;
    const lpg_emission = lpg * 42.36; 
    
    const total_emission = transport_emission + electricity_emission + food_emission + lpg_emission;

    let eco_score;
    if (total_emission <= 30) eco_score = 95;
    else if (total_emission <= 60) eco_score = 85;
    else if (total_emission <= 100) eco_score = 70;
    else if (total_emission <= 150) eco_score = 55;
    else eco_score = 40;

    const transport_cost = km * transportCostsPerKm[inputs.vehicle];
    const electricity_cost = kwh * electricityCostPerKwh;
    const food_cost = dietMonthlyCosts[inputs.diet_type];
    const lpg_cost = lpg * lpgCostPerCylinder; 
    
    const estimated_spent = transport_cost + electricity_cost + food_cost + lpg_cost;

    const newRecord = {
      user_id,
      month: inputs.month,
      transport_emission,
      electricity_emission,
      food_emission,
      lpg_emission, 
      total_emission,
      eco_score,
      estimated_spent,
      transport_km: inputs.transport_km,
      electricity_kwh: inputs.electricity_kwh,
      lpg_cylinders: inputs.lpg_cylinders, 
      diet_type: inputs.diet_type
    };

    setLatestResult(newRecord);

    try {
      const res = await fetch("http://localhost:5000/api/carbon/add-record", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify(newRecord),
      });
      const saved = await res.json();
      setRecords((prev) => [saved, ...prev]);

      // NEW: Notify the parent Dashboard that a calculation was saved
      if (onCalculationComplete) {
        onCalculationComplete();
      }

    } catch (err) {
      console.error("Error saving record:", err);
    }
      
    try {
      const aiRes = await fetch("http://localhost:5000/api/carbon/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transport_emission,
          electricity_emission,
          food_emission,
          lpg_emission, 
          transport_cost,
          electricity_cost,
          food_cost,
          lpg_cost 
        })
      });
      
      const suggestionData = await aiRes.json();
      setAiSuggestion(suggestionData);
      
    } catch (err) {
      console.error("AI engine error:", err);
    }
  };

  return (
    // ... [The entire return statement remains exactly the same as your original code] ...
    <div className="calculator-container">
      <h2>Carbon Footprint Calculator</h2>
      <div className="form">
        <select name="month" value={inputs.month} onChange={handleChange}>
          <option>January</option>
          <option>February</option>
          <option>March</option>
          <option>April</option>
          <option>May</option>
          <option>June</option>
          <option>July</option>
          <option>August</option>
          <option>September</option>
          <option>October</option>
          <option>November</option>
          <option>December</option>
        </select>

        <input
          type="number"
          name="transport_km"
          placeholder="Transport Distance (km)"
          value={inputs.transport_km}
          onChange={handleChange}
        />
        <select name="vehicle" value={inputs.vehicle} onChange={handleChange}>
          <option value="Car (Petrol)">Car (Petrol)</option>
          <option value="Car (Diesel)">Car (Diesel)</option>
          <option value="Bike">Bike</option>
          <option value="Bus">Bus</option>
          <option value="Train">Train</option>
        </select>
        <input
          type="number"
          name="electricity_kwh"
          placeholder="Electricity Usage (kWh)"
          value={inputs.electricity_kwh}
          onChange={handleChange}
        />
        
        <input
          type="number"
          name="lpg_cylinders"
          placeholder="LPG Cylinders Used (14.2kg)"
          value={inputs.lpg_cylinders}
          onChange={handleChange}
          step="0.5" 
        />

        <select name="diet_type" value={inputs.diet_type} onChange={handleChange}>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Mixed">Mixed</option>
          <option value="High Meat">High Meat</option>
        </select>
        <button onClick={calculate}>Calculate</button>
      </div>

      {latestResult && (
        <div className="result">
          <h3>Latest Calculation:</h3>
          <p>Transport Emission: {latestResult.transport_emission.toFixed(2)} kg CO₂</p>
          <p>Electricity Emission: {latestResult.electricity_emission.toFixed(2)} kg CO₂</p>
          <p>LPG Emission: {latestResult.lpg_emission.toFixed(2)} kg CO₂</p>
          <p>Food Emission: {latestResult.food_emission.toFixed(2)} kg CO₂</p>
          <p style={{ fontWeight: 'bold', marginTop: '10px' }}>
            Total Emission: {latestResult.total_emission.toFixed(2)} kg CO₂
          </p>
          <p>Eco Score: {latestResult.eco_score}</p>
          <p style={{ fontWeight: 'bold', color: '#d9534f' }}>
            Estimated Monthly Cost: ₹{latestResult.estimated_spent.toFixed(2)}
          </p>
          
          <hr style={{ margin: '15px 0' }} />
          
          {(() => {
            const indianMonthlyAverage = 166;
            const maxVisualScale = indianMonthlyAverage * 2; 
            
            const difference = latestResult.total_emission - indianMonthlyAverage;
            const percentageDiff = ((Math.abs(difference) / indianMonthlyAverage) * 100).toFixed(1);
            
            const isOver = difference > 0;
            const messageColor = isOver ? "#d9534f" : "#5cb85c"; 
            
            const fillWidth = Math.min((latestResult.total_emission / maxVisualScale) * 100, 100);
            const targetMarkerPosition = (indianMonthlyAverage / maxVisualScale) * 100;

            return (
              <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>National Average Comparison</h4>
                
                <div style={{ position: 'relative', width: '100%', backgroundColor: '#e0e0e0', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{
                    width: `${fillWidth}%`,
                    backgroundColor: messageColor,
                    height: '100%',
                    transition: 'width 0.5s ease-out'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${targetMarkerPosition}%`,
                    borderLeft: '3px dashed #333',
                    zIndex: 1
                  }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#555', marginBottom: '15px' }}>
                  <span>0 kg</span>
                  <span style={{ fontWeight: 'bold' }}>Avg: {indianMonthlyAverage} kg</span>
                  <span>{maxVisualScale}+ kg</span>
                </div>

                <p style={{ color: messageColor, fontWeight: 'bold', margin: 0, fontSize: '14px' }}>
                  {isOver 
                    ? `⚠️ Your emission is ${percentageDiff}% higher than the Indian monthly average.` 
                    : `🌱 Great job! Your emission is ${percentageDiff}% lower than the Indian monthly average.`}
                </p>
              </div>
            );
          })()}

          {aiSuggestion && (
            <div style={{ 
              backgroundColor: '#e8f4f8', 
              padding: '15px', 
              borderRadius: '8px', 
              marginTop: '15px', 
              borderLeft: '4px solid #0275d8' 
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#0275d8' }}>
                🤖 AI Insight: Focus on {aiSuggestion.category}
              </h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#000000', lineHeight: '1.5' }}>
                {aiSuggestion.suggestion}
              </p>
              
              {aiSuggestion.potential_savings > 0 && (
                <p style={{ margin: 0, fontWeight: 'bold', color: '#5cb85c', fontSize: '15px' }}>
                  💡 Potential Monthly Savings: ₹{aiSuggestion.potential_savings.toFixed(2)}
                </p>
              )}
            </div>
          )}

        </div>
      )}
{latestResult && (
  <div style={{
    backgroundColor: "#fff8e1",
    color:"black",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    borderLeft: "4px solid #f0ad4e"
  }}>
    <h4>🔮 What-If Scenario Simulator</h4>

    <label>Switch Vehicle:</label>
    <select
      value={whatIfInputs.vehicle}
      onChange={(e) =>
        setWhatIfInputs({ ...whatIfInputs, vehicle: e.target.value })
      }
    >
      <option>Car (Petrol)</option>
      <option>Car (Diesel)</option>
      <option>Bike</option>
      <option>Bus</option>
      <option>Train</option>
    </select>

    <label style={{ marginLeft: "10px" }}>
      Electricity Reduction (%):
    </label>
    <input
      type="number"
      value={whatIfInputs.electricity_reduction}
      onChange={(e) =>
        setWhatIfInputs({
          ...whatIfInputs,
          electricity_reduction: e.target.value
        })
      }
      style={{ width: "60px", marginLeft: "5px" }}
    />

    <label style={{ marginLeft: "10px" }}>Change Diet:</label>
    <select
      value={whatIfInputs.diet_type}
      onChange={(e) =>
        setWhatIfInputs({ ...whatIfInputs, diet_type: e.target.value })
      }
    >
      <option>Vegetarian</option>
      <option>Mixed</option>
      <option>High Meat</option>
    </select>

    <br />
    <button
      onClick={runWhatIfSimulation}
      style={{ marginTop: "10px" }}
    >
      Simulate Impact
    </button>

    {whatIfResult && (
      <div style={{ marginTop: "10px" }}>
        <p>🌱 CO₂ Reduction: {whatIfResult.reduction.toFixed(2)} kg</p>
        <p>💰 Estimated Savings: ₹{whatIfResult.moneySaved.toFixed(2)}</p>
        <p>📉 New Emission: {whatIfResult.newTotal.toFixed(2)} kg CO₂</p>
      </div>
    )}
  </div>
)}
    </div>
  );
}

export default CarbonCalculator;