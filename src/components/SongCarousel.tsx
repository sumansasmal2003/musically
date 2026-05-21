// src/components/SongCarousel.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiArrowRight } from "react-icons/fi";
import { usePlayer } from "@/context/PlayerContext";
import Link from "next/link";

interface Song {
  _id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  mood: string;
}

interface SongCarouselProps {
  title: string;
  icon?: React.ReactNode;
  songs: Song[];
  moodCategory: string;
  hideExplore?: boolean;
}

export default function SongCarousel({ title, icon, songs, moodCategory, hideExplore = false }: SongCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayer();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!songs || songs.length === 0) return null;

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [songs]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 350);
    }
  };

  // Determine if we have enough songs to warrant an "Explore" button
  const hasEnoughToExplore = songs.length >= 6 && !hideExplore;

  return (
    <section className="mb-12 relative group">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-3 capitalize">
          {icon}
          {title}
        </h2>

        {/* Only show View All if the row fills up */}
        {hasEnoughToExplore && (
          <Link
            href={`/search?q=${moodCategory}`}
            className="text-sm font-semibold text-zinc-500 hover:text-indigo-600 transition-colors"
          >
            View All
          </Link>
        )}
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-md border border-zinc-200 text-zinc-800 rounded-full shadow-lg hover:bg-zinc-50 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <FiChevronLeft className="text-2xl mr-1" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {songs.map((song) => {
            const isThisPlaying = currentSong?._id === song._id && isPlaying;

            return (
              <div
                key={song._id}
                className="snap-start shrink-0 w-40 md:w-48 lg:w-56 group/card cursor-pointer"
                onClick={() => (currentSong?._id === song._id ? togglePlay() : playSong(song))}
              >
                <div className="relative w-full aspect-square mb-4 rounded-2xl overflow-hidden shadow-sm group-hover/card:shadow-xl transition-all duration-300">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${isThisPlaying ? 'scale-110' : 'group-hover/card:scale-110'}`}
                  />

                  <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex items-center justify-center ${isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'}`}>
                    <button className="w-14 h-14 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-indigo-400 transition-all">
                      {isThisPlaying ? <FiPause className="text-xl" /> : <FiPlay className="text-xl ml-1" />}
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-zinc-900 truncate text-base mb-1 group-hover/card:text-indigo-600 transition-colors">
                  {song.title}
                </h3>
                <p className="text-sm text-zinc-500 truncate font-medium">
                  {song.artist}
                </p>
              </div>
            );
          })}

          {/* Only show Explore More card if the row fills up */}
          {hasEnoughToExplore && (
            <Link href={`/search?q=${moodCategory}`} className="snap-start shrink-0 w-40 md:w-48 lg:w-56 group/more flex flex-col justify-center items-center">
              <div className="w-full aspect-square mb-4 rounded-2xl border-2 border-dashed border-zinc-300 bg-white/50 flex flex-col items-center justify-center group-hover/more:border-indigo-400 group-hover/more:bg-indigo-50/50 transition-all duration-300 shadow-sm">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-zinc-400 group-hover/more:text-indigo-600 group-hover/more:shadow-md transition-all">
                  <FiArrowRight className="text-2xl" />
                </div>
                <span className="mt-4 font-bold text-zinc-500 group-hover/more:text-indigo-600 transition-colors">
                  Explore More
                </span>
              </div>
            </Link>
          )}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-md border border-zinc-200 text-zinc-800 rounded-full shadow-lg hover:bg-zinc-50 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <FiChevronRight className="text-2xl ml-1" />
          </button>
        )}
      </div>
    </section>
  );
}
