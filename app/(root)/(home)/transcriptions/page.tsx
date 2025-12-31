"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader } from "@/components/loader";

interface Transcription {
  id: string;
  user_id: string;
  room_name: string;
  sender: string;
  text: string;
  created_at: string;
}

interface Translation {
  id: string;
  user_id: string;
  meeting_id: string;
  source_lang: string;
  target_lang: string;
  original_text: string;
  translated_text: string;
  created_at: string;
}

interface GroupedTranscription {
  room_name: string;
  entries: (Transcription & { translation?: Translation })[];
}

export default function TranscriptionsPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded } = useUser();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [transResponse, translatResponse] = await Promise.all([
          fetch("/api/transcription"),
          fetch("/api/translate/history") // Mocking this for now or I should create it
        ]);

        if (!transResponse.ok) throw new Error("Failed to fetch transcriptions");
        
        const transData = await transResponse.json();
        
        let translationsData: Translation[] = [];
        if (translatResponse.ok) {
          const data = await translatResponse.json();
          translationsData = data.translations || [];
        }

        // Map transcriptions and their translations
        const combined = transData.transcriptions.map((t: Transcription) => {
          const translation = translationsData.find(
            (tr) => tr.original_text === t.text && tr.meeting_id === t.room_name
          );
          return { ...t, translation };
        });

        setTranscriptions(combined);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchAllData();
    }
  }, [isLoaded]);

  // Group transcriptions by room_name
  const groupedTranscriptions = transcriptions.reduce<GroupedTranscription[]>(
    (acc, transcription) => {
      const existing = acc.find((g) => g.room_name === transcription.room_name);
      if (existing) {
        existing.entries.push(transcription);
      } else {
        acc.push({ room_name: transcription.room_name, entries: [transcription] });
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
              key={group.room_name}
              className="rounded-lg border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Room: {group.room_name.slice(0, 8)}...
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
                          {entry.sender}
                        </span>
                        <span className="text-[10px] text-white/30">
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/80">{entry.text}</p>
                      {entry.translation && (
                        <p className="mt-1 text-xs font-medium italic text-emerald-400">
                          {entry.translation.translated_text}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const text = group.entries
                    .map((e) => `[${e.sender}]: ${e.text}`)
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
