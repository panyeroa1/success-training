"use client";

import {
  SPEAKER_LANGUAGES,
  TARGET_LANGUAGES,
} from "@/constants/languages";
import { Input } from "@/components/ui/input";
import { useTranslatorStore } from "@/store/use-translator";

export const TranslatorSettingsForm = () => {
  const enabled = useTranslatorStore((state) => state.enabled);
  const autoTranslateEnabled = useTranslatorStore(
    (state) => state.autoTranslateEnabled
  );
  const targetLang = useTranslatorStore((state) => state.targetLang);
  const showOriginal = useTranslatorStore((state) => state.showOriginal);
  const speakerLang = useTranslatorStore((state) => state.speakerLang);
  const setEnabled = useTranslatorStore((state) => state.setEnabled);
  const setAutoTranslateEnabled = useTranslatorStore(
    (state) => state.setAutoTranslateEnabled
  );
  const setTargetLang = useTranslatorStore((state) => state.setTargetLang);
  const setShowOriginal = useTranslatorStore((state) => state.setShowOriginal);
  const setSpeakerLang = useTranslatorStore((state) => state.setSpeakerLang);
  const ttsEnabled = useTranslatorStore((state) => state.ttsEnabled);
  const cartesiaVoice = useTranslatorStore((state) => state.ttsVoice);
  const setCartesiaVoice = useTranslatorStore((state) => state.setTtsVoice);
  const setTtsEnabled = useTranslatorStore((state) => state.setTtsEnabled);
  const ttsVolume = useTranslatorStore((state) => state.ttsVolume);
  const setTtsVolume = useTranslatorStore((state) => state.setTtsVolume);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0F1720] px-4 py-3">
        <div>
          <label
            htmlFor="translator-enabled"
            className="text-sm font-semibold text-white"
          >
            Enable Live Captions
          </label>
          <p className="text-xs text-white/60">
            Broadcast your speech as captions to the call.
          </p>
        </div>
        <input
          id="translator-enabled"
          type="checkbox"
          aria-label="Enable live captions"
          title="Enable live captions"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
          className="size-5 accent-emerald-500"
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0F1720] px-4 py-3">
        <div>
          <label
            htmlFor="translator-auto"
            className="text-sm font-semibold text-white"
          >
            Auto-translate captions
          </label>
          <p className="text-xs text-white/60">
            Translate incoming captions to your target language.
          </p>
        </div>
        <input
          id="translator-auto"
          type="checkbox"
          aria-label="Auto-translate captions"
          title="Auto-translate captions"
          checked={autoTranslateEnabled}
          onChange={(event) => setAutoTranslateEnabled(event.target.checked)}
          className="size-5 accent-sky-500"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0F1720] px-4 py-3">
        <label
          htmlFor="translator-target-lang"
          className="text-sm font-semibold text-white"
        >
          My target language
        </label>
        <select
          id="translator-target-lang"
          aria-label="My target language"
          title="My target language"
          value={targetLang}
          onChange={(event) => setTargetLang(event.target.value)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-[#101b24] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/60"
        >
          {TARGET_LANGUAGES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0F1720] px-4 py-3">
        <div>
          <label
            htmlFor="translator-show-original"
            className="text-sm font-semibold text-white"
          >
            Show original text
          </label>
          <p className="text-xs text-white/60">
            Display the original caption under the translation.
          </p>
        </div>
        <input
          id="translator-show-original"
          type="checkbox"
          aria-label="Show original text"
          title="Show original text"
          checked={showOriginal}
          onChange={(event) => setShowOriginal(event.target.checked)}
          className="size-5 accent-amber-500"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0F1720] px-4 py-3">
        <label
          htmlFor="translator-speaker-lang"
          className="text-sm font-semibold text-white"
        >
          Speaker language
        </label>
        <select
          id="translator-speaker-lang"
          aria-label="Speaker language"
          title="Speaker language"
          value={speakerLang}
          onChange={(event) => setSpeakerLang(event.target.value)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-[#101b24] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
        >
          {SPEAKER_LANGUAGES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0F1720] px-4 py-3">
        <div>
          <label
            htmlFor="translator-tts"
            className="text-sm font-semibold text-white"
          >
            Read aloud captions (Cartesia)
          </label>
          <p className="text-xs text-white/60">
            Use Cartesia TTS to speak captions locally.
          </p>
        </div>
        <input
          id="translator-tts"
          type="checkbox"
          aria-label="Read aloud captions"
          title="Read aloud captions"
          checked={ttsEnabled}
          onChange={(event) => setTtsEnabled(event.target.checked)}
          className="size-5 accent-violet-500"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0F1720] px-4 py-3">
        <label
          htmlFor="translator-tts-volume"
          className="text-sm font-semibold text-white"
        >
          Translation volume
        </label>
        <p className="text-xs text-white/60">
          Standard listening level for read-aloud captions.
        </p>
        <input
          id="translator-tts-volume"
          aria-label="Translation volume"
          title="Translation volume"
          type="range"
          min={30}
          max={100}
          step={1}
          value={Math.round((ttsVolume || 0) * 100)}
          onChange={(event) =>
            setTtsVolume(Number(event.target.value) / 100)
          }
          className="mt-3 w-full accent-emerald-500"
        />
        <div className="mt-1 text-right text-xs text-white/60">
          {Math.round((ttsVolume || 0) * 100)}%
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0F1720] px-4 py-3">
        <label
          htmlFor="translator-voice"
          className="text-sm font-semibold text-white"
        >
          Cartesia voice ID
        </label>
        <Input
          id="translator-voice"
          aria-label="Cartesia voice ID"
          title="Cartesia voice ID"
          value={cartesiaVoice}
          onChange={(event) => setCartesiaVoice(event.target.value)}
          placeholder="e.g. 9c7e6604-52c6-424a-9f9f-2c4ad89f3bb9"
          className="mt-2 border-white/10 bg-[#101b24] text-sm text-white placeholder:text-white/40 focus-visible:ring-emerald-500/60"
        />
      </div>
    </div>
  );
};
