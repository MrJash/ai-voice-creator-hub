"use client";

import {
  Globe,
  Volume2,
  Settings,
  Loader2,
  Sparkles,
  ChevronDown,
  Check,
  Upload,
  Mic,
  Play,
  Square,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "~/components/ui/dropdown-menu";
import type { Language, VoiceFile, UploadedVoice } from "~/types/tts";
import { useRef, useState } from "react";

const S3_BUCKET_URL = "https://ai-voice-creator-hub-jash.s3.us-east-1.amazonaws.com";

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
  seed: number;
  setSeed: (value: number) => void;
  userUploadedVoices: UploadedVoice[];
  isUploadingVoice: boolean;
  handleVoiceUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  seed,
  setSeed,
  userUploadedVoices,
  isUploadingVoice,
  handleVoiceUpload,
  text,
  isGenerating,
  onGenerate,
}: SpeechSettingsProps) {
  const creditsNeeded = Math.max(1, Math.ceil(text.length / 100));
  const selectedLang = languages.find((l) => l.code === selectedLanguage);
  const selectedVoiceFile = voiceFiles.find((v) => v.s3_key === selectedVoice);
  const selectedUploadedVoice = userUploadedVoices.find((v) => v.s3Key === selectedVoice);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const playPreview = (e: React.MouseEvent, s3Key: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (playingVoice === s3Key) {
      previewAudioRef.current?.pause();
      setPlayingVoice(null);
      return;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    const audio = new Audio(`${S3_BUCKET_URL}/${s3Key}`);
    previewAudioRef.current = audio;
    setPlayingVoice(s3Key);
    audio.play().catch(() => setPlayingVoice(null));
    audio.onended = () => setPlayingVoice(null);
  };

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
            <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <Globe className="h-3.5 w-3.5" />
              Language
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-input bg-background hover:border-primary/40 w-full justify-between rounded-lg px-2.5 py-2 text-xs font-normal transition-colors"
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
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Voice Select */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <Volume2 className="h-3.5 w-3.5" />
              Voice
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-input bg-background hover:border-primary/40 w-full justify-between rounded-lg px-2.5 py-2 text-xs font-normal transition-colors"
                >
                  <span>
                    {selectedUploadedVoice
                      ? `🎤 ${selectedUploadedVoice.name}`
                      : selectedVoiceFile?.name ?? "Select voice"}
                  </span>
                  <ChevronDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="max-h-64 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto"
                align="start"
              >
                <DropdownMenuLabel className="text-xs">Presets</DropdownMenuLabel>
                {voiceFiles.map((voice) => (
                  <DropdownMenuItem
                    key={voice.s3_key}
                    onClick={() => setSelectedVoice(voice.s3_key)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {voice.s3_key === selectedVoice && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <span className="flex-1">{voice.name}</span>
                    {voice.name !== "Default" && (
                      <button
                        onClick={(e) => playPreview(e, voice.s3_key)}
                        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title={playingVoice === voice.s3_key ? "Stop preview" : "Preview voice"}
                      >
                        {playingVoice === voice.s3_key ? (
                          <Square className="h-3 w-3 fill-current" />
                        ) : (
                          <Play className="h-3 w-3 fill-current" />
                        )}
                      </button>
                    )}
                  </DropdownMenuItem>
                ))}
                {userUploadedVoices.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs">Your Voices</DropdownMenuLabel>
                    {userUploadedVoices.map((voice) => (
                      <DropdownMenuItem
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.s3Key)}
                        className="flex items-center gap-2 text-xs"
                      >
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                          {voice.s3Key === selectedVoice && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                        <span className="flex flex-1 items-center gap-1.5">
                          <Mic className="h-3 w-3" />
                          {voice.name}
                        </span>
                        <button
                          onClick={(e) => playPreview(e, voice.s3Key)}
                          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title={playingVoice === voice.s3Key ? "Stop preview" : "Preview voice"}
                        >
                          {playingVoice === voice.s3Key ? (
                            <Square className="h-3 w-3 fill-current" />
                          ) : (
                            <Play className="h-3 w-3 fill-current" />
                          )}
                        </button>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Upload Voice */}
          <div className="space-y-1.5">
            <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <Upload className="h-3.5 w-3.5" />
              Upload Your Voice
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleVoiceUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full gap-2 text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingVoice}
            >
              {isUploadingVoice ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Choose Audio File
                </>
              )}
            </Button>
            <p className="text-muted-foreground text-[10px]">
              Upload a clear voice sample (WAV/MP3, max 10MB)
            </p>
          </div>

          {/* Sliders Section */}
          <div className="bg-muted/50 space-y-3 rounded-lg p-3">
            {/* Emotion/Intensity Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  <Settings className="h-3.5 w-3.5" />
                  Emotion
                </label>
                <span className="bg-background text-muted-foreground rounded-md px-1.5 py-0.5 text-xs font-mono shadow-sm">
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
              <div className="text-muted-foreground flex justify-between text-[10px]">
                <span>Calm</span>
                <span>Expressive</span>
              </div>
            </div>

            {/* Pacing Control Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  <Settings className="h-3.5 w-3.5" />
                  Pacing
                </label>
                <span className="bg-background text-muted-foreground rounded-md px-1.5 py-0.5 text-xs font-mono shadow-sm">
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
              <div className="text-muted-foreground flex justify-between text-[10px]">
                <span>Fast</span>
                <span>Accurate</span>
              </div>
            </div>

            {/* Seed Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  <Settings className="h-3.5 w-3.5" />
                  Random Seed
                </label>
                <span className="text-muted-foreground/60 text-[10px]">
                  {seed === 0 ? "random" : "fixed"}
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                value={seed}
                onChange={(e) => setSeed(Math.max(0, Math.floor(Number(e.target.value))))}
                placeholder="0 = random"
                className="border-input bg-background text-foreground placeholder:text-muted-foreground/50 w-full rounded-md border px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <p className="text-muted-foreground/60 text-[10px]">
                0 = random each time · set a number to reproduce output
              </p>
            </div>
          </div>

          {/* Credits & Generate */}
          <div className="space-y-2 pt-1">
            {text.trim() && (
              <div className="bg-muted rounded-lg border px-3 py-2 text-center">
                <p className="text-muted-foreground text-xs">
                  Cost:{" "}
                  <span className="text-foreground font-semibold">
                    {creditsNeeded} credit{creditsNeeded > 1 ? "s" : ""}
                  </span>
                  <span className="text-muted-foreground/50"> · </span>
                  <span className="text-muted-foreground">{text.length} chars</span>
                </p>
              </div>
            )}

            <Button
              onClick={onGenerate}
              disabled={isGenerating || !text.trim()}
              className="h-10 w-full gap-2 rounded-lg text-sm font-medium shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
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