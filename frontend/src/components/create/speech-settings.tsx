"use client";

import {
  Globe,
  Volume2,
  Settings,
  Loader2,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { Language, VoiceFile } from "~/types/tts";

interface SpeechSettingsProps {
  languages: Language[];
  voiceFiles: VoiceFile[];
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  exaggeration: number;
  setExaggeration: (value: number) => void;
  cfgWeight: number;
  setCfgWeight: (value: number) => void;
  text: string;
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function SpeechSettings({
  languages,
  voiceFiles,
  selectedLanguage,
  setSelectedLanguage,
  selectedVoice,
  setSelectedVoice,
  exaggeration,
  setExaggeration,
  cfgWeight,
  setCfgWeight,
  text,
  isGenerating,
  onGenerate,
}: SpeechSettingsProps) {
  const creditsNeeded = Math.max(1, Math.ceil(text.length / 100));
  const selectedLang = languages.find((l) => l.code === selectedLanguage);
  const selectedVoiceFile = voiceFiles.find((v) => v.s3_key === selectedVoice);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        {/* Header */}
        <div className="mb-4 border-b pb-3">
          <h3 className="text-sm font-semibold tracking-tight">Settings</h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Customize your speech output
          </p>
        </div>

        <div className="space-y-4">
          {/* Language Select */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
              <Globe className="h-3.5 w-3.5 text-gray-500" />
              Language
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-input bg-background hover:border-gray-400 w-full justify-between rounded-lg px-2.5 py-2 text-xs font-normal transition-colors"
                >
                  <span>
                    {selectedLang
                      ? `${selectedLang.flag} ${selectedLang.name}`
                      : "Select language"}
                  </span>
                  <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="max-h-64 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto"
                align="start"
              >
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className="flex items-center justify-between text-xs"
                  >
                    <span>
                      {lang.flag} {lang.name}
                    </span>
                    {lang.code === selectedLanguage && (
                      <Check className="h-3.5 w-3.5 text-gray-900" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Voice Select */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
              <Volume2 className="h-3.5 w-3.5 text-gray-500" />
              Voice
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-input bg-background hover:border-gray-400 w-full justify-between rounded-lg px-2.5 py-2 text-xs font-normal transition-colors"
                >
                  <span>{selectedVoiceFile?.name ?? "Select voice"}</span>
                  <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width)"
                align="start"
              >
                {voiceFiles.map((voice) => (
                  <DropdownMenuItem
                    key={voice.s3_key}
                    onClick={() => setSelectedVoice(voice.s3_key)}
                    className="flex items-center justify-between text-xs"
                  >
                    <span>{voice.name}</span>
                    {voice.s3_key === selectedVoice && (
                      <Check className="h-3.5 w-3.5 text-gray-900" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Sliders Section */}
          <div className="space-y-3 rounded-lg bg-gray-50 p-3">
            {/* Emotion/Intensity Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <Settings className="h-3.5 w-3.5 text-gray-500" />
                  Emotion
                </label>
                <span className="rounded-md bg-white px-1.5 py-0.5 text-xs font-mono text-gray-600 shadow-sm">
                  {exaggeration.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={exaggeration}
                onChange={(e) => setExaggeration(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-gray-900"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Calm</span>
                <span>Expressive</span>
              </div>
            </div>

            {/* Pacing Control Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                  <Settings className="h-3.5 w-3.5 text-gray-500" />
                  Pacing
                </label>
                <span className="rounded-md bg-white px-1.5 py-0.5 text-xs font-mono text-gray-600 shadow-sm">
                  {cfgWeight.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={cfgWeight}
                onChange={(e) => setCfgWeight(parseFloat(e.target.value))}
                className="w-full cursor-pointer accent-gray-900"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Fast</span>
                <span>Accurate</span>
              </div>
            </div>
          </div>

          {/* Credits & Generate */}
          <div className="space-y-2 pt-1">
            {text.trim() && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                <p className="text-xs text-gray-600">
                  Cost:{" "}
                  <span className="font-semibold text-gray-900">
                    {creditsNeeded} credit{creditsNeeded > 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-400"> · </span>
                  <span className="text-gray-500">{text.length} chars</span>
                </p>
              </div>
            )}

            <Button
              onClick={onGenerate}
              disabled={isGenerating || !text.trim()}
              className="h-10 w-full gap-2 rounded-lg bg-gray-900 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Speech
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}