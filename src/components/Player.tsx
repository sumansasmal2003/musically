// src/components/Player.tsx
"use client";

import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiShuffle, FiRepeat, FiMusic } from "react-icons/fi";
import { usePlayer } from "@/context/PlayerContext";

export default function Player() {
  const {
    currentSong, isPlaying, progress, duration, isShuffle, repeatMode,
    togglePlay, playNext, playPrevious, seek, toggleShuffle, toggleRepeat, audioRef
  } = usePlayer();

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Check if current song is a live broadcast
  const isLive = currentSong.mood === "Live";

  return (
    <div className="h-24 bg-white border-t border-zinc-200 w-full flex items-center justify-between px-6 z-50">

      {/* Now Playing Info */}
      <div className="w-1/3 flex items-center gap-4">
        <div className="w-14 h-14 bg-zinc-100 rounded-lg border border-zinc-200 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
          {currentSong?.coverUrl ? (
            <img src={currentSong.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <FiMusic className="text-zinc-300 text-xl" />
          )}
        </div>
        <div>
          <h4 className="text-sm font-bold text-zinc-900 truncate max-w-[200px]">
            {currentSong?.title || "Select a Track"}
          </h4>
          <p className="text-xs text-zinc-500 truncate max-w-[200px] font-medium">
            {currentSong?.artist || "Artist"}
          </p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="w-1/3 flex flex-col items-center gap-2">
        <div className="flex items-center gap-6">

          <button
            onClick={toggleShuffle}
            disabled={isLive}
            className={`transition-colors disabled:opacity-30 ${isShuffle ? "text-zinc-900 drop-shadow-sm" : "text-zinc-400 hover:text-zinc-900"}`}
          >
            <FiShuffle />
          </button>

          <button onClick={playPrevious} disabled={!currentSong || isLive} className="text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-30">
            <FiSkipBack className="text-xl" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentSong}
            className="w-11 h-11 flex items-center justify-center bg-zinc-900 text-white rounded-full hover:bg-zinc-800 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-md"
          >
            {isPlaying ? <FiPause className="text-lg" /> : <FiPlay className="text-lg ml-1" />}
          </button>

          <button onClick={() => playNext(true)} disabled={!currentSong || isLive} className="text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-30">
            <FiSkipForward className="text-xl" />
          </button>

          <button
            onClick={toggleRepeat}
            disabled={isLive}
            className={`transition-colors relative flex items-center justify-center disabled:opacity-30 ${repeatMode === "one" ? "text-zinc-900 drop-shadow-sm" : "text-zinc-400 hover:text-zinc-900"}`}
          >
            <FiRepeat />
            {repeatMode === "one" && (
              <span className="absolute -top-1.5 -right-2 text-[9px] font-extrabold bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            )}
          </button>

        </div>

        {/* Progress Bar or Live Badge */}
        {isLive ? (
          <div className="w-full max-w-[200px] flex items-center justify-center gap-2 text-[10px] font-extrabold tracking-widest text-red-500 bg-red-50 py-1.5 rounded-full border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            LIVE BROADCAST
          </div>
        ) : (
          <div className="w-full max-w-md flex items-center gap-3 text-xs text-zinc-500 font-medium">
            <span className="w-8 text-right">{formatTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="flex-1 h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-zinc-900 hover:bg-zinc-300 transition-colors"
            />
            <span className="w-8 text-left">{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* Volume Controls */}
      <div className="w-1/3 flex items-center justify-end gap-3 text-zinc-500">
        <FiVolume2 className="text-lg" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          className="w-24 h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-zinc-900 hover:bg-zinc-300 transition-colors"
          onChange={(e) => {
            // Updated to use the context audioRef directly for better safety
            if (audioRef.current) audioRef.current.volume = Number(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
