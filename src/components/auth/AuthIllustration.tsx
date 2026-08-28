"use client";

import React from "react";

export function AuthIllustration() {
  return (
    <div className="relative w-full max-w-[160px] sm:max-w-[200px] md:max-w-[230px] lg:max-w-[280px] aspect-square flex items-center justify-center select-none pointer-events-none mx-auto">
      <svg
        viewBox="0 0 360 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Ambient Background Glow */}
          <radialGradient
            id="wskBlobGrad"
            cx="48%"
            cy="48%"
            r="52%"
            fx="42%"
            fy="42%"
          >
            <stop offset="0%" stopColor="#EEF7F3" />
            <stop offset="60%" stopColor="#DBEFE6" />
            <stop offset="100%" stopColor="#C6E3D7" />
          </radialGradient>

          {/* Primary Shield Gradient */}
          <linearGradient id="shieldGrad" x1="130" y1="80" x2="230" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#256B5C" />
            <stop offset="50%" stopColor="#184D42" />
            <stop offset="100%" stopColor="#0E3029" />
          </linearGradient>

          {/* Inner Hologram Glass Gradient */}
          <linearGradient id="innerGlass" x1="140" y1="100" x2="220" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#45A997" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1B5549" stopOpacity="0.85" />
          </linearGradient>

          {/* Cyber Pulse Wave Gradient */}
          <linearGradient id="pulseWave" x1="0" y1="0" x2="360" y2="360" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5AE2CF" />
            <stop offset="100%" stopColor="#287B6C" />
          </linearGradient>

          {/* Amber Gold Core */}
          <linearGradient id="goldCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFDE6A" />
            <stop offset="100%" stopColor="#E5B224" />
          </linearGradient>
        </defs>

        {/* Ambient Pastel Background Blob (Centered within 360x360) */}
        <path
          d="M110 65 C170 40, 260 55, 290 120 C320 180, 315 250, 270 295 C215 340, 120 330, 75 285 C30 240, 45 155, 70 105 C85 70, 95 75, 110 65 Z"
          fill="url(#wskBlobGrad)"
          opacity="0.9"
        />

        {/* Floating Soft Ambient Bokeh Circles */}
        <circle cx="85" cy="80" r="16" fill="#FFFFFF" opacity="0.65" />
        <circle cx="140" cy="55" r="12" fill="#FFFFFF" opacity="0.5" />
        <circle cx="270" cy="80" r="18" fill="#FFFFFF" opacity="0.55" />
        <circle cx="305" cy="180" r="12" fill="#FFFFFF" opacity="0.45" />
        <circle cx="65" cy="210" r="14" fill="#FFFFFF" opacity="0.4" />
        <circle cx="275" cy="275" r="11" fill="#FFFFFF" opacity="0.5" />

        {/* Outer Audio Waveform & Biometric Radar Concentric Arcs */}
        <g opacity="0.45" stroke="#256B5C" strokeWidth="1.2" strokeDasharray="3 3">
          <circle cx="180" cy="180" r="105" />
          <circle cx="180" cy="180" r="125" strokeDasharray="5 5" />
        </g>

        {/* Left Audio Spectrogram Waveform Bars */}
        <g transform="translate(68, 158)" opacity="0.85">
          <rect x="0" y="12" width="3" height="20" rx="1.5" fill="#388D7E" />
          <rect x="6" y="5" width="3" height="34" rx="1.5" fill="#4EA699" />
          <rect x="12" y="0" width="3" height="44" rx="1.5" fill="#256B5C" />
          <rect x="18" y="8" width="3" height="28" rx="1.5" fill="#4EA699" />
          <rect x="24" y="15" width="3" height="14" rx="1.5" fill="#388D7E" />
        </g>

        {/* Right Audio Spectrogram Waveform Bars */}
        <g transform="translate(268, 158)" opacity="0.85">
          <rect x="0" y="15" width="3" height="14" rx="1.5" fill="#388D7E" />
          <rect x="6" y="8" width="3" height="28" rx="1.5" fill="#4EA699" />
          <rect x="12" y="0" width="3" height="44" rx="1.5" fill="#256B5C" />
          <rect x="18" y="5" width="3" height="34" rx="1.5" fill="#4EA699" />
          <rect x="24" y="12" width="3" height="20" rx="1.5" fill="#388D7E" />
        </g>

        {/* Scanning Radar Laser Line Sweep */}
        <path
          d="M180 180 L275 145"
          stroke="url(#pulseWave)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="275" cy="145" r="3.5" fill="#5AE2CF" />
        <circle cx="275" cy="145" r="7" fill="#5AE2CF" opacity="0.25" />

        {/* Main Central Forensic Cyber Shield */}
        <g transform="translate(0, 0)">
          {/* Shield Outer Shadow & Border */}
          <path
            d="M180 80 L242 110 C242 185, 212 242, 180 270 C148 242, 118 185, 118 110 Z"
            fill="url(#shieldGrad)"
            stroke="#50B6A6"
            strokeWidth="2.5"
          />

          {/* Inner Shield Glass Facet */}
          <path
            d="M180 94 L230 118 C230 178, 206 226, 180 250 C154 226, 130 178, 130 118 Z"
            fill="url(#innerGlass)"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.2"
          />

          {/* Biometric Facial & Neural Scanning Matrix */}
          <circle cx="180" cy="138" r="3.5" fill="#FFDE6A" />
          <circle cx="160" cy="158" r="3" fill="#60DFC9" />
          <circle cx="200" cy="158" r="3" fill="#60DFC9" />
          <circle cx="180" cy="176" r="3" fill="#60DFC9" />
          <circle cx="166" cy="202" r="3" fill="#60DFC9" />
          <circle cx="194" cy="202" r="3" fill="#60DFC9" />
          <circle cx="180" cy="220" r="3.5" fill="#FFDE6A" />

          {/* Neural Connection Lines */}
          <g stroke="#60DFC9" strokeWidth="1" opacity="0.65">
            <line x1="180" y1="138" x2="160" y2="158" />
            <line x1="180" y1="138" x2="200" y2="158" />
            <line x1="160" y1="158" x2="180" y2="176" />
            <line x1="200" y1="158" x2="180" y2="176" />
            <line x1="160" y1="158" x2="166" y2="202" />
            <line x1="200" y1="158" x2="194" y2="202" />
            <line x1="180" y1="176" x2="166" y2="202" />
            <line x1="180" y1="176" x2="194" y2="202" />
            <line x1="166" y1="202" x2="180" y2="220" />
            <line x1="194" y1="202" x2="180" y2="220" />
          </g>

          {/* Central AI Verification Core Emblem */}
          <circle cx="180" cy="176" r="11" fill="#207464" opacity="0.8" />
          <circle cx="180" cy="176" r="6" fill="url(#goldCore)" />
          <circle cx="180" cy="176" r="2" fill="#FFFFFF" />
        </g>

        {/* Top-Right VERIFIED Badge */}
        <g transform="translate(225, 68)">
          <rect x="0" y="0" width="68" height="23" rx="11.5" fill="#13382F" stroke="#4EBDA9" strokeWidth="1.2" />
          <circle cx="12" cy="11.5" r="5" fill="#38A189" />
          <path d="M9.5 11.5 L11.5 13.5 L14.5 9" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="21" y="15" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.4">
            VERIFIED
          </text>
        </g>

        {/* Bottom-Left AI SHIELD Badge */}
        <g transform="translate(68, 250)">
          <rect x="0" y="0" width="70" height="23" rx="11.5" fill="#13382F" stroke="#F6C85F" strokeWidth="1.2" />
          <circle cx="12" cy="11.5" r="5" fill="#D9A441" />
          <path d="M10 11.5 L14 11.5 L14 14.5 L10 14.5 Z" fill="#FFFFFF" />
          <path d="M10.5 11.5 L10.5 10 C10.5 9 13.5 9 13.5 10 L13.5 11.5" stroke="#FFFFFF" strokeWidth="0.8" fill="none" />
          <text x="21" y="15" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.4">
            AI SHIELD
          </text>
        </g>
      </svg>
    </div>
  );
}
