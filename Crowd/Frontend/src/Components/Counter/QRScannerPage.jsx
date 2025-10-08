import { useState } from "react";
import QRScanner from "../Counter/QRScanner"; // adjust the relative path to your QRScanner.jsx

const SCAN_API = import.meta.env.VITE_SCAN_API || "http://localhost:5000/api/scan";

export default function QRScannerPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleFound({ text, reservationId }) {
    setError("");
    setResult(null);
    try {
      const res = await fetch(SCAN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId,   // if QR contains 24-hex id (reservation:<id> or raw id)
          qrText: text,    // always send raw text too (for CF payloads)
          checkedInBy: "counter-01" // optional: who scanned
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message || `Error ${res.status}`);
      setResult(json.ticket);
    } catch (e) {
      setError(e.message || "Scan failed");
    }
  }

  return (
    <div className="p-4">
      <QRScanner onFound={handleFound} />

      {result && (
        <div className="mt-4 rounded-lg bg-emerald-600/15 p-4 text-white">
          <div><b>Name:</b> {result.fullName}</div>
          <div><b>NIC:</b> {result.nic}</div>
          <div><b>Type:</b> {result.type} {result.type === "family" ? `(${result.count})` : ""}</div>
          <div><b>Counter:</b> {result.counter || "—"}</div>
          <div><b>Checked in at:</b> {new Date(result.checkedInAt).toLocaleString()}</div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-rose-600/20 p-4 text-rose-100">
          {error}
        </div>
      )}
    </div>
  );
}
