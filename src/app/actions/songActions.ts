"use server";

import connectToDatabase from "@/lib/mongodb";
import Song from "@/models/Song";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini (Ensure GEMINI_API_KEY is in your .env.local)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MUSIC_MOODS = ["Energetic", "Calm", "Happy", "Sad", "Focus", "Romantic", "Soulful", "Upbeat"];

/**
 * Helper function to fetch lyrics safely from LRCLIB
 */
async function fetchLyrics(title: string, artist: string): Promise<string> {
  if (!title || !artist) return "";
  try {
    const res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout so uploads don't freeze
    });
    if (res.ok) {
      const data = await res.json();
      return data.plainLyrics || "";
    }
  } catch (error) {
    console.error("Lyrics fetch failed:", error);
  }
  return "";
}

/**
 * 1. AI Analysis Action
 * Called when the user clicks "Fetch" on the upload page
 */
export async function analyzeSongMood(title: string, artist: string) {
  try {
    // 1. Fetch lyrics for context
    const lyrics = await fetchLyrics(title, artist);

    // 2. Construct the Gemini Prompt
    const context = lyrics
      ? `Song: "${title}" by "${artist}"\nLyrics:\n${lyrics}`
      : `Song: "${title}" by "${artist}"\nNote: Lyrics unavailable. Analyze based on artist genre and song title.`;

    const prompt = `You are an elite music metadata analyst. Analyze the following song and determine its primary mood.
    You must select EXACTLY ONE mood from this strict list: ${MUSIC_MOODS.join(", ")}.

    ${context}`;

    // 3. Ask Gemini for a strict JSON response
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.2, // Keep it focused and deterministic
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primary_mood: {
              type: Type.STRING,
              description: "The single best mood match from the allowed list.",
              enum: MUSIC_MOODS
            },
            confidence_score: {
              type: Type.NUMBER,
              description: "Confidence in the assessment from 0.0 to 1.0"
            }
          },
          required: ["primary_mood", "confidence_score"]
        }
      }
    });

    // 4. Parse the output
    const resultText = response.text;
    if (!resultText) throw new Error("No response from Gemini");

    const analysis = JSON.parse(resultText);

    return {
      mood: analysis.primary_mood,
      score: analysis.confidence_score
    };

  } catch (error) {
    console.error("Gemini Mood Analysis Error:", error);
    // Safe Fallback if AI fails or rate limits
    return {
      mood: "Upbeat",
      score: 0.5
    };
  }
}

/**
 * 2. MongoDB Migration Action
 * Called when the user clicks "Confirm & Save to MongoDB"
 */
export async function migrateSongToMongo(songData: any) {
  try {
    await connectToDatabase();

    // Check if song already exists to prevent duplicates
    const existingSong = await Song.findOne({
      title: songData.title,
      artist: songData.artist
    });

    if (existingSong) {
      return { success: false, message: "This song already exists in the database." };
    }

    // Save the new song with the AI detected mood
    const newSong = new Song({
      title: songData.title,
      artist: songData.artist,
      coverUrl: songData.coverUrl,
      audioUrl: songData.audioUrl,
      duration: songData.duration || "0:00",
      mood: songData.mood,
      moodScore: songData.moodScore,
      playCount: 0 // Initialize tracking
    });

    await newSong.save();

    return { success: true, message: "Successfully saved to MongoDB!" };
  } catch (error) {
    console.error("MongoDB Migration Error:", error);
    return { success: false, message: "Failed to save to database." };
  }
}
