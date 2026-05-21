// src/app/artist/[name]/page.tsx
import connectToDatabase from "@/lib/mongodb";
import Song from "@/models/Song";
import PlayButton from "@/components/PlayButton";
import { FaMusic } from "react-icons/fa";
import { FiUser } from "react-icons/fi";

// Utility to escape regex characters safely
const escapeRegex = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 1. Update the type definition: params is now a Promise
export default async function ArtistPage({ params }: { params: Promise<{ name: string }> }) {

  // 2. AWAIT the params before accessing .name
  const resolvedParams = await params;

  // Decode the URL encoded artist name
  const decodedArtistName = decodeURIComponent(resolvedParams.name);
  const safeArtistName = escapeRegex(decodedArtistName);

  // Fetch all songs where this artist's name appears (case-insensitive)
  await connectToDatabase();
  const songs = await Song.find({
    artist: { $regex: safeArtistName, $options: "i" }
  }).lean();

  // Convert Mongoose objects to plain JavaScript objects
  const formattedSongs = songs.map((song: any) => ({
    _id: song._id.toString(),
    title: song.title,
    artist: song.artist,
    album: song.album || "",
    coverUrl: song.coverUrl,
    audioUrl: song.audioUrl,
    duration: song.duration,
    mood: song.mood,
    moodScore: song.moodScore || 0,
    createdAt: song.createdAt ? new Date(song.createdAt).toISOString() : ""
  }));

  return (
    <div className="flex flex-col flex-1 min-h-screen text-zinc-900 p-8 md:p-12 overflow-y-auto">
      {/* Artist Header Section */}
      <header className="mb-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-6 mb-2">
          <div className="w-24 h-24 bg-zinc-100 rounded-full shadow-sm border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
            <FiUser className="text-zinc-300 text-4xl" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
              {decodedArtistName}
            </h1>
            <p className="text-lg text-zinc-500 font-medium mt-2">
              {formattedSongs.length} track{formattedSongs.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>
      </header>

      {/* Artist Tracks Grid */}
      <main className="max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-zinc-800 mb-6">All Songs</h2>

        {formattedSongs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {formattedSongs.map((song: any) => (
              <div
                key={song._id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 hover:shadow-md hover:border-zinc-300 transition-all group cursor-pointer flex-col flex"
              >
                {/* Album Art Wrapper */}
                <div className="w-full aspect-square bg-zinc-100 rounded-xl mb-4 relative overflow-hidden border border-zinc-100">
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

                  {/* Play Button Hover Overlay */}
                  <div className="absolute inset-0 bg-zinc-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <PlayButton song={song} />
                  </div>
                </div>

                {/* Track Info */}
                <h3 className="font-bold text-zinc-900 text-base truncate pr-2">
                  {song.title}
                </h3>
                <p className="text-sm text-zinc-500 font-medium truncate mt-0.5">
                  {song.mood !== "Unknown" ? song.mood : "Standard Mix"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">No tracks found for this artist.</p>
        )}
      </main>
    </div>
  );
}
