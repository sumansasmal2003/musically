// src/app/api/analyze-mood/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MUSIC_MOODS = ["Energetic", "Calm", "Happy", "Sad", "Focus", "Romantic", "Soulful", "Upbeat"];

// Helper to fetch lyrics from LRCLIB
async function fetchLyrics(title: string, artist: string): Promise<string> {
  if (!title || !artist) return "";
  try {
    const res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
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

export async function POST(request: Request) {
  try {
    const { title, artist, lyrics_or_description } = await request.json();

    if (!title && !artist) {
      return NextResponse.json({ error: "Title or artist required" }, { status: 400 });
    }

    // 1. Fetch Lyrics if not provided
    let lyrics = lyrics_or_description;
    if (!lyrics) {
      lyrics = await fetchLyrics(title, artist);
    }

    // 2. Construct Context for Gemini
    const context = lyrics
      ? `Song: "${title}" by "${artist}"\nLyrics:\n${lyrics}`
      : `Song: "${title}" by "${artist}"\nNote: Lyrics unavailable. Analyze based on artist genre and song title.`;

    const prompt = `You are an elite music metadata analyst. Analyze the following song and determine its primary mood.
    You must select EXACTLY ONE mood from this strict list: ${MUSIC_MOODS.join(", ")}.

    ${context}`;

    // 3. Call Gemini 1.5 Flash (Fast, cheap, and highly accurate for text classification)
    // We use structured outputs to ensure it ALWAYS returns perfect JSON
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.2, // Low temperature for consistent classification
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
            },
            reasoning: {
              type: Type.STRING,
              description: "A brief 1-sentence explanation of why this mood was chosen based on the lyrics or artist."
            }
          },
          required: ["primary_mood", "confidence_score", "reasoning"]
        }
      }
    });

    // 4. Parse and return the structured response
    const resultText = response.text;
    if (!resultText) throw new Error("No response from Gemini");

    const analysis = JSON.parse(resultText);

    // Format the scores dictionary for your frontend consistency
    const all_scores = MUSIC_MOODS.reduce((acc, mood) => {
      acc[mood] = mood === analysis.primary_mood ? analysis.confidence_score : 0.05;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      primary_mood: analysis.primary_mood,
      confidence_score: analysis.confidence_score,
      reasoning: analysis.reasoning,
      all_scores: all_scores
    });

  } catch (error) {
    console.error("Gemini Engine Error:", error);
    return NextResponse.json(
      { error: "AI Engine inference failed", details: String(error) },
      { status: 500 }
    );
  }
}
