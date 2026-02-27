"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import {
  Loader2,
  Calendar,
  TrendingUp,
  Star,
  ArrowRight,
  Music,
  Mic,
  Settings,
  AudioLines,
  Globe,
} from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useEffect, useState } from "react";
import { getUserAudioProjects } from "~/actions/tts";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

interface AudioProject {
  id: string;
  name: string | null;
  text: string;
  audioUrl: string;
  s3Key: string;
  language: string;
  voiceS3Key: string;
  exaggeration: number;
  cfgWeight: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserStats {
  totalAudioProjects: number;
  thisMonth: number;
  thisWeek: number;
}
export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [audioProjects, setAudioProjects] = useState<AudioProject[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalAudioProjects: 0,
    thisMonth: 0,
    thisWeek: 0,
  });
  const [user, setUser] = useState<{
    name?: string;
    createdAt?: string | Date;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const [sessionResult, audioResult] = await Promise.all([
          authClient.getSession(),
          getUserAudioProjects(),
        ]);

        if (sessionResult?.data?.user) {
          setUser(sessionResult.data.user);
        }

        if (audioResult.success && audioResult.audioProjects) {
          setAudioProjects(audioResult.audioProjects);
        }

        const audios = audioResult.audioProjects ?? [];

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setUserStats({
          totalAudioProjects: audios.length,
          thisMonth: audios.filter((p) => new Date(p.createdAt) >= thisMonth)
            .length,
          thisWeek: audios.filter((p) => new Date(p.createdAt) >= thisWeek)
            .length,
        });
      } catch (error) {
        console.error("Dashboard initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-2 text-xs text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt as string | number | Date).toLocaleDateString(
        "en-US",
        { month: "short", year: "numeric" },
      )
    : "N/A";

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        {/* Page Header */}
        <div className="border-b border-gray-100 bg-white px-4 py-5 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Welcome back{user?.name ? `, ${user.name}` : ""}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here&apos;s an overview of your workspace
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl space-y-5 px-2 py-4 sm:px-4 sm:py-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: "Total Audio",
                value: userStats.totalAudioProjects,
                sub: "Generations",
                icon: AudioLines,
                iconColor: "text-violet-500",
                iconBg: "bg-violet-50",
              },
              {
                label: "This Month",
                value: userStats.thisMonth,
                sub: "Created",
                icon: Calendar,
                iconColor: "text-blue-500",
                iconBg: "bg-blue-50",
              },
              {
                label: "This Week",
                value: userStats.thisWeek,
                sub: "Recent",
                icon: TrendingUp,
                iconColor: "text-emerald-500",
                iconBg: "bg-emerald-50",
              },
              {
                label: "Member Since",
                value: memberSince,
                sub: "Joined",
                icon: Star,
                iconColor: "text-amber-500",
                iconBg: "bg-amber-50",
              },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="border-border/60 shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500">
                      {stat.label}
                    </p>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-md ${stat.iconBg}`}>
                      <stat.icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {stat.sub}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => router.push("/dashboard/create")}
              className="group flex items-center gap-4 rounded-xl border border-gray-900 bg-gray-900 p-4 text-left text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <Mic className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Text-to-Speech</p>
                <p className="text-xs text-white/60">Generate with additional speech options</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-70" />
            </button>

            <button
              onClick={() => router.push("/dashboard/projects")}
              className="group flex items-center gap-4 rounded-xl border border-border/60 bg-white p-4 text-left shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                <Music className="h-5 w-5 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">All Audio</p>
                <p className="text-xs text-gray-400">Browse your library</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
            </button>

            <button
              onClick={() => router.push("/dashboard/settings")}
              className="group flex items-center gap-4 rounded-xl border border-border/60 bg-white p-4 text-left shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">Settings</p>
                <p className="text-xs text-gray-400">Manage your account</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
            </button>
          </div>

          {/* Recent Audio */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Recent Projects
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Your latest generated audio
                  </p>
                </div>
                {audioProjects.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/dashboard/projects")}
                    className="h-8 gap-1.5 rounded-lg text-xs"
                  >
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {audioProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 pb-10 pt-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-gray-50">
                    <Music className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    No projects yet
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Generate your first speech to see it here
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/create")}
                    className="mt-4 h-9 gap-2 rounded-lg bg-gray-900 text-sm font-medium text-white shadow-sm hover:bg-gray-800 active:scale-[0.98]"
                  >
                    <Mic className="h-4 w-4" />
                    Create Audio
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 px-5 pb-5">
                  {audioProjects.slice(0, 5).map((audio, i) => (
                    <div
                      key={audio.id}
                      className="group flex items-center gap-4 rounded-xl border border-border/60 bg-white p-3.5 transition-all hover:border-gray-300 hover:shadow-sm"
                    >
                      {/* Number Badge */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white">
                        {i + 1}
                      </div>

                      {/* Text & Meta */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {audio.name ??
                            audio.text.substring(0, 60) +
                              (audio.text.length > 60 ? "..." : "")}
                        </p>
                        <div className="mt-1 flex items-center gap-2.5 text-[11px] text-gray-400">
                          <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-1.5 py-0.5 font-medium uppercase">
                            <Globe className="h-2.5 w-2.5" />
                            {audio.language}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(audio.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Audio Player */}
                      <audio
                        src={audio.audioUrl}
                        controls
                        className="hidden h-9 w-52 shrink-0 sm:block"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SignedIn>
    </>
  );
}