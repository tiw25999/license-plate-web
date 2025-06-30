import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminChart = ({ data, loading }) => {
  if (loading) return <div className="text-center my-3">📊 กำลังโหลดกราฟ...</div>;

  const formatted = data.reduce((acc, plate) => {
    const date = plate.timestamp?.split(' ')[0];
    if (!date) return acc;
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(formatted).map(([date, count]) => ({ date, count }));

  return (
    <div className="card mb-4 p-3">
      <h5>แนวโน้มการตรวจจับทะเบียนรถ</h5>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#007bff" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminChart;
