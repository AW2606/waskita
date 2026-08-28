"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faMicrophoneLines,
  faVideo,
  faEnvelopeOpenText,
  faPhoneVolume,
  faCloudArrowUp,
  faFileAudio,
  faFileVideo,
  faArrowRight,
  faCircleCheck,
  faLock,
  faRotateRight,
  faTrashCan,
  faSliders,
  faCircleNotch,
} from "@fortawesome/free-solid-svg-icons";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { verifyContent, clearVerificationCache } from "@/lib/api";

type ContentType = "suara" | "video" | "pesan" | "telepon";

export default function VerifikasiPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedType, setSelectedType] = useState<ContentType>("suara");

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text & Phone state
  const [inputText, setInputText] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cache & Testing controls
  const [bypassCache, setBypassCache] = useState<boolean>(false);
  const [isClearingCache, setIsClearingCache] = useState<boolean>(false);
  const [cacheSuccessMessage, setCacheSuccessMessage] = useState<string | null>(null);

  const token = (session as unknown as { accessToken?: string })?.accessToken;

  const instruments = [
    {
      id: "suara" as ContentType,
      title: "Rekaman Suara & Panggilan",
      category: "upload",
      accept: "audio/*,.aac,.mp3,.wav,.m4a,.ogg,.flac",
      telemetry: "CODEC: AAC · MP3 · WAV · M4A  |  SAMPLING: 16.0 kHz",
      description: "Pemeriksaan spektrum akustik vokal, micro-jitter, dan kloning suara AI.",
      sampleHint: "Mendukung .aac, .mp3, .wav, .m4a, .ogg, .flac (Maksimal 25MB)",
      tier: "primary",
    },
    {
      id: "video" as ContentType,
      title: "Video & Deepfake",
      category: "upload",
      accept: "video/*,image/*,.mp4,.mov,.avi,.mkv,.webm,.jpg,.jpeg,.png",
      telemetry: "FORMAT: MP4 · MOV · WEBM  |  ROI: FACE DISPARITY & ELA",
      description: "Analisis sinkronisasi artikulasi bibir vs mata, batas kompresi ELA, dan artefak neural.",
      sampleHint: "Mendukung .mp4, .mov, .avi, .webm (Maksimal 50MB)",
      tier: "primary",
    },
    {
      id: "pesan" as ContentType,
      title: "Pesan Teks & Chat",
      category: "input",
      telemetry: "KANAL: WHATSAPP · SMS · EMAIL  |  HEURISTIK: SOCIAL ENGINEERING",
      description: "Pembedahan manipulasi urgensi, ancaman batas waktu, dan pola rekening mencurigakan.",
      placeholder: "Tempelkan isi pesan WhatsApp, SMS, atau email yang mencurigakan di sini...",
      tier: "secondary",
    },
    {
      id: "telepon" as ContentType,
      title: "Nomor Kontak",
      category: "input",
      telemetry: "JARINGAN: GSM / VOIP  |  DATABASE: INTELIJEN TERVERIFIKASI",
      description: "Penelusuran riwayat pelaporan nomor telepon asing dan reputasi kontak.",
      placeholder: "Contoh: +62 812-3456-7890 atau 0812...",
      tier: "secondary",
    },
  ];

  const activeInstrument = instruments.find((t) => t.id === selectedType)!;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setSelectedFile(droppedFile);
      setErrorMessage(null);
    }
  };

  const handleUsePresetSample = (type: "audio" | "video") => {
    if (type === "audio") {
      const sampleRate = 16000;
      const numSamples = sampleRate * 2;
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);

      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, "RIFF");
      view.setUint32(4, 36 + numSamples * 2, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, numSamples * 2, true);

      for (let i = 0; i < numSamples; i++) {
        const sample = Math.sin((i / sampleRate) * 440 * 2 * Math.PI) * 0.5;
        view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      }

      const blob = new Blob([buffer], { type: "audio/wav" });
      const sampleAudioFile = new File([blob], "rekaman_suara_mencurigakan_sample.wav", {
        type: "audio/wav",
      });
      setSelectedType("suara");
      setSelectedFile(sampleAudioFile);
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#1F6B5C";
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "20px sans-serif";
        ctx.fillText("Waskita Deepfake Sample", 20, 150);
      }
      canvas.toBlob((blob) => {
        if (blob) {
          const sampleVideoFile = new File([blob], "video_tokoh_publik_sample.png", {
            type: "image/png",
          });
          setSelectedType("video");
          setSelectedFile(sampleVideoFile);
        }
      });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    setCacheSuccessMessage(null);
    setErrorMessage(null);
    try {
      const res = await clearVerificationCache(token);
      setCacheSuccessMessage(
        res.cleared_count > 0
          ? `Berhasil menghapus ${res.cleared_count} sidik jari cache. File akan dianalisis utuh oleh model AI.`
          : "Cache sidik jari berhasil dibersihkan."
      );
      setTimeout(() => setCacheSuccessMessage(null), 5000);
    } catch (err: unknown) {
      console.error("Gagal bersihkan cache:", err);
      setErrorMessage("Gagal membersihkan cache sidik jari.");
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCacheSuccessMessage(null);

    if (activeInstrument.category === "upload" && !selectedFile) {
      setErrorMessage("Silakan pilih atau unggah file rekaman suara / video terlebih dahulu.");
      return;
    }

    if (activeInstrument.category === "input" && !inputText.trim()) {
      setErrorMessage(
        selectedType === "telepon"
          ? "Silakan masukkan nomor telepon yang ingin diperiksa."
          : "Silakan masukkan teks pesan yang mencurigakan."
      );
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("content_type", selectedType);

      if (bypassCache) {
        formData.append("bypass_cache", "true");
      }

      if (activeInstrument.category === "input") {
        formData.append("text_content", inputText.trim());
      } else if (selectedFile) {
        formData.append("file", selectedFile, selectedFile.name);
      }

      const result = await verifyContent(formData, token);
      router.push(`/verifikasi/proses?id=${result.id}`);
    } catch (err: unknown) {
      console.error("Verification submit error:", err);
      const msg = err instanceof Error ? err.message : "Gagal memproses verifikasi.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink relative overflow-x-clip">
      
      {/* Background Ambient Radar Curve */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none -mr-40 -mt-28 opacity-20 dark:opacity-10 z-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 600 600" className="w-full h-full text-primary" fill="none">
          <circle cx="300" cy="300" r="280" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 8" className="opacity-40" />
          <circle cx="300" cy="300" r="180" stroke="currentColor" strokeWidth="1.5" className="opacity-30" />
          <path d="M 300 300 L 520 180" stroke="currentColor" strokeWidth="2" className="opacity-40" />
        </svg>
      </div>

      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-16 space-y-6 sm:space-y-12 relative z-10">
        
        {/* =========================================================================
            1. HEADER & GUEST METADATA BAR (Seamlessly Integrated)
            ========================================================================= */}
        <div className="space-y-4 text-left">
          {/* Natural Metadata Pill */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 text-xs font-mono text-muted border-b border-muted/15 pb-4">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
              <span className="font-bold text-primary truncate">
                INSTRUMEN FORENSIK<span className="hidden sm:inline"> TERPADU</span>
              </span>
              <span className="hidden md:inline text-muted/50">//</span>
              <span className="hidden md:inline text-muted">LANGKAH 01: PILIH SUMBER</span>
            </div>

            {status === "unauthenticated" ? (
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-ink/80 dark:text-muted shrink-0">
                <span>Mode Tamu<span className="hidden sm:inline"> Aktif (Langsung Verifikasi)</span></span>
                <span>·</span>
                <Link href="/login" className="text-primary hover:underline font-bold whitespace-nowrap">
                  Masuk Akun &rarr;
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-primary font-bold shrink-0">
                <FontAwesomeIcon icon={faCircleCheck} className="w-3.5 h-3.5 shrink-0" />
                <span>Akun Terverifikasi</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-ink tracking-tight">
              Pilih instrumen yang ingin diperiksa.
            </h1>
            <p className="font-body text-muted text-xs sm:text-base md:text-lg max-w-2xl leading-relaxed">
              Pilih salah satu format media di bawah untuk menganalisis keaslian berkas menggunakan pembedahan forensik akustik dan visual objektif.
            </p>
          </div>
        </div>

        {/* =========================================================================
            2. INSTRUMENT SELECTOR (Mobile: Compact Tabs / Desktop: 2-Tier Deck)
            ========================================================================= */}
        
        {/* Mobile: Compact Segmented Tab Selector */}
        <div className="md:hidden space-y-2">
          <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-muted/20 shadow-2xs backdrop-blur-md">
            {instruments.map((inst) => {
              const isSelected = selectedType === inst.id;
              const getIcon = () => {
                switch (inst.id) {
                  case "suara":
                    return faMicrophoneLines;
                  case "video":
                    return faVideo;
                  case "pesan":
                    return faEnvelopeOpenText;
                  case "telepon":
                    return faPhoneVolume;
                }
              };

              return (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(inst.id);
                    setErrorMessage(null);
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-white shadow-sm font-bold scale-[1.02]"
                      : "text-muted hover:text-ink hover:bg-muted/10 font-medium"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={getIcon()}
                    className={`w-4 h-4 mb-1 ${isSelected ? "text-white" : "text-primary"}`}
                  />
                  <span className="text-[11px] font-mono tracking-tight capitalize">
                    {inst.id === "telepon" ? "Nomor" : inst.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: Asymmetrical 2-Tier Architecture */}
        <div className="hidden md:block space-y-4">
          {/* Tier 1: Multimodal Media (Audio & Video - Primary Focus) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Instrument A: Suara & Panggilan */}
            <button
              type="button"
              onClick={() => {
                setSelectedType("suara");
                setErrorMessage(null);
              }}
              className={`p-6 sm:p-7 rounded-3xl text-left transition-all duration-200 cursor-pointer border relative overflow-hidden flex flex-col justify-between space-y-4 ${
                selectedType === "suara"
                  ? "bg-white dark:bg-[#13221E] border-primary shadow-md ring-2 ring-primary/20 -translate-y-0.5"
                  : "bg-white/60 dark:bg-white/[0.03] border-muted/20 hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Live Functional Mini Waveform */}
                <div className="flex items-end gap-1 h-5 text-primary">
                  <span className="w-1 h-2.5 bg-current rounded-full animate-pulse" />
                  <span className="w-1 h-5 bg-current rounded-full animate-pulse [animation-delay:150ms]" />
                  <span className="w-1 h-2 bg-current rounded-full animate-pulse [animation-delay:300ms]" />
                  <span className="w-1 h-4 bg-current rounded-full animate-pulse [animation-delay:450ms]" />
                  <span className="w-1 h-3 bg-current rounded-full animate-pulse [animation-delay:200ms]" />
                </div>
                <span className="font-mono text-[11px] font-bold uppercase text-primary">
                  {selectedType === "suara" ? "[ AKTIF ]" : "SUARA"}
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">
                  Rekaman Suara & Panggilan
                </h2>
                <p className="font-body text-muted text-sm leading-relaxed">
                  Pemeriksaan spektrum akustik vokal, micro-jitter pita suara, dan kloning suara AI.
                </p>
              </div>

              <div className="font-mono text-[10px] text-muted/80 pt-2 border-t border-muted/15">
                CODEC: AAC · MP3 · WAV · M4A
              </div>
            </button>

            {/* Instrument B: Video & Deepfake */}
            <button
              type="button"
              onClick={() => {
                setSelectedType("video");
                setErrorMessage(null);
              }}
              className={`p-6 sm:p-7 rounded-3xl text-left transition-all duration-200 cursor-pointer border relative overflow-hidden flex flex-col justify-between space-y-4 ${
                selectedType === "video"
                  ? "bg-white dark:bg-[#13221E] border-primary shadow-md ring-2 ring-primary/20 -translate-y-0.5"
                  : "bg-white/60 dark:bg-white/[0.03] border-muted/20 hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Optical Scan Line Grid Signal */}
                <div className="w-5 h-5 border border-primary text-primary rounded-sm flex items-center justify-center p-0.5">
                  <span className="w-full h-0.5 bg-primary animate-pulse" />
                </div>
                <span className="font-mono text-[11px] font-bold uppercase text-primary">
                  {selectedType === "video" ? "[ AKTIF ]" : "VIDEO"}
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-ink">
                  Video & Deepfake
                </h2>
                <p className="font-body text-muted text-sm leading-relaxed">
                  Analisis disparitas artikulasi bibir vs mata (Wav2Lip), kompresi ELA, dan wajah sintetis.
                </p>
              </div>

              <div className="font-mono text-[10px] text-muted/80 pt-2 border-t border-muted/15">
                FORMAT: MP4 · MOV · WEBM · AVI
              </div>
            </button>

          </div>

          {/* Tier 2: Communication Channels (Text & Phone - Compact Row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Instrument C: Pesan Teks */}
            <button
              type="button"
              onClick={() => {
                setSelectedType("pesan");
                setErrorMessage(null);
              }}
              className={`p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex items-center justify-between ${
                selectedType === "pesan"
                  ? "bg-white dark:bg-[#13221E] border-primary shadow-sm ring-2 ring-primary/20"
                  : "bg-white/40 dark:bg-white/[0.02] border-muted/15 hover:border-primary/30"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">¶_TX</span>
                  <h3 className="font-display font-bold text-base text-ink">
                    Pesan Teks & Chat
                  </h3>
                </div>
                <p className="font-body text-xs text-muted">
                  Manipulasi urgensi panik dan pancingan rekening.
                </p>
              </div>
              <span className="font-mono text-[10px] text-muted uppercase">
                {selectedType === "pesan" ? "[ TERPILIH ]" : "WHATSAPP / SMS"}
              </span>
            </button>

            {/* Instrument D: Nomor Telepon */}
            <button
              type="button"
              onClick={() => {
                setSelectedType("telepon");
                setErrorMessage(null);
              }}
              className={`p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex items-center justify-between ${
                selectedType === "telepon"
                  ? "bg-white dark:bg-[#13221E] border-primary shadow-sm ring-2 ring-primary/20"
                  : "bg-white/40 dark:bg-white/[0.02] border-muted/15 hover:border-primary/30"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">+62//</span>
                  <h3 className="font-display font-bold text-base text-ink">
                    Nomor Kontak
                  </h3>
                </div>
                <p className="font-body text-xs text-muted">
                  Penelusuran jejak pelaporan dan reputasi nomor asing.
                </p>
              </div>
              <span className="font-mono text-[10px] text-muted uppercase">
                {selectedType === "telepon" ? "[ TERPILIH ]" : "GSM / VOIP"}
              </span>
            </button>

          </div>
        </div>

        {/* =========================================================================
            3. WORKBENCH & UPLOAD STAGE (Textured Surface)
            ========================================================================= */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl sm:rounded-3xl border border-muted/20 bg-white/80 dark:bg-[#101D19]/80 backdrop-blur-xl p-5 sm:p-8 md:p-10 space-y-5 sm:space-y-7 shadow-xs relative overflow-hidden"
        >
          {/* Header Bar */}
          <div className="border-b border-muted/15 pb-3 sm:pb-4 flex items-center justify-between gap-3 text-left">
            <div className="space-y-0.5 min-w-0">
              <span className="font-mono text-[10px] sm:text-[11px] text-primary font-bold uppercase tracking-wider block">
                INPUT FORENSIK AKTIF
              </span>
              <h2 className="font-display font-bold text-lg sm:text-2xl text-ink truncate">
                {activeInstrument.title}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-primary font-semibold shrink-0 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>Zero-Retention</span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 sm:p-4 bg-caution/15 text-ink border border-caution/40 rounded-2xl text-xs sm:text-sm font-body">
              {errorMessage}
            </div>
          )}

          {cacheSuccessMessage && (
            <div className="p-3.5 sm:p-4 bg-primary/15 text-primary border border-primary/30 rounded-2xl text-xs sm:text-sm font-body font-medium flex items-center gap-2">
              <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 shrink-0" />
              <span>{cacheSuccessMessage}</span>
            </div>
          )}

          {/* Upload Dropzone (For Voice / Video) */}
          {activeInstrument.category === "upload" && (
            <div className="space-y-3 sm:space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept={activeInstrument.accept}
                onChange={handleFileChange}
                className="hidden"
                id="media-file-upload-input"
              />

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed p-6 sm:p-10 rounded-2xl sm:rounded-3xl text-center cursor-pointer transition-all duration-200 space-y-3 sm:space-y-4 ${
                    isDragging
                      ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01]"
                      : "border-muted/30 hover:border-primary/50 bg-mist/50 dark:bg-white/[0.02]"
                  }`}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-[#1E302A] mx-auto flex items-center justify-center text-primary shadow-xs border border-muted/20">
                    <FontAwesomeIcon icon={faCloudArrowUp} className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>

                  <div className="space-y-1 max-w-md mx-auto">
                    <p className="font-body font-bold text-ink text-sm sm:text-base md:text-lg">
                      {isDragging ? (
                        "Lepaskan berkas di sini..."
                      ) : (
                        <>
                          <span className="sm:hidden">Ketuk untuk memilih berkas</span>
                          <span className="hidden sm:inline">Tarik berkas ke sini, atau <span className="text-primary underline">klik untuk memilih</span></span>
                        </>
                      )}
                    </p>
                    <p className="font-body text-[11px] sm:text-xs text-muted leading-relaxed">
                      {activeInstrument.sampleHint}
                    </p>
                  </div>
                </div>
              ) : (
                /* Selected File Card */
                <div className="p-4 sm:p-6 rounded-2xl bg-mist dark:bg-black/30 border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                      <FontAwesomeIcon
                        icon={selectedType === "suara" ? faFileAudio : faFileVideo}
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0 text-left">
                      <h4 className="font-display font-bold text-sm sm:text-base text-ink truncate max-w-[200px] xs:max-w-[260px] sm:max-w-md">
                        {selectedFile.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-muted">
                        <span>{formatFileSize(selectedFile.size)}</span>
                        <span>·</span>
                        <span className="text-primary font-semibold">Siap Dianalisis</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-muted hover:text-ink hover:bg-muted/15 transition-colors cursor-pointer self-end sm:self-center"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="w-3 h-3" />
                    <span>Ganti Berkas</span>
                  </button>
                </div>
              )}

              {/* Preset Sample Generator Button */}
              {!selectedFile && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => handleUsePresetSample(selectedType === "suara" ? "audio" : "video")}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 hover:bg-accent/20 border border-accent/30 text-xs font-mono text-ink dark:text-mist hover:text-accent transition-all cursor-pointer text-left"
                  >
                    <FontAwesomeIcon icon={faSliders} className="w-3 h-3 text-accent shrink-0" />
                    <span>Gunakan sampel demo pengujian</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Text / Phone Input Area */}
          {activeInstrument.category === "input" && (
            <div className="space-y-3 text-left">
              {selectedType === "pesan" ? (
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={activeInstrument.placeholder}
                  rows={4}
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-mist dark:bg-black/30 border border-muted/25 focus:border-primary focus:ring-2 focus:ring-primary/20 text-ink font-body text-sm sm:text-base outline-none resize-none transition-all"
                  id="message-text-input"
                />
              ) : (
                <input
                  type="tel"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={activeInstrument.placeholder}
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-mist dark:bg-black/30 border border-muted/25 focus:border-primary focus:ring-2 focus:ring-primary/20 text-ink font-mono text-sm sm:text-base outline-none transition-all"
                  id="phone-number-input"
                />
              )}
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-muted">
                <span>{inputText.length} Karakter</span>
                <span className="hidden sm:inline">Model NLP & Pattern Matcher</span>
              </div>
            </div>
          )}

          {/* Diagnostic Cache Control (Testing & Deep Analysis) */}
          <div className="pt-3 border-t border-muted/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs font-mono text-muted">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bypassCache}
                onChange={(e) => setBypassCache(e.target.checked)}
                className="w-4 h-4 rounded border-muted/40 text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
              />
              <span className="font-medium text-ink/80 dark:text-muted">Lewati Cache (Analisis Utuh)</span>
            </label>

            <button
              type="button"
              onClick={handleClearCache}
              disabled={isClearingCache}
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faRotateRight} className={`w-3 h-3 shrink-0 ${isClearingCache ? "animate-spin" : ""}`} />
              <span>{isClearingCache ? "Membersihkan..." : "Bersihkan Cache"}</span>
            </button>
          </div>

          {/* Submit Action Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-primary text-white font-body font-bold text-base sm:text-lg shadow-md hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              id="submit-verification-btn"
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} className="w-5 h-5 animate-spin shrink-0" />
                  <span>Memproses Analisis...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span>Mulai Analisis Sekarang</span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                </>
              )}
            </button>
          </div>
        </form>

      </main>

      <Footer />
    </div>
  );
}
