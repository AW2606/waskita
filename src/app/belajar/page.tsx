"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faCircleCheck,
  faTriangleExclamation,
  faArrowRight,
  faRotateRight,
  faShieldHalved,
  faCircleNotch,
} from "@fortawesome/free-solid-svg-icons";
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
        setErrorMessage("Gagal memuat skenario simulasi dari basis data.");
      } finally {
        setIsLoading(false);
      }
    }
    loadInitial();
  }, []);

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

  const handleSelectChoice = async (choice: "a" | "b") => {
    if (!currentScenario || isSubmitting || answerResult) return;

    setSelectedChoice(choice);
    setIsSubmitting(true);
    try {
      const res = await answerScenario(currentScenario.id, choice);
      setAnswerResult(res);

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

  const handleNext = async () => {
    if (!scenariosList || scenariosList.length === 0) return;

    const currentIndex = scenariosList.findIndex((s) => s.id === currentScenario?.id);
    if (currentIndex >= 0 && currentIndex < scenariosList.length - 1) {
      const nextId = scenariosList[currentIndex + 1].id;
      await handleLoadScenario(nextId);
    } else {
      setIsCompletedAll(true);
    }
  };

  const handleRestart = async () => {
    setIsCompletedAll(false);
    setCompletedIds([]);
    if (scenariosList.length > 0) {
      await handleLoadScenario(scenariosList[0].id);
    }
  };

  // Safe extractors for fields from either backend schema or offline schema
  const narrativeText =
    currentScenario?.narrative ||
    (currentScenario as unknown as { description?: string })?.description ||
    "";
  const optionAText =
    currentScenario?.choice_a ||
    (currentScenario as unknown as { option_a?: string })?.option_a ||
    "";
  const optionBText =
    currentScenario?.choice_b ||
    (currentScenario as unknown as { option_b?: string })?.option_b ||
    "";

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink relative overflow-x-clip">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10 relative z-10">
        
        {/* Header Summary */}
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold uppercase border-b border-muted/15 pb-4">
            <FontAwesomeIcon icon={faGraduationCap} className="w-3.5 h-3.5" />
            <span>MODUL EDUKASI INTERAKTIF // SIMULASI SKENARIO AI</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
              Latihan Kepekaan Modus AI
            </h1>
            <p className="font-body text-muted text-base sm:text-lg max-w-2xl leading-relaxed">
              Uji kesiapan dan ketenangan Anda saat menghadapi skenario penipuan digital terkini (kloning suara, video deepfake, dan manipulasi kepanikan).
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center space-y-3">
            <FontAwesomeIcon icon={faCircleNotch} className="w-8 h-8 text-primary animate-spin" />
            <p className="font-body text-muted text-sm">Memuat skenario interaktif...</p>
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-caution/10 text-caution border border-caution/20 text-sm font-body font-bold">
            {errorMessage}
          </div>
        )}

        {/* Completed All Screen */}
        {!isLoading && isCompletedAll && (
          <div className="p-8 sm:p-12 rounded-3xl bg-white/80 dark:bg-[#101D19]/80 backdrop-blur-xl border border-muted/20 text-center space-y-6 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <FontAwesomeIcon icon={faCircleCheck} className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="font-display font-bold text-3xl text-ink">
                Simulasi Selesai!
              </h2>
              <p className="font-body text-muted text-base leading-relaxed">
                Anda telah menyelesaikan seluruh skenario edukasi. Latihan ini membekali naluri Anda untuk selalu tenang dan memverifikasi sebelum bertindak.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-body font-bold text-base shadow-xs hover:bg-primary/90 transition-opacity cursor-pointer"
              >
                <FontAwesomeIcon icon={faRotateRight} className="w-4 h-4" />
                <span>Ulangi Simulasi</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Scenario Card */}
        {!isLoading && !isCompletedAll && currentScenario && (
          <div className="p-7 sm:p-10 rounded-3xl bg-white/80 dark:bg-[#101D19]/80 backdrop-blur-xl border border-muted/20 space-y-7 text-left shadow-xs">
            
            {/* Scenario Header Bar */}
            <div className="flex items-center justify-between border-b border-muted/15 pb-4">
              <div className="space-y-0.5">
                <span className="font-mono text-xs text-primary font-bold uppercase">
                  SKENARIO {currentScenario.id} DARI {scenariosList.length}
                </span>
                <h2 className="font-display font-bold text-2xl text-ink">
                  {currentScenario.title}
                </h2>
              </div>
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-mist dark:bg-white/5 border border-muted/20 text-muted">
                SIMULASI
              </span>
            </div>

            {/* Realistic Scenario Message Bubble */}
            <div className="p-5 rounded-2xl bg-mist dark:bg-black/30 border border-muted/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-muted">
                <span className="font-bold text-primary">SUMBER KOMUNIKASI:</span>
                <span>STATUS: MENDESAK</span>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-[#13221E] border border-muted/15 text-sm sm:text-base font-body text-ink space-y-2">
                <p className="leading-relaxed italic">
                  "{narrativeText}"
                </p>
              </div>
            </div>

            {/* Decision Choices */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base text-ink">
                Pilih Respon Tindakan Anda:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option A */}
                <button
                  type="button"
                  disabled={isSubmitting || answerResult !== null}
                  onClick={() => handleSelectChoice("a")}
                  className={`p-5 rounded-2xl text-left border transition-all cursor-pointer ${
                    selectedChoice === "a"
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-mist/60 dark:bg-white/[0.02] border-muted/20 hover:border-primary/40 text-ink"
                  } disabled:cursor-not-allowed`}
                >
                  <span className="font-mono text-xs font-bold block mb-1 opacity-75">
                    OPSI A
                  </span>
                  <span className="font-body text-sm font-semibold leading-relaxed block">
                    {optionAText}
                  </span>
                </button>

                {/* Option B */}
                <button
                  type="button"
                  disabled={isSubmitting || answerResult !== null}
                  onClick={() => handleSelectChoice("b")}
                  className={`p-5 rounded-2xl text-left border transition-all cursor-pointer ${
                    selectedChoice === "b"
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-mist/60 dark:bg-white/[0.02] border-muted/20 hover:border-primary/40 text-ink"
                  } disabled:cursor-not-allowed`}
                >
                  <span className="font-mono text-xs font-bold block mb-1 opacity-75">
                    OPSI B
                  </span>
                  <span className="font-body text-sm font-semibold leading-relaxed block">
                    {optionBText}
                  </span>
                </button>

              </div>
            </div>

            {/* Answer Result & Pedagogical Debrief */}
            {answerResult && (
              <div className="p-6 rounded-2xl bg-mist/80 dark:bg-white/[0.03] border border-muted/20 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={answerResult.is_correct ? faCircleCheck : faTriangleExclamation}
                    className={`w-5 h-5 ${answerResult.is_correct ? "text-primary" : "text-caution"}`}
                  />
                  <h4 className="font-display font-bold text-lg text-ink">
                    {answerResult.is_correct ? "Langkah Tepat & Aman!" : "Perlu Lebih Waspada"}
                  </h4>
                </div>

                <p className="font-body text-sm sm:text-base text-ink/90 leading-relaxed">
                  {answerResult.explanation}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-body font-bold text-sm shadow-xs hover:bg-primary/90 transition-opacity cursor-pointer"
                  >
                    <span>Lanjut ke Skenario Berikutnya</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
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
