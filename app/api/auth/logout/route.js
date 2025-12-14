import { NextResponse } from "next/server";

export async function POST(req) {
  // With localStorage sessions, logout is handled client-side
  // This endpoint just confirms logout
  return NextResponse.json({ success: true });
}

