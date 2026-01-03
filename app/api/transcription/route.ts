import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = 
  process.env.SUPABASE_SERVICE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseClient(): SupabaseClient | null {
  if (supabaseUrl && supabaseKey) {
    return createClient(supabaseUrl, supabaseKey);
  }
  return null;
}

/**
 * POST /api/transcription
 * Body: { user_id, room_name, sender, text }
 * Maps to transcript_segments table
 */
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { user_id, room_name, sender, text } = body;

    if (!room_name || !text) {
      return NextResponse.json(
        { error: "Missing required fields: room_name and text" },
        { status: 400 }
      );
    }

    // Map to transcript_segments table columns
    const { data, error } = await supabase
      .from("transcript_segments")
      .insert([{ 
        meeting_id: room_name,
        speaker_id: user_id || sender || "anonymous",
        source_lang: "auto",
        source_text: text
      }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Transcription API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/transcription?room_name=xxx
 * Reads from transcript_segments table
 */
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return NextResponse.json({ transcriptions: [] }, { status: 200 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get("room_name");

    let query = supabase
      .from("transcript_segments")
      .select("*")
      .order("created_at", { ascending: true });

    if (roomName) {
      query = query.eq("meeting_id", roomName);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map database columns back to expected format
    const transcriptions = (data || []).map((row) => ({
      id: row.id,
      user_id: row.speaker_id,
      room_name: row.meeting_id,
      sender: row.speaker_id,
      text: row.source_text,
      created_at: row.created_at,
    }));

    return NextResponse.json({ transcriptions });
  } catch (error) {
    console.error("Transcription API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
