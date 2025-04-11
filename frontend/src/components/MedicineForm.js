import React, { useState } from 'react';
import axios from 'axios';

const MedicineForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    expiry_date: '',
    quantity: '',
    manufacturer: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/add-medicine', formData); // ✅ Correct API URL
      onAdd(); // refresh the list
      setFormData({
        name: '',
        expiry_date: '',
        quantity: '',
        manufacturer: '',
      });
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert('Failed to add medicine. Check your backend server.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="expiry_date"
        value={formData.expiry_date}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="manufacturer"
        placeholder="Manufacturer"
        value={formData.manufacturer}
        onChange={handleChange}
        required
      />
      <button type="submit">Add Medicine</button>
    </form>
  );
};

export default MedicineForm;
