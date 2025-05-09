import { connectToDatabase } from "@/app/utils/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const db = await connectToDatabase();

    const body = await req.json();
    const { peerId } = body;

    if (!peerId) {
      return NextResponse.json({ message: "peerId is required" }, { status: 400 });
    }

    const [result] = await db.execute(
      "INSERT INTO peer_sessions (peer_id) VALUES (?)",
      [peerId]
    );

    return NextResponse.json({ message: "Peer ID saved successfully", result }, { status: 200 });
  } catch (error) {
    console.error("Error saving peer ID:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
