import React, { useEffect, useState } from "react";
import "./CarbonChart.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale, // NEW: Import LogarithmicScale
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

// NEW: Register LogarithmicScale
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale, 
  BarElement,
  Title,
  Tooltip,
  Legend
);

function CarbonChart({ updateTrigger }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/carbon/records/1")
      .then((res) => res.json())
      .then((data) => setRecords(data))
      .catch((err) => console.log("Error fetching chart data:", err));
  }, [updateTrigger]);

  const chartRecords = [...records].reverse();

  const data = {
    labels: chartRecords.map((r) => r.month),
    datasets: [
      {
        label: "Total Carbon Emission (kg CO₂)",
        // FIX 1: Parse the PostgreSQL string into a float so Chart.js understands the math
        data: chartRecords.map((r) => parseFloat(r.total_emission)),
        backgroundColor: "rgba(46, 125, 50, 0.7)", 
        borderColor: "#2e7d32",
        borderWidth: 1,
        hoverBackgroundColor: "#1b5e20",
        borderRadius: 6, 
        barPercentage: 0.6, 
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Segoe UI', Roboto, sans-serif",
            size: 13
          }
        }
      },
      title: {
        display: true,
        text: "Monthly Carbon Emission Trend",
        font: {
          family: "'Segoe UI', Roboto, sans-serif",
          size: 16,
          weight: "600"
        },
        padding: { bottom: 20 },
        color: "#2c3e50"
      },
      tooltip: {
        backgroundColor: "rgba(44, 62, 80, 0.9)",
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false, 
        callbacks: {
          label: function(context) {
            return `${context.parsed.y.toFixed(2)} kg CO₂`;
          }
        }
      }
    },
    scales: {
      y: {
        // FIX 2: Change the scale type to logarithmic to handle huge variations in data
        type: "logarithmic",
        grid: {
          color: "rgba(0, 0, 0, 0.05)", 
          drawBorder: false,
        },
        ticks: {
          color: "#546e7a",
          font: { size: 12 },
          // Optional: Format the Y-axis labels so they don't look messy in scientific notation
          callback: function (value, index, values) {
            if (value === 10 || value === 100 || value === 1000 || value === 10000 || value === 100000) {
              return value + ' kg';
            }
            return null; // Hide the intermediate tick marks
          }
        }
      },
      x: {
        grid: {
          display: false, 
          drawBorder: false,
        },
        ticks: {
          color: "#546e7a",
          font: { size: 12 }
        }
      }
    }
  };

  if (records.length === 0) {
    return (
      <div className="chart-container loading-chart">
        <p>Loading chart data...</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      {/* ADDED: style={{ height: "450px", position: "relative" }} to make it taller */}
      <div className="chart-wrapper" style={{ height: "450px", position: "relative", width: "100%" }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default CarbonChart;