import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Song from "@/models/Song";
import mongoose from "mongoose";

const MOOD_FALLBACK_ORDER: Record<string, string[]> = {
  Romantic: ["Soulful", "Calm", "Sad", "Happy", "Upbeat", "Energetic", "Focus"],
  Soulful: ["Romantic", "Calm", "Sad", "Focus", "Happy", "Upbeat", "Energetic"],
  Calm: ["Soulful", "Focus", "Romantic", "Sad", "Happy", "Upbeat", "Energetic"],
  Sad: ["Soulful", "Calm", "Romantic", "Focus", "Happy", "Upbeat", "Energetic"],
  Focus: ["Calm", "Soulful", "Sad", "Upbeat", "Energetic", "Happy", "Romantic"],
  Happy: ["Upbeat", "Energetic", "Romantic", "Soulful", "Calm", "Focus", "Sad"],
  Upbeat: ["Energetic", "Happy", "Romantic", "Soulful", "Calm", "Focus", "Sad"],
  Energetic: ["Upbeat", "Happy", "Focus", "Calm", "Soulful", "Romantic", "Sad"],
  Unknown: ["Upbeat", "Happy", "Calm", "Focus", "Energetic", "Soulful", "Romantic", "Sad"]
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mood = searchParams.get("mood") || "Unknown";
  const currentId = searchParams.get("currentId");
  const isShuffle = searchParams.get("shuffle") === "true";
  const playedIdsParam = searchParams.get("playedIds");

  try {
    await connectToDatabase();

    // 1. Gather all played IDs from the current session
    const excludeStringIds = playedIdsParam ? playedIdsParam.split(",") : [];
    if (currentId && !excludeStringIds.includes(currentId)) {
      excludeStringIds.push(currentId);
    }

    // Convert string IDs to MongoDB ObjectIds for the aggregate query
    const excludeObjectIds = excludeStringIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const baseQuery: any = {};
    if (excludeObjectIds.length > 0) {
      baseQuery._id = { $nin: excludeObjectIds };
    }

    let nextSong = [];

    if (isShuffle) {
      nextSong = await Song.aggregate([
        { $match: baseQuery },
        { $sample: { size: 1 } }
      ]);
    } else {
      // 2. First Attempt: Find a new song matching the EXACT mood
      nextSong = await Song.aggregate([
        { $match: { ...baseQuery, mood: mood } },
        { $sample: { size: 1 } }
      ]);

      // 3. Second Attempt: Transition to fallback moods once exact mood is exhausted
      if (nextSong.length === 0) {
        const relatedMoods = MOOD_FALLBACK_ORDER[mood] || MOOD_FALLBACK_ORDER["Unknown"];

        for (const fallbackMood of relatedMoods) {
          nextSong = await Song.aggregate([
            { $match: { ...baseQuery, mood: fallbackMood } },
            { $sample: { size: 1 } }
          ]);
          if (nextSong.length > 0) break;
        }
      }
    }

    // 4. Absolute Fallback: If ALL songs in the database have been played,
    // drop the exclusion filter entirely so the music never stops.
    if (nextSong.length === 0) {
      nextSong = await Song.aggregate([
        { $match: {} },
        { $sample: { size: 1 } }
      ]);
    }

    return NextResponse.json(nextSong[0] || null);
  } catch (error) {
    console.error("API Error finding next song:", error);
    return NextResponse.json({ error: "Failed to fetch next song" }, { status: 500 });
  }
}
