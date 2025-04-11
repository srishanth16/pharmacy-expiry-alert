import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';

import MedicineForm from './components/MedicineForm';
import MedicineList from './components/MedicineList';
import ExpiryChart from './components/ExpiryChart';

import './styles.css';

function App() {
  const [medicines, setMedicines] = useState([]);
  const [nearExpiry, setNearExpiry] = useState([]);

  const fetchData = async () => {
    try {
      const allRes = await axios.get('http://localhost:5000/get-medicines');
      const nearRes = await axios.get('http://localhost:5000/get-near-expiry');
      setMedicines(allRes.data);
      setNearExpiry(nearRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportMedicinesCSV = () => {
    const headers = ['Name', 'Expiry Date', 'Quantity', 'Manufacturer'];
    const rows = medicines.map(med => [
      med.name,
      med.expiry_date,
      med.quantity,
      med.manufacturer
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(row => row.join(",")).join("\n");

    const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], {
      type: 'text/csv;charset=utf-8;'
    });
    saveAs(blob, 'all_medicines.csv');
  };

  return (
    <div className="container">
      <h1>Pharmacy Expiry Alert</h1>

      <MedicineForm onAdd={fetchData} />

      <button onClick={exportMedicinesCSV} style={{ 
        margin: '10px 0', 
        backgroundColor: '#4caf50', 
        color: 'white', 
        padding: '8px 16px', 
        border: 'none', 
        borderRadius: '5px', 
        cursor: 'pointer' 
      }}>
        📥 Export All Medicines to CSV
      </button>

      <h2>All Medicines</h2>
      <MedicineList medicines={medicines} />

      <h2>⚠️ Near Expiry Medicines (within 30 days)</h2>
      <MedicineList medicines={nearExpiry} />

      <h2>📅 Medicines Expiry by Month</h2>
      <ExpiryChart data={medicines} />
    </div>
  );
}

export default App;