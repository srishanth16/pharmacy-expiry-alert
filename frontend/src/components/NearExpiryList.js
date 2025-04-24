import React, { useEffect, useState } from 'react';
import axios from 'axios';

function NearExpiryList() {
  const [nearExpiryMeds, setNearExpiryMeds] = useState([]);

  useEffect(() => {
    const fetchNearExpiry = async () => {
      try {
        const res = await axios.get('http://localhost:5000/get-near-expiry');
        // Sort the data by expiry_date after fetching
        const sortedData = res.data.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
        setNearExpiryMeds(sortedData); // Update the state with sorted data
      } catch (error) {
        console.error('Error fetching near expiry medicines:', error);
      }
    };

    fetchNearExpiry();
  }, []);

  const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry - today;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // days left
  };

  const getColor = (daysLeft) => {
    if (daysLeft <= 7) return 'red';
    if (daysLeft <= 14) return 'orange';
    return 'goldenrod';
  };

  return (
    <div className="near-expiry">
      <h2>🟡 Medicines Near Expiry (next 30 days)</h2>
      {nearExpiryMeds.length === 0 ? (
        <p>No medicines are near expiry.</p>
      ) : (
        <ul>
          {nearExpiryMeds.map((med, index) => {
            const daysLeft = getDaysLeft(med.expiry_date);
            return (
              <li key={index} style={{ color: getColor(daysLeft), marginBottom: '8px' }}>
                <strong>{med.name}</strong> — Expires: {med.expiry_date}  
                <br />
                Quantity: {med.quantity} | Manufacturer: {med.manufacturer}
                <br />
                ⏳ <strong>{daysLeft} days left</strong>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default NearExpiryList;
