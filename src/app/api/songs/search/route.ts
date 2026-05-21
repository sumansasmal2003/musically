import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Song from "@/models/Song";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    await connectToDatabase();

    // Perform a case-insensitive search across title, artist, AND mood
    const songs = await Song.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { artist: { $regex: query, $options: "i" } },
        { mood: { $regex: query, $options: "i" } } // <-- THIS FIXES THE MOOD SEARCH
      ]
    }).limit(30);

    return NextResponse.json(songs);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Failed to search songs" },
      { status: 500 }
    );
  }
}
