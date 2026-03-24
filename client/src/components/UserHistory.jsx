import React, { useEffect, useState } from "react";
import "./UserHistory.css"; 

function UserHistory({ updateTrigger }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/carbon/records/1") 
      .then((res) => res.json())
      .then((data) => setRecords(data))
      .catch((err) => console.log(err));
  }, [updateTrigger]); 

  return (
    <div className="history-container">
      <h2>Your Carbon History</h2>
      {records.length === 0 ? (
        <p className="no-records">No records found.</p>
      ) : (
        <div className="table-responsive">
          <table className="history-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Transport (kg CO₂)</th>
                <th>Electricity (kg CO₂)</th>
                <th>LPG (kg CO₂)</th> 
                <th>Food (kg CO₂)</th>
                <th>Total (kg CO₂)</th>
                <th>Eco Score</th>
                <th>Money Spent (₹)</th>
              </tr>
            </thead>
            <tbody>
              {/* FIX: Copied the array and reversed it so newest is at the top */}
              {[...records].reverse().map((r) => (
                <tr key={r.id}>
                  <td className="month-cell">{r.month}</td>
                  <td>{r.transport_emission ? Number(r.transport_emission).toFixed(2) : "0.00"}</td>
                  <td>{r.electricity_emission ? Number(r.electricity_emission).toFixed(2) : "0.00"}</td>
                  <td>{r.lpg_emission ? Number(r.lpg_emission).toFixed(2) : "0.00"}</td>
                  <td>{r.food_emission ? Number(r.food_emission).toFixed(2) : "0.00"}</td>
                  <td className="total-cell">{r.total_emission ? Number(r.total_emission).toFixed(2) : "0.00"}</td>
                  <td>
                    <span className={`eco-badge ${r.eco_score >= 70 ? 'good' : 'bad'}`}>
                      {r.eco_score}
                    </span>
                  </td>
                  <td className="money-cell">
                    ₹{r.estimated_spent ? Number(r.estimated_spent).toFixed(2) : "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserHistory;