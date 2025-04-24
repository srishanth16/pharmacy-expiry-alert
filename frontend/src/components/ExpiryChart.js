import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';

const ExpiryChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  const months = [
    'All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Get unique years from the data
  const years = useMemo(() => {
    const yearSet = new Set();
    safeData.forEach(med => {
      const year = new Date(med.expiry_date).getFullYear();
      yearSet.add(year);
    });
    return ['All', ...Array.from(yearSet).sort()];
  }, [safeData]);

  const filteredData = useMemo(() => {
    const monthlyCount = {};
    safeData.forEach(med => {
      const date = new Date(med.expiry_date);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex + 1];
      const monthYear = `${monthName} ${year}`;

      const matchYear = selectedYear === 'All' || year.toString() === selectedYear.toString();
      const matchMonth = selectedMonth === 'All' || selectedMonth === monthName;

      if (matchYear && matchMonth) {
        monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1;
      }
    });

    return Object.entries(monthlyCount).map(([month, count]) => ({
      month,
      count,
    }));
  }, [safeData, selectedYear, selectedMonth]);

  const downloadCSV = () => {
    const headers = ['Month', 'Count'];
    const rows = filteredData.map(({ month, count }) => [month, count]);

    const filename = selectedYear === 'All' && selectedMonth === 'All'
      ? 'expiry_data_all_years_all_months.csv'
      : `expiry_data_${selectedYear}_${selectedMonth}.csv`;

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (safeData.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>No expiry data available to show chart.</p>;
  }

  if (filteredData.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>No data available for the selected filters.</p>;
  }

  return (
    <div style={{
      marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9',
      borderRadius: '12px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', textAlign: 'center'
    }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>📅 Medicines Expiry by Month</h2>

      {/* Year and Month Filters */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Filter by Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{
            padding: '6px 10px', marginRight: '20px', borderRadius: '6px',
            border: '1px solid #ddd'
          }}
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <label style={{ marginRight: '10px' }}>Filter by Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            padding: '6px 10px', marginRight: '20px', borderRadius: '6px',
            border: '1px solid #ddd'
          }}
        >
          {months.map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>

        <button
          onClick={downloadCSV}
          style={{
            backgroundColor: '#4caf50', color: 'white', padding: '6px 12px',
            border: 'none', borderRadius: '6px', cursor: 'pointer'
          }}
        >
          📥 Export CSV
        </button>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#4e73df" radius={[10, 10, 0, 0]}>
            <LabelList dataKey="count" position="top" fill="#333" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpiryChart;
