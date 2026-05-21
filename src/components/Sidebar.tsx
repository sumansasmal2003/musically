// src/components/Sidebar.tsx
import Link from "next/link";
import { FiMusic, FiUser } from "react-icons/fi";
import connectToDatabase from "@/lib/mongodb";
import Song from "@/models/Song";
import SidebarNav from "./SidebarNav"; // <-- Import the new client component

async function getTopArtists() {
  try {
    await connectToDatabase();
    const topArtists = await Song.aggregate([
      { $project: { artistArray: { $split: ["$artist", ","] } } },
      { $unwind: "$artistArray" },
      { $group: { _id: { $trim: { input: "$artistArray" } }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    return topArtists.map(a => a._id).filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch top artists:", error);
    return [];
  }
}

export default async function Sidebar() {
  const popularArtists = await getTopArtists();

  return (
    <aside className="w-64 bg-zinc-50 border-r border-zinc-200 h-full flex flex-col pt-8 pb-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="bg-zinc-900 text-white p-2 rounded-lg">
          <FiMusic className="text-xl" />
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-900">Musically AI</span>
      </div>

      {/* Main Navigation - Now completely dynamic */}
      <SidebarNav />

      {/* Popular Artists */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-4 mb-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Popular Artists</h2>
        </div>
        <div className="flex flex-col gap-1">
          {popularArtists.length > 0 ? (
            popularArtists.map((artist, index) => (
              <Link
                key={index}
                href={`/artist/${encodeURIComponent(artist)}`}
                className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <FiUser className="text-lg text-zinc-400 shrink-0" />
                <span className="truncate">{artist}</span>
              </Link>
            ))
          ) : (
            <p className="px-4 text-sm text-zinc-400">No artists found</p>
          )}
        </div>
      </div>
    </aside>
  );
}
