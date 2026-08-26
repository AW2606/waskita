"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Search,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  getScenariosList,
  getScenarioDetail,
  answerScenario,
  ScenarioSummary,
  ScenarioDetail,
  ScenarioAnswerResponse,
} from "@/lib/api";

export default function BelajarPage() {
  const [scenariosList, setScenariosList] = useState<ScenarioSummary[]>([]);
  const [currentScenario, setCurrentScenario] = useState<ScenarioDetail | null>(null);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<"a" | "b" | null>(null);
  const [answerResult, setAnswerResult] = useState<ScenarioAnswerResponse | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompletedAll, setIsCompletedAll] = useState<boolean>(false);

  // Initial Load: Fetch Scenarios List from Database
  useEffect(() => {
    async function loadInitial() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const list = await getScenariosList();
        setScenariosList(list);

        if (list && list.length > 0) {
          const detail = await getScenarioDetail(list[0].id);
          setCurrentScenario(detail);
        }
      } catch (err: unknown) {
        console.error("Error loading scenarios:", err);
        setErrorMessage("Gagal memuat skenario simulasi dari basis data. Pastikan server backend aktif.");
      } finally {
        setIsLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Handle Loading a specific scenario
  const handleLoadScenario = async (id: number) => {
    try {
      setIsLoading(true);
      setSelectedChoice(null);
      setAnswerResult(null);
      const detail = await getScenarioDetail(id);
      setCurrentScenario(detail);
    } catch (err) {
      console.error("Error loading scenario detail:", err);
      setErrorMessage("Gagal memuat detail skenario.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user submitting their answer
  const handleSelectChoice = async (choice: "a" | "b") => {
    if (!currentScenario || isSubmitting || answerResult) return;

    setSelectedChoice(choice);
    setIsSubmitting(true);
    try {
      const res = await answerScenario(currentScenario.id, choice);
      setAnswerResult(res);

      // Record scenario as completed in this session
      if (!completedIds.includes(currentScenario.id)) {
        setCompletedIds((prev) => [...prev, currentScenario.id]);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      setErrorMessage("Gagal mengirim jawaban. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle transitioning to next unanswered scenario
  const handleNext = async () => {
    if (!scenariosList || scenariosList.length === 0) return;

    // Find next scenario not yet completed
    const remaining = scenariosList.filter(
      (s) => !completedIds.includes(s.id) && s.id !== currentScenario?.id
    );

    if (remaining.length > 0) {
      handleLoadScenario(remaining[0].id);
    } else if (completedIds.length >= scenariosList.length) {
      setIsCompletedAll(true);
    } else {
      // If current scenario completed the set
      setIsCompletedAll(true);
    }
  };

  // Reset entire session to start fresh
  const handleRestartSession = () => {
    setCompletedIds([]);
    setIsCompletedAll(false);
    setSelectedChoice(null);
    setAnswerResult(null);
    if (scenariosList.length > 0) {
      handleLoadScenario(scenariosList[0].id);
    }
  };

  // Calculate current case index
  const currentIndex = scenariosList.findIndex((s) => s.id === currentScenario?.id);

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
            Pelajari taktik manipulasi suara dan deepfake melalui latihan skenario sederhana yang diambil langsung dari basis data kasus riil.
          </p>

          {/* Dot Indicator Progress (Non-competitive, reflects database count) */}
          {!isCompletedAll && scenariosList.length > 0 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {scenariosList.map((s, idx) => {
                const isCurrent = s.id === currentScenario?.id;
                const isCompleted = completedIds.includes(s.id);

                return (
                  <button
                    key={s.id}
                    onClick={() => handleLoadScenario(s.id)}
                    className={`transition-all duration-300 cursor-pointer ${
                      isCurrent
                        ? "w-8 h-3 bg-primary rounded-full shadow-xs"
                        : isCompleted
                        ? "w-3 h-3 bg-primary/70 rounded-full"
                        : "w-3 h-3 bg-muted/30 hover:bg-muted/60 rounded-full"
                    }`}
                    aria-label={`Kasus ${idx + 1}: ${s.title}`}
                    title={`Kasus ${idx + 1}: ${s.title}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Error message banner if any */}
        {errorMessage && (
          <div className="p-4 bg-caution/15 text-ink border border-caution/40 rounded-2xl text-sm font-body text-center">
            {errorMessage}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white p-12 rounded-3xl border border-muted/20 shadow-sm flex flex-col items-center justify-center space-y-4 min-h-[300px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="font-body text-muted text-base">
              Mengambil data skenario simulasi dari basis data...
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: All Scenarios Completed Warm Closing Screen           */}
        {/* ------------------------------------------------------------- */}
        {!isLoading && isCompletedAll && (
          <div className="bg-white p-8 sm:p-14 rounded-3xl border border-muted/20 shadow-sm text-center space-y-8 animate-in fade-in zoom-in-95 duration-400">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20 shadow-xs">
              <ShieldCheck className="w-9 h-9 text-primary" />
            </div>

            <div className="space-y-3 max-w-xl mx-auto">
              <h2 className="font-display font-semibold text-3xl sm:text-4xl text-ink">
                Kamu sudah lebih siap mengenali pola-pola ini.
              </h2>
              <p className="font-body text-muted text-base sm:text-lg leading-relaxed">
                Terima kasih sudah meluangkan waktu untuk berlatih bersama Waskita. Dengan memahami taktik desakan waktu buatan, manipulasi emosi panik, kloning suara AI, dan deepfake visual, kamu kini memiliki benteng pertahanan yang jauh lebih kokoh untuk melindungi diri dan keluarga tercinta.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleRestartSession}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-mist hover:bg-mist/80 text-ink border border-muted/30 font-body font-medium text-base px-6 py-3.5 rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-muted" />
                <span>Ulangi Latihan Simulasi</span>
              </button>

              <Link
                href="/verifikasi"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-body font-medium text-base px-8 py-3.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Coba Periksa Konten Asli</span>
              </Link>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: Active Scenario Interactive Card                      */}
        {/* ------------------------------------------------------------- */}
        {!isLoading && !isCompletedAll && currentScenario && (
          <div className="bg-white p-7 sm:p-10 rounded-3xl border border-muted/20 shadow-sm space-y-6 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-muted/20 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-mist rounded-md text-primary border border-muted/20">
                  Basis Data Kasus Nyata
                </span>
                <span className="font-mono text-xs text-muted">
                  ID #{currentScenario.id}
                </span>
              </div>
              <span className="font-mono text-xs text-muted">
                Kasus #{currentIndex >= 0 ? currentIndex + 1 : 1} dari {scenariosList.length}
              </span>
            </div>

            {/* Narrative / Situation Text */}
            <div className="space-y-3">
              <h2 className="font-display font-semibold text-2xl text-ink">
                {currentScenario.title}
              </h2>
              <div className="p-5 sm:p-6 bg-mist rounded-2xl border border-muted/30 font-body text-base sm:text-lg text-ink/90 leading-relaxed">
                &quot;{currentScenario.narrative}&quot;
              </div>
            </div>

            {/* 2 Response Choices */}
            <div className="space-y-3 pt-2">
              <h3 className="font-display font-semibold text-lg text-ink">
                Apa tindakan yang sebaiknya kamu ambil?
              </h3>

              <div className="space-y-3">
                {/* Choice A */}
                <button
                  type="button"
                  disabled={isSubmitting || answerResult !== null}
                  onClick={() => handleSelectChoice("a")}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 disabled:cursor-default ${
                    selectedChoice === "a"
                      ? answerResult
                        ? answerResult.is_correct
                          ? "bg-primary/10 border-primary shadow-xs ring-2 ring-primary/20"
                          : "bg-caution/15 border-caution shadow-xs ring-2 ring-caution/20"
                        : "bg-primary/10 border-primary"
                      : "bg-mist/40 hover:bg-mist border-muted/25"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl font-mono text-sm font-bold flex items-center justify-center shrink-0 ${
                      selectedChoice === "a"
                        ? answerResult
                          ? answerResult.is_correct
                            ? "bg-primary text-white"
                            : "bg-caution text-white"
                          : "bg-primary text-white"
                        : "bg-white text-ink border border-muted/25"
                    }`}
                  >
                    A
                  </span>
                  <span className="font-body text-base text-ink leading-relaxed pt-0.5 flex-1">
                    {currentScenario.choice_a}
                  </span>
                </button>

                {/* Choice B */}
                <button
                  type="button"
                  disabled={isSubmitting || answerResult !== null}
                  onClick={() => handleSelectChoice("b")}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 disabled:cursor-default ${
                    selectedChoice === "b"
                      ? answerResult
                        ? answerResult.is_correct
                          ? "bg-primary/10 border-primary shadow-xs ring-2 ring-primary/20"
                          : "bg-caution/15 border-caution shadow-xs ring-2 ring-caution/20"
                        : "bg-primary/10 border-primary"
                      : "bg-mist/40 hover:bg-mist border-muted/25"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl font-mono text-sm font-bold flex items-center justify-center shrink-0 ${
                      selectedChoice === "b"
                        ? answerResult
                          ? answerResult.is_correct
                            ? "bg-primary text-white"
                            : "bg-caution text-white"
                          : "bg-primary text-white"
                        : "bg-white text-ink border border-muted/25"
                    }`}
                  >
                    B
                  </span>
                  <span className="font-body text-base text-ink leading-relaxed pt-0.5 flex-1">
                    {currentScenario.choice_b}
                  </span>
                </button>
              </div>
            </div>

            {/* Non-judgmental Feedback & AI Pattern Explanation */}
            {answerResult && (
              <div className="space-y-4 pt-4 border-t border-muted/20 animate-in fade-in duration-300">
                <div
                  className={`p-5 rounded-2xl border ${
                    answerResult.is_correct
                      ? "bg-primary/10 border-primary/30 text-ink"
                      : "bg-caution/15 border-caution/40 text-ink"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {answerResult.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-caution" />
                    )}
                    <h4 className="font-display font-semibold text-lg text-ink">
                      {answerResult.is_correct
                        ? "Langkah Bijak & Tepat"
                        : "Catatan Pembelajaran & Refleksi"}
                    </h4>
                  </div>
                  <p className="font-body text-base text-ink/90 leading-relaxed">
                    {answerResult.is_correct
                      ? "Pilihan Anda sangat tepat! Menghentikan reaksi impulsif dan memverifikasi melalui jalur resmi adalah pertahanan paling ampuh."
                      : "Tidak apa-apa, modus penipuan ini memang sengaja dirancang untuk mengecoh dan memanfaatkan psikologi kita. Mari pelajari pola di balik kasus ini:"}
                  </p>
                </div>

                {/* Underlying AI Pattern Explanation */}
                <div className="p-5 bg-mist rounded-2xl border border-muted/30 space-y-1.5">
                  <h4 className="font-mono text-xs text-primary font-semibold uppercase tracking-wider">
                    [ ANALISIS POLA PENIPUAN AI & REKAYASA SOSIAL ]
                  </h4>
                  <p className="font-body text-base text-ink/90 leading-relaxed">
                    {answerResult.explanation}
                  </p>
                </div>

                {/* Continue button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 bg-primary text-white font-body font-medium text-base px-6 py-3.5 rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                  >
                    <span>
                      {completedIds.length < scenariosList.length
                        ? "Lanjut Skenario Berikutnya"
                        : "Selesaikan Simulasi"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
