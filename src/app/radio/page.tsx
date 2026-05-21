"use client";

import { useState, useEffect } from "react";
import { FiRadio, FiPlay, FiPause } from "react-icons/fi";
import { usePlayer } from "@/context/PlayerContext";

// 100% Secure (HTTPS) and highly stable Indian Radio Streams
const RADIO_CHANNELS = [
  {
    id: "vividh-bharati",
    name: "Vividh Bharati",
    isLive: true,
    streamUrl: "https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/playlist.m3u8",
    description: "The classic national service of All India Radio.",
    cover: "https://onlineradiofm.in/assets/image/radio/100/vividh_bharati.webp"
  },
  {
    id: "Radio Mirchi 98.3 FM Delhi",
    name: "Radio Mirchi 98.3 FM",
    isLive: true,
    streamUrl: "https://eu8.fastcast4u.com/proxy/clyedupq?mp=%2F1?aw_0_req_lsid=2c0fae177108c9a42a7cf24878625444",
    description: "It's hot! The best of Bollywood hits and chart-toppers.",
    cover: "https://onlineradiofm.in/assets/image/radio/180/radio-mirchi.webp"
  },
  {
    id: "Radio Hungama 90s Once Again",
    name: "Hungama 90s Once Again",
    isLive: true,
    streamUrl: "https://stream-289.zeno.fm/rm4i9pdex3cuv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJybTRpOXBkZXgzY3V2IiwiaG9zdCI6InN0cmVhbS0yODkuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6ImVaME1vZmVhUV9hRmJWLVdxdWd0elEiLCJpYXQiOjE3NzkzMzExMTcsImV4cCI6MTc3OTMzMTE3N30._Ea_61lQdxdESWu5C963rU-EchPyVAotRfy6pnKO11A",
    description: "Taking you back to the vibrant 90s Bollywood pop era.",
    cover: "https://onlineradiofm.in/assets/image/radio/180/Hungama90sOnceAgain.webp"
  },
  {
    id: "radio-lata-mangeshkar",
    name: "Radio Lata Mangeshkar",
    isLive: true,
    streamUrl: "https://stream-288.zeno.fm/87xam8pf7tzuv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiI4N3hhbThwZjd0enV2IiwiaG9zdCI6InN0cmVhbS0yODguemVuby5mbSIsInJ0dGwiOjUsImp0aSI6Imw0bGhnOTYzU002ZUtPeWM4Z2lNTUEiLCJpYXQiOjE3NzkzMzE0MjUsImV4cCI6MTc3OTMzMTQ4NX0.i_-peeX1rJN4blhQdBsLMAeGeeZ9PeX1v2RrRAK050Q",
    description: "A dedicated tribute to the legendary voice of India, Lata Mangeshkar.",
    cover: "https://onlineradiofm.in/assets/image/radio/180/RadioCity-LataMangeshkarRadio2222.png"
  },
  {
    id: "93.5-red-fm",
    name: "93.5 Red FM",
    isLive: true,
    streamUrl: "https://stream-175.zeno.fm/9phrkb1e3v8uv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiI5cGhya2IxZTN2OHV2IiwiaG9zdCI6InN0cmVhbS0xNzUuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6InhvRzFLc3lKUW9PZ0FOYkp1UHJSV2ciLCJpYXQiOjE3NzkzMzE1MDksImV4cCI6MTc3OTMzMTU2OX0.VVebF6MRCz_fldHH6xrpMeCBRh2vTt8v-4q4VL-jhYY",
    description: "Bajaate Raho! Superhit music and endless entertainment.",
    cover: "https://onlineradiofm.in/assets/image/radio/180/red-fm15.webp"
  },
  {
    id: "Ishq-fm-94.3",
    name: "Ishq 94.3 FM",
    isLive: true,
    streamUrl: "https://drive.uber.radio/uber/bollywoodlove/icecast.audio",
    description: "Do the Ishq! The romantic destination for Bollywood love songs.",
    cover: "https://onlineradiofm.in/assets/image/radio/180/ishq.webp"
  },
  {
    id: "Suryan-fm",
    name: "Suryan FM",
    isLive: true,
    streamUrl: "https://radios.crabdance.com:8002/2",
    description: "The superhit Tamil radio station bringing you the best Kollywood music.",
    cover: "https://onlineradiofm.in/assets/image/radio/180/suryanradio.webp"
  },
  {
    id: "Radio Hungama Evergreen Bollywood",
    name: "Hungama Evergreen",
    isLive: true,
    streamUrl: "https://server.mixify.in:8010/radio.mp3",
    description: "Evergreen classics and golden hits from the 70s, 80s, and 90s.",
    cover: "https://onlineradiofm.in/assets/image/radio/180/Evergreen-Bollywood.webp"
  },
  {
    id: "Hits Of Bollywood",
    name: "Hits Of Bollywood",
    isLive: true,
    streamUrl: "https://stream-291.zeno.fm/a2gyqzwpwfeuv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiJhMmd5cXp3cHdmZXV2IiwiaG9zdCI6InN0cmVhbS0yOTEuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6ImdCZjNMdXlkUlU2LXBHd2phYjBmQ0EiLCJpYXQiOjE3NzkzMzIwNjgsImV4cCI6MTc3OTMzMjEyOH0.jni2Ty4GO_sy5_Hz7Altlk3auuEfPShkdIHEP4BfBgo",
    description: "Nonstop Bollywood hits from 80s, 90s and 00s. Evergreen and golden hits.",
    cover: "https://onlineradiofm.in/assets/image/radio/180/hitsofbollywood.webp"
  },
  {
    id: "Mohammed Rafi Radio",
    name: "Mohammed Rafi Radio",
    isLive: true,
    streamUrl: "https://stream-286.zeno.fm/2xx62x8ztm0uv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiIyeHg2Mng4enRtMHV2IiwiaG9zdCI6InN0cmVhbS0yODYuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6IkpYX2kteW9iUmFlUXNSQzBoYmxlM1EiLCJpYXQiOjE3NzkzMzIxNzQsImV4cCI6MTc3OTMzMjIzNH0.2CtDxBu1N5eAX4C4J0578z2A70w-Z-PNiyMHxlCUScY",
    description: "A continuous tribute to the legendary Mohammed Rafi.",
    cover: "https://onlineradiofm.in/assets/image/radio/180/rafi.webp"
  },
  {
    id: "Kishore Kumar Radio",
    name: "Kishore Kumar Radio",
    isLive: true,
    streamUrl: "https://stream-281.zeno.fm/0ghtfp8ztm0uv?zt=eyJhbGciOiJIUzI1NiJ9.eyJzdHJlYW0iOiIwZ2h0ZnA4enRtMHV2IiwiaG9zdCI6InN0cmVhbS0yODEuemVuby5mbSIsInJ0dGwiOjUsImp0aSI6IkQzbTBFakh1UU91NjJfU0FONm1XUWciLCJpYXQiOjE3NzkzMzIzNTcsImV4cCI6MTc3OTMzMjQxN30.vzw4BEk9Dlzjg8opsGgUW6dTbvw4-mZvw_tsgBpSNww",
    description: "The timeless, energetic tracks of Kishore Kumar non-stop.",
    cover: "https://onlineradiofm.in/assets/image/radio/180/kishhorekumar.webp"
  },
  {
    id: "Radio Hungama Punjabi Hits",
    name: "Hungama Punjabi Hits",
    isLive: true,
    streamUrl: "https://s8.voscast.com:7021/stream",
    description: "The best of energetic Punjabi pop and Bhangra beats.",
    cover: "https://onlineradiofm.in/assets/image/radio/180/hot-now-punjabi.webp"
  },
];

