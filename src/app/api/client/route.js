import { connectToDatabase } from "@/app/utils/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const db = await connectToDatabase();

    const body = await req.json();
    const { peerId, uniq_id } = body;

    if (!peerId, !uniq_id) {
      return NextResponse.json({ message: "peerId and uniq_id are required" }, { status: 400 });      
    }

    const [result] = await db.execute(
      "INSERT INTO peer_sessions (peer_id, id_session) VALUES (?, ?)",
      [peerId, uniq_id]
    );

    return NextResponse.json({ message: "Peer ID saved successfully", result }, { status: 200 });
  } catch (error) {
    console.error("Error saving peer ID:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
export async function GET(req) {
  const url = new URL(req.url);
  const id_session = url.searchParams.get("uniq_id"); // Extract the id_session from the URL
  
  try {
    const db = await connectToDatabase();
    
    const [rows] = await db.execute(
      "SELECT peer_id FROM peer_sessions WHERE id_session = ? ORDER BY id DESC LIMIT 1",
      [id_session]
    );
    console.log("rows", rows);
    return NextResponse.json({ message: "Latest peer ID retrieved", peerId: rows[0].peer_id }, { status: 200 });
  } catch (error) {
    console.error("Error saving peer ID:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
