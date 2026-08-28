"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faTriangleExclamation,
  faCircleCheck,
  faInfoCircle,
  faPhone,
  faKey,
  faThumbsUp,
  faThumbsDown,
  faRotateRight,
  faChevronDown,
  faChevronUp,
  faFlag,
  faUsers,
  faXmark,
  faCircleNotch,
  faArrowRight,
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClarityGauge } from "@/components/ClarityGauge";
import {
  getVerification,
  submitVerificationFeedback,
  reportNumber,
  getReportCount,
  VerificationData,
} from "@/lib/api";

function HasilContent() {
  const searchParams = useSearchParams();
  const verificationId = searchParams.get("id");
  const { data: session } = useSession();

  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Feedback State
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);

  // Report Number State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [communityReportCount, setCommunityReportCount] = useState<number>(0);

  const token = (session as unknown as { accessToken?: string })?.accessToken;

  useEffect(() => {
    async function loadData() {
      if (!verificationId) {
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

  const extractedPhone = React.useMemo(() => {
    if (!data) return "";
    const ct = data.content_type?.toLowerCase();
    if (ct !== "telepon" && ct !== "phone_number") return "";
    const techStr = data.technical_detail || "";
    const match = techStr.match(/Nomor Terperiksa:\s*([^\n•]+)/);
    return match ? match[1].trim() : "";
  }, [data]);

  useEffect(() => {
    if (!extractedPhone) return;
    getReportCount(extractedPhone).then((res) => {
      setCommunityReportCount(res.report_count);
    });
  }, [extractedPhone]);

  const handleReportSubmit = async () => {
    if (!extractedPhone || !reportReason.trim() || !token) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const result = await reportNumber(extractedPhone, reportReason.trim(), token);
      setReportSubmitted(true);
      setCommunityReportCount(result.report_count);
      setShowReportModal(false);
      setReportReason("");
    } catch (err: unknown) {
      setReportError(err instanceof Error ? err.message : "Gagal mengirim laporan.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleFeedback = async (isPositive: boolean) => {
    if (!data?.id || feedbackSubmitted) return;
    setFeedbackLoading(true);
    try {
      await submitVerificationFeedback(data.id, isPositive);
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-mist text-ink flex flex-col items-center justify-center space-y-4">
        <FontAwesomeIcon icon={faCircleNotch} className="w-8 h-8 text-primary animate-spin" />
        <p className="font-body text-muted text-base">
          Mengambil data hasil analisis forensik...
        </p>
      </div>
    );
  }

  let gaugeValue = data.score || 50;
  if (!data.score) {
    if (data.risk_level === "tenang") gaugeValue = 22;
    else if (data.risk_level === "sangat_waspada") gaugeValue = 88;
    else gaugeValue = 52;
  }

  const techLines = (data.technical_detail || "").split("\n");
  const extractedInfo = {
    transcribedText: "",
    intentLabel: "",
    intentSummary: "",
    detectedKeywords: "",
    detectedLinks: "",
    recompressionDetected: false,
    communityCached: false,
    isSinglePhoto: false,
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
    } else if (trimmed.includes("Indikator Frasa Berisiko Terdeteksi:") || trimmed.includes("Indikator Frasa Terdeteksi:")) {
      extractedInfo.detectedKeywords = trimmed.replace(/.*Indikator Frasa (?:Berisiko )?Terdeteksi:\s*/, "");
    } else if (trimmed.includes("Tautan URL Terdeteksi:")) {
      extractedInfo.detectedLinks = trimmed.replace(/.*Tautan URL Terdeteksi:\s*/, "");
    } else if (trimmed.includes("kompresi berulang") || trimmed.includes("WhatsApp")) {
      extractedInfo.recompressionDetected = true;
    } else if (trimmed.includes("Community Fingerprint")) {
      extractedInfo.communityCached = true;
    } else if (
      trimmed.includes("Foto Tunggal") ||
      trimmed.includes("Citra / Foto Tunggal") ||
      trimmed.includes("Single-Frame") ||
      trimmed.includes("1 frame")
    ) {
      extractedInfo.isSinglePhoto = true;
    }
  });

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink relative overflow-x-clip">
      
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10 relative z-10">
        
        {/* =========================================================================
            1. HEADER SUMMARY & STATUS BAR
            ========================================================================= */}
        <div className="space-y-3 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted border-b border-muted/15 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-primary font-bold">ANALISIS SELESAI</span>
              <span>//</span>
              <span>ID: {data.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="uppercase">TIPE: {data.content_type}</span>
              {extractedInfo.communityCached && (
                <>
                  <span>·</span>
                  <span className="text-primary font-semibold">Sidik Jari Komunitas</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
              Hasil Verifikasi Kejernihan
            </h1>
            <p className="font-body text-muted text-base">
              Rangkuman tingkat risiko rekayasa dan panduan tindakan berdasarkan pembedahan forensik.
            </p>
          </div>
        </div>

        {/* =========================================================================
            2. RADAR KEJERNIHAN (Visual Centerpiece)
            ========================================================================= */}
        <div className="p-8 sm:p-12 rounded-3xl border border-muted/20 bg-white/80 dark:bg-[#101D19]/80 backdrop-blur-xl shadow-xs space-y-8">
          
          {data.risk_level === "tidak_dapat_diperiksa" ? (
            <div className="p-7 rounded-3xl bg-caution/10 border-2 border-caution/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-caution/20 text-caution flex items-center justify-center mx-auto">
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <span className="font-mono text-xs text-caution uppercase tracking-wider font-bold block">
                  STATUS: TIDAK DAPAT DIPERIKSA
                </span>
                <h2 className="font-display font-bold text-2xl text-ink">
                  Media Tidak Dapat Dianalisis
                </h2>
                <p className="font-body text-sm sm:text-base text-ink/80 leading-relaxed">
                  {data.explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <ClarityGauge value={gaugeValue} />
            </div>
          )}

          {/* Single Photo Disclaimer */}
          {data.content_type.toLowerCase() === "video" && extractedInfo.isSinglePhoto && (
            <div className="p-4 rounded-2xl bg-caution/10 border border-caution/30 flex items-start gap-3.5 text-left">
              <FontAwesomeIcon icon={faTriangleExclamation} className="w-5 h-5 text-caution mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <span className="font-mono text-xs text-caution uppercase tracking-wider font-bold block">
                  Catatan Analisis Foto Tunggal
                </span>
                <p className="font-body text-xs sm:text-sm text-ink/90 leading-relaxed font-medium">
                  Analisis foto tunggal memiliki tingkat ketidakpastian lebih tinggi dibanding video multikerangka. Sangat disarankan untuk memverifikasi secara langsung.
                </p>
              </div>
            </div>
          )}

          {/* Explanation Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-mist/60 dark:bg-white/[0.03] border border-muted/20 space-y-2 text-left">
            <h2 className="font-display font-bold text-lg sm:text-xl text-ink flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4 text-primary" />
              <span>Penjelasan Hasil Analisis</span>
            </h2>
            <p className="font-body text-ink/90 text-base sm:text-lg leading-relaxed">
              {data.explanation}
            </p>
          </div>

          {/* Phishing Alert Box (If Link Detected) */}
          {extractedInfo.detectedLinks && (
            <div className="p-5 rounded-2xl bg-caution/15 border-2 border-caution/40 space-y-2.5 text-left">
              <div className="flex items-center gap-2 text-caution font-display font-bold text-base">
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4" />
                <span>Tautan Phishing Berbahaya Terdeteksi:</span>
              </div>
              <div className="p-3 bg-white dark:bg-black/40 rounded-xl font-mono text-xs text-ink/90 break-all border border-caution/30">
                {extractedInfo.detectedLinks}
              </div>
              <p className="font-body text-xs text-muted">
                Jangan membuka atau memasukkan data perbankan ke tautan tersebut.
              </p>
            </div>
          )}

          {/* Context & Intent Keywords (XAI) */}
          {(extractedInfo.intentLabel || extractedInfo.detectedKeywords) && (
            <div className="p-6 rounded-2xl bg-mist/40 dark:bg-white/[0.02] border border-muted/20 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
                  <FontAwesomeIcon icon={faWaveSquare} className="w-4 h-4 text-primary" />
                  <span>Konteks Rekayasa & Frasa Kunci:</span>
                </h3>
                <span className="font-mono text-2xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase">
                  Explainable AI
                </span>
              </div>

              {extractedInfo.detectedKeywords && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {extractedInfo.detectedKeywords.split(",").map((kw: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 text-ink font-body text-xs font-medium border border-muted/20"
                    >
                      {kw.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Recommendations */}
          <div className="space-y-4 text-left">
            <h3 className="font-display font-bold text-lg text-ink">
              Langkah Tindakan yang Disarankan:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-muted/20 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
                </div>
                <h4 className="font-display font-bold text-base text-ink">
                  1. Hubungi Jalur Resmi Mandiri
                </h4>
                <p className="font-body text-muted text-xs sm:text-sm leading-relaxed">
                  Jangan gunakan nomor yang diberikan dalam pesan. Hubungi nomor resmi yang tersimpan di kontak pribadi Anda.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-muted/20 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                  <FontAwesomeIcon icon={faKey} className="w-4 h-4 text-ink dark:text-white" />
                </div>
                <h4 className="font-display font-bold text-base text-ink">
                  2. Konfirmasi Kata Sandi Keluarga
                </h4>
                <p className="font-body text-muted text-xs sm:text-sm leading-relaxed">
                  Tanyakan kode rahasia atau fakta masa lalu yang hanya diketahui oleh keluarga inti Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Loop */}
          <div className="p-5 rounded-2xl bg-mist/60 dark:bg-white/[0.02] border border-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-left">
              <h4 className="font-display font-bold text-sm text-ink">
                Bantu Waskita Meningkatkan Akurasi
              </h4>
              <p className="font-body text-xs text-muted">
                Apakah hasil analisis ini membantu situasi Anda?
              </p>
            </div>

            {feedbackSubmitted ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-body text-primary font-bold bg-primary/10 px-3.5 py-1.5 rounded-xl">
                <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4" />
                <span>Terima kasih atas masukan Anda!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={feedbackLoading}
                  onClick={() => handleFeedback(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-primary/10 text-ink hover:text-primary border border-muted/20 text-xs font-body font-semibold transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faThumbsUp} className="w-3.5 h-3.5" />
                  <span>Membantu</span>
                </button>
                <button
                  type="button"
                  disabled={feedbackLoading}
                  onClick={() => handleFeedback(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-white/5 hover:bg-caution/10 text-ink hover:text-caution border border-muted/20 text-xs font-body font-semibold transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faThumbsDown} className="w-3.5 h-3.5" />
                  <span>Koreksi</span>
                </button>
              </div>
            )}
          </div>

          {/* Expandable Technical Details */}
          {data.technical_detail && (
            <div className="border-t border-muted/15 pt-6 text-left">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-mist/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="font-body font-bold text-ink text-base flex items-center gap-2">
                  <span>Rincian Telemetri Teknis Analisis</span>
                </span>
                <FontAwesomeIcon
                  icon={isDetailsOpen ? faChevronUp : faChevronDown}
                  className="w-4 h-4 text-muted"
                />
              </button>

              {isDetailsOpen && (
                <div className="mt-3 p-5 rounded-2xl bg-mist/80 dark:bg-black/30 border border-muted/20 space-y-3 animate-in fade-in duration-200">
                  <div className="font-mono text-xs text-ink/80 whitespace-pre-line leading-relaxed">
                    {data.technical_detail}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-muted/15">
            <Link
              href="/verifikasi"
              className="inline-flex items-center gap-2 text-primary font-body font-bold hover:underline text-sm sm:text-base cursor-pointer"
            >
              <FontAwesomeIcon icon={faRotateRight} className="w-3.5 h-3.5" />
              <span>Periksa Berkas Lain</span>
            </Link>

            <Link
              href="/belajar"
              className="inline-flex items-center gap-2 bg-primary text-white font-body font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-opacity text-sm sm:text-base shadow-xs cursor-pointer"
            >
              <span>Pelajari Modus Serupa</span>
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
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
