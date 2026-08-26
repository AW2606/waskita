"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { verifyContent } from "@/lib/api";

type ContentType = "suara" | "video" | "pesan" | "telepon";

export default function VerifikasiPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedType, setSelectedType] = useState<ContentType>("suara");
  const [inputText, setInputText] = useState("");
  const [dummyFileName, setDummyFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const token = (session as unknown as { accessToken?: string })?.accessToken;

  const contentTypes = [
    {
      id: "suara" as ContentType,
      title: "Rekaman Suara",
      icon: Mic,
      description: "Periksa voice note, rekaman panggilan, atau pesan suara.",
      category: "upload",
      sampleHint: "Format .mp3, .m4a, .wav (Maks. 25MB)",
    },
    {
      id: "video" as ContentType,
      title: "Video / Deepfake",
      icon: Video,
      description: "Periksa video wawancara, berita palsu, atau ekspresi wajah ganjil.",
      category: "upload",
      sampleHint: "Format .mp4, .mov (Maks. 50MB)",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === "unauthenticated" || !token) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("content_type", selectedType);

      if (activeContent.category === "input") {
        formData.append("text_content", inputText || activeContent.placeholder || "");
      } else {
        // Dummy file simulation
        const fakeFile = new Blob(["sample content data"], { type: "audio/mpeg" });
        formData.append("file", fakeFile, dummyFileName || "sample_media_record.mp3");
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

  const handleSimulateFileSelect = () => {
    if (selectedType === "suara") {
      setDummyFileName("rekaman_suara_mencurigakan.mp3");
    } else {
      setDummyFileName("video_konfirmasi_transfer.mp4");
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
            Pilih salah satu format konten di bawah untuk memulai verifikasi cepat dengan aman.
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
                  Masuk untuk Menyimpan Riwayat
                </h3>
                <p className="font-body text-xs sm:text-sm text-muted">
                  Hasil verifikasi akan terikat secara privat ke akun Anda dan file media langsung dihapus permanen.
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
                  setDummyFileName(null);
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
            <span className="font-mono text-xs text-muted">Zero-Retention Policy</span>
          </div>

          {errorMessage && (
            <div className="p-4 bg-caution/15 text-ink border border-caution/40 rounded-xl text-sm font-body">
              {errorMessage}
            </div>
          )}

          {/* Render Drag & Drop Area for Voice / Video */}
          {activeContent.category === "upload" && (
            <div
              onClick={handleSimulateFileSelect}
              className="border-2 border-dashed border-muted/40 hover:border-primary/60 bg-mist/60 hover:bg-mist p-8 sm:p-12 rounded-2xl text-center cursor-pointer transition-all duration-200 space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-white mx-auto flex items-center justify-center text-primary shadow-xs border border-muted/20">
                {dummyFileName ? (
                  selectedType === "suara" ? (
                    <FileAudio className="w-7 h-7 text-primary" />
                  ) : (
                    <FileVideo className="w-7 h-7 text-primary" />
                  )
                ) : (
                  <UploadCloud className="w-7 h-7 text-primary" />
                )}
              </div>

              {dummyFileName ? (
                <div className="space-y-1">
                  <p className="font-body font-semibold text-ink text-base sm:text-lg">
                    {dummyFileName}
                  </p>
                  <p className="font-mono text-xs text-primary font-medium">
                    File siap diperiksa (Klik untuk mengganti)
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-body font-semibold text-ink text-base sm:text-lg">
                    Tarik dan lepaskan file ke sini, atau{" "}
                    <span className="text-primary underline">klik untuk memilih file sampel</span>
                  </p>
                  <p className="font-body text-xs text-muted">
                    {activeContent.sampleHint}
                  </p>
                </div>
              )}
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
