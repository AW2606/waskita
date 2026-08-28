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

  // 0% = kiri (-90°), 50% = atas (0°), 100% = kanan (+90°)
  const needleRotation = (clampedValue - 50) * 1.8;

  // Zona Status
  const getActiveZone = () => {
    if (clampedValue < 35) {
      return {
        title: "Tenang",
        fullTitle: "Tenang (Risiko Rendah)",
        color: "text-emerald-700 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15",
        borderColor: "border-emerald-500/30 dark:border-emerald-500/40",
        dotBg: "bg-emerald-500",
        accentHex: "#10B981",
        desc: "Tidak ditemukan anomali atau tanda manipulasi signifikan.",
      };
    } else if (clampedValue <= 70) {
      return {
        title: "Periksa",
        fullTitle: "Perlu Diperiksa (Sedang)",
        color: "text-amber-700 dark:text-amber-400",
        bgColor: "bg-amber-500/10 dark:bg-amber-500/15",
        borderColor: "border-amber-500/30 dark:border-amber-500/40",
        dotBg: "bg-amber-500",
        accentHex: "#F59E0B",
        desc: "Ditemukan pola yang tidak biasa. Sebaiknya periksa lebih lanjut.",
      };
    } else {
      return {
        title: "Waspada",
        fullTitle: "Sangat Waspada (Tinggi)",
        color: "text-rose-700 dark:text-rose-400",
        bgColor: "bg-rose-500/10 dark:bg-rose-500/15",
        borderColor: "border-rose-500/30 dark:border-rose-500/40",
        dotBg: "bg-rose-500",
        accentHex: "#F43F5E",
        desc: "Indikasi manipulasi sintesis AI terdeteksi sangat kuat.",
      };
    }
  };

  const currentZone = getActiveZone();

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Gauge Header / Telemetry Tag */}
      <div className="text-center space-y-1 mb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/10 dark:bg-white/[0.04] border border-muted/20 dark:border-white/10 text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-widest font-bold">
            RADAR KEJERNIHAN WASKITA
          </span>
        </div>
      </div>

      {/* Speedometer SVG Canvas */}
      <div className="relative w-[300px] sm:w-[340px] h-[175px] sm:h-[195px] flex items-center justify-center">
        <svg
          viewBox="0 0 300 170"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Gradient Zona Tenang: Vibrant Emerald to Teal */}
            <linearGradient id="gaugeTenangGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Gradient Zona Periksa: Golden Amber to Warm Honey */}
            <linearGradient id="gaugePeriksaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Gradient Zona Waspada: Coral Amber to Vibrant Rose Red */}
            <linearGradient id="gaugeWaspadaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>

            {/* Gradient Jarum */}
            <linearGradient id="gaugeNeedleGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0D2823" />
              <stop offset="100%" stopColor="#1F4E43" />
            </linearGradient>

            {/* Filter Glow / Shadow */}
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.25" />
            </filter>

            <filter id="needleGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* 1. Subtle Outer Telemetry Dash Ring */}
          <path
            d="M 28 145 A 122 122 0 0 1 272 145"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2 6"
            className="text-muted/25 dark:text-white/15"
          />

          {/* 2. Precision Scale Radial Ticks */}
          {/* 0% (Left) */}
          <line x1="20" y1="145" x2="28" y2="145" stroke="currentColor" strokeWidth="2" className="text-muted/40 dark:text-white/30" />
          {/* 25% */}
          <line x1="58.07" y1="53.07" x2="63.73" y2="58.73" stroke="currentColor" strokeWidth="1.5" className="text-muted/30 dark:text-white/20" />
          {/* 50% (Top Center) */}
          <line x1="150" y1="15" x2="150" y2="23" stroke="currentColor" strokeWidth="2" className="text-muted/40 dark:text-white/30" />
          {/* 75% */}
          <line x1="241.93" y1="53.07" x2="236.27" y2="58.73" stroke="currentColor" strokeWidth="1.5" className="text-muted/30 dark:text-white/20" />
          {/* 100% (Right) */}
          <line x1="280" y1="145" x2="272" y2="145" stroke="currentColor" strokeWidth="2" className="text-muted/40 dark:text-white/30" />

          {/* 3. Base Background Continuous Track */}
          <path
            d="M 45.4 135.85 A 105 105 0 0 1 254.6 135.85"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            strokeLinecap="round"
            className="text-muted/15 dark:text-white/[0.06]"
          />

          {/* 4. Three Precise Mathematically Aligned Segments (Radius R=105, Center 150,145) */}
          {/* Zona 1: Tenang (0% - 34%) */}
          <path
            d="M 45.4 135.85 A 105 105 0 0 1 89.77 58.99"
            fill="none"
            stroke="url(#gaugeTenangGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            className={`transition-opacity duration-300 ${clampedValue < 35 ? "opacity-100 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "opacity-45"}`}
          />

          {/* Zona 2: Periksa (35% - 70%) */}
          <path
            d="M 105.63 51.44 A 105 105 0 0 1 194.37 51.44"
            fill="none"
            stroke="url(#gaugePeriksaGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            className={`transition-opacity duration-300 ${clampedValue >= 35 && clampedValue <= 70 ? "opacity-100 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "opacity-45"}`}
          />

          {/* Zona 3: Waspada (71% - 100%) */}
          <path
            d="M 210.23 58.99 A 105 105 0 0 1 254.60 135.85"
            fill="none"
            stroke="url(#gaugeWaspadaGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            className={`transition-opacity duration-300 ${clampedValue > 70 ? "opacity-100 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "opacity-45"}`}
          />

          {/* 5. Center Digital Readout */}
          <g className="select-none">
            <text
              x="150"
              y="114"
              textAnchor="middle"
              className="font-display font-extrabold text-2xl sm:text-3xl fill-ink dark:fill-white tracking-tight"
            >
              {clampedValue}%
            </text>
            <text
              x="150"
              y="128"
              textAnchor="middle"
              className="font-mono text-[9px] fill-muted uppercase tracking-widest font-bold"
            >
              SKOR RISIKO
            </text>
          </g>

          {/* 6. High-Tech Aerodynamic Needle */}
          <g
            transform={`rotate(${needleRotation}, 150, 145)`}
            className="transition-transform duration-700 ease-out"
            filter="url(#needleGlow)"
          >
            {/* Shadow & Needle Blade */}
            <path
              d="M 147.5 145 L 149.2 42 L 150 33 L 150.8 42 L 152.5 145 Z"
              className="fill-ink dark:fill-white"
            />
            {/* Glowing Active Tip */}
            <circle cx="150" cy="33" r="3.5" fill={currentZone.accentHex} />
            <circle cx="150" cy="33" r="1.5" fill="#FFFFFF" />

            {/* Metallic Dual-Layer Hub Pivot */}
            <circle
              cx="150"
              cy="145"
              r="13"
              className="fill-white dark:fill-[#0A1613] stroke-muted/30 dark:stroke-white/20"
              strokeWidth="2.5"
            />
            <circle
              cx="150"
              cy="145"
              r="6.5"
              fill={currentZone.accentHex}
            />
            <circle
              cx="150"
              cy="145"
              r="2.5"
              fill="#FFFFFF"
            />
          </g>
        </svg>
      </div>

      {/* 3 Zone Cards */}
      {showLabels && (
        <div className="w-full max-w-sm grid grid-cols-3 gap-2 sm:gap-2.5 mt-3 text-center">
          {/* Tenang */}
          <div
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 ${
              clampedValue < 35
                ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/30 scale-[1.02]"
                : "bg-white/50 dark:bg-white/[0.03] border-muted/20 text-muted opacity-70 hover:opacity-90"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${clampedValue < 35 ? "bg-emerald-500 animate-pulse" : "bg-emerald-500/50"}`} />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">0-34%</span>
            </div>
            <span className={`font-display font-bold text-xs sm:text-sm block ${clampedValue < 35 ? "text-emerald-700 dark:text-emerald-400" : "text-ink/80 dark:text-muted"}`}>
              Tenang
            </span>
          </div>

          {/* Periksa */}
          <div
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 ${
              clampedValue >= 35 && clampedValue <= 70
                ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/50 shadow-sm ring-1 ring-amber-500/30 scale-[1.02]"
                : "bg-white/50 dark:bg-white/[0.03] border-muted/20 text-muted opacity-70 hover:opacity-90"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${clampedValue >= 35 && clampedValue <= 70 ? "bg-amber-500 animate-pulse" : "bg-amber-500/50"}`} />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">35-70%</span>
            </div>
            <span className={`font-display font-bold text-xs sm:text-sm block ${clampedValue >= 35 && clampedValue <= 70 ? "text-amber-700 dark:text-amber-400" : "text-ink/80 dark:text-muted"}`}>
              Periksa
            </span>
          </div>

          {/* Waspada */}
          <div
            className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 ${
              clampedValue > 70
                ? "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/50 shadow-sm ring-1 ring-rose-500/30 scale-[1.02]"
                : "bg-white/50 dark:bg-white/[0.03] border-muted/20 text-muted opacity-70 hover:opacity-90"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${clampedValue > 70 ? "bg-rose-500 animate-pulse" : "bg-rose-500/50"}`} />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">71-100%</span>
            </div>
            <span className={`font-display font-bold text-xs sm:text-sm block ${clampedValue > 70 ? "text-rose-700 dark:text-rose-400" : "text-ink/80 dark:text-muted"}`}>
              Waspada
            </span>
          </div>
        </div>
      )}

      {/* Active Status Badge */}
      <div className="mt-3.5">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-body font-bold border backdrop-blur-md shadow-2xs transition-all duration-300 ${currentZone.bgColor} ${currentZone.color} ${currentZone.borderColor}`}
        >
          <span className={`w-2 h-2 rounded-full ${currentZone.dotBg} animate-pulse shrink-0`} />
          <span>Status: {currentZone.fullTitle}</span>
        </div>
      </div>
    </div>
  );
}