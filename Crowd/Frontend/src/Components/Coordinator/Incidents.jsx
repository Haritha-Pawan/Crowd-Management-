// Coordinator/Incidents.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Users,
  ShieldAlert,
  AlertCircle,
  MessageCircle,
  CheckCircle,
  XCircle,
  FileDown,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addBusinessHeader } from "../../assets/pdfHeader"; // adjust relative path if needed

const API = "https://crowd-management-api.onrender.com/api";

// ---------- utils ----------
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const makeIndexText = (i) =>
  norm(
    [
      i.type,
      i.reportedBy,
      i.status,
      new Date(i.time || Date.now()).toLocaleString(),
      // Emergency
      i.emergencyType,
      i.description,
      i.location,
      // Lost Person
      i.name,
      i.age,
      i.gender,
      i.lastSeen,
      // Lost Item
      i.itemName,
      i.itemDescription,
      i.lastSeenLocation,
      // Complaints
      i.subject,
      i.complaintDetails,
    ]
      .filter(Boolean)
      .join(" ")
  );

// ---------- component ----------
const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // search state
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(norm(query)), 220);
    return () => clearTimeout(t);
  }, [query]);

  // load + sockets
  useEffect(() => {
    fetchIncidents();

    const socket = io("http://${API_BASE_URL}", { withCredentials: true });

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
        prev.map((i) => ((i._id || i.id) === id ? { ...i, status } : i))
      );
      toast("Incident status updated");
    });

    return () => socket.disconnect();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await axios.get(`${API}/support`);
      if (Array.isArray(res.data)) {
        setIncidents(res.data);
      } else {
        console.error("Expected array but got:", res.data);
        setIncidents([]);
      }
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setIncidents([]);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Solved" ? "Pending" : "Solved";
      await axios.put(`${API}/support/${id}/status`, { status: newStatus });
      setIncidents((prev) =>
        prev.map((i) => ((i.id || i._id) === id ? { ...i, status: newStatus } : i))
      );
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update status");
    }
  };

  // ---------- search suggestions ----------
  const suggestionPool = useMemo(() => {
    return incidents.map((i) => {
      const id = i._id || i.id;
      const time = new Date(i.time || Date.now());

      // label for dropdown
      let label = "";
      switch (i.type) {
        case "Lost Person":
          label = [i.name, i.gender, i.age != null ? `Age ${i.age}` : "", i.lastSeen]
            .filter(Boolean)
            .join(" • ");
          break;
        case "Lost Item":
          label = [i.itemName, i.itemDescription, i.lastSeenLocation]
            .filter(Boolean)
            .join(" • ");
          break;
        case "Emergency":
          label = [i.emergencyType, i.description, i.location]
            .filter(Boolean)
            .join(" • ");
          break;
        case "Complaints":
          label = [i.subject, i.complaintDetails].filter(Boolean).join(" • ");
          break;
        default:
          label = i.type || "Incident";
      }

      // clean, matchable key
      let searchKey =
        (i.type === "Lost Person" && (i.name || i.lastSeen || i.gender)) ||
        (i.type === "Lost Item" && (i.itemName || i.lastSeenLocation)) ||
        (i.type === "Emergency" && (i.emergencyType || i.location)) ||
        (i.type === "Complaints" && i.subject) ||
        i.reportedBy ||
        i.type;

      searchKey = norm(searchKey);

      return {
        id,
        type: i.type,
        time,
        label,
        raw: i,
        searchKey, // used on pick
        textIndex: makeIndexText(i),
      };
    });
  }, [incidents]);

  const filteredSuggestions = useMemo(() => {
    const q = norm(query);
    if (!q) return [];
    return suggestionPool.filter((s) => s.textIndex.includes(q)).slice(0, 8);
  }, [query, suggestionPool]);

  const onPickSuggestion = (s) => {
    // insert clean search key (not the fancy label)
    setQuery(s.searchKey);
    setDebounced(s.searchKey);
    setSelectedCategory("All");
    setShowSuggestions(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // ---------- list filtering ----------
  const filtered = useMemo(() => {
    const list =
      selectedCategory === "All"
        ? incidents
        : incidents.filter((i) => i.type === selectedCategory);

    if (!debounced) return list;

    return list.filter((i) => makeIndexText(i).includes(debounced));
  }, [incidents, selectedCategory, debounced]);

  // ---------- PDF export ----------
  const exportPDF = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    let nextY = addBusinessHeader(doc);
    const categoryTitle =
      selectedCategory === "All" ? "All Incidents" : selectedCategory;

    doc.setFont("helvetica", "bold").setFontSize(14);
    doc.text(`Incident Report — ${categoryTitle}`, 14, nextY);
    doc.setFont("helvetica", "normal").setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, nextY + 6);
    nextY += 12;

    // build rows with separate columns per type
    const rows = filtered.map((i, idx) => {
      const t = new Date(i.time || Date.now()).toLocaleString();
      switch (i.type) {
        case "Lost Person":
          return [
            idx + 1,
            i.type,
            i.name || "-",
            i.gender || "-",
            i.age ?? "-",
            i.lastSeen || "-",
            i.reportedBy || "-",
            i.status || "-",
            t,
          ];
        case "Lost Item":
          return [
            idx + 1,
            i.type,
            i.itemName || "-",
            i.itemDescription || "-",
            i.lastSeenLocation || "-",
            i.reportedBy || "-",
            i.status || "-",
            t,
          ];
        case "Emergency":
          return [
            idx + 1,
            i.type,
            i.emergencyType || "-",
            i.description || "-",
            i.location || "-",
            i.reportedBy || "-",
            i.status || "-",
            t,
          ];
        case "Complaints":
          return [
            idx + 1,
            i.type,
            i.subject || "-",
            i.complaintDetails || "-",
            i.reportedBy || "-",
            t,
          ];
        default:
          return [idx + 1, i.type || "-", i.reportedBy || "-", i.status || "-", t];
      }
    });

    const head =
      selectedCategory === "Lost Person"
        ? [
            [
              "#",
              "Type",
              "Name",
              "Gender",
              "Age",
              "Last Seen",
              "Reported By",
              "Status",
              "Time",
            ],
          ]
        : selectedCategory === "Lost Item"
        ? [
            [
              "#",
              "Type",
              "Item Name",
              "Description",
              "Last Seen",
              "Reported By",
              "Status",
              "Time",
            ],
          ]
        : selectedCategory === "Emergency"
        ? [
            [
              "#",
              "Type",
              "Emergency Type",
              "Description",
              "Location",
              "Reported By",
              "Status",
              "Time",
            ],
          ]
        : selectedCategory === "Complaints"
        ? [["#", "Type", "Subject", "Details", "Reported By", "Time"]]
        : [
            ["#", "Type", "Reported By", "Status", "Time"], // fallback for mixed
          ];

    // If "All", use a generic mixed table with unified columns:
    const useMixed =
      selectedCategory === "All" ||
      new Set(filtered.map((i) => i.type)).size > 1;

    autoTable(doc, {
      startY: nextY,
      head: useMixed
        ? [["#", "Type", "Summary", "Reported By", "Status", "Time"]]
        : head,
      body: useMixed
        ? filtered.map((i, idx) => {
            const t = new Date(i.time || Date.now()).toLocaleString();
            let summary = "";
            if (i.type === "Lost Person") {
              summary = [
                i.name && `Name: ${i.name}`,
                i.gender && `Gender: ${i.gender}`,
                i.age != null && `Age: ${i.age}`,
                i.lastSeen && `Last Seen: ${i.lastSeen}`,
              ]
                .filter(Boolean)
                .join(" | ");
            } else if (i.type === "Lost Item") {
              summary = [
                i.itemName && `Item: ${i.itemName}`,
                i.itemDescription && `Desc: ${i.itemDescription}`,
                i.lastSeenLocation && `Last Seen: ${i.lastSeenLocation}`,
              ]
                .filter(Boolean)
                .join(" | ");
            } else if (i.type === "Emergency") {
              summary = [
                i.emergencyType && `Type: ${i.emergencyType}`,
                i.description && `Desc: ${i.description}`,
                i.location && `Location: ${i.location}`,
              ]
                .filter(Boolean)
                .join(" | ");
            } else if (i.type === "Complaints") {
              summary = [
                i.subject && `Subject: ${i.subject}`,
                i.complaintDetails && `Details: ${i.complaintDetails}`,
              ]
                .filter(Boolean)
                .join(" | ");
            }
            return [
              idx + 1,
              i.type || "-",
              summary || "-",
              i.reportedBy || "-",
              i.status || "-",
              t,
            ];
          })
        : rows,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [33, 37, 41] },
      didDrawPage: () => {
        // repeat header if multiple pages
        addBusinessHeader(doc);
      },
      margin: { left: 14, right: 14 },
    });

    doc.save(
      `Incident_Report_${categoryTitle.replace(/\s+/g, "_")}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
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
            src={
              String(i.imageUrl).startsWith("http")
                ? i.imageUrl
                : `http://${API_BASE_URL}${i.imageUrl}`
            }
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
            src={
              String(i.imageUrl).startsWith("http")
                ? i.imageUrl
                : `http://${API_BASE_URL}${i.imageUrl}`
            }
            alt="Lost Item"
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Incident Management</h1>
          <p className="text-gray-300">View and manage incidents reported by attendees</p>
        </div>

        <div className="flex items-center gap-3">
          {/* search box */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-md px-3 py-2">
              <Search size={16} className="text-white/70" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search incidents…"
                className="bg-transparent outline-none text-sm text-white placeholder:text-white/60 w-64"
              />
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute mt-1 w-full bg-[#0f172a] border border-white/10 rounded-md shadow-xl z-50 max-h-64 overflow-auto">
                {filteredSuggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onPickSuggestion(s)}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm text-white/90"
                  >
                    {s.label}
                    <div className="text-white/50 text-xs">
                      {s.type} • {s.time.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* export button */}
          <button
            onClick={exportPDF}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            <FileDown size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6 mb-8">
        {["All", "Lost Person", "Emergency", "Lost Item", "Complaints"].map(
          (cat) => (
            <div
              key={cat}
              className={`p-4 rounded-md cursor-pointer border ${
                selectedCategory === cat ? "bg-white/20" : "bg-white/10"
              } border-white/10 hover:bg-white/20`}
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
              <div className="text-2xl font-bold mt-1">
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
          {selectedCategory === "All" ? "All Reported Incidents" : selectedCategory}
        </h2>

        <table className="w-full text-left text-white text-sm">
          <thead>{renderTableHeader()}</thead>
          <tbody>{filtered.map(renderTableRow)}</tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-6 text-gray-400">No incidents found.</div>
        )}
      </div>
    </div>
  );
};

export default Incidents;
