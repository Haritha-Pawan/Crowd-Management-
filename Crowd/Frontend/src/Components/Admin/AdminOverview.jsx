import { Users, LocateIcon, Car, LoaderPinwheel } from "lucide-react";
import React, { useEffect, useState } from "react";
import Barchart from "./Barchart";
import LineChart from "./LineChart";
import SendMessage from "../sendSMS"; // ✅ your sendSMS.jsx component

const AdminOverview = () => {
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [totalCounters, setTotalCounters] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // ✅ for popup

  // Fetch attendee count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("http://${API_BASE_URL}/other/attendance/count");
        const data = await res.json();
        setAttendeeCount(data.count);
      } catch (err) {
        console.error("Error fetching attendee count:", err);
      }
    };
    fetchCount();
  }, []);

  // Fetch total counters
  useEffect(() => {
    const fetchTotalCounters = async () => {
      try {
        const res = await fetch("http://${API_BASE_URL}/api/counter/totalCount");
        const data = await res.json();
        setTotalCounters(data.count);
      } catch (err) {
        console.error("Error fetching total counters:", err);
      }
    };
    fetchTotalCounters();
  }, []);

  const card = [
    { title: "Total Attendee", icon: <Users color="#2f80ed" />, count: attendeeCount, summary: "+12% from last event" },
    { title: "Active Counters", icon: <LocateIcon color="#4ade80" />, count: totalCounters, summary: "3 at capacity" },
    { title: "Parking Usage", icon: <Car color="#facc15" />, count: attendeeCount, summary: "415/530 spaces occupied" },
    { title: "Service", icon: <LoaderPinwheel color="#c084fc" />, count: attendeeCount, summary: "Food courts & stalls" },
  ];

  return (
    <div className="p-12 h-full max-h-screen overflow-y-auto relative">
      {/* Header */}
      <div className="header text-white text-3xl font-bold">Admin Overview</div>
      <div className="sub-heading text-xl text-gray-300">
        Monitor and manage all system components
      </div>

      {/* ✅ Send Reminder Button */}
      <button
        onClick={() => setIsPopupOpen(true)}
        className="absolute top-12 right-12 p-2 px-4 rounded-md cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:opacity-80 focus:outline-none transition-all"
      >
        + Send Reminder
      </button>

      {/* ✅ Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg text-white w-[450px] relative shadow-xl border border-white/20">
            <h2 className="text-xl font-semibold mb-4">Send SMS Reminder</h2>
            
            {/* ✅ Reuse your sendSMS component */}
            <SendMessage />

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards Section */}
      <div className="card mt-8 xl:grid grid-cols-4 gap-8 mx-auto">
        {card.map((data, index) => (
          <div
            key={index}
            className="users bg-white/5 border-white/10 p-5 text-white font-bold rounded-md"
          >
            <div className="icon flex justify-between">
              <div className="title text-[18px]">{data.title}</div>
              <div className="icon">{data.icon}</div>
            </div>
            <div className="count text-2xl mt-1">{data.count}</div>
            <div className="summary mt-1 text-[14px] font-normal text-gray-300">
              {data.summary}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="card mt-8 xl:grid grid-cols-2 gap-16 mx-auto h-80">
        <div className="chart1 bg-white/5 rounded-md p-4 h-full">
          <Barchart />
        </div>
        <div className="bg-white/5 w-130 rounded-md">
          <LineChart />
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
