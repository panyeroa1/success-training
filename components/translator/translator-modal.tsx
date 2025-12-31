"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useTranslatorStore } from "@/store/use-translator";

import { TranslatorSettingsForm } from "./translator-settings-form";

type TranslatorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TranslatorModal = ({
  open,
  onOpenChange,
}: TranslatorModalProps) => {
  const { toast } = useToast();
  const { user, isLoaded } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  const enabled = useTranslatorStore((state) => state.enabled);
  const autoTranslateEnabled = useTranslatorStore(
    (state) => state.autoTranslateEnabled
  );
  const targetLang = useTranslatorStore((state) => state.targetLang);
  const showOriginal = useTranslatorStore((state) => state.showOriginal);
  const speakerLang = useTranslatorStore((state) => state.speakerLang);
  const ttsEnabled = useTranslatorStore((state) => state.ttsEnabled);
  const ttsVoice = useTranslatorStore((state) => state.ttsVoice);
  const ttsVolume = useTranslatorStore((state) => state.ttsVolume);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata as Record<string, unknown>),
          translatorPrefs: {
            enabled,
            autoTranslateEnabled,
            targetLang,
            showOriginal,
            speakerLang,
            ttsEnabled,
            ttsVoice,
            ttsVolume,
          },
        },
      });

      toast({ title: "Translator preferences saved." });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save translator preferences.", error);
      toast({
        title: "Failed to save preferences.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden border-white/10 bg-[#0B121A] text-white">
        <DialogHeader>
          <DialogTitle>Live Translator</DialogTitle>
          <DialogDescription className="text-white/60">
            Configure live captions and translation for this call.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <TranslatorSettingsForm />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-emerald-500 text-white hover:bg-emerald-500/90"
            disabled={!isLoaded || !user || isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
