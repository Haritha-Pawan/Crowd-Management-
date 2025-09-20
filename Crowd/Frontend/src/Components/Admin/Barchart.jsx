import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Total Users", value: 50 },
  { name: "Active Users", value: 30 },
  { name: "Pending", value: 15 },
  { name: "Organizers", value: 5 },
];

function Barchart() {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255,255,255,0.1)"
          />
          <XAxis 
            dataKey="name" 
            stroke="#fff"
            fontSize={12}
          />
          <YAxis 
            stroke="#fff"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: 'none',
              borderRadius: '4px',
              color: '#fff'
            }}
          />
          <Legend 
            wrapperStyle={{
              color: '#fff'
            }}
          />
          <Bar 
            dataKey="value" 
            fill="#4ade80" 
            barSize={40}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Barchart
