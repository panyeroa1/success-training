"use client";

import { Users } from "lucide-react";
import { CallParticipantsList } from "@stream-io/video-react-sdk";
import { SidebarPanel } from "./sidebar-panel";

interface ParticipantsPanelProps {
  onClose: () => void;
}

export function ParticipantsPanel({ onClose }: ParticipantsPanelProps) {
  return (
    <SidebarPanel
      title="Participants"
      icon={<Users className="h-5 w-5 text-[#0E78F9]" />}
      onClose={onClose}
    >
      <CallParticipantsList onClose={onClose} />
    </SidebarPanel>
  );
}
