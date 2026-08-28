"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { AuthIllustration } from "./AuthIllustration";

interface AuthLayoutCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayoutCard({
  title,
  subtitle,
  children,
}: AuthLayoutCardProps) {
  return (
    <div className="min-h-screen w-full bg-[#0F2620] relative flex flex-col items-center justify-center p-3 sm:p-5 md:p-8 lg:p-10 overflow-x-hidden font-body selection:bg-[#4EA699]/30 selection:text-white">
      
      {/* =========================================================
          BACKGROUND AMBIENT BOKEH & ATMOSPHERE GLOW
          ========================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep Forest Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#16382E] via-[#0E2620] to-[#0A1D18]" />

        {/* Ambient Blurred Light Orbs */}
        <div className="absolute -top-24 -left-24 w-[360px] sm:w-[520px] h-[360px] sm:h-[520px] bg-[#2E6B5D]/25 rounded-full blur-[80px] sm:blur-[110px]" />
        <div className="absolute top-1/3 -right-32 w-[380px] sm:w-[560px] h-[380px] sm:h-[560px] bg-[#3B8F80]/20 rounded-full blur-[90px] sm:blur-[130px]" />
        <div className="absolute -bottom-28 left-1/4 w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] bg-[#1F5448]/30 rounded-full blur-[80px] sm:blur-[100px]" />

        {/* Distinct Floating Bokeh Circles */}
        <div className="absolute top-8 left-[8%] w-16 sm:w-24 h-16 sm:h-24 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-[2px]" />
        <div className="absolute top-1/4 left-6 w-10 sm:w-16 h-10 sm:h-16 rounded-full bg-[#52B4A3]/[0.08]" />
        <div className="absolute bottom-12 right-8 w-24 sm:w-36 h-24 sm:h-36 rounded-full bg-white/[0.03] border border-white/[0.05] backdrop-blur-[1px]" />
        <div className="absolute bottom-1/3 right-[15%] w-14 sm:w-20 h-14 sm:h-20 rounded-full bg-[#62C8B7]/[0.06]" />
      </div>

      {/* =========================================================
          TOP NAVIGATION SHORTCUT: BACK TO HOME
          ========================================================= */}
      <div className="w-full max-w-[1040px] mb-2.5 sm:mb-3.5 flex items-center justify-between z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[#B5D5CB] hover:text-white border border-white/10 text-xs font-medium backdrop-blur-md transition-all active:scale-95 group shadow-sm"
        >
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="w-3 h-3 transition-transform group-hover:-translate-x-0.5"
          />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* =========================================================
          MAIN FLOATING SPLIT CARD CONTAINER (MOBILE, TABLET, DESKTOP)
          ========================================================= */}
      <div className="w-full max-w-[1040px] rounded-[24px] sm:rounded-[32px] md:rounded-[40px] bg-[#143229] border border-white/[0.14] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.7)] relative z-10 overflow-hidden flex flex-col md:flex-row min-h-[auto] md:min-h-[560px] lg:min-h-[600px]">
        
        {/* =========================================================
            ORGANIC WHITE CURVED S-WAVE BACKGROUND (TABLET & DESKTOP md:+)
            ========================================================= */}
        <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
          <svg
            viewBox="0 0 1040 600"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M 0,0 L 330,0 C 350,85 450,165 450,300 C 450,435 340,515 360,600 L 0,600 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {/* =========================================================
            LEFT SECTION: CONTENT (BRANDING, ILLUSTRATION, COPYRIGHT)
            ========================================================= */}
        <div className="relative w-full md:w-[44%] lg:w-[42%] bg-white md:bg-transparent text-[#102B24] p-5 sm:p-6 md:p-7 lg:pl-9 lg:pr-4 lg:py-9 flex flex-col justify-between z-10">
          
          {/* Top-Left Branding / Logo */}
          <div className="z-10 text-left flex items-center justify-between md:flex md:items-center md:gap-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group transition-transform active:scale-95">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-xs border border-[#16382E]/10 shrink-0">
                <Image
                  src="/logoweb.png"
                  alt="Waskita Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>
              <span className="font-display font-black text-xl sm:text-2xl md:text-3xl tracking-tight text-[#0F2D25] leading-none">
                Waskita
              </span>
            </Link>
            <span className="md:hidden text-[10px] font-mono text-[#2F6F62] bg-[#E8F4EE] px-2.5 py-1 rounded-full font-bold">
              AI FORENSIK
            </span>
          </div>

          {/* Center Thematic AI Forensics Illustration */}
          <div className="my-auto py-3 sm:py-4 md:py-5 flex items-center justify-center z-10">
            <AuthIllustration />
          </div>

          {/* Bottom-Left Copyright */}
          <div className="text-left z-10 text-[#6B857D] text-[10px] sm:text-[11px] md:text-xs">
            <p className="font-medium text-[#46685F]">
              &copy; {new Date().getFullYear()} Waskita • Platform Verifikasi AI
            </p>
          </div>

          {/* Mobile Bottom Wave Divider (Phones only < md) */}
          <div className="md:hidden absolute -bottom-[1px] left-0 w-full h-6 sm:h-8 pointer-events-none z-10">
            <svg
              viewBox="0 0 400 32"
              preserveAspectRatio="none"
              className="w-full h-full fill-[#143229]"
            >
              <path d="M 0,32 C 120,32 180,0 400,24 L 400,32 L 0,32 Z" />
            </svg>
          </div>
        </div>

        {/* =========================================================
            RIGHT SECTION: DARK GREEN FORM AREA
            ========================================================= */}
        <div className="w-full md:w-[56%] lg:w-[58%] bg-[#143229] md:bg-transparent text-white p-5 sm:p-7 md:p-8 lg:pl-14 lg:pr-12 lg:py-10 flex flex-col justify-center z-10 md:ml-auto">
          
          <div className="w-full max-w-sm sm:max-w-md mx-auto md:max-w-none space-y-4 sm:space-y-5">
            {/* Form Title */}
            <div className="text-left">
              <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-[#9DC4B9] font-normal mt-1">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form Input Elements & Actions (Children) */}
            {children}
          </div>

        </div>

      </div>

    </div>
  );
}
