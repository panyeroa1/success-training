import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export interface Speaker {
  id: string;
  name: string;
  isLocal: boolean;
}

export function useMeetingSpeakers(meetingId: string, currentUserId: string) {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!meetingId) return;

    const fetchSpeakers = async () => {
      try {
        // Fetch distinct speakers from transcript_segments
        const { data, error } = await supabase
          .from("transcript_segments")
          .select("speaker_id")
          .eq("meeting_id", meetingId)
          .order("created_at", { ascending: false })
          .limit(50); // Get recent speakers

        if (error) {
          console.error("Error fetching speakers:", error);
          return;
        }

        // Deduplicate speakers
        const uniqueSpeakerIds = Array.from(new Set(data.map((row) => row.speaker_id)));
        
        // Map to speaker objects
        // In a real app, you might want to join with a users table to get names
        // simplified here: use ID as name or "Speaker X"
        const speakerList = uniqueSpeakerIds.map((id) => ({
          id: id,
          name: id === currentUserId ? "You" : `Speaker ${id.slice(0, 4)}`,
          isLocal: id === currentUserId,
        }));

        setSpeakers(speakerList);
      } catch (err) {
        console.error("Failed to fetch speakers", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpeakers();

    // Subscribe to new transcripts to update speaker list dynamically
    const channel = supabase
      .channel("active-speakers")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "transcript_segments",
          filter: `meeting_id=eq.${meetingId}`,
        },
        (payload) => {
          const newSpeakerId = payload.new.speaker_id;
          setSpeakers((prev) => {
            if (prev.some((s) => s.id === newSpeakerId)) return prev;
            return [
              {
                id: newSpeakerId,
                name: newSpeakerId === currentUserId ? "You" : `Speaker ${newSpeakerId.slice(0, 4)}`,
                isLocal: newSpeakerId === currentUserId,
              },
              ...prev,
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId, currentUserId]);

  return { speakers, isLoading };
}
