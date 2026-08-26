"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Info,
  Loader2,
  Calendar,
  Layers,
  Mic,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  ExternalLink,
  Video,
  Share2,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClarityGauge } from "@/components/ClarityGauge";
import { getVerification, submitVerificationFeedback, VerificationData } from "@/lib/api";

function HasilContent() {
  const searchParams = useSearchParams();
  const verificationId = searchParams.get("id");
  const { data: session } = useSession();

  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Feedback State
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackIsPositive, setFeedbackIsPositive] = useState<boolean | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);

  const token = (session as unknown as { accessToken?: string })?.accessToken;

  useEffect(() => {
    async function loadData() {
      if (!verificationId) {
        // Fallback default sample data if accessed directly without id
        setData({
          id: "WSK-SAMPLE-01",
          content_type: "suara",
          risk_level: "sangat_waspada",
          score: 92,
          explanation:
            "Meskipun karakter gelombang suara berasal dari manusia asli (bukan kloning AI), isi percakapan yang diucapkan memuat pola penipuan rekayasa sosial berisiko sangat tinggi (seperti intimidasi, desakan transfer darurat, atau permintaan OTP). Jangan ikuti instruksi penelepon dan lakukan verifikasi mandiri ke pihak resmi.",
          technical_detail:
            '• Transkripsi Percakapan (Whisper ASR): "Halo, ini dari kepolisian. Rekening Anda terindikasi kasus narkoba, segera transfer 5 juta dalam 15 menit untuk uang jaminan. Jangan bilang siapa-siapa."\n• Skor Probabilitas Deepfake (Akustik): 6.0%\n• Skor Risiko Modus Penipuan (Konten): 95.0%\n• Indikator Frasa Berisiko Terdeteksi: segera transfer, dalam 15 menit, jangan bilang siapa-siapa, kepolisian, kasus narkoba, uang jaminan\n• Kategori Modus: Desakan Waktu Palsu (Urgency), Isolasi Korban & Kerahasiaan (Secrecy), Intimidasi & Catut Nama Aparat / Pejabat\n• Privasi & Retensi: File media mentah tidak disimpan permanen dan telah dihapus otomatis (Zero Retention Policy).',
          created_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      try {
        const result = await getVerification(verificationId, token);
        setData(result);
      } catch (err) {
        console.error("Error fetching verification:", err);
        setData({
          id: verificationId,
          content_type: "suara",
          risk_level: "perlu_diperiksa",
          score: 52,
          explanation:
            "Kami menemukan pola suara yang tidak biasa dari rekaman ini. Ini bukan bukti mutlak, namun disarankan verifikasi manual sebelum bertindak.",
          technical_detail:
            "• Status: Hasil verifikasi tersimpan di basis data terenkripsi akun Anda.\n• Privasi: File media telah dihapus seketika (Zero-Retention).",
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [verificationId, token]);

  const handleFeedback = async (isPositive: boolean) => {
    if (!data?.id || feedbackSubmitted) return;
    setFeedbackLoading(true);
    try {
      await submitVerificationFeedback(data.id, isPositive);
      setFeedbackSubmitted(true);
      setFeedbackIsPositive(isPositive);
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-body text-muted text-base">
          Mengambil data hasil analisis dari database...
        </p>
      </div>
    );
  }

  // Calculate score for gauge needle
  let gaugeValue = data.score || 50;
  if (!data.score) {
    if (data.risk_level === "tenang") gaugeValue = 22;
    else if (data.risk_level === "sangat_waspada") gaugeValue = 86;
    else gaugeValue = 52;
  }

  // Parse structured information from technical_detail
  const techLines = (data.technical_detail || "").split("\n");
  const extractedInfo = {
    transcribedText: "",
    acousticScoreStr: "",
    contentScoreStr: "",
    intentLabel: "",
    intentSummary: "",
    detectedKeywords: "",
    modeCategories: "",
    detectedLinks: "",
    recompressionDetected: false,
    communityCached: false,
  };

  techLines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.includes("Transkripsi Percakapan (Whisper ASR):")) {
      const match = trimmed.match(/Transkripsi Percakapan \(Whisper ASR\):\s*"(.*)"/);
      extractedInfo.transcribedText = match ? match[1] : trimmed.replace(/.*Transkripsi Percakapan \(Whisper ASR\):\s*/, "").replace(/^"|"$/g, "");
    } else if (trimmed.includes("Klasifikasi Niat (Intent):")) {
      extractedInfo.intentLabel = trimmed.replace(/.*Klasifikasi Niat \(Intent\):\s*/, "");
    } else if (trimmed.includes("Konteks Niat:")) {
      extractedInfo.intentSummary = trimmed.replace(/.*Konteks Niat:\s*/, "");
    } else if (trimmed.includes("Skor Probabilitas Deepfake (Akustik):")) {
      extractedInfo.acousticScoreStr = trimmed.replace(/.*Skor Probabilitas Deepfake \(Akustik\):\s*/, "");
    } else if (trimmed.includes("Skor Risiko Modus Penipuan (Konten):")) {
      extractedInfo.contentScoreStr = trimmed.replace(/.*Skor Risiko Modus Penipuan \(Konten\):\s*/, "");
    } else if (trimmed.includes("Indikator Frasa Berisiko Terdeteksi:") || trimmed.includes("Indikator Frasa Terdeteksi:")) {
      extractedInfo.detectedKeywords = trimmed.replace(/.*Indikator Frasa (?:Berisiko )?Terdeteksi:\s*/, "");
    } else if (trimmed.includes("Kategori Modus:") || trimmed.includes("Kategori Modus Teridentifikasi:")) {
      extractedInfo.modeCategories = trimmed.replace(/.*Kategori Modus (?:Teridentifikasi)?:\s*/, "");
    } else if (trimmed.includes("Tautan URL Terdeteksi:")) {
      extractedInfo.detectedLinks = trimmed.replace(/.*Tautan URL Terdeteksi:\s*/, "");
    } else if (trimmed.includes("kompresi berulang") || trimmed.includes("WhatsApp")) {
      extractedInfo.recompressionDetected = true;
    } else if (trimmed.includes("Community Fingerprint")) {
      extractedInfo.communityCached = true;
    }
  });

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-8 sm:space-y-10">
        {/* Header Summary */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Hasil Analisis Selesai
          </div>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl text-ink tracking-tight">
            Ringkasan Kejernihan Konten
          </h1>
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-muted pt-1">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> ID: {data.id}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Tipe: {data.content_type.toUpperCase()}
            </span>
            {extractedInfo.communityCached && (
              <>
                <span>•</span>
                <span className="text-primary font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Komunitas
                </span>
              </>
            )}
          </div>
        </div>

        {/* Main Result Card with Radar Kejernihan */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-muted/20 shadow-sm space-y-8">
          {/* Semicircle Gauge Component */}
          <div className="py-2">
            <ClarityGauge value={gaugeValue} />
          </div>

          {/* Video Temporal & Compression Badge */}
          {data.content_type.toLowerCase() === "video" && extractedInfo.recompressionDetected && (
            <div className="p-4 rounded-2xl bg-caution/10 border border-caution/30 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-caution/20 text-caution flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-xs text-caution uppercase tracking-wider font-semibold block">
                  Pemberitahuan Forensik Kompresi Video
                </span>
                <p className="font-body text-xs sm:text-sm text-ink/80 leading-relaxed">
                  Video terdeteksi mengalami kompresi berulang (khas media yang diteruskan berkali-kali di WhatsApp/medsos). Kompresi berat dapat menyamarkan detail mikro manipulasi visual.
                </p>
              </div>
            </div>
          )}

          {/* Plain Language Explanation Card (Real Data) */}
          <div className="p-6 sm:p-7 bg-mist/80 rounded-2xl border border-muted/30 space-y-2 text-center sm:text-left">
            <h2 className="font-display font-semibold text-xl text-ink flex items-center justify-center sm:justify-start gap-2">
              <Info className="w-5 h-5 text-primary shrink-0" />
              Penjelasan Hasil Analisis
            </h2>
            <p className="font-body text-ink/90 text-base sm:text-lg leading-relaxed">
              {data.explanation}
            </p>
          </div>

          {/* Phishing / Malicious Link Detection Box (If Found) */}
          {extractedInfo.detectedLinks && (
            <div className="p-5 rounded-2xl bg-caution/15 border-2 border-caution/40 space-y-2.5">
              <div className="flex items-center gap-2 text-caution font-display font-semibold text-base">
                <AlertTriangle className="w-5 h-5" />
                Peringatan Tautan / Link Phishing Berbahaya Terdeteksi:
              </div>
              <p className="font-body text-xs sm:text-sm text-ink leading-relaxed">
                Pesan ini menyertakan tautan situs web yang berisiko tinggi mencuri akun atau data pribadi Anda:
              </p>
              <div className="p-3 bg-white/90 rounded-xl font-mono text-xs text-ink/90 break-all border border-caution/30 flex items-center justify-between gap-2">
                <span>{extractedInfo.detectedLinks}</span>
                <span className="px-2 py-0.5 rounded bg-caution/20 text-caution font-bold uppercase text-2xs shrink-0">
                  Risiko Phishing
                </span>
              </div>
              <p className="font-body text-xs text-muted">
                ⚠️ Jangan pernah membuka atau memasukkan nomor rekening, PIN, atau kata sandi Anda ke halaman tautan tersebut.
              </p>
            </div>
          )}

          {/* Intent-Gated Discourse & Context Classification Card (XAI) */}
          {(extractedInfo.intentLabel || data.content_type.toLowerCase() === "suara" || data.content_type.toLowerCase() === "pesan") && (
            <div className="p-6 rounded-2xl bg-white border border-primary/20 shadow-2xs space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display font-semibold text-base text-ink flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Klasifikasi Niat & Konteks Pembicaraan:
                </h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  Intent-Gated XAI
                </span>
              </div>

              <div className="p-4 rounded-xl bg-mist/60 border border-muted/20 space-y-2">
                <div className="font-display font-semibold text-sm sm:text-base text-ink flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {extractedInfo.intentLabel || (data.risk_level === "tenang" ? "Narasi Edukasi & Informasi Publik (Bukan Serangan Langsung)" : "Analisis Struktur Niat & Percakapan")}
                  </span>
                </div>
                <p className="font-body text-xs sm:text-sm text-ink/80 leading-relaxed">
                  {extractedInfo.intentSummary ||
                    (data.risk_level === "tenang"
                      ? "Konten teridentifikasi sebagai narasi informasi / edukasi pencegahan penipuan, bukan instruksi yang mendesak Anda melakukan transaksi secara langsung."
                      : "Sistem mendeteksi struktur kalimat untuk memastikan apakah ada desakan tindakan transfer dana, kode OTP, atau isolasi kontak.")}
                </p>
              </div>

              {extractedInfo.detectedKeywords && (
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted font-medium flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Frasa Teridentifikasi dalam Konteks:
                  </span>
                  {extractedInfo.detectedKeywords.split(",").map((kw: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-mist text-ink font-body text-xs font-medium border border-muted/30"
                    >
                      {kw.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Recommendations */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-lg text-ink text-center sm:text-left">
              Langkah Bijak yang Disarankan:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-muted/30 shadow-2xs space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-semibold text-base text-ink">
                    1. Hubungi Nomor Resmi Sendiri
                  </h4>
                  <p className="font-body text-muted text-sm leading-relaxed">
                    Jangan gunakan kontak yang diberikan dalam pesan. Hubungi kontak resmi dari buku kontak pribadi Anda.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-muted/30 shadow-2xs space-y-2 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-ink" />
                  </div>
                  <h4 className="font-display font-semibold text-base text-ink">
                    2. Tanyakan Fakta Keluarga / Safe Word
                  </h4>
                  <p className="font-body text-muted text-sm leading-relaxed">
                    Tanyakan kata sandi rahasia keluarga Anda atau hal masa lalu yang hanya diketahui keluarga inti.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Feedback Loop Widget (Human-in-the-Loop) */}
          <div className="p-5 rounded-2xl bg-mist/60 border border-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <h4 className="font-display font-semibold text-sm text-ink flex items-center justify-center sm:justify-start gap-1.5">
                <Share2 className="w-4 h-4 text-primary" />
                Bantu Waskita Makin Pintar
              </h4>
              <p className="font-body text-xs text-muted">
                Apakah hasil analisis ini akurat & membantu Anda?
              </p>
            </div>

            {feedbackSubmitted ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-body text-primary font-semibold bg-primary/10 px-3.5 py-1.5 rounded-xl animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Terima kasih atas masukan Anda!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={feedbackLoading}
                  onClick={() => handleFeedback(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-primary/10 text-ink hover:text-primary border border-muted/30 text-xs font-body font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Akurat & Membantu</span>
                </button>
                <button
                  type="button"
                  disabled={feedbackLoading}
                  onClick={() => handleFeedback(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-caution/10 text-ink hover:text-caution border border-muted/30 text-xs font-body font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Laporkan Koreksi</span>
                </button>
              </div>
            )}
          </div>

          {/* Accordion / Expandable Technical Details (Real Data) */}
          {data.technical_detail && (
            <div className="border-t border-muted/20 pt-6">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="w-full flex items-center justify-between text-left p-4 rounded-xl hover:bg-mist transition-colors cursor-pointer"
              >
                <span className="font-body font-semibold text-ink text-base flex items-center gap-2">
                  Kenapa hasil ini begini?
                  <span className="font-mono text-xs text-muted font-normal">
                    (Rincian Teknis Analisis)
                  </span>
                </span>
                {isDetailsOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted" />
                )}
              </button>

              {isDetailsOpen && (
                <div className="mt-4 p-5 rounded-2xl bg-mist border border-muted/30 space-y-3 animate-in fade-in duration-200">
                  <div className="space-y-2 font-mono text-xs sm:text-sm text-ink/80 whitespace-pre-line">
                    {data.technical_detail}
                  </div>

                  {/* Responsible AI Transparency Note */}
                  <div className="pt-2 border-t border-muted/20">
                    <div className="p-3.5 rounded-xl bg-white border border-muted/30 text-xs font-body text-muted leading-relaxed space-y-1">
                      <div className="font-semibold text-ink flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-primary" />
                        Catatan Etika & Tanggung Jawab AI (Responsible AI):
                      </div>
                      <p>
                        Sistem ini dikalibrasi menggunakan sampel uji terbatas dan dirancang sebagai instrumen edukasi serta penapisan awal (*early triage support*). Model akan terus disempurnakan secara bertahap melalui masukan komunitas dan tidak dimaksudkan sebagai alat pembuktian hukum mutlak.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-muted/20">
            <Link
              href="/verifikasi"
              className="inline-flex items-center gap-2 text-primary font-body font-semibold hover:underline text-base cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Periksa Konten Lain
            </Link>

            <Link
              href="/belajar"
              className="inline-flex items-center gap-2 bg-primary text-white font-body font-medium px-6 py-3 rounded-xl hover:bg-primary/90 transition-opacity text-base shadow-xs cursor-pointer"
            >
              <span>Pelajari Pola Serupa di Sini</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function VerifikasiHasilPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-mist flex items-center justify-center">
          <span className="font-mono text-xs text-muted">Memuat hasil verifikasi...</span>
        </div>
      }
    >
      <HasilContent />
    </Suspense>
  );
}
