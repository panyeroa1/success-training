import { supabase } from "@/lib/supabase";

export interface TranscriptionEntry {
  id?: string;
  meeting_id: string;
  speaker_id: string;
  speaker_name: string;
  text: string;
  stt_provider: "stream" | "webspeech" | "deepgram";
  timestamp: string;
  created_at?: string;
}

/**
 * Save a transcription entry to Supabase
 */
export async function saveTranscription(
  entry: Omit<TranscriptionEntry, "id" | "created_at">
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("transcriptions").insert([entry]);

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
 * Get transcriptions for a specific meeting
 */
export async function getTranscriptionsForMeeting(
  meetingId: string
): Promise<TranscriptionEntry[]> {
  try {
    const { data, error } = await supabase
      .from("transcriptions")
      .select("*")
      .eq("meeting_id", meetingId)
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("Failed to fetch transcriptions:", error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error("Error fetching transcriptions:", e);
    return [];
  }
}

/**
 * SQL to create the transcriptions table in Supabase:
 *
 * CREATE TABLE transcriptions (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   meeting_id TEXT NOT NULL,
 *   speaker_id TEXT NOT NULL,
 *   speaker_name TEXT NOT NULL,
 *   text TEXT NOT NULL,
 *   stt_provider TEXT NOT NULL CHECK (stt_provider IN ('stream', 'webspeech', 'deepgram')),
 *   timestamp TIMESTAMPTZ NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Create index for faster queries by meeting_id
 * CREATE INDEX idx_transcriptions_meeting_id ON transcriptions(meeting_id);
 *
 * -- Enable Row Level Security
 * ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;
 *
 * -- Allow authenticated users to insert and read
 * CREATE POLICY "Allow authenticated insert" ON transcriptions
 *   FOR INSERT TO authenticated WITH CHECK (true);
 *
 * CREATE POLICY "Allow authenticated select" ON transcriptions
 *   FOR SELECT TO authenticated USING (true);
 */
