import React, { useState } from 'react';
import axios from 'axios';

const MedicineForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    expiry_date: '',
    quantity: '',
    manufacturer: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(''); // Reset error message

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
      setError('Failed to add medicine. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h3>Add New Medicine</h3>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
        style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc' }}
      />
      <input
        type="date"
        name="expiry_date"
        value={formData.expiry_date}
        onChange={handleChange}
        required
        style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc' }}
      />
      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={handleChange}
        required
        style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc' }}
      />
      <input
        type="text"
        name="manufacturer"
        placeholder="Manufacturer"
        value={formData.manufacturer}
        onChange={handleChange}
        required
        style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc' }}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          width: '100%',
        }}
      >
        {isSubmitting ? 'Adding...' : 'Add Medicine'}
      </button>
    </form>
  );
};

export default MedicineForm;
