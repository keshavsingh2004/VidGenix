"use client";

import Link from "next/link";
import { FileVideo, Github, ChevronRight, Wand2, Layers, Mic } from "lucide-react";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

export function LandingPage() {
  const { isSignedIn } = useUser();
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
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
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
          <video 
            controls 
            className="w-full rounded-lg shadow-2xl"
            poster="https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
          >
            <source src="/generated/elon_musk_2024-11-25T17-29-34-722Z/video/final_video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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