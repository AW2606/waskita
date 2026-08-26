"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";

function ProsesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationId = searchParams.get("id");

  useEffect(() => {
    // 2.5 second delay to simulate deepfake analysis and show arc animation
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
    <div className="min-h-screen bg-mist text-ink flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 sm:p-12 rounded-3xl shadow-sm border border-muted/20 animate-in fade-in zoom-in-95 duration-500">
        {/* Pulsing Arc / Gauge Animation */}
        <div className="relative w-48 h-28 mx-auto flex items-center justify-center">
          <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
            {/* Background Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#F3F6F4"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Animated Glowing Pulsing Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#2F6F62"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray="250"
              strokeDashoffset="120"
              className="animate-pulse"
            />
            {/* Scanning radar indicator orb */}
            <circle cx="100" cy="100" r="10" fill="#2F6F62" className="animate-ping opacity-60" />
            <circle cx="100" cy="100" r="8" fill="#10322C" />
          </svg>
        </div>

        {/* Status Text */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Analisis Model & Pola Frekuensi
          </div>
          
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink tracking-tight">
            Sedang memeriksa dengan hati-hati...
          </h1>
          
          <p className="font-body text-muted text-base">
            Ini biasanya hanya memerlukan waktu singkat.
          </p>
        </div>

        {/* Gentle scanning bars */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-mist h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full animate-pulse"
              style={{ width: "75%" }}
            />
          </div>
          <span className="font-mono text-xs text-muted block">
            ID Verifikasi: {verificationId || "Memproses..."}
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
