"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faCompass,
  faUserShield,
  faGraduationCap,
  faCircleCheck,
  faLock,
  faArrowRight,
  faWaveSquare,
  faFingerprint,
  faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  // State for interactive hero radar demo
  const [demoState, setDemoState] = useState<"real" | "fake">("real");
  const [needleLoaded, setNeedleLoaded] = useState(false);

  // Purposeful Animation 1: Gauge needle sweep on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setNeedleLoaded(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // State for feature showcase tab
  const [activeTab, setActiveTab] = useState<"audio" | "video" | "text" | "phone">("audio");

  const mediaTabs = [
    {
      id: "audio",
      name: "Suara & Audio",
      telemetry: "FORMAT: AAC · MP3 · WAV  |  SAMPLING: 16.0 kHz  |  FORENSIK: SPEKTRAL 60-D",
      headline: "Deteksi Kloning Vokal & Suara AI",
      desc: "Menganalisis 60 parameter biometrik akustik termasuk micro-jitter, variansi shimmer pita suara, dan ketidakteraturan vocoder sintetis.",
      tags: ["Biometrik Vokal", "Zero-Crossing Rate", "Wav2Vec2 Neural"],
    },
    {
      id: "video",
      name: "Video Deepfake",
      telemetry: "CODEC: H.264 / H.265 / VP9  |  ANALISIS: MULTIMODAL  |  FACE ROI: 120 FPS",
      headline: "Analisis Sinkronisasi Artikulasi Wajah",
      desc: "Membedah disparitas ketajaman area mata vs bibir (Wav2Lip / SadTalker), anomali batas kompresi ELA, dan tekstur pori-pori sintetis.",
      tags: ["Rasio Laplacian", "Error Level Analysis", "Vision Transformer"],
    },
    {
      id: "text",
      name: "Pesan & Teks",
      telemetry: "KANAL: WHATSAPP / SMS / TELEGRAM  |  HEURISTIK: SOCIAL ENGINEERING",
      headline: "Pembedahan Pola Rekayasa Sosial",
      desc: "Mengenali teknik manipulasi psikologis panik, ancaman tenggat waktu palsu, dan pencocokan pola rekening penipuan.",
      tags: ["Analisis Urgensi", "Domain Scanner", "Pola Rekening"],
    },
    {
      id: "phone",
      name: "Nomor Kontak",
      telemetry: "JARINGAN: GSM / VOIP / VIRTUAL  |  DATABASE: INTELIJEN KOMUNITAS",
      headline: "Pengecekan Reputasi & Jejak Laporan",
      desc: "Menelusuri riwayat pelaporan nomor telepon dan rekening bank mencurigakan dari database intelijen komunitas terverifikasi.",
      tags: ["Database Terintegrasi", "Deteksi Spoofing", "Indeks Risiko"],
    },
  ];

  const currentMedia = mediaTabs.find((t) => t.id === activeTab) || mediaTabs[0];

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink relative overflow-x-clip">
      
      {/* Background Ambient Radar Curve */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] pointer-events-none -mr-40 -mt-28 opacity-25 dark:opacity-15 z-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 600 600" className="w-full h-full text-primary" fill="none">
          <circle cx="300" cy="300" r="280" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 8" className="opacity-40" />
          <circle cx="300" cy="300" r="200" stroke="currentColor" strokeWidth="1.5" className="opacity-30" />
          <circle cx="300" cy="300" r="120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" className="text-accent opacity-50" />
          <path d="M 300 300 L 520 180" stroke="currentColor" strokeWidth="2" className="opacity-40" />
          <path d="M 300 300 L 180 520" stroke="currentColor" strokeWidth="1.5" className="opacity-25" />
        </svg>
      </div>

      {/* Navbar Global */}
      <Navbar />

      {/* Main Content (Spacious vertical rhythm, no box wrapping everything) */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-16 md:py-24 space-y-24 sm:space-y-32 relative z-10">
        
        {/* =========================================================================
            1. HERO SECTION: Full-Bleed Narrative + Live Radar Console
            ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Narrative (Full-Bleed, no bounding card) */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="space-y-4">
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.6rem] text-ink tracking-tight leading-[1.12]">
                Ragu dengan keaslian telepon atau video? <br />
                <span className="text-primary font-bold">
                  Periksa sebelum percaya.
                </span>
              </h1>
              <p className="font-body text-muted text-lg sm:text-xl leading-relaxed max-w-xl">
                Waskita menganalisis keaslian rekaman suara, video deepfake, dan pesan manipulasi secara objektif menggunakan forensik akustik dan visual mutakhir untuk melindungi keluarga Anda.
              </p>
            </div>

            {/* Action Group */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/verifikasi"
                  className="inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-white font-body font-bold text-lg px-8 py-4 rounded-2xl shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer group focus:ring-2 focus:ring-primary focus:outline-none"
                  id="hero-start-verify-btn"
                >
                  <span>Mulai Periksa Konten</span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
                
                <Link
                  href="/belajar"
                  className="inline-flex items-center justify-center text-ink dark:text-white hover:text-primary font-body font-bold text-lg px-7 py-4 rounded-2xl border border-muted/25 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md hover:border-primary/40 shadow-2xs transition-all focus:ring-2 focus:ring-muted focus:outline-none"
                >
                  <span>Pelajari Modus AI</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Visual: Forensic Console with Teal -> Amber -> Ink Gauge */}
          <div className="lg:col-span-5">
            <div className="p-7 rounded-3xl border border-muted/20 bg-white/75 dark:bg-[#101D19]/80 backdrop-blur-xl shadow-sm relative overflow-hidden">
              
              {/* Header with Sample Switcher */}
              <div className="flex items-center justify-between border-b border-muted/15 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      demoState === "real" ? "bg-[#1F6B5C]" : "bg-[#0D2823] dark:bg-white"
                    } transition-colors duration-500`}
                  />
                  <span className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
                    RADAR KEJERNIHAN
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-mist dark:bg-white/5 p-1 rounded-xl border border-muted/15">
                  <button
                    onClick={() => setDemoState("real")}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all duration-300 font-semibold cursor-pointer ${
                      demoState === "real"
                        ? "bg-white dark:bg-[#1E302A] text-primary shadow-xs"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    Sampel Asli
                  </button>
                  <button
                    onClick={() => setDemoState("fake")}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all duration-300 font-semibold cursor-pointer ${
                      demoState === "fake"
                        ? "bg-white dark:bg-[#1E302A] text-[#0D2823] dark:text-white shadow-xs"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    Sampel AI
                  </button>
                </div>
              </div>

              {/* Gauge Graphic */}
              <div className="relative py-2 flex flex-col items-center">
                <div className="w-[240px] h-[130px] relative flex items-center justify-center">
                  <svg viewBox="0 0 240 135" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="heroGaugeTrack" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1F6B5C" />
                        <stop offset="45%" stopColor="#D97706" />
                        <stop offset="100%" stopColor="#0D2823" />
                      </linearGradient>
                    </defs>

                    {/* Background Track */}
                    <path
                      d="M 30 120 A 90 90 0 0 1 210 120"
                      fill="none"
                      className="stroke-[#E2E8E4] dark:stroke-[#20322D]"
                      strokeWidth="18"
                      strokeLinecap="round"
                    />

                    {/* Active Calibrated Arc (Teal -> Amber -> Dark Ink) */}
                    <path
                      d="M 30 120 A 90 90 0 0 1 210 120"
                      fill="none"
                      stroke={demoState === "real" ? "#1F6B5C" : "url(#heroGaugeTrack)"}
                      strokeWidth="18"
                      strokeLinecap="round"
                      strokeDasharray="282.7"
                      strokeDashoffset={demoState === "real" ? "250" : "15"}
                      className="transition-all duration-700 ease-out"
                    />

                    {/* Gauge Needle (Animated on load + animated on switch) */}
                    <g
                      transform={`rotate(${!needleLoaded ? -90 : demoState === "real" ? -76 : 76}, 120, 120)`}
                      className="transition-transform duration-700 ease-out text-ink"
                    >
                      <line
                        x1="120"
                        y1="120"
                        x2="120"
                        y2="38"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <circle cx="120" cy="120" r="8" fill="currentColor" />
                      <circle cx="120" cy="120" r="3" className="fill-mist" />
                    </g>
                  </svg>
                </div>

                {/* Status Indicator */}
                <div className="mt-3 text-center space-y-1">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold transition-all duration-500 ${
                      demoState === "real"
                        ? "bg-[#1F6B5C]/10 text-[#1F6B5C]"
                        : "bg-[#0D2823]/10 text-[#0D2823] dark:bg-white/10 dark:text-white"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        demoState === "real" ? "bg-[#1F6B5C]" : "bg-[#0D2823] dark:bg-white"
                      }`}
                    />
                    {demoState === "real" ? "Status: Tenang (3% Risiko)" : "Status: Sangat Waspada (92% Risiko)"}
                  </div>
                  <p className="font-body text-xs text-muted">
                    {demoState === "real"
                      ? "Pola vokal mikrofon dan artikulasi wajah konsisten secara alami."
                      : "Ditemukan pola sintesis suara neural AI dan disparitas artikulasi bibir."}
                  </p>
                </div>
              </div>

              {/* Real-time Forensic Telemetry */}
              <div className="mt-4 pt-4 border-t border-muted/15 space-y-2">
                <div className="flex items-center justify-between text-xs font-body">
                  <span className="text-muted flex items-center gap-2 font-medium">
                    <FontAwesomeIcon icon={faWaveSquare} className="w-3.5 h-3.5 text-primary" /> Spektrum Akustik Suara
                  </span>
                  <span
                    className={`font-mono font-bold transition-colors duration-500 ${
                      demoState === "real" ? "text-[#1F6B5C]" : "text-[#0D2823] dark:text-white"
                    }`}
                  >
                    {demoState === "real" ? "Alami (97%)" : "Sintetik AI (94%)"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-body">
                  <span className="text-muted flex items-center gap-2 font-medium">
                    <FontAwesomeIcon icon={faFingerprint} className="w-3.5 h-3.5 text-primary" /> Sinkronisasi Artikulasi
                  </span>
                  <span
                    className={`font-mono font-bold transition-colors duration-500 ${
                      demoState === "real" ? "text-[#1F6B5C]" : "text-[#0D2823] dark:text-white"
                    }`}
                  >
                    {demoState === "real" ? "Konsisten" : "Anomali Wav2Lip"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. FORENSIC STUDIO: Textured Acoustic & Visual Forensic Stage
            ========================================================================= */}
        <section className="space-y-6">
          <div className="space-y-2 text-left">
            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              KAPABILITAS SISTEM
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink tracking-tight">
              Pusat analisis forensik media digital.
            </h2>
          </div>

          {/* Textured Forensic Card (Acoustic Waveform / Spectrogram Grid in Background) */}
          <div className="rounded-3xl border border-muted/20 bg-white/70 dark:bg-[#101D19]/70 backdrop-blur-xl p-6 sm:p-9 relative overflow-hidden">
            
            {/* Ambient Acoustic Waveform Texture Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.06] flex items-center justify-around z-0">
              <svg viewBox="0 0 1000 300" className="w-full h-full text-current" fill="currentColor">
                <path d="M0,150 Q50,50 100,150 T200,150 T300,150 T400,150 T500,150 T600,150 T700,150 T800,150 T900,150 T1000,150" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M0,150 Q25,20 50,150 T100,150 T150,150 T200,150 T250,150 T300,150 T350,150 T400,150 T450,150 T500,150 T550,150 T600,150 T650,150 T700,150 T750,150 T800,150 T850,150 T900,150 T950,150 T1000,150" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </div>

            {/* Media Selector: Functional Signal Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
              
              {/* Tab 1: Suara & Audio (With Purposeful Animation 2: Ambient Mini Waveform) */}
              <button
                onClick={() => setActiveTab("audio")}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                  activeTab === "audio"
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-mist/60 dark:bg-white/5 border-muted/15 text-ink hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  {/* Functional Live Mini-Waveform */}
                  <div className="flex items-end gap-0.75 h-4">
                    <span className="w-0.75 h-2 bg-current rounded-full animate-pulse" />
                    <span className="w-0.75 h-3.5 bg-current rounded-full animate-pulse [animation-delay:150ms]" />
                    <span className="w-0.75 h-1.5 bg-current rounded-full animate-pulse [animation-delay:300ms]" />
                    <span className="w-0.75 h-4 bg-current rounded-full animate-pulse [animation-delay:450ms]" />
                    <span className="w-0.75 h-2.5 bg-current rounded-full animate-pulse [animation-delay:200ms]" />
                  </div>
                  <span className="font-mono text-[10px] opacity-75 font-semibold">AUDIO</span>
                </div>
                <div className="font-display font-bold text-sm sm:text-base leading-snug">
                  Suara & Panggilan
                </div>
              </button>

              {/* Tab 2: Video Deepfake (Optical Scan Grid) */}
              <button
                onClick={() => setActiveTab("video")}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                  activeTab === "video"
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-mist/60 dark:bg-white/5 border-muted/15 text-ink hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  {/* Optical Scan Line Grid Signal */}
                  <div className="w-4 h-4 border border-current rounded-sm flex items-center justify-center p-0.5 opacity-85">
                    <span className="w-full h-0.5 bg-current animate-pulse" />
                  </div>
                  <span className="font-mono text-[10px] opacity-75 font-semibold">VIDEO</span>
                </div>
                <div className="font-display font-bold text-sm sm:text-base leading-snug">
                  Video Deepfake
                </div>
              </button>

              {/* Tab 3: Pesan & Teks (Lexical Token Signal) */}
              <button
                onClick={() => setActiveTab("text")}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                  activeTab === "text"
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-mist/60 dark:bg-white/5 border-muted/15 text-ink hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] font-bold tracking-tighter opacity-85">¶_TX</span>
                  <span className="font-mono text-[10px] opacity-75 font-semibold">PESAN</span>
                </div>
                <div className="font-display font-bold text-sm sm:text-base leading-snug">
                  Pesan & Rekayasa
                </div>
              </button>

              {/* Tab 4: Nomor Kontak (Telemetry Threat Index) */}
              <button
                onClick={() => setActiveTab("phone")}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                  activeTab === "phone"
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-mist/60 dark:bg-white/5 border-muted/15 text-ink hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] font-bold opacity-85">+62//</span>
                  <span className="font-mono text-[10px] opacity-75 font-semibold">KONTAK</span>
                </div>
                <div className="font-display font-bold text-sm sm:text-base leading-snug">
                  Nomor Telepon
                </div>
              </button>
            </div>

            {/* Instrument Data Readout Bar (Not floating pills) */}
            <div className="mt-6 pt-3 pb-3 border-y border-muted/15 flex items-center justify-between font-mono text-[11px] text-muted overflow-x-auto whitespace-nowrap relative z-10">
              <span className="text-primary font-bold">{currentMedia.telemetry}</span>
              <span className="hidden sm:inline text-muted/75 font-medium">PIPELINE: ACTIVE</span>
            </div>

            {/* Selected Forensic Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 relative z-10">
              <div className="lg:col-span-8 space-y-3 text-left">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-ink">
                  {currentMedia.headline}
                </h3>
                <p className="font-body text-muted text-base sm:text-lg leading-relaxed">
                  {currentMedia.desc}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentMedia.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-xs px-3 py-1 rounded-md bg-mist dark:bg-white/5 text-ink/80 border border-muted/20 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
                <Link
                  href="/verifikasi"
                  className="inline-flex items-center gap-2.5 bg-primary text-white font-body font-semibold text-base px-6 py-3.5 rounded-xl shadow-xs hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <span>Buka Verifikasi Ini</span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Asymmetric Duo: Pendampingan Keluarga vs Simulasi Edukasi Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Wing 1: Pendampingan Keluarga (5 Cols - Editorial Minimalism) */}
            <div className="md:col-span-5 p-7 rounded-3xl border border-muted/20 bg-white/60 dark:bg-white/[0.03] backdrop-blur-md flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold text-accent uppercase tracking-wider">
                  PROTEKSI KELUARGA
                </div>
                <h3 className="font-display font-bold text-2xl text-ink">
                  Pendampingan Tanpa Sadap
                </h3>
                <p className="font-body text-muted text-sm sm:text-base leading-relaxed">
                  Bantu lindungi orang tua dan kerabat dari ancaman panggilan panik rekayasa (kloning suara anak atau cucu) tanpa pernah mengintip isi percakapan pribadi mereka.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/keluarga"
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase font-bold text-primary hover:underline"
                >
                  <FontAwesomeIcon icon={faUserShield} className="w-3.5 h-3.5" />
                  <span>Pelajari Ruang Keluarga &rarr;</span>
                </Link>
              </div>
            </div>

            {/* Wing 2: Latihan Kepekaan Modus AI with Mini Scenario Mockup Preview (7 Cols) */}
            <div className="md:col-span-7 p-7 rounded-3xl border border-muted/20 bg-white/60 dark:bg-white/[0.03] backdrop-blur-md flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-2">
                <div className="font-mono text-xs font-bold text-primary uppercase tracking-wider">
                  SIMULASI INTERAKTIF
                </div>
                <h3 className="font-display font-bold text-2xl text-ink">
                  Latihan Kepekaan Modus AI
                </h3>
              </div>

              {/* Realistic Mini Scenario Preview Card */}
              <div className="p-4 rounded-2xl bg-mist/90 dark:bg-black/30 border border-muted/20 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                  <span className="text-primary font-bold">SKENARIO 01 // PESAN MENDESAK</span>
                  <span>KESULITAN: MENENGAH</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#13221E] border border-muted/15 text-xs font-body text-ink space-y-1">
                  <div className="font-bold text-[11px] text-muted font-mono">Nomor Tak Dikenal (+62 812-xxxx):</div>
                  <p className="italic">"Halo Mah, tasku kecopetan di stasiun dan HP hilang. Ini pinjam HP teman. Tolong transfer 500rb buat ongkos pulang..."</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-2xs font-mono">
                  <span className="p-2 rounded-lg bg-primary/10 text-primary font-semibold text-center border border-primary/20">
                    Opsi A: Verifikasi Pola di Waskita
                  </span>
                  <span className="p-2 rounded-lg bg-mist dark:bg-white/5 text-muted text-center border border-muted/15">
                    Opsi B: Langsung Kirim Dana
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  href="/belajar"
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase font-bold text-primary hover:underline"
                >
                  <FontAwesomeIcon icon={faGraduationCap} className="w-3.5 h-3.5" />
                  <span>Mulai Uji Kepekaan Skenario &rarr;</span>
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            3. ZERO-RETENTION PRIVACY SECTION: Dynamic Theme Centerpiece
            ========================================================================= */}
        <section className="rounded-3xl bg-white/85 dark:bg-[#0B1815] text-ink dark:text-[#F2F7F5] border border-muted/20 dark:border-white/10 p-8 sm:p-12 relative overflow-hidden text-left shadow-sm dark:shadow-lg backdrop-blur-xl transition-colors duration-300">
          {/* Subtle Ambient Emerald Radial Glow */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-primary/10 dark:bg-primary/15 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary font-bold uppercase tracking-wider">
              <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5" /> JAMINAN ETIKA & KEAMANAN MUTLAK
            </div>
            <h3 className="font-display font-bold text-3xl sm:text-4xl text-ink dark:text-white tracking-tight">
              Privasi Tanpa Kompromi (Zero-Retention)
            </h3>
            <p className="font-body text-muted dark:text-[#A3B5AF] text-base sm:text-lg leading-relaxed">
              Waskita dirancang dengan prinsip etika ketat: Kami <strong>tidak pernah menyimpan</strong> berkas suara, citra, atau rekaman video yang Anda unggah ke basis data permanen. Media dianalisis di memori volatil terenkripsi dan langsung dimusnahkan seketika setelah hasil verifikasi selesai ditampilkan.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-muted dark:text-[#7D938B]">
              <span className="inline-flex items-center gap-1.5">
                <FontAwesomeIcon icon={faShieldHalved} className="text-primary" /> Enkripsi Memori RAM Volatil
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FontAwesomeIcon icon={faScaleBalanced} className="text-primary" /> Kepatuhan UU PDP No. 27/2022
              </span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer Global: Full-Width Dark Ink Footer */}
      <Footer />
    </div>
  );
}
