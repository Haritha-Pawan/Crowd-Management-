import React, { useEffect, useState } from 'react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AttendeeLineChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/users/attendee-daily-count')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className=" p-4 rounded-lg shadow-l bg-white/5 ">
      <h2 className="text-xl font-bold mb-4 text-amber-50">Daily Attendee Registrations</h2>
      <ResponsiveContainer width="100%" height={250}>
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AttendeeLineChart;
