"use client";

import React from "react";

interface ClarityGaugeProps {
  value?: number;
  className?: string;
  showLabels?: boolean;
}

export function ClarityGauge({
  value = 50,
  className = "",
  showLabels = true,
}: ClarityGaugeProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // 0 = kiri, 50 = tengah, 100 = kanan
  const needleRotation = (clampedValue - 50) * 1.8;

  // Warna status sesuai sistem desain: Teal (Tenang) -> Amber (Perlu Diperiksa) -> Tinta Gelap / Ink (Sangat Waspada)
  const getActiveZone = () => {
    if (clampedValue < 35) {
      return {
        title: "Tenang",
        color: "text-[#1F6B5C]",
        bgColor: "bg-[#1F6B5C]/10",
        borderColor: "border-[#1F6B5C]/30",
        desc: "Tidak ditemukan anomali atau tanda manipulasi signifikan.",
      };
    } else if (clampedValue <= 70) {
      return {
        title: "Perlu Diperiksa",
        color: "text-[#D97706]",
        bgColor: "bg-[#D97706]/10",
        borderColor: "border-[#D97706]/30",
        desc: "Ditemukan pola yang tidak biasa. Sebaiknya periksa lebih lanjut.",
      };
    } else {
      return {
        title: "Sangat Perlu Waspada",
        color: "text-[#0D2823] dark:text-[#E2EAE6]",
        bgColor: "bg-[#0D2823]/10 dark:bg-white/10",
        borderColor: "border-[#0D2823]/30 dark:border-white/20",
        desc: "Indikasi manipulasi sintesis AI terdeteksi sangat kuat.",
      };
    }
  };

  const currentZone = getActiveZone();

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Gauge Title */}
      <div className="text-center space-y-1 mb-2">
        <span className="font-mono text-xs text-muted tracking-wider uppercase font-semibold">
          RADAR KEJERNIHAN WASKITA
        </span>
      </div>

      {/* SVG Arc & Needle */}
      <div className="relative w-[300px] sm:w-[340px] h-[175px] sm:h-[195px] flex items-center justify-center">
        <svg
          viewBox="0 0 300 170"
          className="w-full h-full overflow-visible drop-shadow-xs"
        >
          <defs>
            {/* Zona Tenang: Teal */}
            <linearGradient id="tenangGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1F6B5C" />
              <stop offset="100%" stopColor="#2D6A4F" />
            </linearGradient>

            {/* Zona Perlu Diperiksa: Amber */}
            <linearGradient id="periksaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#C98A3B" />
            </linearGradient>

            {/* Zona Sangat Waspada: Dark Ink (No Red) */}
            <linearGradient id="waspadaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1C352F" />
              <stop offset="100%" stopColor="#0D2823" />
            </linearGradient>

            {/* Shadow Jarum */}
            <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Zona Hijau Teal */}
          <path
            d="M 45 145 A 105 105 0 0 1 95.8 54.9"
            fill="none"
            stroke="url(#tenangGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Zona Amber Caution */}
          <path
            d="M 102.7 49.3 A 105 105 0 0 1 197.3 49.3"
            fill="none"
            stroke="url(#periksaGrad)"
            strokeWidth="24"
            strokeLinecap="butt"
            className="transition-all duration-300"
          />

          {/* Zona Dark Ink Waspada */}
          <path
            d="M 204.2 54.9 A 105 105 0 0 1 255 145"
            fill="none"
            stroke="url(#waspadaGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Pembatas Hijau → Amber */}
          <line
            x1="100"
            y1="55"
            x2="109"
            y2="77"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="butt"
          />

          {/* Pembatas Amber → Dark Ink */}
          <line
            x1="204"
            y1="55"
            x2="191"
            y2="77"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="butt"
          />

          {/* Jarum Indikator */}
          <g
            transform={`rotate(${needleRotation}, 150, 145)`}
            className="transition-transform duration-700 ease-out"
            filter="url(#needleShadow)"
          >
            <path d="M 147 145 L 149 38 L 151 38 L 153 145 Z" fill="#0D2823" className="dark:fill-white" />
            <polygon points="146,45 150,30 154,45" fill="#0D2823" className="dark:fill-white" />
            <circle cx="150" cy="145" r="14" fill="#0D2823" className="dark:fill-white" />
            <circle cx="150" cy="145" r="7" fill="#F4F7F5" className="dark:fill-[#08100E]" />
          </g>
        </svg>
      </div>

      {/* 3 Zone Labels */}
      {showLabels && (
        <div className="w-full max-w-sm grid grid-cols-3 gap-2 mt-3 text-center">
          {/* Tenang */}
          <div
            className={`p-2.5 rounded-xl border transition-all ${
              clampedValue < 35
                ? "bg-[#1F6B5C]/10 border-[#1F6B5C]/40 font-bold"
                : "bg-white/60 dark:bg-white/5 border-muted/20 text-muted opacity-80"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1 bg-[#1F6B5C]" />
            <span className="font-body text-xs sm:text-sm font-semibold block text-[#1F6B5C]">
              Tenang
            </span>
          </div>

          {/* Perlu Diperiksa */}
          <div
            className={`p-2.5 rounded-xl border transition-all ${
              clampedValue >= 35 && clampedValue <= 70
                ? "bg-[#D97706]/10 border-[#D97706]/40 font-bold"
                : "bg-white/60 dark:bg-white/5 border-muted/20 text-muted opacity-80"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1 bg-[#D97706]" />
            <span className="font-body text-xs sm:text-sm font-semibold block text-[#D97706]">
              Periksa
            </span>
          </div>

          {/* Sangat Waspada (Dark Ink) */}
          <div
            className={`p-2.5 rounded-xl border transition-all ${
              clampedValue > 70
                ? "bg-[#0D2823]/10 dark:bg-white/15 border-[#0D2823]/40 dark:border-white/30 font-bold"
                : "bg-white/60 dark:bg-white/5 border-muted/20 text-muted opacity-80"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1 bg-[#0D2823] dark:bg-white" />
            <span className="font-body text-xs sm:text-sm font-semibold block text-[#0D2823] dark:text-white">
              Waspada
            </span>
          </div>
        </div>
      )}

      {/* Active Status Badge */}
      <div className="mt-4">
        <span
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${currentZone.bgColor} ${currentZone.color} ${currentZone.borderColor}`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          Status: {currentZone.title}
        </span>
      </div>
    </div>
  );
}