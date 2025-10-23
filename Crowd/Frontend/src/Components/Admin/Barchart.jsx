import React, { useEffect, useState } from "react";
import axios from "axios";
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

function Barchart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch user data from backend
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users");
        const users = res.data;

        // ✅ Example of processing data (adjust based on your API structure)
        const totalUsers = users.length;
        const activeUsers = users.filter((u) => u.status === "active").length;
        const pendingUsers = users.filter((u) => u.status === "pending").length;
        const organizers = users.filter((u) => u.role === "organizer").length;

        // Prepare data for chart
        const chartData = [
          { name: "Total Users", value: totalUsers },
          { name: "Active Users", value: activeUsers },
          { name: "Pending", value: pendingUsers },
          { name: "Organizers", value: organizers },
        ];

        setData(chartData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="#fff" fontSize={12} />
          <YAxis stroke="#fff" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0,0,0,0.8)",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
            }}
          />
          <Legend wrapperStyle={{ color: "#fff" }} />
          <Bar
            dataKey="value"
            fill="#4ade80"
            barSize={40}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Barchart;
