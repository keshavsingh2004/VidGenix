"use client";

import { useState, useEffect } from "react";
import { FileVideo, Github } from "lucide-react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import AnimatedLoadingWait from "./animated-loading-wait";

interface FormData {
  title: string;
}

interface Scene {
  scene: string;
  path: string;
  url: string;
  narration: string; // Add narration to Scene interface
}

interface Narration {
  narration: string;
  path: string;
  startTime: number;
  duration: number;
}

interface Metadata {
  timestamp: string;
  totalDuration: number;
  durationPerScene: number;
  videoKey: string; // Add videoKey to metadata
}

interface ResponseData {
  success: boolean;
  data: {
    projectDir: string;
    script: string;
    scenes: Scene[];
    narrations: Narration[];
    video: string;
    metadata: Metadata;
    audio: {  // Add audio type definition
      url: string;
      duration: number;
    };
  };
}

export function GeneratePage() {
  const { isSignedIn } = useUser();
  const [formData, setFormData] = useState<FormData>({ title: "" });
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFormData = localStorage.getItem("formData");
      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }
    }
  }, []);

  useEffect(() => {
    const savedLog = console.log;
    console.log = (...args: any[]) => {
      setLogs((prev) => [...prev, args.join(" ")]);
      savedLog(...args);
    };
    return () => {
      console.log = savedLog;
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      localStorage.setItem("formData", JSON.stringify(newData));
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast({
        title: "Error",
        description: "Please sign in to generate a video",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResponseData(null); // Reset previous response
    try {
      console.log("Generation started...");
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || 'Generation failed');
      }
      if (data.error) {
        throw new Error(data.error);
      }
      setResponseData(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Generation failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold flex items-center gap-2 text-blue-400">
              <FileVideo className="w-6 h-6" />
              VidGenix
            </Link>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/keshavsingh2004/VidGenix"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <Github className="w-6 h-6" />
              </a>
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
          <h2 className="text-2xl font-bold">Please sign in to generate videos</h2>
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors">
              Sign In to Continue
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold flex items-center gap-2 text-blue-400">
            <FileVideo className="w-6 h-6" />
            VidGenix
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/keshavsingh2004/VidGenix"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
            >
              <Github className="w-6 h-6" />
            </a>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          {/* Left Column */}
          <div className="space-y-6">
            {isLoading ? (
              // Show skeleton loader while loading
              <SceneNarrationSkeleton />
            ) : (
              // Show form and response data when not loading
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter topic"
                    required
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 rounded-lg"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !isSignedIn}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700 "
                  >
                    Generate Video
                  </Button>
                </form>

                {responseData?.data && (
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    <div className="space-y-4 pr-4">

                      {responseData.data.scenes?.length > 0 && (
                        <>
                          <h3 className="text-lg font-semibold text-gray-300">Scenes</h3>
                          {responseData.data.scenes.map((scene: Scene, index: number) => (
                            <Card key={index} className="bg-gray-800 border-gray-700">
                              <CardContent className="p-4 space-y-2">
                                <p className="text-sm font-semibold text-gray-300">
                                  Scene {index + 1}: {scene.scene.replace(/^Scene \d+:\s*/, "")}
                                </p>
                                <img src={scene.path} alt={`Scene ${index + 1}`} className="rounded" />
                              </CardContent>
                            </Card>
                          ))}
                        </>
                      )}

                      {responseData.data.audio && (
                        <>
                          <h3 className="text-lg font-semibold text-gray-300">Audio</h3>
                          <Card className="bg-gray-800 border-gray-700">
                            <CardContent className="p-4 space-y-2">
                              <audio controls src={responseData.data.audio.url} className="w-full">
                                Your browser does not support the audio tag.
                              </audio>
                            </CardContent>
                          </Card>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </>
            )}
          </div>


          {/* Right Column */}
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] space-y-4">
            {isLoading ? (
              <AnimatedLoadingWait />
            ) : (
              responseData?.data?.video && (
                <div className="w-auto max-h-[80vh] aspect-[9/16] rounded-lg overflow-hidden bg-gray-800">
                  <video
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.error("Video loading error:", e);
                      toast({
                        title: "Error",
                        description: "Error loading video. Please try again.",
                        variant: "destructive",
                      });
                    }}
                  >
                    <source
                      src={responseData.data.video}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                  <div className="mt-2 text-sm text-gray-400">
                    Video URL: {responseData.data.video}
                  </div>
                </div>
              )
            )}



          </div>
        </div>
      </main>
    </div>
  );
}

function SceneNarrationSkeleton() {
  return (
    <div className="space-y-4 pr-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="w-full h-24 bg-gray-800" />
      ))}
    </div>
  );
}