import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MedicineForm from './components/MedicineForm';
import MedicineList from './components/MedicineList';
import ExpiryChart from './components/ExpiryChart';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import './styles.css';

// Axios config: Always send cookies
axios.defaults.withCredentials = true;

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [nearExpiry, setNearExpiry] = useState([]);

  // Check if the user is authenticated
  const checkAuth = async () => {
    try {
      await axios.get('http://localhost:5000/check-auth'); // Check auth from backend
      setAuthenticated(true); // If successful, set authenticated to true
    } catch (error) {
      setAuthenticated(false); // If not, set authenticated to false
    }
  };

  // Fetch medicines and near expiry medicines from the backend
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

  // Use useEffect hook to check authentication status and fetch data accordingly
  useEffect(() => {
    checkAuth(); // Check if the user is authenticated on app load
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchData(); // Fetch data only if authenticated
    }
  }, [authenticated]);

  // Handle CSV export for all medicines
  const exportMedicinesCSV = () => {
    const headers = ['Name', 'Expiry Date', 'Quantity', 'Manufacturer'];
    const rows = medicines.map(med => [
      med.name,
      med.expiry_date,
      med.quantity,
      med.manufacturer
    ]);

    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(row => row.join(",")).join("\n");

    const blob = new Blob([decodeURIComponent(encodeURI(csvContent))], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'all_medicines.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If not authenticated, show the LoginPage component
  if (!authenticated) {
    return <LoginPage onLoginSuccess={() => setAuthenticated(true)} />;
  }
  

  return (
    <div className="container">
      <Dashboard />

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
