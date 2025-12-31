"use client";

import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { ClosedCaption, LayoutList, Users, ChevronDown } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useWebSpeechSTT } from "@/hooks/use-web-speech-stt";
import { useDeepgramSTT } from "@/hooks/use-deepgram-stt";

import { EndCallButton } from "./end-call-button";
import { Loader } from "./loader";
import { TranscriptionOverlay } from "./transcription-overlay";

type CallLayoutType = "grid" | "speaker-left" | "speaker-right";
type STTProvider = "stream" | "webspeech" | "deepgram";

const controlButtonClasses =
  "flex size-11 items-center justify-center rounded-[5px] border border-white/10 bg-white/5 text-white transition hover:bg-white/15";

const STT_PROVIDER_LABELS: Record<STTProvider, string> = {
  stream: "Stream",
  webspeech: "Browser",
  deepgram: "Deepgram",
};

export const MeetingRoom = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showParticipants, setShowParticipants] = useState(false);
  const [layout, setLayout] = useState<CallLayoutType>("speaker-left");
  const [sttProvider, setSTTProvider] = useState<STTProvider>("stream");
  const [customTranscript, setCustomTranscript] = useState<{
    text: string;
    speaker: string;
    timestamp: number;
  } | null>(null);

  const call = useCall();
  const { user } = useUser();

  const {
    useCallCallingState,
    useIsCallCaptioningInProgress,
    useLocalParticipant,
  } = useCallStateHooks();
  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const isStreamCaptionsEnabled = useIsCallCaptioningInProgress();

  // Web Speech API hook
  const webSpeech = useWebSpeechSTT({ language: "en-US", continuous: true });

  // Deepgram hook
  const deepgram = useDeepgramSTT({ language: "en", model: "nova-2" });

  // Determine if any caption system is active
  const isCaptionsActive =
    sttProvider === "stream"
      ? isStreamCaptionsEnabled
      : sttProvider === "webspeech"
        ? webSpeech.isListening
        : deepgram.isListening;

  // Update custom transcript when Web Speech or Deepgram provides new text
  useEffect(() => {
    if (sttProvider === "webspeech" && webSpeech.transcript) {
      setCustomTranscript({
        text: webSpeech.transcript.text,
        speaker: user?.firstName || user?.username || "You",
        timestamp: webSpeech.transcript.timestamp,
      });
    }
  }, [webSpeech.transcript, sttProvider, user]);

  useEffect(() => {
    if (sttProvider === "deepgram" && deepgram.transcript) {
      setCustomTranscript({
        text: deepgram.transcript.text,
        speaker: user?.firstName || user?.username || "You",
        timestamp: deepgram.transcript.timestamp,
      });
    }
  }, [deepgram.transcript, sttProvider, user]);

  const toggleCaptions = async () => {
    if (!call) return;

    try {
      if (sttProvider === "stream") {
        if (isStreamCaptionsEnabled) {
          await call.stopClosedCaptions();
          console.log("Stream captions stopped");
        } else {
          await call.startClosedCaptions();
          console.log("Stream captions started");
        }
      } else if (sttProvider === "webspeech") {
        if (webSpeech.isListening) {
          webSpeech.stop();
          console.log("Web Speech stopped");
        } else {
          webSpeech.start();
          console.log("Web Speech started");
        }
      } else if (sttProvider === "deepgram") {
        if (deepgram.isListening) {
          deepgram.stop();
          console.log("Deepgram stopped");
        } else {
          await deepgram.start();
          console.log("Deepgram started");
        }
      }
    } catch (error) {
      console.error("Failed to toggle captions:", error);
    }
  };

  const handleProviderChange = async (provider: STTProvider) => {
    // Stop current provider first
    if (sttProvider === "stream" && isStreamCaptionsEnabled) {
      try {
        await call?.stopClosedCaptions();
      } catch (e) {
        console.error(e);
      }
    } else if (sttProvider === "webspeech" && webSpeech.isListening) {
      webSpeech.stop();
    } else if (sttProvider === "deepgram" && deepgram.isListening) {
      deepgram.stop();
    }

    setSTTProvider(provider);
    setCustomTranscript(null);
  };

  const isPersonalRoom = !!searchParams.get("personal");

  const CallLayout = () => {
    switch (layout) {
      case "grid":
        return <PaginatedGridLayout />;
      case "speaker-right":
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      <div className="relative flex size-full items-center justify-center px-4 pb-28 pt-4">
        <div className="flex size-full items-center">
          <CallLayout />
        </div>

        <div
          className={cn("ml-2 hidden h-[calc(100vh_-_120px)]", {
            "show-block": showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      <TranscriptionOverlay
        sttProvider={sttProvider}
        customTranscript={customTranscript}
        userId={user?.id}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 flex w-full flex-wrap items-center justify-center gap-2 border-t border-white/10 bg-black/80 px-3 py-3 backdrop-blur-md">
        <CallControls onLeave={() => router.push("/")} />

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(controlButtonClasses, "cursor-pointer")}
            title="Call layout"
          >
            <LayoutList size={20} className="text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-white/10 bg-black/90 text-white">
            {["Grid", "Speaker Left", "Speaker Right"].map((item, i) => (
              <div key={item + "-" + i}>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    setLayout(
                      item.toLowerCase().replace(" ", "-") as CallLayoutType
                    )
                  }
                >
                  {item}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="border-white/10" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Caption toggle with provider selector */}
        <div className="flex items-center">
          <button
            onClick={toggleCaptions}
            title={isCaptionsActive ? "Disable Captions" : "Enable Captions"}
            className={cn(
              controlButtonClasses,
              "relative rounded-r-none border-r-0",
              isCaptionsActive &&
                "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
            )}
          >
            <ClosedCaption size={20} />
            {isCaptionsActive && (
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                controlButtonClasses,
                "w-auto gap-1 rounded-l-none px-2",
                isCaptionsActive &&
                  "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
              )}
              title="Select STT Provider"
            >
              <span className="text-[10px] font-medium">
                {STT_PROVIDER_LABELS[sttProvider]}
              </span>
              <ChevronDown size={12} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-white/10 bg-black/90 text-white">
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer",
                  sttProvider === "stream" && "bg-white/10"
                )}
                onClick={() => handleProviderChange("stream")}
              >
                Stream (Built-in)
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-white/10" />
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer",
                  sttProvider === "webspeech" && "bg-white/10"
                )}
                onClick={() => handleProviderChange("webspeech")}
              >
                Browser (Web Speech)
                {!webSpeech.isSupported && (
                  <span className="ml-2 text-[10px] text-red-400">
                    Not Supported
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="border-white/10" />
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer",
                  sttProvider === "deepgram" && "bg-white/10"
                )}
                onClick={() => handleProviderChange("deepgram")}
              >
                Deepgram (Cloud)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CallStatsButton />

        <button
          onClick={() =>
            setShowParticipants((prevShowParticipants) => !prevShowParticipants)
          }
          title="Show participants"
        >
          <div className={cn(controlButtonClasses, "cursor-pointer")}>
            <Users size={20} className="text-white" />
          </div>
        </button>

        {!isPersonalRoom && <EndCallButton />}
      </div>
    </div>
  );
};
