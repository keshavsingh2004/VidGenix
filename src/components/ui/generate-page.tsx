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

interface FormData {
  title: string;
}

interface Scene {
  scene: string;
  path: string;
}

interface Narration {
  narration: string;
  path: string;
}

interface Metadata {
  timestamp: string;
  totalDuration: number;
  durationPerScene: number;
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
  };
}

export function GeneratePage() {
  const { isSignedIn } = useUser();
  const [formData, setFormData] = useState<FormData>({ title: "" });
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFormData = localStorage.getItem("formData");
      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }
    }
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
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.error?.message?.includes("Invalid API key")) {
        toast({
          title: "Error",
          description: "Invalid API key or Invalid API key/application pair",
          variant: "destructive",
        });
      } else {
        setResponseData(data);
      }
    } catch (error) {
      console.error("Error:", error);
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
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter topic"
                required
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
              <Button
                type="submit"
                disabled={isLoading || !isSignedIn}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Generate Video
              </Button>
            </form>

            <ScrollArea className="h-[calc(100vh-250px)]">
              {isLoading ? (
                <SceneNarrationSkeleton />
              ) : (
                responseData?.data && (
                  <div className="space-y-4 pr-4">
                    {responseData.data.scenes?.map((scene: Scene, index: number) => (
                      <Card key={index} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4 space-y-2">
                          <p className="text-sm font-semibold text-gray-300">
                            Scene {index + 1}: {scene.scene.replace(/^Scene \d+:\s*/, "")}
                          </p>
                          <p className="text-sm text-gray-400">
                            Narration {index + 1}: {responseData.data.narrations?.[index]?.narration || ""}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              )}
            </ScrollArea>
          </div>

          {/* Right Column */}
          <div className="flex items-center justify-center min-h-[calc(100vh-250px)]">
            {isLoading ? (
              <Skeleton className="w-full aspect-video rounded-lg bg-gray-800" />
            ) : (
              responseData?.data?.video && (
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-800">
                  <video controls className="w-full h-full object-contain">
                    <source src={responseData.data.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
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