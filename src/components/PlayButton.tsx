"use client";

import { FaPlay, FaPause } from "react-icons/fa";
import { usePlayer } from "@/context/PlayerContext";

export default function PlayButton({ song }: { song: any }) {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const isThisPlaying = currentSong?._id === song._id.toString();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other card click events
    if (isThisPlaying) {
      togglePlay();
    } else {
      playSong({
        _id: song._id.toString(),
        title: song.title,
        artist: song.artist,
        coverUrl: song.coverUrl,
        audioUrl: song.audioUrl,
        mood: song.mood
      });
    }
  };

  return (
    <button
      onClick={handlePlayClick}
      className="bg-zinc-900 text-white p-4 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
    >
      {isThisPlaying && isPlaying ? (
        <FaPause className="text-sm" />
      ) : (
        <FaPlay className="ml-1 text-sm" />
      )}
    </button>
  );
}
