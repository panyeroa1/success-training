import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Use service key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meeting_id, speaker_id, speaker_name, text, stt_provider, timestamp } = body;

    if (!meeting_id || !text) {
      return NextResponse.json(
        { error: "Missing required fields: meeting_id and text are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("transcriptions")
      .insert([
        {
          meeting_id,
          speaker_id: speaker_id || "unknown",
          speaker_name: speaker_name || "Speaker",
          text,
          stt_provider: stt_provider || "stream",
          timestamp: timestamp || new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Transcription API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get("meeting_id");

    let query = supabase
      .from("transcriptions")
      .select("*")
      .order("timestamp", { ascending: true });

    if (meetingId) {
      query = query.eq("meeting_id", meetingId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ transcriptions: data || [] });
  } catch (error) {
    console.error("Transcription API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
