"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader } from "@/components/loader";

interface Transcription {
  id: string;
  meeting_id: string;
  speaker_id: string;
  speaker_name: string;
  text: string;
  stt_provider: string;
  timestamp: string;
  created_at: string;
}

interface GroupedTranscription {
  meeting_id: string;
  entries: Transcription[];
}

export default function TranscriptionsPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, user } = useUser();

  useEffect(() => {
    const fetchTranscriptions = async () => {
      try {
        const response = await fetch("/api/transcription");
        if (!response.ok) {
          throw new Error("Failed to fetch transcriptions");
        }
        const data = await response.json();
        setTranscriptions(data.transcriptions || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load transcriptions");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchTranscriptions();
    }
  }, [isLoaded]);

  // Group transcriptions by meeting_id
  const groupedTranscriptions = transcriptions.reduce<GroupedTranscription[]>(
    (acc, transcription) => {
      const existing = acc.find((g) => g.meeting_id === transcription.meeting_id);
      if (existing) {
        existing.entries.push(transcription);
      } else {
        acc.push({ meeting_id: transcription.meeting_id, entries: [transcription] });
      }
      return acc;
    },
    []
  );

  if (!isLoaded || loading) {
    return <Loader />;
  }

  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Transcriptions</h1>

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {groupedTranscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-white/10 bg-white/5 p-10">
          <p className="text-lg text-white/60">No transcriptions yet</p>
          <p className="text-sm text-white/40">
            Start a meeting and enable captions to see transcriptions here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groupedTranscriptions.map((group) => (
            <div
              key={group.meeting_id}
              className="rounded-lg border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Meeting: {group.meeting_id.slice(0, 8)}...
                </h2>
                <span className="text-sm text-white/40">
                  {group.entries.length} entries
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {group.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex gap-3 rounded border border-white/5 bg-white/5 p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium uppercase text-emerald-400">
                          {entry.speaker_name}
                        </span>
                        <span className="text-[10px] text-white/30">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] uppercase text-white/50">
                          {entry.stt_provider}
                        </span>
                      </div>
                      <p className="text-sm text-white/80">{entry.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const text = group.entries
                    .map((e) => `[${e.speaker_name}]: ${e.text}`)
                    .join("\n");
                  navigator.clipboard.writeText(text);
                }}
                className="mt-4 rounded bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
              >
                Copy Transcript
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
