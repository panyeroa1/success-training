import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Deepgram API key not configured" },
      { status: 500 }
    );
  }

  // Return the API key for WebSocket authentication
  // In production, you should use Deepgram's temporary key API
  // For now, we return the key directly (ensure this is only accessible to authenticated users)
  return NextResponse.json({ key: apiKey });
}
