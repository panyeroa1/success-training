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
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded } = useUser();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/translate/history");
        
        if (!response.ok) throw new Error("Failed to fetch translation history");
        
        const data = await response.json();
        setTranslations(data.translations || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchHistory();
    }
  }, [isLoaded]);

  // Group by meeting_id (which acts as the room name)
  const groupedData = translations.reduce<{ meeting_id: string; entries: Translation[] }[]>(
    (acc, entry) => {
      const roomName = entry.meeting_id || "unknown";
      const existing = acc.find((g) => g.meeting_id === roomName);
      if (existing) {
        existing.entries.push(entry);
      } else {
        acc.push({ meeting_id: roomName, entries: [entry] });
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
      <h1 className="text-3xl font-bold">Transcriptions & Translations</h1>

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {groupedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-white/10 bg-white/5 p-10">
          <p className="text-lg text-white/60">No data found</p>
          <p className="text-sm text-white/40">
            Start a meeting and enable translations to see history here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groupedData.map((group) => (
            <div
              key={group.meeting_id}
              className="rounded-lg border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Room: {group.meeting_id.slice(0, 8)}...
                </h2>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-white/40">
                    {group.entries.length} entries
                  </span>
                </div>
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
                          {entry.user_id.slice(0, 8)}...
                        </span>
                        <span className="text-[10px] text-white/30">
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/80">{entry.original_text}</p>
                      <p className="mt-1 text-xs font-medium italic text-emerald-400">
                        {entry.translated_text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => {
                    const text = group.entries
                      .map((e) => `[Text]: ${e.original_text}\n[Translation]: ${e.translated_text}`)
                      .join("\n\n");
                    navigator.clipboard.writeText(text);
                  }}
                  className="rounded bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
                >
                  Copy All
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
