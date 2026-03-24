import React from "react";
import Dashboard from "./components/Dashboard";
import CarbonCalculator from "./components/CarbonCalculator";

import "./App.css";

function App() {
  return (
    <div className="app-container">
      <h1 className="main-title" style={{color: "#2e7d32"}}>Carbon Footprint Tracker 🌱</h1>

      <Dashboard/>
      

      
      
    </div>
  );
}

export default App;