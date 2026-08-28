"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";

function ProsesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationId = searchParams.get("id");

  useEffect(() => {
    // 2.5 second delay to simulate deepfake analysis and show radar sweep
    const timer = setTimeout(() => {
      if (verificationId) {
        router.push(`/verifikasi/hasil?id=${verificationId}`);
      } else {
        router.push("/verifikasi/hasil");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [router, verificationId]);

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col items-center justify-center p-6 select-none relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 p-9 sm:p-11 rounded-3xl bg-white/80 dark:bg-[#101D19]/80 backdrop-blur-xl border border-muted/20 shadow-sm relative z-10">
        
        {/* Calibrated Radar Arc Scanner */}
        <div className="relative w-48 h-28 mx-auto flex items-center justify-center">
          <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1F6B5C" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#0D2823" />
              </linearGradient>
            </defs>

            {/* Background Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#E2E8E4"
              className="dark:stroke-[#20322D]"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Animated Pulsing Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#scanGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="250"
              strokeDashoffset="110"
              className="animate-pulse"
            />
            {/* Radar scanner orb */}
            <circle cx="100" cy="100" r="10" fill="#1F6B5C" className="animate-ping opacity-60" />
            <circle cx="100" cy="100" r="7" fill="#0D2823" className="dark:fill-white" />
          </svg>
        </div>

        {/* Status Copy */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs uppercase tracking-wider font-bold">
            <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" />
            <span>ANALISIS SPEKTROGRAM & POLA AI</span>
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
            Memeriksa keaslian media...
          </h1>

          <p className="font-body text-muted text-sm sm:text-base leading-relaxed">
            Menganalisis 60 parameter akustik dan sinkronisasi neural secara objektif.
          </p>
        </div>

        {/* Telemetry progress line */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-mist dark:bg-white/5 h-2 rounded-full overflow-hidden border border-muted/15">
            <div
              className="bg-primary h-full rounded-full animate-pulse transition-all duration-1000"
              style={{ width: "75%" }}
            />
          </div>
          <span className="font-mono text-xs text-muted block">
            ID Verifikasi: {verificationId || "WSK-AUTO-RUN"}
          </span>
        </div>

      </div>
    </div>
  );
}

export default function VerifikasiProsesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-mist flex items-center justify-center">
          <span className="font-mono text-xs text-muted">Memuat proses verifikasi...</span>
        </div>
      }
    >
      <ProsesContent />
    </Suspense>
  );
}
