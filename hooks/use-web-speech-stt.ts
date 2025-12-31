"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface WebSpeechTranscript {
  text: string;
  isFinal: boolean;
  timestamp: number;
}

interface UseWebSpeechSTTOptions {
  language?: string;
  continuous?: boolean;
}

interface UseWebSpeechSTTReturn {
  transcript: WebSpeechTranscript | null;
  isListening: boolean;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  error: string | null;
}

export function useWebSpeechSTT(
  options: UseWebSpeechSTTOptions = {}
): UseWebSpeechSTTReturn {
  const { language = "en-US", continuous = true } = options;

  const [transcript, setTranscript] = useState<WebSpeechTranscript | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (text) {
          setTranscript({
            text,
            isFinal: !!finalTranscript,
            timestamp: Date.now(),
          });
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setError(event.error);
        if (event.error !== "no-speech") {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        // Restart if still supposed to be listening (for continuous mode)
        if (isListening && continuous) {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            // Already started
          }
        } else {
          setIsListening(false);
        }
      };
    } else {
      setIsSupported(false);
      setError("Web Speech API is not supported in this browser");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, continuous, isListening]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;

    setError(null);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setError("Failed to start speech recognition");
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    start,
    stop,
    error,
  };
}
