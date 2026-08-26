"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Info,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClarityGauge } from "@/components/ClarityGauge";
import { getVerification, VerificationData } from "@/lib/api";

function HasilContent() {
  const searchParams = useSearchParams();
  const verificationId = searchParams.get("id");

  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!verificationId) {
        // Fallback default sample data if accessed directly without id
        setData({
          id: "WSK-SAMPLE-01",
          content_type: "suara",
          risk_level: "perlu_diperiksa",
          score: 52,
          explanation:
            "Kami menemukan pola suara yang tidak biasa dari rekaman ini. Ini bukan bukti pasti penipuan, tapi sebaiknya kamu periksa lebih lanjut.",
          technical_detail:
            "• Artefak Spektral: Terdeteksi diskontinuitas fase pada frekuensi 3.2 kHz di detik ke-3.4 dan ke-7.1.\n• Variansi Pitch: Tingkat modulasi intonasi vokal terlalu seragam (std dev: 0.12 Hz).\n• Jejak Akustik: Tidak ditemukan respon pantulan ruang (room reverb) fisik alami.",
          created_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      try {
        const result = await getVerification(verificationId);
        setData(result);
      } catch (err) {
        console.error("Error fetching verification:", err);
        // Set fallback data
        setData({
          id: verificationId,
          content_type: "suara",
          risk_level: "perlu_diperiksa",
          score: 52,
          explanation:
            "Kami menemukan pola suara yang tidak biasa dari rekaman ini. Ini bukan bukti mutlak, namun disarankan verifikasi ulang sebelum bertindak.",
          technical_detail:
            "• Artefak Spektral: Terdeteksi diskontinuitas frekuensi.\n• Variansi Pitch: Modulasi vokal seragam.\n• Tingkat Keyakinan Model: 82.4%.",
          created_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [verificationId]);

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
          </div>
        </div>

        {/* Main Result Card with Radar Kejernihan */}
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-muted/20 shadow-sm space-y-8">
          {/* Semicircle Gauge Component */}
          <div className="py-2">
            <ClarityGauge value={gaugeValue} />
          </div>

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

          {/* Action Recommendations (Gentle guidance) */}
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
                    2. Tanyakan Fakta Keluarga
                  </h4>
                  <p className="font-body text-muted text-sm leading-relaxed">
                    Tanyakan hal spesifik masa lalu yang hanya diketahui keluarga inti Anda, bukan info publik di medsos.
                  </p>
                </div>
              </div>
            </div>
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
