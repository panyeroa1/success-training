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
 * GET /api/translate/history?meeting_id=xxx
 */
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return NextResponse.json({ translations: [] }, { status: 200 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get("meeting_id");

    let query = supabase
      .from("translations")
      .select("*")
      .order("created_at", { ascending: true });

    if (meetingId) {
      query = query.eq("meeting_id", meetingId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ translations: data || [] });
  } catch (error) {
    console.error("Translation History API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
