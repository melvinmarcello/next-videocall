import { connectToDatabase } from "@/app/utils/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const db = await connectToDatabase();

    const body = await req.json();
    const { name, email, cif, phone } = body;

    if (!name || !email || !cif || !phone) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }
    const uniq_id = crypto.randomUUID();
    
    const [result] = await db.execute(
      "INSERT INTO usersmss (name, email, cif, phone, uniq_id) VALUES (?, ?, ?, ?, ?)",
      [name, email, cif, phone, uniq_id]
    );

    return NextResponse.json({ message: "Peer ID saved successfully", result }, { status: 200 });
  } catch (error) {
    console.error("Error saving peer ID:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}


export async function GET() {
  try {
    const db = await connectToDatabase();

    const [rows] = await db.execute("SELECT * FROM usersmss");

    return NextResponse.json({ message: "Data retrieved successfully", data: rows }, { status: 200 });
  } catch (error) {
    console.error("Error retrieving peer IDs:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}