// src/models/Song.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISong extends Document {
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string;
  duration: string;
  mood: string;             // Added for AI classification
  moodScore: number;        // Added for AI confidence
  playCount: number;
  createdAt: Date;
}

const SongSchema: Schema<ISong> = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, required: false },
  coverUrl: { type: String, required: true },
  audioUrl: { type: String, required: true },
  duration: { type: String, required: true },
  mood: { type: String, default: "Unknown" },
  moodScore: { type: Number, default: 0 },
  playCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Song: Model<ISong> = mongoose.models.Song || mongoose.model<ISong>("Song", SongSchema);

export default Song;
