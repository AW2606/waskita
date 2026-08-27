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

  // Warna status
  const getActiveZone = () => {
    if (clampedValue < 35) {
      return {
        title: "Tenang",
        color: "text-[#2D6A4F]",
        bgColor: "bg-[#2D6A4F]/10",
        borderColor: "border-[#2D6A4F]/30",
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
        color: "text-[#DC2626]",
        bgColor: "bg-[#DC2626]/10",
        borderColor: "border-[#DC2626]/30",
        desc: "Indikasi manipulasi sintesis AI terdeteksi sangat kuat.",
      };
    }
  };

  const currentZone = getActiveZone();

  return (
    <div
      className={`flex flex-col items-center select-none ${className}`}
    >
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
            {/* =====================================
                WARNA ZONA
            ====================================== */}

            {/* Tenang */}
            <linearGradient
              id="tenangGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#2D6A4F" />
              <stop offset="100%" stopColor="#2D6A4F" />
            </linearGradient>

            {/* Perlu Diperiksa */}
            <linearGradient
              id="periksaGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Sangat Waspada */}
            <linearGradient
              id="waspadaGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>

            {/* Shadow Jarum */}
            <filter
              id="needleShadow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="2"
                floodOpacity="0.2"
              />
            </filter>
          </defs>

          {/* =====================================
              RADAR
          ====================================== */}

          {/* Zona Hijau */}
          <path
            d="M 45 145 A 105 105 0 0 1 95.8 54.9"
            fill="none"
            stroke="url(#tenangGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Zona Orange */}
          <path
            d="M 102.7 49.3 A 105 105 0 0 1 197.3 49.3"
            fill="none"
            stroke="url(#periksaGrad)"
            strokeWidth="24"
            strokeLinecap="butt"
            className="transition-all duration-300"
          />

          {/* Zona Merah */}
          <path
            d="M 204.2 54.9 A 105 105 0 0 1 255 145"
            fill="none"
            stroke="url(#waspadaGrad)"
            strokeWidth="24"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* =====================================
              PEMBATAS LINGKARAN
          ====================================== */}

          {/* Pembatas Hijau → Orange */}
 <line
  x1="100    "
  y1="55"
  x2="109"
  y2="77"
  stroke="#FFFFFF"
  strokeWidth="5"
  strokeLinecap="butt"
/>

<line
  x1="204"
  y1="55"
  x2="191"
  y2="77"
  stroke="#FFFFFF"
  strokeWidth="5"
  strokeLinecap="butt"
/>

          {/* =====================================
              JARUM
          ====================================== */}

          <g
            transform={`rotate(${needleRotation}, 150, 145)`}
            className="transition-transform duration-700 ease-out"
            filter="url(#needleShadow)"
          >
            {/* Jarum */}
            <path
              d="M 147 145 L 149 38 L 151 38 L 153 145 Z"
              fill="#10322C"
            />

            {/* Ujung Jarum */}
            <polygon
              points="146,45 150,30 154,45"
              fill="#10322C"
            />

            {/* Titik Tengah */}
            <circle
              cx="150"
              cy="145"
              r="14"
              fill="#10322C"
            />

            <circle
              cx="150"
              cy="145"
              r="7"
              fill="#F3F6F4"
            />
          </g>
        </svg>
      </div>

      {/* =====================================
          3 ZONE LABELS
      ====================================== */}

      {showLabels && (
        <div className="w-full max-w-sm grid grid-cols-3 gap-2 mt-3 text-center">

          {/* Tenang */}
          <div
            className={`p-2 rounded-xl border transition-all ${
              clampedValue < 35
                ? "bg-[#2D6A4F]/10 border-[#2D6A4F]/40 font-semibold"
                : "bg-white/60 border-muted/20 text-muted opacity-80"
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full mx-auto mb-1"
              style={{ backgroundColor: "#2D6A4F" }}
            />

            <span className="font-body text-xs sm:text-sm font-medium block text-[#2D6A4F]">
              Tenang
            </span>
          </div>

          {/* Perlu Diperiksa */}
          <div
            className={`p-2 rounded-xl border transition-all ${
              clampedValue >= 35 && clampedValue <= 70
                ? "bg-[#D97706]/10 border-[#D97706]/40 font-semibold shadow-2xs"
                : "bg-white/60 border-muted/20 text-muted opacity-80"
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full mx-auto mb-1"
              style={{ backgroundColor: "#D97706" }}
            />

            <span className="font-body text-xs sm:text-sm font-medium block text-[#D97706]">
              Perlu Diperiksa
            </span>
          </div>

          {/* Sangat Waspada */}
          <div
            className={`p-2 rounded-xl border transition-all ${
              clampedValue > 70
                ? "bg-[#DC2626]/10 border-[#DC2626]/40 font-semibold"
                : "bg-white/60 border-muted/20 text-muted opacity-80"
            }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full mx-auto mb-1"
              style={{ backgroundColor: "#DC2626" }}
            />

            <span className="font-body text-xs sm:text-sm font-medium block text-[#DC2626]">
              Sangat Waspada
            </span>
          </div>
        </div>
      )}

      {/* =====================================
          ACTIVE STATUS
      ====================================== */}

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