import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Card styling (unchanged)
const cardStyle = {
  backgroundColor: '#f1f5f9',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  textAlign: 'center',
  flex: 1,
  margin: '10px',
  minWidth: '220px'
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:5000/dashboard-data', { withCredentials: true })
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '20px' }}>Loading dashboard...</p>;
  }
  if (error) {
    return <p style={{ textAlign: 'center', marginTop: '20px', color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 0 10px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
        📊 Dashboard Overview
      </h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={cardStyle}>
          <h3>🧪 Total Medicines</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.total_medicines}
          </p>
        </div>

        <div style={cardStyle}>
          <h3>⚠️ Near Expiry (30 days)</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f97316' }}>
            {stats.near_expiry_medicines}
          </p>
        </div>

        <div style={cardStyle}>
          <h3>❌ Expired</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#e11d48' }}>
            {stats.expired_medicines}
          </p>
        </div>

        <div style={cardStyle}>
          <h3>📉 Low Stock (≤5)</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>
            {stats.low_stock_medicines}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
