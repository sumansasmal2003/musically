import { NextResponse } from "next/server";
import { migrateSongToMongo } from "@/app/actions/songActions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.artist || !body.audioUrl) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Call your existing server action to save to MongoDB
    const response = await migrateSongToMongo(body);

    if (response.success) {
      return NextResponse.json({ success: true, message: response.message });
    } else {
      return NextResponse.json({ success: false, message: response.message }, { status: 400 });
    }

  } catch (error) {
    console.error("Migrate Save Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
