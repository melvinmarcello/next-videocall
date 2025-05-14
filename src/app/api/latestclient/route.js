import { connectToDatabase } from "@/app/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await connectToDatabase();
    
    const [rows] = await db.execute(
      "SELECT peer_id FROM peer_sessions ORDER BY id DESC LIMIT 1"
    );

    return NextResponse.json({ message: "Latest peer ID retrieved", peerId: rows[0].peer_id }, { status: 200 });
  } catch (error) {
    console.error("Error saving peer ID:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
