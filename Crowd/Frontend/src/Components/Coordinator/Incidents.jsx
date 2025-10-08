import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Users,
  ShieldAlert,
  AlertCircle,
  MessageCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
  fetchIncidents();
  const socket = io("http://localhost:5000"); // Adjust URL in production

  socket.on("newIncident", (newIncident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    toast.success("New incident reported!");
  });

  socket.on("incidentDeleted", ({ id }) => {
    setIncidents((prev) => prev.filter((i) => (i._id || i.id) !== id));
    toast("Incident deleted");
  });

  socket.on("incidentStatusUpdated", ({ id, status }) => {
    setIncidents((prev) =>
      prev.map((i) =>
        (i._id || i.id) === id ? { ...i, status } : i
      )
    );
    toast("Incident status updated");
  });

  return () => socket.disconnect();
}, []);


  const fetchIncidents = async () => {
     try {
    const res = await axios.get('http://localhost:5000/api/support'); // full URL
    if (Array.isArray(res.data)) {
      setIncidents(res.data);
    } else {
      console.error("Expected array but got:", res.data);
      setIncidents([]); // fallback to empty array
    }
  } catch (err) {
    console.error("Error fetching incidents:", err);
    setIncidents([]); // prevent crash
  }
  };

  const toggleStatus = async (id, currentStatus) => {
  try {
    const newStatus = currentStatus === "Solved" ? "Pending" : "Solved";

    await axios.put(`http://localhost:5000/api/support/${id}/status`, {
      status: newStatus,
    });

    setIncidents((prev) =>
      prev.map((i) =>
        (i.id || i._id) === id ? { ...i, status: newStatus } : i
      )
    );
  } catch (err) {
    console.error("Status update error:", err);
    toast.error("Failed to update status");
  }
};


  const filtered =
    selectedCategory === "All"
      ? incidents
      : incidents.filter((i) => i.type === selectedCategory);

  const renderStatus = (i) => {
    if (!i.status) return null;
    return i.status === "Solved" ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-500 text-white flex items-center gap-1 w-fit">
        <CheckCircle size={14} /> Solved
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-yellow-500 text-black flex items-center gap-1 w-fit">
        <XCircle size={14} /> Pending
      </span>
    );
  };

  const renderTableHeader = () => {
    let headers;
    if (selectedCategory === "Lost Person") {
      headers = [
        "Name",
        "Age",
        "Gender",
        "Last Seen",
        "Image",
        "Reported By",
        "Time",
        "Status",
        "Action",
      ];
    } else if (selectedCategory === "Lost Item") {
      headers = [
        "Item Name",
        "Description",
        "Last Seen",
        "Image",
        "Reported By",
        "Time",
        "Status",
        "Action",
      ];
    } else if (selectedCategory === "Emergency") {
      headers = [
        "Type",
        "Description",
        "Location",
        "Reported By",
        "Time",
        "Status",
        "Action",
      ];
    } else if (selectedCategory === "Complaints") {
      headers = ["Subject", "Details", "Reported By", "Time"];
    } else {
      headers = ["Type", "Details", "Reported By", "Time", "Status", "Action"];
    }

    return (
      <tr className="border-b border-white/10 text-gray-300">
        {headers.map((h) => (
          <th key={h} className="pb-3">
            {h}
          </th>
        ))}
      </tr>
    );
  };

  const renderTableRow = (i) => {
    let cells = [];

    if (selectedCategory === "Lost Person") {
      cells = [
        i.name,
        i.age,
        i.gender,
        i.lastSeen,
        i.imageUrl ? (
          <img
  src={i.imageUrl.startsWith("http") ? i.imageUrl : `http://localhost:5000${i.imageUrl}`}
  alt="Lost Person"
  className="w-16 h-16 object-cover rounded"
/>

        ) : (
          "-"
        ),
        i.reportedBy,
        new Date(i.time).toLocaleString(),
      ];
    } else if (selectedCategory === "Lost Item") {
      cells = [
        i.itemName,
        i.itemDescription,
        i.lastSeenLocation,
        i.imageUrl ? (
          <img
  src={i.imageUrl.startsWith("http") ? i.imageUrl : `http://localhost:5000${i.imageUrl}`}
  alt="Lost Person"
  className="w-16 h-16 object-cover rounded"
/>

        ) : (
          "-"
        ),
        i.reportedBy,
        new Date(i.time).toLocaleString(),
      ];
    } else if (selectedCategory === "Emergency") {
      cells = [
        i.emergencyType,
        i.description,
        i.location,
        i.reportedBy,
        new Date(i.time).toLocaleString(),
      ];
    } else if (selectedCategory === "Complaints") {
      cells = [
        i.subject,
        i.complaintDetails,
        i.reportedBy,
        new Date(i.time).toLocaleString(),
      ];
    } else {
      let detail;
      if (i.type === "Lost Person") {
        detail = `Name: ${i.name}, Age: ${i.age}, Last Seen: ${i.lastSeen}, Gender: ${i.gender}`;
      } else if (i.type === "Lost Item") {
        detail = `Item: ${i.itemName}, Desc: ${i.itemDescription}, Last Seen: ${i.lastSeenLocation}`;
      } else if (i.type === "Emergency") {
        detail = `Type: ${i.emergencyType}, Desc: ${i.description}, Location: ${i.location}`;
      } else if (i.type === "Complaints") {
        detail = `Subject: ${i.subject}, Details: ${i.complaintDetails}`;
      }
      cells = [i.type, detail, i.reportedBy, new Date(i.time).toLocaleString()];
    }

    return (
      <tr key={i._id || i.id} className="border-b border-white/10">
        {cells.map((c, idx) => (
          <td key={idx} className="py-3">
            {c || "-"}
          </td>
        ))}
        {i.type !== "Complaints" && selectedCategory !== "Complaints" && (
          <>
            <td className="py-3">{renderStatus(i)}</td>
            <td className="py-3">
              <button
                onClick={() => toggleStatus(i._id || i.id, i.status)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  i.status === "Solved"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                {i.status === "Solved" ? "Mark Pending" : "Mark Solved"}
              </button>
            </td>
          </>
        )}
      </tr>
    );
  };

  return (
    <div className="p-10 w-full text-white min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-2">Incident Management</h1>
      <p className="text-gray-300 mb-6">
        View and manage incidents reported by attendees
      </p>

      <div className="grid md:grid-cols-5 gap-6 mb-8">
        {["All", "Lost Person", "Emergency", "Lost Item", "Complaints"].map(
          (cat) => (
            <div
              key={cat}
              className="p-4 bg-white/10 rounded-md cursor-pointer hover:bg-white/20"
              onClick={() => setSelectedCategory(cat)}
            >
              <div className="flex items-center gap-2 text-sm text-gray-300">
                {cat === "Lost Person" && <Users size={18} />}
                {cat === "Emergency" && <ShieldAlert size={18} />}
                {cat === "Lost Item" && <AlertCircle size={18} />}
                {cat === "Complaints" && <MessageCircle size={18} />}
                {cat === "All" && "All Incidents"}
                {cat !== "All" && cat}
              </div>
              <div className="text-2xl font-bold">
                {cat === "All"
                  ? incidents.length
                  : incidents.filter((i) => i.type === cat).length}
              </div>
            </div>
          )
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-md p-6 overflow-auto flex-1">
        <h2 className="text-xl font-semibold mb-4">
          {selectedCategory === "All"
            ? "All Reported Incidents"
            : selectedCategory}
        </h2>

        <table className="w-full text-left text-white text-sm">
          <thead>{renderTableHeader()}</thead>
          <tbody>{filtered.map(renderTableRow)}</tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            No incidents found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default Incidents;
