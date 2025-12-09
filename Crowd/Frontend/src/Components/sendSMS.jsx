import axios from "axios";
import { useState } from "react";

export default function SendMessage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      alert("Please enter a message before sending.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Call your backend controller endpoint
      const res = await axios.post("http://${API_BASE_URL}/users/attendees/send-message", {
        message,
      });

      alert(res.data.message || "Message sent successfully!");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert(
        error.response?.data?.message ||
          "Failed to send message. Please check the server logs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-slate-900 text-white rounded-lg shadow-md w-[400px] mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">Send Message to All Attendees</h2>

      <textarea
        className="w-full h-32 p-3 bg-slate-800 text-white rounded-md border border-gray-600 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className={`px-6 py-2 rounded-md font-medium ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Sending..." : "Send SMS"}
      </button>
    </div>
  );
}
