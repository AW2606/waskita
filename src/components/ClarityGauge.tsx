"use client";

import React from "react";

interface ClarityGaugeProps {
  value?: number; // 0 to 100 (0 = Tenang, 50 = Perlu Diperiksa, 100 = Sangat Perlu Waspada)
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
  
  // Calculate rotation angle in degrees:
  // 0 -> -90 deg (left / Tenang)
  // 50 -> 0 deg (top / Perlu Diperiksa)
  // 100 -> +90 deg (right / Sangat Perlu Waspada)
  const needleRotation = (clampedValue - 50) * 1.8;

  // Determine current active zone
  const getActiveZone = () => {
    if (clampedValue < 35) {
      return {
        title: "Tenang",
        color: "text-primary",
        bgColor: "bg-primary/10",
        borderColor: "border-primary/30",
        desc: "Tidak ditemukan anomali atau tanda manipulasi signifikan.",
      };
    } else if (clampedValue <= 70) {
      return {
        title: "Perlu Diperiksa",
        color: "text-caution",
        bgColor: "bg-caution/15",
        borderColor: "border-caution/40",
        desc: "Ditemukan pola yang tidak biasa. Sebaiknya periksa lebih lanjut.",
      };
    } else {
      return {
        title: "Sangat Perlu Waspada",
        color: "text-ink",
        bgColor: "bg-ink/10",
        borderColor: "border-ink/40",
        desc: "Indikasi manipulasi sintesis AI terdeteksi sangat kuat.",
      };
    }
  };

  const currentZone = getActiveZone();

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Gauge Title */}
      <div className="text-center space-y-1 mb-2">
        <span className="font-mono text-xs text-muted tracking-wider uppercase">
          [ RADAR KEJERNIHAN WASKITA ]
        </span>
      </div>

      {/* SVG Arc & Needle */}
      <div className="relative w-[300px] sm:w-[340px] h-[175px] sm:h-[195px] flex items-center justify-center">
        <svg
          viewBox="0 0 300 170"
          className="w-full h-full overflow-visible drop-shadow-xs"
        >
          <defs>
            {/* Zone 1 Gradient (Tenang) */}
            <linearGradient id="tenangGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2F6F62" />
              <stop offset="100%" stopColor="#3d8f7e" />
            </linearGradient>
            {/* Zone 2 Gradient (Perlu Diperiksa) */}
            <linearGradient id="periksaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D9A441" />
              <stop offset="100%" stopColor="#C98A3B" />
            </linearGradient>
            {/* Zone 3 Gradient (Sangat Perlu Waspada) */}
            <linearGradient id="waspadaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2b4c44" />
              <stop offset="100%" stopColor="#10322C" />
            </linearGradient>

            {/* Needle Drop Shadow */}
            <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Semicircle Arc Track Segments (Radius 105, center 150, 145) */}
          {/* Segment 1: Tenang (180 deg to 122 deg) */}
          <path
            d="M 45 145 A 105 105 0 0 1 95.8 54.9"
            fill="none"
            stroke="url(#tenangGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Segment 2: Perlu Diperiksa (118 deg to 62 deg) */}
          <path
            d="M 102.7 49.3 A 105 105 0 0 1 197.3 49.3"
            fill="none"
            stroke="url(#periksaGrad)"
            strokeWidth="24"
            className="transition-all duration-300"
          />

          {/* Segment 3: Sangat Perlu Waspada (58 deg to 0 deg) */}
          <path
            d="M 204.2 54.9 A 105 105 0 0 1 255 145"
            fill="none"
            stroke="url(#waspadaGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Tick dividers */}
          <line
            x1="99"
            y1="40"
            x2="99"
            y2="64"
            stroke="#F3F6F4"
            strokeWidth="3"
          />
          <line
            x1="201"
            y1="40"
            x2="201"
            y2="64"
            stroke="#F3F6F4"
            strokeWidth="3"
          />

          {/* Needle Group */}
          <g
            transform={`rotate(${needleRotation}, 150, 145)`}
            className="transition-transform duration-700 ease-out"
            filter="url(#needleShadow)"
          >
            {/* Needle pointer */}
            <path
              d="M 147 145 L 149 38 L 151 38 L 153 145 Z"
              fill="#10322C"
            />
            <polygon
              points="146,45 150,30 154,45"
              fill="#10322C"
            />
            {/* Center Pivot Circle */}
            <circle cx="150" cy="145" r="14" fill="#10322C" />
            <circle cx="150" cy="145" r="7" fill="#F3F6F4" />
          </g>
        </svg>
      </div>

      {/* 3 Zone Labels */}
      {showLabels && (
        <div className="w-full max-w-sm grid grid-cols-3 gap-2 mt-3 text-center">
          {/* Zone 1 */}
          <div
            className={`p-2 rounded-xl border transition-all ${
              clampedValue < 35
                ? "bg-primary/10 border-primary/40 font-semibold"
                : "bg-white/60 border-muted/20 text-muted opacity-80"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-primary mx-auto mb-1" />
            <span className="font-body text-xs sm:text-sm text-primary font-medium block">
              Tenang
            </span>
          </div>

          {/* Zone 2 */}
          <div
            className={`p-2 rounded-xl border transition-all ${
              clampedValue >= 35 && clampedValue <= 70
                ? "bg-caution/15 border-caution/50 font-semibold shadow-2xs"
                : "bg-white/60 border-muted/20 text-muted opacity-80"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-caution mx-auto mb-1" />
            <span className="font-body text-xs sm:text-sm text-caution font-medium block">
              Perlu Diperiksa
            </span>
          </div>

          {/* Zone 3 */}
          <div
            className={`p-2 rounded-xl border transition-all ${
              clampedValue > 70
                ? "bg-ink/10 border-ink/40 font-semibold"
                : "bg-white/60 border-muted/20 text-muted opacity-80"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-ink mx-auto mb-1" />
            <span className="font-body text-xs sm:text-sm text-ink font-medium block">
              Sangat Waspada
            </span>
          </div>
        </div>
      )}

      {/* Active Status Badge */}
      <div className="mt-4">
        <span
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${currentZone.bgColor} ${currentZone.color} ${currentZone.borderColor}`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          Status: {currentZone.title}
        </span>
      </div>
    </div>
  );
}
