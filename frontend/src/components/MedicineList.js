import React from 'react';
import './MedicineList.css'; // Make sure this exists and includes styles

const MedicineList = ({ medicines }) => {
  if (!medicines || medicines.length === 0) {
    return <p>No medicines available</p>;
  }

  const today = new Date();

  return (
    <div className="list">
      {medicines.map((med, idx) => {
        const expiryDate = new Date(med.expiry_date);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        let medicineClass = '';
        if (diffDays < 0) {
          medicineClass = 'expired'; // Red
        } else if (diffDays <= 30) {
          medicineClass = 'near-expiry'; // Yellow
        }

        return (
          <div key={med._id || idx} className={`medicine ${medicineClass}`}>
            <h3>{med.name}</h3>
            <p>Expiry: {med.expiry_date}</p>
            <p>Quantity: {med.quantity}</p>
            <p>Manufacturer: {med.manufacturer}</p>
          </div>
        );
      })}
    </div>
  );
};

export default MedicineList;
