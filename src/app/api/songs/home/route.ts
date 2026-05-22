// On your Next.js Web Project: src/app/api/songs/home/route.ts
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Song from "@/models/Song";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Get Trending (Sorted by playCount)
    const trending = await Song.find({ mood: { $ne: "Live" } })
      .sort({ playCount: -1 })
      .limit(10)
      .lean();

    // 2. Get Dynamic Moods
    const allMoods = await Song.distinct("mood");
    const validMoods = allMoods.filter((m) => m && m !== "Live");

    const moodDataPromises = validMoods.map(async (mood) => {
      const songs = await Song.find({ mood }).sort({ _id: -1 }).limit(10).lean();
      return { moodName: mood, songs };
    });

    const dynamicMoods = await Promise.all(moodDataPromises);

    return NextResponse.json({ trending, dynamicMoods });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch home data" }, { status: 500 });
  }
}
