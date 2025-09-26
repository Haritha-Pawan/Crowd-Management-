import React, { useState, useEffect } from "react";
import { Users, ShieldAlert, AlertCircle, MessageCircle, CheckCircle, XCircle } from "lucide-react";

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const sampleIncidents = [
      {
        id: 1,
        type: "Lost Person",
        name: "John Doe",
        age: 8,
        lastSeen: "Main Stage",
        gender: "Male",
        image: "",
        reportedBy: "Parent",
        time: "2025-09-03 14:23",
        status: "Pending",
      },
      {
        id: 2,
        type: "Emergency",
        emergencyType: "Medical",
        description: "Heart attack reported",
        location: "Zone B",
        reportedBy: "Security Team",
        time: "2025-09-03 13:10",
        status: "Solved",
      },
      {
        id: 3,
        type: "Lost Item",
        itemName: "Backpack",
        description: "Blue backpack with books",
        lastSeen: "Parking Lot",
        image: "",
        reportedBy: "Michael Lee",
        time: "2025-09-03 11:45",
        status: "Pending",
      },
      {
        id: 4,
        type: "Complaints",
        subject: "Restroom Issue",
        details: "Restrooms are not clean",
        reportedBy: "Sarah Johnson",
        time: "2025-09-03 15:10",
      },
    ];
    setIncidents(sampleIncidents);
  }, []);

  const filtered = selectedCategory === "All"
    ? incidents
    : incidents.filter((i) => i.type === selectedCategory);

  const toggleStatus = (id) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: i.status === "Solved" ? "Pending" : "Solved" } : i
      )
    );
  };

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
      headers = ["Name", "Age", "Gender", "Last Seen", "Image", "Reported By", "Time", "Status", "Action"];
    } else if (selectedCategory === "Lost Item") {
      headers = ["Item Name", "Description", "Last Seen", "Image", "Reported By", "Time", "Status", "Action"];
    } else if (selectedCategory === "Emergency") {
      headers = ["Type", "Description", "Location", "Reported By", "Time", "Status", "Action"];
    } else if (selectedCategory === "Complaints") {
      headers = ["Subject", "Details", "Reported By", "Time"];
    } else {
      headers = ["Type", "Details", "Reported By", "Time", "Status", "Action"];
    }
    return (
      <tr className="border-b border-white/10 text-gray-300">
        {headers.map((h) => (
          <th key={h} className="pb-3">{h}</th>
        ))}
      </tr>
    );
  };

  const renderTableRow = (i) => {
    let cells = [];
    if (selectedCategory === "Lost Person") {
      cells = [i.name, i.age, i.gender, i.lastSeen, i.image, i.reportedBy, i.time];
    } else if (selectedCategory === "Lost Item") {
      cells = [i.itemName, i.description, i.lastSeen, i.image, i.reportedBy, i.time];
    } else if (selectedCategory === "Emergency") {
      cells = [i.emergencyType, i.description, i.location, i.reportedBy, i.time];
    } else if (selectedCategory === "Complaints") {
      cells = [i.subject, i.details, i.reportedBy, i.time];
    } else {
      let detail;
      if (i.type === "Lost Person") detail = `Name: ${i.name}, Age: ${i.age}, Last Seen: ${i.lastSeen}, Gender: ${i.gender}`;
      else if (i.type === "Lost Item") detail = `Item: ${i.itemName}, Desc: ${i.description}, Last Seen: ${i.lastSeen}`;
      else if (i.type === "Emergency") detail = `Type: ${i.emergencyType}, Desc: ${i.description}, Location: ${i.location}`;
      else if (i.type === "Complaints") detail = `Subject: ${i.subject}, Details: ${i.details}`;
      cells = [i.type, detail, i.reportedBy, i.time];
    }

    return (
      <tr key={i.id} className="border-b border-white/10">
        {cells.map((c, idx) => (
          <td key={idx} className="py-3">{c || "-"}</td>
        ))}
        {i.type !== "Complaints" && selectedCategory !== "Complaints" && (
          <>
            <td className="py-3">{renderStatus(i)}</td>
            <td className="py-3">
              <button
                onClick={() => toggleStatus(i.id)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  i.status === "Solved" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
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
    // Make this div take at least full viewport height
    <div className="p-10 w-full text-white min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-2">Incident Management</h1>
      <p className="text-gray-300 mb-6">View and manage incidents reported by attendees</p>

      {/* Category Cards */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        {["All", "Lost Person", "Emergency", "Lost Item", "Complaints"].map((cat) => (
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
              {cat === "All" ? incidents.length : incidents.filter((i) => i.type === cat).length}
            </div>
          </div>
        ))}
      </div>

      {/* Incidents Table */}
      <div className="bg-white/5 border border-white/10 rounded-md p-6 overflow-auto flex-1">
        <h2 className="text-xl font-semibold mb-4">
          {selectedCategory === "All" ? "All Reported Incidents" : selectedCategory}
        </h2>

        <table className="w-full text-left text-white text-sm">
          <thead>{renderTableHeader()}</thead>
          <tbody>{filtered.map(renderTableRow)}</tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-6 text-gray-400">No incidents found for this category.</div>
        )}
      </div>
    </div>
  );
};

export default Incidents;
