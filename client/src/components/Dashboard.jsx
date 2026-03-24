import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import CarbonChart from "./CarbonChart";
import UserHistory from "./UserHistory";
import CarbonCalculator from "./CarbonCalculator";

function Dashboard() {
  const [data, setData] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // NEW: State to trigger updates across child components
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    fetch("http://localhost:5000/api/carbon/1")
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch((err) => console.log(err));
  }, [updateTrigger]); // NEW: Added updateTrigger to dependency array

  if (!data) {
    return <p className="loading">Loading...</p>;
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // NEW: Function to increment trigger and force re-fetches
  const handleCalculationComplete = () => {
    setUpdateTrigger((prev) => prev + 1);
  };

  return (
    <div className="dashboard">
      {/* NEW: Pass the update handler as a prop */}
      <CarbonCalculator onCalculationComplete={handleCalculationComplete} />
      
      <div className="cards">
        <div className="card emission">
          <h3>Total Emission</h3>
          <p>{parseFloat(data.total_emission).toFixed(2)} kg</p>
        </div>

        <div className="card eco">
          <h3>Eco Score</h3>
          <p>{data.eco_score}/100</p>
        </div>

        <div className="card money">
          <h3>Money Spent</h3>
          <p>₹{parseFloat(data.estimated_spent).toFixed(2)}</p>
        </div>
      </div>

      {/* NEW: Pass the updateTrigger so the chart knows when to re-fetch */}
      <CarbonChart updateTrigger={updateTrigger} />

      <div className="history-controls" style={{ textAlign: "center", margin: "20px 0" }}>
        <button 
          onClick={toggleHistory} 
          style={{
            padding: "10px 20px",
            backgroundColor: "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          {showHistory ? "Hide History" : "Show History"}
        </button>
      </div>

      {/* NEW: Pass the updateTrigger so history knows when to re-fetch */}
      {showHistory && <UserHistory updateTrigger={updateTrigger} />}

    </div>
  );
}

export default Dashboard;