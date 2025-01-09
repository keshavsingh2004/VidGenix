"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FileVideo, Github, ChevronRight, Wand2, Layers, Mic, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

export function LandingPage() {
  const { isSignedIn } = useUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          await videoRef.current.pause();
        } else {
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('Error toggling video:', error);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text leading-tight">
            Transform Text into Engaging Videos
            </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Create professional videos from text in minutes with our AI-powered platform
          </p>
          <Link
            href="/generate"
            className="mt-8 bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
          >
            Start Creating <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<Wand2 className="w-6 h-6 text-blue-400" />}
            title="Text-to-Video Generation"
            description="Enter a simple text prompt to automatically generate story scripts and scenes using Groq LLaMa 3.3 70B."
            color="blue"
          />
          <FeatureCard
            icon={<Layers className="w-6 h-6 text-purple-400" />}
            title="AI-powered Images"
            description="Generate high-quality images for each scene using the Flux model, perfectly matching your script."
            color="purple"
          />
          <FeatureCard
            icon={<Mic className="w-6 h-6 text-pink-400" />}
            title="AI Voiceover"
            description="Convert text into realistic speech with Deepgram's cutting-edge AI voice synthesis technology."
            color="pink"
          />
          <FeatureCard
            icon={<FileVideo className="w-6 h-6 text-green-400" />}
            title="Video Assembly"
            description="Automatically combine images and voiceovers into a polished video slideshow."
            color="green"
          />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src="https://utfs.io/f/Gv2JxtlSEriP3xBHTmahNj0Hp2GuK6AVSUJBL4Wa8Tymc3Ek"
              preload="metadata"
              width="1920"
              height="1080"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-auto"
              style={{ objectFit: 'contain' }}
            />
            {/* Top right controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={togglePlay}
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full p-2 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={toggleMute}
                className="bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full p-2 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            {/* Center play button */}

          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} VidGenix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className={`bg-${color}-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}