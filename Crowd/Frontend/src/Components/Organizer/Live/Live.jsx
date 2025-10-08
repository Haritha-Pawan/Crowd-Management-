import React, { useState } from "react";
import { Video } from "lucide-react";

export default function Live() {
  // --- YOUTUBE ---
  const [ytMode, setYtMode] = useState("video"); // "video" | "live"
  const [youtubeVideoId, setYoutubeVideoId] = useState("dQw4w9WgXcQ"); // test a normal video first
  const [youtubeChannelId, setYoutubeChannelId] = useState(""); // put UC... when you go live

  const ytSrc =
    ytMode === "video" && youtubeVideoId.trim()
      ? `https://www.youtube.com/embed/${youtubeVideoId.trim()}`
      : ytMode === "live" && youtubeChannelId.trim()
      ? `https://www.youtube.com/embed/live_stream?channel=${youtubeChannelId.trim()}`
      : "";

  // --- FACEBOOK ---
  const [facebookUrl, setFacebookUrl] = useState("");
  const fbSrc = facebookUrl
    ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        facebookUrl.trim()
      )}&show_text=false&autoplay=false`
    : "";

  // --- ZOOM ---
  const [zoomUrl, setZoomUrl] = useState("");

  return (
    <div className="p-12 min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <div className="text-white text-3xl font-bold">Live Preview Dashboard</div>
      <div className="text-xl text-gray-300 mb-8">Paste your live links to monitor streams</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* =================== YOUTUBE =================== */}
        <section className="bg-white/5 border border-white/10 rounded-lg p-5">
          <div className="flex gap-3 items-center mb-2">
            <Video color="#F74F47" />
            <div className="text-white font-semibold">YouTube</div>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Test with a <b>Video ID</b> first. When you actually go live, switch to <b>Live (Channel ID)</b>.
          </p>

          {/* Mode toggle */}
          <div className="flex gap-3 mb-3">
            <label className="text-gray-200 text-sm flex items-center gap-2">
              <input
                type="radio"
                name="ytMode"
                value="video"
                checked={ytMode === "video"}
                onChange={() => setYtMode("video")}
              />
              Video ID
            </label>
            <label className="text-gray-200 text-sm flex items-center gap-2">
              <input
                type="radio"
                name="ytMode"
                value="live"
                checked={ytMode === "live"}
                onChange={() => setYtMode("live")}
              />
              Live (Channel ID)
            </label>
          </div>

          {ytMode === "video" ? (
            <>
              <label className="block text-gray-200 text-sm mb-1">YouTube Video ID</label>
              <input
                className="w-full mb-3 rounded-md bg-white/10 text-white p-2 outline-none border border-white/10"
                placeholder="e.g. dQw4w9WgXcQ"
                value={youtubeVideoId}
                onChange={(e) => setYoutubeVideoId(e.target.value)}
              />
            </>
          ) : (
            <>
              <label className="block text-gray-200 text-sm mb-1">YouTube Channel ID (starts with UC...)</label>
              <input
                className="w-full mb-3 rounded-md bg-white/10 text-white p-2 outline-none border border-white/10"
                placeholder="e.g. UC_x5XG1OV2P6uZZ5FSM9Ttw"
                value={youtubeChannelId}
                onChange={(e) => setYoutubeChannelId(e.target.value)}
              />
            </>
          )}

          <div className="w-full h-56 bg-black/40 rounded overflow-hidden flex items-center justify-center">
            {ytSrc ? (
              <iframe
                key={ytSrc} // force refresh on change
                className="w-full h-full"
                src={ytSrc}
                title="YouTube"
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <span className="text-gray-400 text-sm">Enter a valid Video ID or Channel ID</span>
            )}
          </div>
        </section>

        {/* =================== FACEBOOK =================== */}
        <section className="bg-white/5 border border-white/10 rounded-lg p-5">
          <div className="flex gap-3 items-center mb-2">
            <Video color="#0ea5e9" />
            <div className="text-white font-semibold">Facebook Live</div>
          </div>
          <p className="text-gray-300 text-sm mb-2">
            Paste a <b>public</b> Facebook live/video URL (privacy must be Public).
          </p>
          <input
            type="text"
            placeholder="e.g. https://www.facebook.com/YourPage/videos/1234567890"
            className="w-full mb-3 rounded-md bg-white/10 text-white p-2 outline-none border border-white/10"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
          />
          <div className="w-full h-56 bg-black/40 rounded overflow-hidden flex items-center justify-center">
            {fbSrc ? (
              <iframe
                key={fbSrc}
                className="w-full h-full"
                src={fbSrc}
                title="Facebook"
                style={{ border: "none", overflow: "hidden" }}
                scrolling="no"
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <span className="text-gray-400 text-sm">Paste a PUBLIC Facebook video/live URL</span>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-2">
            If it stays blank: make sure the post is Public and your browser isn’t blocking 3rd-party cookies.
          </p>
        </section>

        {/* =================== ZOOM =================== */}
        <section className="bg-white/5 border border-white/10 rounded-lg p-5">
          <div className="flex gap-3 items-center mb-2">
            <Video color="#22c55e" />
            <div className="text-white font-semibold">Zoom (Join link)</div>
          </div>
          <p className="text-gray-300 text-sm mb-2">Zoom can’t be embedded. Share a join URL.</p>
          <input
            type="text"
            placeholder="e.g. https://zoom.us/j/1234567890"
            className="w-full mb-3 rounded-md bg-white/10 text-white p-2 outline-none border border-white/10"
            value={zoomUrl}
            onChange={(e) => setZoomUrl(e.target.value)}
          />
          <div className="w-full h-56 bg-black/40 rounded flex items-center justify-center">
            {zoomUrl ? (
              <a
                href={zoomUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow"
              >
                Join Zoom Meeting
              </a>
            ) : (
              <span className="text-gray-400 text-sm">Paste a Zoom meeting link</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
