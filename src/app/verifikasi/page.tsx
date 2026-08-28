"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Mic,
  Video,
  MessageSquareText,
  PhoneCall,
  UploadCloud,
  FileAudio,
  FileVideo,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Lock,
  LogIn,
  X,
  Sparkles,
  FileCheck,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { verifyContent, clearVerificationCache } from "@/lib/api";

type ContentType = "suara" | "video" | "pesan" | "telepon";

export default function VerifikasiPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedType, setSelectedType] = useState<ContentType>("suara");
  
  // Real File upload state
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

  const contentTypes = [
    {
      id: "suara" as ContentType,
      title: "Rekaman Suara",
      icon: Mic,
      description: "Periksa voice note, rekaman panggilan, atau pesan suara.",
      category: "upload",
      accept: "audio/*,.aac,.mp3,.wav,.m4a,.ogg,.flac",
      sampleHint: "Mendukung .aac, .mp3, .wav, .m4a, .ogg, .flac (Maks. 25MB)",
    },
    {
      id: "video" as ContentType,
      title: "Video / Deepfake",
      icon: Video,
      description: "Periksa video wawancara, berita palsu, atau ekspresi wajah ganjil.",
      category: "upload",
      accept: "video/*,image/*,.mp4,.mov,.avi,.mkv,.webm,.jpg,.jpeg,.png",
      sampleHint: "Mendukung .mp4, .mov, .avi, .webm (Maks. 50MB)",
    },
    {
      id: "pesan" as ContentType,
      title: "Pesan / Chat",
      icon: MessageSquareText,
      description: "Periksa teks pesan WhatsApp, SMS penipuan, atau email ganjil.",
      category: "input",
      placeholder: "Tempelkan isi teks pesan yang mencurigakan di sini...",
    },
    {
      id: "telepon" as ContentType,
      title: "Nomor Telepon",
      icon: PhoneCall,
      description: "Periksa reputasi dan pola nomor asing yang menghubungi Anda.",
      category: "input",
      placeholder: "Contoh: +62 812-3456-7890 atau 0812...",
    },
  ];

  const activeContent = contentTypes.find((t) => t.id === selectedType)!;

  // Format file size in KB or MB
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  // Handle Drag & Drop events
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

  // Preset sample generator for testing when user has no audio/video file handy
  const handleUsePresetSample = (type: "audio" | "video") => {
    if (type === "audio") {
      // Create a small valid WAV file in memory
      const sampleRate = 16000;
      const numSamples = sampleRate * 2; // 2 seconds
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);

      // WAV Header
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
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, numSamples * 2, true);

      // Synthesize tone data
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
      // Sample image/video file
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#2F6F62";
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
          ? `Berhasil menghapus ${res.cleared_count} data sidik jari cache! Analisis berikutnya akan memproses file secara utuh dengan model AI terkini.`
          : "Cache sidik jari & browser berhasil dibersihkan! Anda dapat menguji ulang file yang sama."
      );
      setTimeout(() => setCacheSuccessMessage(null), 6000);
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

    // Validation
    if (activeContent.category === "upload" && !selectedFile) {
      setErrorMessage("Silakan pilih atau unggah file rekaman suara / video terlebih dahulu.");
      return;
    }

    if (activeContent.category === "input" && !inputText.trim()) {
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

      if (activeContent.category === "input") {
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
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10 sm:space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Langkah 1: Pilih Sumber Media
          </div>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
            Apa yang ingin kamu periksa?
          </h1>
          <p className="font-body text-muted text-base sm:text-lg">
            Pilih salah satu format konten di bawah untuk memulai verifikasi cerdas dengan model deteksi AI.
          </p>
        </div>

        {/* Unauthenticated Notification Banner */}
        {status === "unauthenticated" && (
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-muted/20 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-base text-ink">
                  Mode Pengunjung (Tamu) Aktif
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted">
                  Anda dapat langsung memverifikasi media sekarang, atau masuk untuk menyimpan riwayat permanen di akun Anda.
                </p>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-body font-medium text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Akun</span>
            </Link>
          </div>
        )}

        {/* 4 Cards Grid (2x2 Desktop, 1 Col Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {contentTypes.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedType(item.id);
                  setErrorMessage(null);
                }}
                className={`p-6 sm:p-7 rounded-2xl text-left transition-all duration-200 cursor-pointer flex items-start gap-5 border ${
                  isSelected
                    ? "bg-white border-primary shadow-md ring-2 ring-primary/20 -translate-y-0.5"
                    : "bg-white/70 hover:bg-white border-muted/25 shadow-2xs hover:shadow-xs"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-mist text-primary border border-muted/20"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-semibold text-xl text-ink">
                      {item.title}
                    </h2>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="font-body text-muted text-sm sm:text-base leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Input / Upload Section */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-7 sm:p-10 rounded-2xl border border-muted/20 shadow-sm space-y-6"
        >
          <div className="border-b border-muted/20 pb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-xl text-ink">
              Unggah / Masukkan Data: {activeContent.title}
            </h2>
            <span className="font-mono text-xs text-primary font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero-Retention Policy
            </span>
          </div>

          {errorMessage && (
            <div className="p-4 bg-caution/15 text-ink border border-caution/40 rounded-xl text-sm font-body">
              {errorMessage}
            </div>
          )}

          {/* Render Drag & Drop Area for Voice / Video */}
          {activeContent.category === "upload" && (
            <div className="space-y-4">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={activeContent.accept}
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
                  className={`border-2 border-dashed p-8 sm:p-12 rounded-2xl text-center cursor-pointer transition-all duration-200 space-y-4 ${
                    isDragging
                      ? "border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01]"
                      : "border-muted/40 hover:border-primary/60 bg-mist/60 hover:bg-mist"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white mx-auto flex items-center justify-center text-primary shadow-xs border border-muted/20">
                    <UploadCloud className="w-8 h-8 text-primary" />
                  </div>

                  <div className="space-y-1.5 max-w-md mx-auto">
                    <p className="font-body font-semibold text-ink text-base sm:text-lg">
                      {isDragging ? (
                        "Lepaskan file di sini..."
                      ) : (
                        <>
                          Tarik dan lepaskan file ke sini, atau{" "}
                          <span className="text-primary underline font-bold">klik untuk memilih file</span>
                        </>
                      )}
                    </p>
                    <p className="font-body text-xs text-muted">
                      {activeContent.sampleHint}
                    </p>
                  </div>
                </div>
              ) : (
                /* Selected File Card */
                <div className="p-6 rounded-2xl bg-mist/80 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                      {selectedType === "suara" ? (
                        <FileAudio className="w-7 h-7" />
                      ) : (
                        <FileVideo className="w-7 h-7" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-semibold text-base text-ink truncate max-w-[280px] sm:max-w-md">
                          {selectedFile.name}
                        </h4>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary font-mono text-xs font-semibold">
                          <FileCheck className="w-3 h-3" /> Siap
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted">
                        Ukuran: {formatFileSize(selectedFile.size)} • Tipe: {selectedFile.type || selectedType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white hover:bg-white/80 text-ink border border-muted/30 rounded-xl text-xs font-body font-medium transition-all cursor-pointer"
                    >
                      Ganti File
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 text-muted hover:text-ink hover:bg-white rounded-xl transition-all cursor-pointer"
                      title="Hapus file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* One-click Sample Test Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-body text-muted">
                <span className="flex items-center gap-1 font-medium text-ink">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Tidak punya file? Coba sampel uji cepat:
                </span>
                <button
                  type="button"
                  onClick={() => handleUsePresetSample("audio")}
                  className="px-3 py-1.5 rounded-lg bg-mist hover:bg-primary/10 text-primary border border-muted/20 font-medium transition-colors cursor-pointer"
                >
                  🎙️ Sampel Kloning Suara AI
                </button>
                <button
                  type="button"
                  onClick={() => handleUsePresetSample("video")}
                  className="px-3 py-1.5 rounded-lg bg-mist hover:bg-primary/10 text-primary border border-muted/20 font-medium transition-colors cursor-pointer"
                >
                  🎬 Sampel Video Deepfake
                </button>
              </div>
            </div>
          )}

          {/* Render Textarea or Input for Message / Phone */}
          {activeContent.category === "input" && (
            <div className="space-y-3">
              {selectedType === "pesan" ? (
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={activeContent.placeholder}
                  className="w-full p-4 rounded-xl border border-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-mist/40 text-ink font-body text-base placeholder:text-muted/60 outline-none transition-all resize-none"
                />
              ) : (
                <input
                  type="tel"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={activeContent.placeholder}
                  className="w-full p-4 rounded-xl border border-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-mist/40 text-ink font-body text-base placeholder:text-muted/60 outline-none transition-all"
                />
              )}
              <p className="font-body text-xs text-muted">
                File media mentah tidak disimpan permanen di server dan langsung dihapus setelah analisis selesai.
              </p>
            </div>
          )}

          {/* Testing & Cache Controls (Untuk Pengujian & Perbandingan Model) */}
          <div className="pt-4 border-t border-muted/20 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-mist/60 p-4 rounded-xl border border-muted/25 text-xs font-body">
              <label className="flex items-center gap-2.5 text-ink hover:text-primary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bypassCache}
                  onChange={(e) => setBypassCache(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-muted/40 cursor-pointer accent-primary"
                />
                <span className="font-medium text-ink">
                  Paksa Analisis Ulang Model AI (Bypass Cache Hash)
                </span>
              </label>

              <button
                type="button"
                onClick={handleClearCache}
                disabled={isClearingCache}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-caution/15 text-muted hover:text-ink border border-muted/30 transition-all cursor-pointer disabled:opacity-50 shrink-0 font-medium"
                title="Hapus semua cache sidik jari SHA-256 tersimpan untuk pengujian perbandingan model"
              >
                {isClearingCache ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5 text-primary" />
                )}
                <span>{isClearingCache ? "Menghapus..." : "Hapus Cache Sidik Jari"}</span>
              </button>
            </div>

            {cacheSuccessMessage && (
              <div className="p-3.5 bg-primary/10 text-primary border border-primary/25 rounded-xl text-xs font-body flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{cacheSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary text-white font-body font-medium text-lg px-8 py-4 rounded-xl shadow-sm hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses Analisis...</span>
                </>
              ) : (
                <>
                  <span>Periksa Sekarang</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
