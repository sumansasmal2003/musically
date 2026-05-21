// src/app/actions/songActions.ts
"use server";

import connectToDatabase from "@/lib/mongodb";
import Song from "@/models/Song";

// 1. New function to preview the mood before saving
export async function analyzeSongMood(title: string, artist: string) {
  try {
    const aiResponse = await fetch(`${process.env.HUGGINGFACE_API_URL}/analyze-mood`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        artist: artist,
        lyrics_or_description: `${title} by ${artist}`
      })
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      return { success: true, mood: aiData.primary_mood, score: aiData.confidence_score };
    }
    return { success: false, mood: "Unknown", score: 0 };
  } catch (error) {
    console.error("Mood Engine API failed:", error);
    return { success: false, mood: "Unknown", score: 0 };
  }
}

// 2. Updated migration function to accept the pre-computed mood
export async function migrateSongToMongo(songData: {
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  mood: string;
  moodScore: number;
}) {
  try {
    await connectToDatabase();

    const existing = await Song.findOne({
      title: songData.title,
      artist: songData.artist
    });

    if (existing) {
      return { success: false, message: "This song already exists in your MongoDB database." };
    }

    const newSong = new Song(songData);
    await newSong.save();

    return { success: true, message: "Song successfully migrated with AI tags!" };
  } catch (error) {
    console.error("Migration error:", error);
    return { success: false, message: "Failed to save to MongoDB. Please try again." };
  }
}
