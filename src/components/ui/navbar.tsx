"use client";

import Link from "next/link";
import { FileVideo, Github } from "lucide-react";
import { UserButton, SignInButton } from "@clerk/nextjs";

export function Navbar() {
  return (
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
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}