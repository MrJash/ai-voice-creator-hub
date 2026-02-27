"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import {
  Loader2,
  Search,
  Calendar,
  Globe,
  Music,
  Trash2,
  Download,
  Plus,
  ArrowUpDown,
  Check,
  ChevronDown,
} from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useEffect, useState } from "react";
import { getUserAudioProjects, deleteAudioProject } from "~/actions/tts";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

type SortBy = "newest" | "oldest" | "name";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name", label: "Text A–Z" },
];

export default function Projects() {
  const [isLoading, setIsLoading] = useState(true);
  const [audioProjects, setAudioProjects] = useState<AudioProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<AudioProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const router = useRouter();

  useEffect(() => {
    const initializeProjects = async () => {
      try {
        const [, projectsResult] = await Promise.all([
          authClient.getSession(),
          getUserAudioProjects(),
        ]);

        if (projectsResult.success && projectsResult.audioProjects) {
          setAudioProjects(projectsResult.audioProjects);
          setFilteredProjects(projectsResult.audioProjects);
        }
      } catch (error) {
        console.error("Audio projects initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeProjects();
  }, []);

  useEffect(() => {
    let filtered = audioProjects.filter((project) =>
      project.text.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    switch (sortBy) {
      case "newest":
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "oldest":
        filtered = filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "name":
        filtered = filtered.sort((a, b) => a.text.localeCompare(b.text));
        break;
    }

    setFilteredProjects(filtered);
  }, [audioProjects, searchQuery, sortBy]);

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this audio project?")) return;

    const result = await deleteAudioProject(projectId);
    if (result.success) {
      setAudioProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Project deleted");
    }
  };

  const handleDownload = (
    audioUrl: string,
    name: string | null,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    window.open(audioUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-2 text-xs text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  const sortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        {/* Page Header */}
        <div className="border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Audio Projects
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {audioProjects.length}{" "}
                {audioProjects.length === 1 ? "project" : "projects"} total
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/create")}
              className="h-9 gap-2 self-start rounded-lg bg-gray-900 text-sm font-medium text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.98] sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              New Audio
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl space-y-4 px-2 py-4 sm:px-4 sm:py-6">
          {/* Search & Sort Bar */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by text content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-input bg-background h-9 rounded-lg pl-9 text-sm"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-input bg-background hover:border-gray-400 h-9 shrink-0 justify-between gap-2 rounded-lg px-3 text-xs font-normal transition-colors sm:w-40"
                    >
                      <span className="flex items-center gap-1.5">
                        <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
                        {sortLabel}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-(--radix-dropdown-menu-trigger-width) sm:w-40">
                    {SORT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className="flex items-center justify-between text-xs"
                      >
                        <span>{option.label}</span>
                        {option.value === sortBy && (
                          <Check className="h-3.5 w-3.5 text-gray-900" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          {filteredProjects.length === 0 ? (
            <Card className="border-border/60 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-gray-200 bg-gray-50">
                  <Music className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {searchQuery ? "No results found" : "No audio projects yet"}
                </h3>
                <p className="mt-1 max-w-sm text-xs text-gray-500">
                  {searchQuery
                    ? `Nothing matches "${searchQuery}". Try different terms.`
                    : "Create your first text-to-speech audio to get started."}
                </p>
                <div className="mt-5">
                  {!searchQuery ? (
                    <Button
                      onClick={() => router.push("/dashboard/create")}
                      className="h-9 gap-2 rounded-lg bg-gray-900 text-sm font-medium text-white shadow-sm hover:bg-gray-800 active:scale-[0.98]"
                    >
                      <Plus className="h-4 w-4" />
                      Create First Audio
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                      className="h-9 rounded-lg text-sm"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Project List */
            <div className="space-y-2">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="border-border/60 group shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {/* Icon */}
                      <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-50 sm:flex">
                        <Music className="h-5 w-5 text-gray-400" />
                      </div>

                      {/* Text & Meta */}
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm leading-snug text-gray-800">
                          {project.text}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="flex items-center gap-1 uppercase">
                            <Globe className="h-3 w-3" />
                            {project.language}
                          </span>
                        </div>
                      </div>

                      {/* Audio Player & Actions */}
                      <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                        <audio
                          controls
                          className="h-9 min-w-0 flex-1 sm:w-48 sm:flex-initial"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <source src={project.audioUrl} type="audio/wav" />
                        </audio>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700"
                          onClick={(e) =>
                            handleDownload(project.audioUrl, project.name, e)
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                          onClick={(e) => handleDelete(project.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SignedIn>
    </>
  );
}