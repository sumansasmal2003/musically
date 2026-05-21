import { FiTrendingUp, FiMusic, FiCoffee, FiMoon, FiActivity, FiSun, FiHeart, FiCloudRain, FiSmile } from "react-icons/fi";
import connectToDatabase from "@/lib/mongodb";
import Song from "@/models/Song";
import SongCarousel from "@/components/SongCarousel";

// NEW: 3D Icon Wrapper Component
const ThreeDIcon = ({ icon: Icon, fromStr, toStr, shadowStr }: any) => (
  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${fromStr} ${toStr} ${shadowStr} flex items-center justify-center text-white border-t border-white/40 border-l border-l-white/20`}>
    <Icon className="text-2xl drop-shadow-md" />
  </div>
);

// Map moods to appropriate 3D styled icons
function getIconForMood(mood: string) {
  switch (mood.toLowerCase()) {
    case "focus":
      return <ThreeDIcon icon={FiCoffee} fromStr="from-amber-400" toStr="to-orange-600" shadowStr="shadow-[0_8px_16px_rgba(234,88,12,0.4)]" />;
    case "calm":
    case "chill":
      return <ThreeDIcon icon={FiMoon} fromStr="from-indigo-400" toStr="to-blue-700" shadowStr="shadow-[0_8px_16px_rgba(59,130,246,0.4)]" />;
    case "energetic":
    case "energy":
      return <ThreeDIcon icon={FiActivity} fromStr="from-rose-400" toStr="to-red-600" shadowStr="shadow-[0_8px_16px_rgba(225,29,72,0.4)]" />;
    case "happy":
      return <ThreeDIcon icon={FiSun} fromStr="from-yellow-300" toStr="to-amber-500" shadowStr="shadow-[0_8px_16px_rgba(245,158,11,0.4)]" />;
    case "romantic":
    case "love":
      return <ThreeDIcon icon={FiHeart} fromStr="from-pink-400" toStr="to-rose-600" shadowStr="shadow-[0_8px_16px_rgba(225,29,72,0.4)]" />;
    case "sad":
    case "melancholy":
      return <ThreeDIcon icon={FiCloudRain} fromStr="from-slate-400" toStr="to-slate-600" shadowStr="shadow-[0_8px_16px_rgba(71,85,105,0.4)]" />;
    case "party":
      return <ThreeDIcon icon={FiSmile} fromStr="from-fuchsia-400" toStr="to-purple-600" shadowStr="shadow-[0_8px_16px_rgba(147,51,234,0.4)]" />;
    default:
      return <ThreeDIcon icon={FiMusic} fromStr="from-emerald-400" toStr="to-teal-600" shadowStr="shadow-[0_8px_16px_rgba(13,148,136,0.4)]" />;
  }
}

async function getTrendingSongs(limit = 10) {
  try {
    await connectToDatabase();
    // NEW: Now sorts by playCount (highest to lowest)
    const songs = await Song.find({ mood: { $ne: "Live" } })
      .sort({ playCount: -1 }) // Sort descending by plays
      .limit(limit)
      .lean();

    return songs.map((song: any) => ({
      _id: song._id.toString(),
      title: song.title,
      artist: song.artist,
      coverUrl: song.coverUrl,
      audioUrl: song.audioUrl,
      mood: song.mood,
    }));
  } catch (error) {
    return [];
  }
}

async function getDynamicMoodData(limit = 10) {
  try {
    await connectToDatabase();
    const allMoods = await Song.distinct("mood");
    const validMoods = allMoods.filter((m) => m && m !== "Live");

    const moodDataPromises = validMoods.map(async (mood) => {
      // Mood rows can still just be sorted by newest (_id: -1) or you could also sort these by playCount!
      const songs = await Song.find({ mood }).sort({ _id: -1 }).limit(limit).lean();
      return {
        moodName: mood,
        songs: songs.map((song: any) => ({
          _id: song._id.toString(),
          title: song.title,
          artist: song.artist,
          coverUrl: song.coverUrl,
          audioUrl: song.audioUrl,
          mood: song.mood,
        }))
      };
    });

    return await Promise.all(moodDataPromises);
  } catch (error) {
    console.error("Failed to fetch dynamic mood data:", error);
    return [];
  }
}

export default async function HomePage() {
  const [trending, dynamicMoods] = await Promise.all([
    getTrendingSongs(),
    getDynamicMoodData()
  ]);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/60 p-8 md:p-12 overflow-y-auto font-sans">

      <header className="mb-12 max-w-[1600px] mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-indigo-800 mb-2">
          Discover
        </h1>
        <p className="text-lg text-zinc-500 font-medium">
          Music curated perfectly for every moment of your day.
        </p>
      </header>

      <main className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">

        {/* Trending Section - Uses the new 3D Icon and hides the Explore button */}
        {trending.length > 0 && (
          <SongCarousel
            title="Trending Right Now"
            icon={<ThreeDIcon icon={FiTrendingUp} fromStr="from-violet-500" toStr="to-purple-700" shadowStr="shadow-[0_8px_16px_rgba(124,58,237,0.4)]" />}
            songs={trending}
            moodCategory="Trending"
            hideExplore={true} // <-- NEW: Turns off the View All buttons
          />
        )}

        {/* Dynamic Mood Sections */}
        {dynamicMoods.map((moodData) => {
          if (moodData.songs.length === 0) return null;

          return (
            <SongCarousel
              key={moodData.moodName}
              title={`${moodData.moodName} Vibes`}
              icon={getIconForMood(moodData.moodName)}
              songs={moodData.songs}
              moodCategory={moodData.moodName}
            />
          );
        })}

      </main>
    </div>
  );
}
