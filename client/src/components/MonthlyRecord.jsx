import React, {useEffect,useState} from "react";
import "./Record.css";

function MonthlyRecords(){

  const [records,setRecords] = useState([])

  useEffect(()=>{

    fetch("http://localhost:5000/api/carbon/all")
    .then(res=>res.json())
    .then(data=>setRecords(data))

  },[])

  return(

    <div className="records">

      <h2>Monthly Records</h2>

      <table>

        <thead>
          <tr>
            <th>Month</th>
            <th>Transport</th>
            <th>Electricity</th>
            <th>Food</th>
            <th>Total</th>
            <th>Eco Score</th>
          </tr>
        </thead>

        <tbody>

{Array.isArray(records) &&
records.map((r)=>(
  <tr key={r.id}>
    <td>{r.month}</td>
    <td>{r.transport_emission}</td>
    <td>{r.electricity_emission}</td>
    <td>{r.food_emission}</td>
    <td>{r.total_emission}</td>
    <td>{r.eco_score}</td>
  </tr>
))}

</tbody>

      </table>

    </div>
  )
}

export default MonthlyRecords