export default function RadioPage() {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const [loadingStation, setLoadingStation] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStationClick = async (channel: any) => {
    const isActive = currentSong?._id === `live-${channel.id}`;

    if (isActive) {
      togglePlay();
      return;
    }

    setLoadingStation(channel.id);

    try {
      playSong({
        _id: `live-${channel.id}`,
        title: channel.name,
        artist: "Live Broadcast",
        coverUrl: channel.cover,
        audioUrl: channel.streamUrl,
        mood: "Live"
      });
    } catch (error) {
      console.error("Failed to start radio station:", error);
    } finally {
      setTimeout(() => setLoadingStation(null), 500);
    }
  };

  if (!isMounted) {
    return <div className="flex-1 min-h-screen bg-zinc-50"></div>;
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-gradient-to-b from-zinc-50 to-white text-zinc-900 p-8 md:p-12 overflow-y-auto font-sans">

      {/* Header */}
      <header className="mb-12 max-w-[1600px] mx-auto w-full">
        <div className="flex items-center gap-5 mb-2">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center text-white border-t border-white/20">
            <FiRadio className="text-2xl drop-shadow-sm" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-indigo-900">
              India FM Radio
            </h1>
            <p className="text-lg text-zinc-500 font-medium mt-1">
              Tune into live terrestrial broadcasts and premium streams.
            </p>
          </div>
        </div>
      </header>

      {/* Grid Layout updated to adapt up to 3 columns on ultra-wide screens */}
      <main className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {RADIO_CHANNELS.map((channel) => {
            const isLoading = loadingStation === channel.id;
            const isActive = currentSong?._id === `live-${channel.id}`;
            const isThisPlaying = isActive && isPlaying;

            return (
              <div key={channel.id} className="relative group w-full h-full flex">

                {/* --- Animated Gradient Glow Wrapper --- */}
                {isActive && (
                  <div className={`absolute -inset-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-[1.75rem] blur-md opacity-70 transition-all duration-500 ${isThisPlaying ? 'animate-pulse' : ''}`}></div>
                )}

                <button
                  onClick={() => handleStationClick(channel)}
                  disabled={loadingStation !== null && !isActive}
                  className={`relative flex w-full flex-col p-5 bg-white/90 backdrop-blur-xl border rounded-[1.6rem] transition-all duration-300 text-left disabled:opacity-70 disabled:cursor-not-allowed ${
                    isActive
                      ? "border-white/50 shadow-2xl scale-[1.02]"
                      : "border-zinc-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                  }`}
                >
                  <div className="flex items-start gap-4 w-full">
                    {/* Cover Art */}
                    <div className={`w-20 h-20 shrink-0 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-500 shadow-sm ${
                      isActive
                        ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105'
                        : 'border border-zinc-100 group-hover:shadow-md group-hover:scale-105'
                    }`}>
                      <img
                        src={channel.cover}
                        alt={channel.name}
                        className="w-full h-full object-cover bg-zinc-100"
                      />
                    </div>

                    {/* Meta Info */}
                    <div className="flex-1 pt-1 min-w-0">

                      {/* Badge Row */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-50 text-red-600 px-2 py-0.5 rounded-md border border-red-100/50 flex items-center gap-1.5">
                          {isThisPlaying ? (
                            <span className="flex items-center gap-0.5 h-2">
                              <span className="w-[2px] h-full bg-red-600 animate-[bounce_0.8s_infinite] rounded-full"></span>
                              <span className="w-[2px] h-[60%] bg-red-600 animate-[bounce_1.2s_infinite] rounded-full"></span>
                              <span className="w-[2px] h-full bg-red-600 animate-[bounce_1s_infinite] rounded-full"></span>
                            </span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          )}
                          LIVE
                        </span>

                        {isLoading && (
                          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-md animate-pulse">
                            Tuning...
                          </span>
                        )}
                      </div>

                      <h2 className="text-sm font-bold text-zinc-900 leading-tight truncate">
                        {channel.name}
                      </h2>

                      <div className={`mt-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                          : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white"
                      }`}>
                        {isThisPlaying ? <FiPause className="text-lg" /> : <FiPlay className="text-lg ml-1" />}
                      </div>
                    </div>
                  </div>

                  {/* Description moves below on this layout for a cleaner card feel */}
                  <div className="mt-4 pt-4 border-t border-zinc-100 w-full">
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed line-clamp-2">
                      {channel.description}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
