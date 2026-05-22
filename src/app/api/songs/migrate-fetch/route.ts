import { NextResponse } from "next/server";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { analyzeSongMood } from "@/app/actions/songActions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const musicId = searchParams.get("id");

    if (!musicId) {
      return NextResponse.json({ error: "Missing music ID" }, { status: 400 });
    }

    // 1. Fetch from Firebase
    const musicRef = ref(db, `musics/${musicId}`);
    const snapshot = await get(musicRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "No music found with this ID" }, { status: 404 });
    }

    const fbData = snapshot.val();
    const title = fbData.musicName || "Unknown Title";
    const artist = fbData.artist || "Unknown Artist";

    // 2. Ask AI for the mood (This runs securely on your server)
    const aiResult = await analyzeSongMood(title, artist);

    // 3. Send formatted data back to the mobile app
    return NextResponse.json({
      title,
      artist,
      detectedMood: aiResult.mood,
      moodScore: aiResult.score,
      coverUrl: fbData.musicImage || "",
      audioUrl: fbData.musicFile || ""
    });

  } catch (error) {
    console.error("Migrate Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
