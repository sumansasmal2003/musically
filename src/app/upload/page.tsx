// src/app/upload/page.tsx
"use client";

import { useState } from "react";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { migrateSongToMongo, analyzeSongMood } from "@/app/actions/songActions";
import { FiSearch, FiCheck, FiAlertCircle, FiUploadCloud, FiMusic, FiCpu } from "react-icons/fi";

export default function UploadPage() {
  const [musicId, setMusicId] = useState("");
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message: string }>({
    type: "idle",
    message: ""
  });

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicId) return;

    setStatus({ type: "loading", message: "Fetching from Firebase..." });
    setFetchedData(null);

    try {
      const musicRef = ref(db, `musics/${musicId}`);
      const snapshot = await get(musicRef);

      if (snapshot.exists()) {
        const fbData = snapshot.val();
        const title = fbData.musicName || "Unknown Title";
        const artist = fbData.artist || "Unknown Artist";

        // Step 2: Now that we have the data, ask the AI for the mood
        setStatus({ type: "loading", message: "Analyzing mood via AI Engine..." });
        const aiResult = await analyzeSongMood(title, artist);

        setFetchedData({
          ...fbData,
          title,
          artist,
          detectedMood: aiResult.mood,
          moodScore: aiResult.score
        });

        setStatus({ type: "success", message: "Music found and analyzed!" });
      } else {
        setStatus({ type: "error", message: "No music found with this ID." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Error connecting to Firebase or AI." });
    }
  };

  const handleMigrate = async () => {
    if (!fetchedData) return;
    setStatus({ type: "loading", message: "Saving to MongoDB..." });

    const formattedData = {
      title: fetchedData.title,
      artist: fetchedData.artist,
      coverUrl: fetchedData.musicImage || "",
      audioUrl: fetchedData.musicFile || "",
      duration: "0:00",
      mood: fetchedData.detectedMood || "Unknown",
      moodScore: fetchedData.moodScore || 0,
    };

    const response = await migrateSongToMongo(formattedData);

    if (response.success) {
      setStatus({ type: "success", message: response.message });
      setFetchedData(null);
      setMusicId("");
    } else {
      setStatus({ type: "error", message: response.message });
    }
  };

  return (
    <div className="relative flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 overflow-hidden px-6 py-24 font-sans">
      <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-zinc-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[30rem] h-[30rem] bg-zinc-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40"></div>

      <div className="relative z-10 w-full max-w-xl p-10 rounded-[2rem] bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)]">

        <div className="flex items-center gap-5 mb-10">
          <div className="p-4 bg-white border border-zinc-100 rounded-2xl text-zinc-800 shadow-sm">
            <FiUploadCloud className="text-3xl" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Migrate Music</h2>
            <p className="text-sm text-zinc-500 font-medium mt-1">Transfer and analyze tracks.</p>
          </div>
        </div>

        {status.type !== "idle" && (
          <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm font-semibold backdrop-blur-md border transition-all duration-300 ${
            status.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
            status.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
            "bg-white border-zinc-200 text-zinc-700 shadow-sm"
          }`}>
            {status.type === "success" && <FiCheck className="text-lg" />}
            {status.type === "error" && <FiAlertCircle className="text-lg" />}
            {status.message}
          </div>
        )}

        <form onSubmit={handleFetch} className="mb-8">
          <label className="block text-sm font-bold text-zinc-700 mb-3 ml-1 tracking-wide">
            FIREBASE MUSIC ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={musicId}
              onChange={(e) => setMusicId(e.target.value)}
              placeholder="e.g., 131"
              className="flex-1 px-5 py-4 rounded-2xl bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all shadow-sm font-medium text-lg"
            />
            <button
              type="submit"
              disabled={status.type === "loading"}
              className="px-8 py-4 rounded-2xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800 hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
            >
              <FiSearch className="text-xl" /> Fetch
            </button>
          </div>
        </form>

        {fetchedData && (
          <div className="pt-8 border-t border-zinc-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xs font-extrabold text-zinc-400 mb-5 uppercase tracking-widest ml-1">
              AI Analysis & Preview
            </h3>

            <div className="space-y-4 mb-8 p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium">Track Name</span>
                <span className="font-bold text-zinc-900 text-base">{fetchedData.title}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium">Artist</span>
                <span className="font-bold text-zinc-900 text-base">{fetchedData.artist}</span>
              </div>

              {/* New AI Mood Row */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium flex items-center gap-2">
                  <FiCpu className="text-zinc-400"/> Detected Mood
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full text-xs">
                    {fetchedData.detectedMood}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-medium">Media Source</span>
                <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-200">
                  <FiMusic className="text-zinc-400" />
                  <span className="font-bold text-zinc-900 text-xs">
                    {fetchedData.musicFile ? "Linked" : "Missing"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleMigrate}
              disabled={status.type === "loading"}
              className="w-full bg-zinc-900 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-zinc-800 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              Confirm & Save to MongoDB
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
