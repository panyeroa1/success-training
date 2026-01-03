"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { LogOut, PhoneOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call?.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!call) return null;

  if (isMeetingOwner) {
    return (
      <Button
        onClick={async () => {
          await call.endCall();
          router.push("/");
        }}
        className="bg-red-500 hover:bg-red-600 gap-2"
      >
        <PhoneOff size={20} />
        <span className="max-sm:hidden">End Call</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={async () => {
        await call.leave();
        router.push("/");
      }}
      className="bg-zinc-800 hover:bg-zinc-700 gap-2 border border-white/10"
    >
      <LogOut size={20} />
      <span className="max-sm:hidden">Leave</span>
    </Button>
  );
};

