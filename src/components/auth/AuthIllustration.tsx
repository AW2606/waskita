"use client";

import React from "react";
import Image from "next/image";

export function AuthIllustration() {
  return (
    <div className="relative w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[320px] aspect-square flex items-center justify-center select-none pointer-events-none mx-auto">
      
      {/* 1. Ambient Background Glow Orbs */}
      <div className="absolute inset-0 bg-radial from-[#45A997]/20 via-[#1B5549]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
      
      {/* 2. Concentric Radar Rings */}
      <div className="absolute inset-2 sm:inset-3 rounded-full border border-[#256B5C]/20 pointer-events-none" />
      <div className="absolute inset-6 sm:inset-8 rounded-full border border-dashed border-[#256B5C]/25 pointer-events-none" />
      <div className="absolute inset-12 sm:inset-14 rounded-full border border-[#256B5C]/15 pointer-events-none" />

      {/* 3. Left & Right Audio Forensics Waveforms */}
      <div className="absolute left-0 sm:left-1 flex items-center gap-1 text-[#388D7E]">
        <span className="w-1 h-3 bg-current rounded-full animate-pulse" />
        <span className="w-1 h-7 bg-current rounded-full animate-pulse [animation-delay:150ms]" />
        <span className="w-1 h-10 bg-current rounded-full animate-pulse [animation-delay:300ms]" />
        <span className="w-1 h-5 bg-current rounded-full animate-pulse [animation-delay:450ms]" />
      </div>

      <div className="absolute right-0 sm:right-1 flex items-center gap-1 text-[#388D7E]">
        <span className="w-1 h-5 bg-current rounded-full animate-pulse [animation-delay:200ms]" />
        <span className="w-1 h-10 bg-current rounded-full animate-pulse [animation-delay:350ms]" />
        <span className="w-1 h-7 bg-current rounded-full animate-pulse [animation-delay:100ms]" />
        <span className="w-1 h-3 bg-current rounded-full animate-pulse [animation-delay:500ms]" />
      </div>

      {/* 4. Top-Right VERIFIED Badge */}
      <div className="absolute top-1 sm:top-2 right-1 sm:right-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13382F] border border-[#4EBDA9]/50 shadow-md text-[10px] sm:text-xs font-mono font-bold text-white tracking-wide">
        <span className="w-2 h-2 rounded-full bg-[#38A189] animate-pulse" />
        <span>VERIFIED</span>
      </div>

      {/* 5. Bottom-Left AI SHIELD Badge */}
      <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#13382F] border border-[#F6C85F]/50 shadow-md text-[10px] sm:text-xs font-mono font-bold text-[#F6C85F] tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D9A441]" />
        <span>AI SHIELD</span>
      </div>

      {/* 6. Central Waskita Logo Card */}
      <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-52 lg:h-52 rounded-3xl sm:rounded-[36px] bg-white shadow-[0_15px_35px_-5px_rgba(0,0,0,0.12)] border border-[#2F6F62]/20 p-4 sm:p-6 flex items-center justify-center backdrop-blur-md">
        <Image
          src="/logo_full.png"
          alt="Waskita Logo"
          width={180}
          height={180}
          className="w-full h-full object-contain filter drop-shadow-xs"
          priority
        />
      </div>

    </div>
  );
}
