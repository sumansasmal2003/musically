"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import Hls from "hls.js";

interface Song {
  _id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  mood: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: "off" | "one";
  playSong: (song: Song) => void;
  togglePlay: () => void;
  playNext: (manual?: boolean) => void;
  playPrevious: () => void;
  seek: (value: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "one">("off");
  const [history, setHistory] = useState<Song[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playNext = async (manual = false) => {
    if (!currentSong) return;

    if (!manual && repeatMode === "one" && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setIsPlaying(false));
      return;
    }

    // Skip MongoDB fetch if we are playing a Live Radio stream
    if (currentSong.mood === "Live") {
      setIsPlaying(false);
      return;
    }

    try {
      setHistory((prev) => [...prev, currentSong]);
      const playedIds = history.slice(-30).map((s) => s._id).join(",");

      const res = await fetch(`/api/songs/next?mood=${currentSong.mood}&currentId=${currentSong._id}&shuffle=${isShuffle}&playedIds=${playedIds}`);
      const nextSong = await res.json();

      if (nextSong && nextSong._id) {
        setIsPlaying(false);
        setProgress(0);

        setCurrentSong({
          _id: nextSong._id.toString(),
          title: nextSong.title,
          artist: nextSong.artist,
          coverUrl: nextSong.coverUrl,
          audioUrl: nextSong.audioUrl,
          mood: nextSong.mood
        });
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Failed to load next song:", error);
      setIsPlaying(false);
    }
  };

  const playPrevious = () => {
    if (!audioRef.current) return;
    if (progress > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (history.length > 0) {
      const previousSong = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));

      setIsPlaying(false);
      setProgress(0);
      setCurrentSong(previousSong);
    } else {
      audioRef.current.currentTime = 0;
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
    }
  };

  const seek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setProgress(value);
    }
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setRepeatMode(prev => prev === "off" ? "one" : "off");

  // HLS and Standard Audio Playback Logic
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    if (!currentSong._id.startsWith("live-")) {
      fetch("/api/songs/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: currentSong._id }),
      }).catch(err => console.error("Play tracking failed", err));
    }

    const audio = audioRef.current;
    const url = currentSong.audioUrl;
    let hlsInstance: Hls | null = null;

    if (url.includes(".m3u8")) {
      // Handle HLS Streams for Indian Radio
      if (Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(audio);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isPlaying) {
            audio.play().catch(e => {
              console.error("HLS Playback failed:", e);
              setIsPlaying(false);
            });
          }
        });
      } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        // Native support for Safari
        audio.src = url;
        if (isPlaying) {
          audio.play().catch(e => {
            console.error("Safari HLS Playback failed:", e);
            setIsPlaying(false);
          });
        }
      }
    } else {
      // Handle Standard MP3 / AAC Streams
      audio.src = url;
      if (isPlaying) {
        audio.play().catch(e => {
          console.error("Standard Playback failed:", e);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [currentSong, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
        const dur = audioRef.current.duration;
        setDuration(isFinite(dur) ? dur : 0);
    }
  };

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, progress, duration, isShuffle, repeatMode,
      playSong, togglePlay, playNext, playPrevious, seek, toggleShuffle, toggleRepeat, audioRef
    }}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => playNext(false)}
        onError={(e) => {
          console.error("Audio stream error:", e);
          setIsPlaying(false);
        }}
      />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within a PlayerProvider");
  return context;
}
