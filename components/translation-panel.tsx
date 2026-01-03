"use client";

import { useState, useEffect } from "react";
import { Check, Globe, ChevronsUpDown, User, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TARGET_LANGUAGES } from "@/constants/languages";
import { cn } from "@/lib/utils";
import { AutoPlayingTTS } from "./autoplaying-tts";
import { useTTS } from "./tts-provider";
import { useMeetingSpeakers } from "@/hooks/use-meeting-speakers";
import { SidebarPanel } from "./sidebar-panel";

interface TranslationPanelProps {
  onClose: () => void;
  onLanguageSelect: (lang: string) => void;
  selectedLanguage: string;
  userId: string;
  meetingId: string;
}

export function TranslationPanel({
  onClose,
  onLanguageSelect,
  selectedLanguage,
  userId,
  meetingId,
}: TranslationPanelProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false);
  
  const { audioDevices, selectedSinkId, setSelectedSinkId, targetUserId, setTargetUserId } = useTTS();
  const { speakers, isLoading: isLoadingSpeakers } = useMeetingSpeakers(meetingId, userId);

  const handleSelect = (value: string) => {
    onLanguageSelect(value);
    setComboboxOpen(false);
  };

  const selectedLabel = TARGET_LANGUAGES.find(
    (lang) => lang.value === selectedLanguage
  )?.label;

  useEffect(() => {
    if (!targetUserId && speakers.length > 0) {
      const otherSpeaker = speakers.find(s => !s.isLocal);
      if (otherSpeaker) {
        setTargetUserId(otherSpeaker.id);
      }
    }
  }, [speakers, targetUserId, setTargetUserId]);

  return (
    <SidebarPanel
      title="Translation"
      icon={<Globe className="h-5 w-5 text-[#0E78F9]" />}
      onClose={onClose}
    >
      <div className="space-y-6">
        <p className="text-zinc-400 text-xs">
          Configure your real-time translation and TTS preferences.
        </p>

        <div className="space-y-2">
           <h3 className="text-sm font-medium text-zinc-300">Status</h3>
           <Button
            variant="outline"
            onClick={() => handleSelect("off")}
            className={cn(
              "w-full justify-between h-auto py-3 px-4 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors",
              selectedLanguage === "off" && "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-400"
            )}
          >
            <span className="font-medium">
              {selectedLanguage === "off" ? "Translation Disabled" : "Translation Active"}
            </span>
            {selectedLanguage === "off" && <Check className="h-4 w-4" />}
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-300">Target Language</h3>
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen} modal={true}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                className="w-full justify-between bg-zinc-900/50 border-white/10 text-white hover:bg-zinc-900 hover:text-white"
              >
                {selectedLanguage !== "off" && selectedLabel
                  ? selectedLabel
                  : "Select language..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0 bg-[#1c1f2e] border-zinc-700 z-[101]">
              <Command className="bg-transparent text-white">
                <CommandInput placeholder="Search language..." className="text-white placeholder:text-zinc-500" />
                <CommandList>
                  <CommandEmpty className="py-6 text-center text-sm text-zinc-400">No language found.</CommandEmpty>
                  <CommandGroup>
                    {TARGET_LANGUAGES.map((lang) => (
                      <CommandItem
                        key={lang.value}
                        value={lang.label}
                        onSelect={() => handleSelect(lang.value)}
                        className="text-white aria-selected:bg-white/10 aria-selected:text-white cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedLanguage === lang.value ? "opacity-100 ring-[#0E78F9]" : "opacity-0"
                          )}
                        />
                        {lang.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-xs text-zinc-500">
            Select the language you want to read.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-300">Source Speaker for TTS</h3>
          <Select value={targetUserId} onValueChange={setTargetUserId}>
            <SelectTrigger className="w-full bg-zinc-900/50 border-white/10 text-white">
              <SelectValue placeholder="Select Speaker" />
            </SelectTrigger>
            <SelectContent className="bg-[#1c1f2e] border-zinc-700 text-white z-[102]">
               {isLoadingSpeakers ? (
                  <SelectItem value="loading" disabled>Loading speakers...</SelectItem>
               ) : speakers.length === 0 ? (
                  <SelectItem value="none" disabled>No active speakers found</SelectItem>
               ) : (
                  speakers.map((speaker) => (
                    <SelectItem key={speaker.id} value={speaker.id} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        {speaker.isLocal ? <UserCircle size={14} /> : <User size={14} />}
                        <span>{speaker.name}</span>
                        {speaker.isLocal && <span className="text-zinc-500 text-xs">(You)</span>}
                      </div>
                    </SelectItem>
                  ))
               )}
            </SelectContent>
          </Select>
          <p className="text-xs text-zinc-500">
            Select whose speech you want to hear translated.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-300">Audio Output</h3>
          {audioDevices.length > 0 ? (
             <Select value={selectedSinkId} onValueChange={setSelectedSinkId}>
              <SelectTrigger className="w-full bg-zinc-900/50 border-white/10 text-white">
                <SelectValue placeholder="Default Output" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1f2e] border-zinc-700 text-white z-[102]">
                <SelectItem value="default">Default Output</SelectItem>
                {audioDevices.map((device) => (
                  <SelectItem key={device.value} value={device.value}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
              <p className="text-xs text-zinc-500 italic">No output devices found (check permissions).</p>
          )}
        </div>
        
        <div className="border-t border-white/10 pt-6">
           <AutoPlayingTTS userId={userId} />
        </div>
      </div>
    </SidebarPanel>
  );
}
