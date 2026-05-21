import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Song from "@/models/Song";

export async function POST(request: Request) {
  try {
    const { songId } = await request.json();

    if (!songId || songId.startsWith("live-")) {
      // Don't track live radio stations
      return NextResponse.json({ success: true });
    }

    await connectToDatabase();

    // Increment the playCount by 1 in MongoDB
    await Song.findByIdAndUpdate(songId, { $inc: { playCount: 1 } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update play count:", error);
    return NextResponse.json({ error: "Failed to update play count" }, { status: 500 });
  }
}
