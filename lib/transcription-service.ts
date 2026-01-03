import { supabase } from "@/lib/supabase";

export interface TranscriptionEntry {
  id?: string;
  user_id: string;
  room_name: string;
  sender: string;
  text: string;
  created_at?: string;
}

/**
 * Save a transcription entry to Supabase (transcript_segments table)
 * Maps our internal field names to the database column names
 */
export async function saveTranscription(
  entry: Omit<TranscriptionEntry, "id" | "created_at">
): Promise<{ success: boolean; error?: string }> {
  try {
    // Map to database column names for transcript_segments table
    const dbEntry = {
      meeting_id: entry.room_name, // room_name maps to meeting_id
      speaker_id: entry.user_id,
      source_lang: "auto", // Default source language
      source_text: entry.text,
    };

    const { error } = await supabase.from("transcript_segments").insert([dbEntry]);

    if (error) {
      console.error("Failed to save transcription:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    console.error("Error saving transcription:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

/**
 * Get transcriptions for a specific room/meeting
 */
export async function getTranscriptionsForRoom(
  roomName: string
): Promise<TranscriptionEntry[]> {
  try {
    const { data, error } = await supabase
      .from("transcript_segments")
      .select("*")
      .eq("meeting_id", roomName)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch transcriptions:", error);
      return [];
    }

    // Map database columns back to our interface
    return (data || []).map((row) => ({
      id: row.id,
      user_id: row.speaker_id,
      room_name: row.meeting_id,
      sender: row.speaker_id,
      text: row.source_text,
      created_at: row.created_at,
    }));
  } catch (e) {
    console.error("Error fetching transcriptions:", e);
    return [];
  }
}
