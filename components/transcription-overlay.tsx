"use client";

import { useCallStateHooks, useCall } from "@stream-io/video-react-sdk";
import { useEffect, useState, useRef, useCallback } from "react";
import { saveTranscription } from "@/lib/transcription-service";

interface CaptionLine {
  id: string;
  speaker: string;
  speakerId: string;
  text: string;
  timestamp: number;
  saved: boolean;
}

interface CustomTranscript {
  text: string;
  speaker: string;
  timestamp: number;
}

interface TranscriptionOverlayProps {
  sttProvider: "stream" | "webspeech" | "deepgram";
  customTranscript: CustomTranscript | null;
  userId?: string;
}

const CAPTION_DISPLAY_DURATION = 5000;
const MAX_VISIBLE_LINES = 2;

export const TranscriptionOverlay = ({
  sttProvider,
  customTranscript,
  userId,
}: TranscriptionOverlayProps) => {
  const { useCallClosedCaptions } = useCallStateHooks();
  const call = useCall();
  const streamCaptions = useCallClosedCaptions();
  const [lines, setLines] = useState<CaptionLine[]>([]);
  const lastCaptionRef = useRef<string>("");
  const savedIdsRef = useRef<Set<string>>(new Set());

  const meetingId = call?.id || "unknown";

  // Save transcription to Supabase
  const saveToSupabase = useCallback(
    async (line: CaptionLine) => {
      if (savedIdsRef.current.has(line.id)) return;

      savedIdsRef.current.add(line.id);

      await saveTranscription({
        meeting_id: meetingId,
        speaker_id: line.speakerId,
        speaker_name: line.speaker,
        text: line.text,
        stt_provider: sttProvider,
        timestamp: new Date(line.timestamp).toISOString(),
      });
    },
    [meetingId, sttProvider]
  );

  // Handle Stream captions
  useEffect(() => {
    if (sttProvider !== "stream" || streamCaptions.length === 0) return;

    const latestCaption = streamCaptions[streamCaptions.length - 1];
    const captionKey = `${latestCaption.user?.id}-${latestCaption.start_time}`;

    if (captionKey === lastCaptionRef.current) return;
    lastCaptionRef.current = captionKey;

    const newLine: CaptionLine = {
      id: captionKey,
      speaker: latestCaption.user?.name || latestCaption.user?.id || "Speaker",
      speakerId: latestCaption.user?.id || "unknown",
      text: latestCaption.text,
      timestamp: Date.now(),
      saved: false,
    };

    // Save to Supabase
    saveToSupabase(newLine);

    setLines((prev) => {
      const existingIndex = prev.findIndex(
        (line) =>
          line.speaker === newLine.speaker &&
          Date.now() - line.timestamp < 2000
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...newLine, timestamp: Date.now() };
        return updated.slice(-MAX_VISIBLE_LINES);
      }

      return [...prev, newLine].slice(-MAX_VISIBLE_LINES);
    });
  }, [streamCaptions, sttProvider, saveToSupabase]);

  // Handle custom transcripts (Web Speech / Deepgram)
  useEffect(() => {
    if (sttProvider === "stream" || !customTranscript) return;

    const newLine: CaptionLine = {
      id: `custom-${customTranscript.timestamp}`,
      speaker: customTranscript.speaker,
      speakerId: userId || "local",
      text: customTranscript.text,
      timestamp: Date.now(),
      saved: false,
    };

    // Save to Supabase
    saveToSupabase(newLine);

    setLines((prev) => {
      const existingIndex = prev.findIndex(
        (line) =>
          line.speaker === newLine.speaker &&
          Date.now() - line.timestamp < 2000
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...newLine, timestamp: Date.now() };
        return updated.slice(-MAX_VISIBLE_LINES);
      }

      return [...prev, newLine].slice(-MAX_VISIBLE_LINES);
    });
  }, [customTranscript, sttProvider, userId, saveToSupabase]);

  // Auto-remove old captions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setLines((prev) =>
        prev.filter((line) => now - line.timestamp < CAPTION_DISPLAY_DURATION)
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (lines.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-32 left-0 right-0 z-40 flex flex-col items-center gap-1 px-8">
      {lines.map((line) => {
        const age = Date.now() - line.timestamp;
        const opacity =
          age > CAPTION_DISPLAY_DURATION - 1000
            ? Math.max(0, 1 - (age - (CAPTION_DISPLAY_DURATION - 1000)) / 1000)
            : 1;

        return (
          <div
            key={line.id}
            className="caption-line w-full max-w-4xl overflow-hidden"
            data-opacity={opacity}
          >
            <p className="text-left text-sm font-light tracking-wide text-white [text-shadow:_1px_1px_3px_rgba(0,0,0,1),_0_0_2px_rgba(0,0,0,1)] md:text-base">
              <span className="mr-2 text-[10px] font-normal uppercase tracking-wider text-white/50 md:text-xs">
                {line.speaker}
              </span>
              <span className="animate-typewriter">{line.text}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
};
