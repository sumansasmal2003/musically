"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { FaMusic } from "react-icons/fa";
import PlayButton from "@/components/PlayButton";

// 1. The actual search logic component
function SearchContent() {
  const searchParams = useSearchParams();
  // Grab the 'q' parameter from the URL if it exists (e.g., from View All clicks)
  const initialQuery = searchParams.get("q") || "";

  // Initialize the query state with the URL parameter
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce logic for live searching
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setIsSearching(false);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const res = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-white text-zinc-900 p-8 md:p-12 overflow-y-auto font-sans">
      {/* Search Header & Input */}
      <header className="mb-12 max-w-7xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-6">
          Search
        </h1>
        <div className="relative max-w-2xl">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 text-xl" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-300 transition-all shadow-sm font-medium text-lg"
          />
        </div>
      </header>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto w-full">
        {isSearching && (
          <p className="text-sm font-medium text-zinc-500 animate-pulse">Searching library...</p>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="text-center py-20">
            <FiSearch className="mx-auto text-4xl text-zinc-300 mb-4" />
            <h3 className="text-xl font-bold text-zinc-800">No results found</h3>
            <p className="text-zinc-500 mt-2">Please ensure words are spelled correctly or try fewer keywords.</p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-zinc-800 mb-6">
              {/* Change heading slightly if viewing a specific mood category */}
              {initialQuery && query === initialQuery ? `${query} Tracks` : "Top Results"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((song: any) => (
                <div
                  key={song._id}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md hover:border-zinc-300 transition-all group cursor-pointer flex flex-col"
                >
                  {/* Album Art Wrapper */}
                  <div className="w-full aspect-square bg-zinc-50 rounded-xl mb-4 relative overflow-hidden border border-zinc-100">
                    {song.coverUrl ? (
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <FaMusic className="text-4xl" />
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-zinc-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <PlayButton song={song} />
                    </div>
                  </div>

                  {/* Track Info */}
                  <h3 className="font-bold text-zinc-900 text-base truncate pr-2">
                    {song.title}
                  </h3>
                  <p className="text-sm text-zinc-500 font-medium truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// 2. The main page export wrapped in Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex-1 min-h-screen bg-white p-12 text-zinc-500">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
