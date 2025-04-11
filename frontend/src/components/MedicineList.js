import React from 'react';

const MedicineList = ({ medicines }) => (
  <div className="list">
    {medicines.map((med, idx) => (
      <div key={idx} className={`medicine ${med.expired ? 'expired' : med.near_expiry ? 'near-expiry' : ''}`}>
        <h3>{med.name}</h3>
        <p>Expiry: {med.expiry_date}</p>
        <p>Quantity: {med.quantity}</p>
        <p>Manufacturer: {med.manufacturer}</p>
      </div>
    ))}
  </div>
);

export default MedicineList;
