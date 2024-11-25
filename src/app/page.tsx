"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  title: string;
  PAT: string;
}

interface Scene {
  scene: string;
  path: string;
}

interface Narration {
  narration: string;
  path: string;
}

interface ResponseData {
  success: boolean;
  data: {
    projectDir: string;
    script: string;
    scenes: Scene[];
    narrations: Narration[];
    video: string;
    metadata: {
      timestamp: string;
      user: string;
      totalDuration: number;
      durationPerScene: number;
    };
  };
}

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [formData, setFormData] = useState<FormData>({ title: "", PAT: "" });
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
      alert("Please sign in to generate a video");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (
        data.error &&
        typeof data.error === "object" &&
        data.error.message &&
        data.error.message.includes("Invalid API key")
      ) {
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">VidGenix</h1>
          <div>
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  required
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
                <div className="flex-1 space-y-2">
                  <Input
                    type="password"
                    name="PAT"
                    value={formData.PAT}
                    onChange={handleInputChange}
                    placeholder="Enter Personal Access Token"
                    required
                    className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  />
                  <Link
                    href="https://clarifai.com/settings/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                  >
                    Get your Personal Access Token
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !isSignedIn}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Generate Video
              </Button>
              {!isSignedIn && (
                <p className="text-red-500 text-center mt-2">
                  Please sign in to generate a video.
                </p>
              )}
            </form>

            <ScrollArea className="h-[calc(100vh-250px)]">
              {isLoading ? (
                <SceneNarrationSkeleton />
              ) : (
                responseData &&
                responseData.data && (
                  <div className="space-y-4 pr-4">
                    {responseData?.data?.scenes?.map((scene, index) => {
                      // Remove the duplicate "Scene X:" from the scene text
                      const sceneText = scene.scene.replace(
                        /^Scene \d+:\s*/,
                        ""
                      );
                      const narration =
                        responseData?.data?.narrations?.[index]?.narration ||
                        "";

                      return (
                        <Card
                          key={index}
                          className="bg-gray-800 border-gray-700"
                        >
                          <CardContent className="p-4 space-y-2">
                            <p className="text-sm font-semibold text-gray-300">
                              Scene {index + 1}: {sceneText}
                            </p>
                            <p className="text-sm text-gray-400">
                              Narration {index + 1}: {narration}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
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
              responseData &&
              responseData.data &&
              responseData.data.video && (
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
