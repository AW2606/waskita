"use client";

import React, { useState } from "react";
import { Sparkles, HelpCircle, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Volume2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface Scenario {
  id: number;
  title: string;
  category: string;
  mediaType: "Panggilan Suara" | "Pesan Mendesak" | "Video Call Singkat";
  situation: string;
  options: {
    id: "A" | "B";
    text: string;
    isSafe: boolean;
    feedback: string;
  }[];
  explanation: string;
}

export default function BelajarPage() {
  const scenarios: Scenario[] = [
    {
      id: 1,
      title: "Skenario 1: Telepon Mendesak dari Pimpinan",
      category: "Kloning Suara AI",
      mediaType: "Panggilan Suara",
      situation:
        "Anda menerima panggilan telepon dari nomor baru. Suara di telepon terdengar persis seperti atasan atau bos Anda di kantor, meminta Anda segera mentransfer dana talangan operasional sebesar Rp 5.000.000 dalam 15 menit ke rekening vendor karena ia sedang dalam rapat tertutup.",
      options: [
        {
          id: "A",
          text: "Langsung mentransfer dana agar pekerjaan kantor tidak terhambat, karena suaranya memang sangat mirip beliau.",
          isSafe: false,
          feedback:
            "Kurang tepat. Kloning suara AI saat ini dapat meniru intonasi dan timbre seseorang hanya dari sampel video YouTube atau story Instagram berdurasi 3 detik.",
        },
        {
          id: "B",
          text: "Menunda transfer dan menghubungi nomor telepon kantor resmi atasan Anda yang sudah lama tersimpan di ponsel.",
          isSafe: true,
          feedback:
            "Pilihan sangat tepat! Memutus rantai urgensi dan melakukan verifikasi silang (cross-check) lewat jalur komunikasi yang sudah dipercaya adalah langkah paling ampuh.",
        },
      ],
      explanation:
        "Ciri khas penipuan AI adalah menciptakan 'urgensi buatan' (harus selesai dalam 15 menit) dan memanfaatkan rasa hormat/takut pada figur otoritas, dikombinasikan dengan suara tiruan.",
    },
    {
      id: 2,
      title: "Skenario 2: Video Call Kerabat Terjebak Masalah Hukum",
      category: "Deepfake Wajah",
      mediaType: "Video Call Singkat",
      situation:
        "Video call WhatsApp berdurasi 5 detik menampilkan keponakan Anda dengan wajah tampak cemas meminta bantuan uang jaminan kantor polisi, namun koneksi kemudian mendadak putus dan beralih ke chat teks.",
      options: [
        {
          id: "A",
          text: "Meminta keponakan menyebutkan nama panggilan masa kecil atau panggilan hewan peliharaan keluarga yang tidak pernah diunggah ke media sosial.",
          isSafe: true,
          feedback:
            "Sangat bijak! Pertanyaan berbasis 'rahasia keluarga' tidak bisa dijawab oleh generator video AI atau pelaku penipuan.",
        },
        {
          id: "B",
          text: "Segera mentransfer uang jaminan karena Anda sempat melihat wajahnya di layar ponsel.",
          isSafe: false,
          feedback:
            "Berisiko tinggi. Video pendek beberapa detik adalah format favorit deepfake karena artefak cacat visual mudah disamarkan dengan alasan sinyal buruk.",
        },
      ],
      explanation:
        "Pelaku sengaja membuat durasi video call sangat singkat agar Anda tidak sempat memperhatikan kedipan mata yang tidak wajar atau distorsi di area mulut.",
    },
    {
      id: 3,
      title: "Skenario 3: Voice Note Anak Meminta Pulsa Darurat",
      category: "Sintesis Audio Emosional",
      mediaType: "Panggilan Suara",
      situation:
        "Voice note dari nomor tak dikenal dengan suara anak Anda menangis tersedu-sedu mengatakan dompetnya hilang di perjalanan dan meminta dikirimi kode OTP yang baru saja masuk ke SMS Anda.",
      options: [
        {
          id: "A",
          text: "Segera kirimkan kode OTP tersebut karena kasihan mendengar suaranya menangis.",
          isSafe: false,
          feedback:
            "Bahaya! Kode OTP tidak pernah boleh dibagikan kepada siapa pun. Efek tangisan sering digunakan untuk memicu kepanikan orang tua agar logika kritis menurun.",
        },
        {
          id: "B",
          text: "Jangan pernah bagikan OTP. Telepon langsung nomor biasa anak Anda atau hubungi guru/teman sekolahnya.",
          isSafe: true,
          feedback:
            "Tepat sekali! Selalu tenangkan diri sejenak dan ingat bahwa kode OTP adalah kunci brankas akun digital pribadi Anda.",
        },
      ],
      explanation:
        "Manipulasi emosi rasa panik adalah taktik utama rekayasa sosial (*social engineering*). Menjaga ketenangan selama 60 detik pertama adalah benteng pertahanan terkuat.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | null>(null);

  const currentScenario = scenarios[currentIndex];
  const chosen = currentScenario.options.find((opt) => opt.id === selectedOption);

  const handleNext = () => {
    setSelectedOption(null);
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-8 sm:space-y-10">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Latihan Simulasi Nyata
          </div>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
            Kenali polanya sebelum tertipu.
          </h1>
          <p className="font-body text-muted text-base sm:text-lg">
            Pelajari taktik manipulasi suara dan deepfake melalui latihan skenario sederhana tanpa tekanan skor kompetitif.
          </p>

          {/* Dot Indicator Progress (Non-competitive) */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {scenarios.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setSelectedOption(null);
                }}
                className={`transition-all duration-200 cursor-pointer ${
                  idx === currentIndex
                    ? "w-8 h-2.5 bg-primary rounded-full"
                    : "w-2.5 h-2.5 bg-muted/40 hover:bg-muted/70 rounded-full"
                }`}
                aria-label={`Skenario ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Scenario Card */}
        <div className="bg-white p-7 sm:p-10 rounded-3xl border border-muted/20 shadow-sm space-y-6">
          {/* Category Tag */}
          <div className="flex items-center justify-between border-b border-muted/20 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-mist rounded-md text-primary border border-muted/20">
                {currentScenario.category}
              </span>
              <span className="font-mono text-xs text-muted">
                {currentScenario.mediaType}
              </span>
            </div>
            <span className="font-mono text-xs text-muted">
              Kasus #{currentIndex + 1} dari {scenarios.length}
            </span>
          </div>

          {/* Situation Text */}
          <div className="space-y-2">
            <h2 className="font-display font-semibold text-2xl text-ink">
              {currentScenario.title}
            </h2>
            <div className="p-5 bg-mist rounded-2xl border border-muted/30 font-body text-base sm:text-lg text-ink/90 leading-relaxed">
              &quot;{currentScenario.situation}&quot;
            </div>
          </div>

          {/* 2 Interactive Response Choices */}
          <div className="space-y-3 pt-2">
            <h3 className="font-display font-semibold text-lg text-ink">
              Apa tindakan yang sebaiknya kamu ambil?
            </h3>

            <div className="space-y-3">
              {currentScenario.options.map((option) => {
                const isSelected = selectedOption === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? option.isSafe
                          ? "bg-primary/10 border-primary shadow-xs ring-2 ring-primary/20"
                          : "bg-caution/15 border-caution shadow-xs ring-2 ring-caution/20"
                        : "bg-mist/40 hover:bg-mist border-muted/25"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl font-mono text-sm font-bold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? option.isSafe
                            ? "bg-primary text-white"
                            : "bg-caution text-white"
                          : "bg-white text-ink border border-muted/25"
                      }`}
                    >
                      {option.id}
                    </span>
                    <span className="font-body text-base text-ink leading-relaxed pt-0.5">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Explanation (Revealed after selection) */}
          {selectedOption && chosen && (
            <div className="space-y-4 pt-4 border-t border-muted/20 animate-in fade-in duration-300">
              <div
                className={`p-5 rounded-2xl border ${
                  chosen.isSafe
                    ? "bg-primary/10 border-primary/30 text-ink"
                    : "bg-caution/15 border-caution/40 text-ink"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {chosen.isSafe ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-caution" />
                  )}
                  <h4 className="font-display font-semibold text-lg text-ink">
                    {chosen.isSafe ? "Langkah Bijak & Tepat" : "Catatan Keamanan"}
                  </h4>
                </div>
                <p className="font-body text-base text-ink/90 leading-relaxed">
                  {chosen.feedback}
                </p>
              </div>

              {/* Underlying AI Pattern Explanation */}
              <div className="p-5 bg-mist rounded-2xl border border-muted/30 space-y-1.5">
                <h4 className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
                  [ ANALISIS POLA PENIPUAN AI ]
                </h4>
                <p className="font-body text-sm text-ink/80 leading-relaxed">
                  {currentScenario.explanation}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 bg-primary text-white font-body font-medium text-base px-6 py-3 rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                >
                  <span>
                    {currentIndex < scenarios.length - 1
                      ? "Lanjut Skenario Berikutnya"
                      : "Ulangi Latihan dari Awal"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
