import { useEffect, useMemo, useState } from "react";
import { Scanner, useDevices } from "@yudiel/react-qr-scanner";
import { Camera, Pause, Play, ScanLine } from "lucide-react";
import { toast } from "react-hot-toast";

const API_SCAN = "http://${API_BASE_URL}/api/checkout/scan";

export default function QRScanner({ onFound }) {
  const devices = useDevices();
  const [deviceId, setDeviceId] = useState("");
  const [paused, setPaused] = useState(false);
  const [last, setLast] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTicket, setLastTicket] = useState(null);

  const defaultBackCam = useMemo(() => {
    const env = devices.find((d) => /back|rear|environment/i.test(d.label));
    return env?.deviceId || devices[0]?.deviceId || "";
  }, [devices]);

  useEffect(() => {
    if (!deviceId && defaultBackCam) setDeviceId(defaultBackCam);
  }, [defaultBackCam, deviceId]);

  const handleScan = async (codes) => {
    if (!codes || !codes.length) return;
    const text = codes[0].rawValue || codes[0].raw || "";
    if (!text || text === last) return;
    setLast(text);
    setPaused(true);
    setError("");

    try {
      setIsSubmitting(true);
      const res = await fetch(API_SCAN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.message || `Scan failed (${res.status})`;
        toast.error(message);
        setError(message);
        setLastTicket(null);
      } else {
        const message = data?.message || "Check-in successful";
        toast.success(message);
        setError("");
        setLastTicket(data.ticket || null);
        if (data.ticket) {
          window.dispatchEvent(new CustomEvent("qr-scan-success", { detail: data.ticket }));
        }
        onFound?.(data.ticket || text);
      }
    } catch (err) {
      const message = err?.message || "Network error";
      toast.error(message);
      setError(message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setPaused(false), 1200);
    }
  };

  const handleError = (e) => {
    console.error("QR error:", e);
    setError(String(e?.message || e));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-start py-12 px-4">
      <div className="w-full max-w-lg bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <ScanLine className="text-indigo-400" /> QR Code Scanner
          </h2>
          <button
            onClick={() => setPaused((p) => !p)}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
            {paused ? "Resume" : "Pause"}
          </button>
        </div>

        {/* Camera select */}
        <div className="mb-4">
          <label className="text-gray-300 text-sm">Select Camera</label>
          <div className="flex items-center gap-2 mt-1">
            <Camera size={18} className="text-indigo-400" />
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="flex-1 bg-slate-700 text-white rounded-lg px-2 py-1 border border-slate-600"
            >
              {[{ deviceId: "", label: "Choose camera…" }, ...devices].map((d) => (
                <option key={d.deviceId || "none"} value={d.deviceId || ""}>
                  {d.label || "Unknown camera"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scanner */}
        <div className="rounded-xl overflow-hidden border border-indigo-500/30">
          <Scanner
            onScan={handleScan}
            onError={handleError}
            paused={paused || isSubmitting}
            constraints={deviceId ? { deviceId } : { facingMode: "environment" }}
            styles={{
              container: { width: "100%", aspectRatio: "1/1" },
              video: { width: "100%", height: "100%", objectFit: "cover" },
            }}
            scanDelay={400}
            components={{
              finder: true,
              torch: true,
              zoom: true,
            }}
          />
        </div>

        {/* Status */}
        <div className="mt-4 p-3 bg-slate-900/70 rounded-lg text-sm text-gray-200">
          {last ? (
            <>
              <span className="font-semibold text-green-400">Scanned:</span>{" "}
              <code className="text-indigo-300">{last}</code>
            </>
          ) : (
            "Point your camera at a QR code"
          )}
          {error && <div className="text-red-400 mt-2">Error: {error}</div>}
        </div>

        {lastTicket && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-sm text-gray-100 space-y-1">
            <div className="text-indigo-300 font-semibold text-base">Last attendee</div>
            <div><span className="font-semibold text-white">Name:</span> {lastTicket.fullName}</div>
            <div><span className="font-semibold text-white">NIC:</span> {lastTicket.nic}</div>
            <div>
              <span className="font-semibold text-white">Type:</span> {lastTicket.type}
              {lastTicket.type === "family" ? ` (${lastTicket.count})` : ""}
            </div>
            <div>
              <span className="font-semibold text-white">Assigned counter:</span>{" "}
              {lastTicket.assignedCounterName || lastTicket.assignedCounterDetails?.name || "—"}
            </div>
            <div>
              <span className="font-semibold text-white">Checked-in at:</span>{" "}
              {lastTicket.checkedInAt
                ? new Date(lastTicket.checkedInAt).toLocaleString("en-GB", { hour12: false })
                : "Just now"}
            </div>
            <div>
              <span className="font-semibold text-white">Total scans:</span>{" "}
              {lastTicket.scanCount ?? 1}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
