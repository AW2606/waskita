"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faUserPlus,
  faLock,
  faKey,
  faShieldHalved,
  faCircleCheck,
  faTriangleExclamation,
  faEye,
  faEyeSlash,
  faCircleNotch,
  faPhone,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  getFamilyMembers,
  addFamilyMember,
  getFamilySafeWord,
  updateFamilySafeWord,
  verifyFamilySafeWord,
  FamilyMemberData,
  SafeWordData,
  SafeWordVerifyResponse,
} from "@/lib/api";

export default function KeluargaPage() {
  const { data: session, status } = useSession();
  const [members, setMembers] = useState<FamilyMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Member Form State
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelation, setNewRelation] = useState("Keluarga");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Safe Word & Duress Code State
  const [safeWordData, setSafeWordData] = useState<SafeWordData>({
    has_safe_word: false,
    has_duress_code: false,
  });
  const [inputSafeWord, setInputSafeWord] = useState("");
  const [inputDuressCode, setInputDuressCode] = useState("");
  const [showSafeWord, setShowSafeWord] = useState(false);
  const [showDuressCode, setShowDuressCode] = useState(false);
  const [isSavingSafeWord, setIsSavingSafeWord] = useState(false);
  const [safeWordSuccess, setSafeWordSuccess] = useState(false);
  const [safeWordError, setSafeWordError] = useState<string | null>(null);

  // Safe Word Verification Test State
  const [verifyCodeInput, setVerifyCodeInput] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verifyResult, setVerifyResult] = useState<SafeWordVerifyResponse | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const token = (session as unknown as { accessToken?: string })?.accessToken;

  useEffect(() => {
    async function loadData() {
      if (status === "loading") return;

      if (status === "unauthenticated" || !token) {
        setLoading(false);
        setMembers([]);
        return;
      }

      try {
        setLoading(true);
        const [membersData, swData] = await Promise.all([
          getFamilyMembers(token).catch(() => []),
          getFamilySafeWord(token).catch(() => ({ has_safe_word: false, has_duress_code: false, safe_word_updated_at: null })),
        ]);

        setMembers(membersData);
        if (swData) {
          setSafeWordData(swData);
        }
      } catch (err) {
        console.error("Error fetching family data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [status, token]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setShowSuccess(false);

    try {
      const added = await addFamilyMember(
        {
          name: newName,
          phone_number: newPhone,
          relation: newRelation,
        },
        token
      );
      setMembers((prev) => [added, ...prev]);
      setNewName("");
      setNewPhone("");
      setNewRelation("Keluarga");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal menambahkan anggota keluarga.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSafeWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!inputSafeWord.trim() && !inputDuressCode.trim()) {
      setSafeWordError("Silakan masukkan kata sandi utama atau kode darurat.");
      return;
    }

    setIsSavingSafeWord(true);
    setSafeWordError(null);
    setSafeWordSuccess(false);

    try {
      const updated = await updateFamilySafeWord(
        {
          safe_word: inputSafeWord.trim() || undefined,
          duress_code: inputDuressCode.trim() || undefined,
        },
        token
      );
      setSafeWordData(updated);
      setInputSafeWord("");
      setInputDuressCode("");
      setSafeWordSuccess(true);
      setTimeout(() => setSafeWordSuccess(false), 4000);
    } catch (err: unknown) {
      setSafeWordError(err instanceof Error ? err.message : "Gagal memperbarui kata sandi keluarga.");
    } finally {
      setIsSavingSafeWord(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !verifyCodeInput.trim()) return;

    setIsVerifyingCode(true);
    setVerifyError(null);
    setVerifyResult(null);

    try {
      const res = await verifyFamilySafeWord(verifyCodeInput.trim(), token);
      setVerifyResult(res);
    } catch (err: unknown) {
      setVerifyError(err instanceof Error ? err.message : "Gagal memverifikasi kode.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink relative overflow-x-clip">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-12 relative z-10">
        
        {/* Header Summary */}
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold uppercase border-b border-muted/15 pb-4">
            <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" />
            <span>RUANG LINDUNG KELUARGA // BEBAS SADAP & PRIVAT</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
              Pendampingan Keluarga
            </h1>
            <p className="font-body text-muted text-base sm:text-lg max-w-2xl leading-relaxed">
              Lindungi orang tua dan kerabat dari ancaman panggilan panik suara tiruan AI menggunakan protokol kata sandi rahasia keluarga tanpa pernah mengintip privasi komunikasi mereka.
            </p>
          </div>
        </div>

        {/* Unauthenticated View */}
        {status === "unauthenticated" && (
          <div className="p-8 sm:p-12 rounded-3xl bg-white/80 dark:bg-[#101D19]/80 backdrop-blur-xl border border-muted/20 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <FontAwesomeIcon icon={faLock} className="w-6 h-6" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="font-display font-bold text-2xl text-ink">
                Masuk untuk Mengelola Ruang Keluarga
              </h2>
              <p className="font-body text-muted text-sm sm:text-base leading-relaxed">
                Fitur ini membutuhkan autentikasi akun terverifikasi agar kata sandi keluarga terenkripsi dengan aman.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-body font-bold text-base shadow-xs hover:bg-primary/90 transition-opacity"
              >
                <span>Masuk Akun</span>
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Authenticated Dashboard */}
        {status === "authenticated" && (
          <div className="space-y-10">
            
            {/* Safe Word & Duress Vault Card */}
            <div className="p-7 sm:p-10 rounded-3xl bg-white/80 dark:bg-[#101D19]/80 backdrop-blur-xl border border-muted/20 space-y-6 text-left shadow-xs">
              <div className="flex items-center justify-between border-b border-muted/15 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold font-mono text-xs uppercase">
                    <FontAwesomeIcon icon={faKey} className="w-3.5 h-3.5" />
                    <span>PROTOKOL BRANKAS KATA SANDI</span>
                  </div>
                  <h2 className="font-display font-bold text-2xl text-ink">
                    Kata Sandi Rahasia Keluarga (Safe Word)
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                      safeWordData.has_safe_word
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-caution/10 text-caution border border-caution/20"
                    }`}
                  >
                    {safeWordData.has_safe_word ? "Brankas Aktif" : "Belum Diatur"}
                  </span>
                </div>
              </div>

              <p className="font-body text-muted text-sm leading-relaxed">
                Kata sandi ini di-<em>hash</em> menggunakan algoritma kriptografi satu arah di server (zero-leakage). Penelepon penipu yang menirukan suara AI tidak akan pernah mengetahui kode rahasia ini.
              </p>

              {safeWordSuccess && (
                <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 text-xs font-body font-bold flex items-center gap-2">
                  <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4" />
                  <span>Kata sandi rahasia keluarga berhasil diperbarui dan dienkripsi!</span>
                </div>
              )}

              {safeWordError && (
                <div className="p-4 rounded-2xl bg-caution/10 text-caution border border-caution/20 text-xs font-body font-bold">
                  {safeWordError}
                </div>
              )}

              <form onSubmit={handleSaveSafeWord} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-body text-xs font-bold text-ink block">
                    Kata Sandi Rahasia Utama
                  </label>
                  <div className="relative">
                    <input
                      type={showSafeWord ? "text" : "password"}
                      value={inputSafeWord}
                      onChange={(e) => setInputSafeWord(e.target.value)}
                      placeholder="Contoh: Kucing Merah 42"
                      className="w-full px-4 py-3 rounded-xl bg-mist dark:bg-black/30 border border-muted/25 text-ink font-body text-sm outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSafeWord(!showSafeWord)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                    >
                      <FontAwesomeIcon icon={showSafeWord ? faEyeSlash : faEye} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-body text-xs font-bold text-ink block">
                    Kode Bahaya Senyap (Duress Code)
                  </label>
                  <div className="relative">
                    <input
                      type={showDuressCode ? "text" : "password"}
                      value={inputDuressCode}
                      onChange={(e) => setInputDuressCode(e.target.value)}
                      placeholder="Contoh: Dompet Ketinggalan"
                      className="w-full px-4 py-3 rounded-xl bg-mist dark:bg-black/30 border border-muted/25 text-ink font-body text-sm outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDuressCode(!showDuressCode)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                    >
                      <FontAwesomeIcon icon={showDuressCode ? faEyeSlash : faEye} className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSafeWord}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-body font-bold text-sm shadow-xs hover:bg-primary/90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {isSavingSafeWord ? (
                      <>
                        <FontAwesomeIcon icon={faCircleNotch} className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan ke Brankas...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5" />
                        <span>Simpan Kata Sandi Keluarga</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Simulation Verification Test Box */}
              {safeWordData.has_safe_word && (
                <div className="mt-4 pt-6 border-t border-muted/15 space-y-3">
                  <h3 className="font-display font-bold text-sm text-ink">
                    Uji Simulasi Panggilan Darurat:
                  </h3>
                  <form onSubmit={handleVerifyCode} className="flex gap-3">
                    <input
                      type="text"
                      value={verifyCodeInput}
                      onChange={(e) => setVerifyCodeInput(e.target.value)}
                      placeholder="Ketik kata sandi untuk menguji kecocokan..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-mist dark:bg-black/30 border border-muted/25 text-ink font-body text-xs outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      disabled={isVerifyingCode || !verifyCodeInput.trim()}
                      className="px-5 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-primary/10 text-ink hover:text-primary border border-muted/20 text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingCode ? "Menguji..." : "Uji Verifikasi"}
                    </button>
                  </form>

                  {verifyResult && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-body font-bold flex items-center gap-2 ${
                        verifyResult.status === "valid_safe_word"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : verifyResult.status === "valid_duress_code"
                          ? "bg-caution/10 text-caution border border-caution/20"
                          : "bg-muted/15 text-muted border border-muted/20"
                      }`}
                    >
                      <FontAwesomeIcon icon={verifyResult.status === "valid_safe_word" ? faCircleCheck : faTriangleExclamation} className="w-4 h-4" />
                      <span>{verifyResult.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Family Members Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Add Member Form (5 Cols) */}
              <div className="lg:col-span-5 p-7 rounded-3xl bg-white/80 dark:bg-[#101D19]/80 backdrop-blur-xl border border-muted/20 space-y-5 text-left shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary font-bold font-mono text-xs uppercase">
                    <FontAwesomeIcon icon={faUserPlus} className="w-3.5 h-3.5" />
                    <span>TAMBAH ANGGOTA</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-ink">
                    Daftarkan Kontak Keluarga
                  </h3>
                </div>

                {showSuccess && (
                  <div className="p-3.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-body font-bold flex items-center gap-2">
                    <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4" />
                    <span>Anggota keluarga berhasil ditambahkan!</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-caution/10 text-caution border border-caution/20 text-xs font-body font-bold">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleAddMember} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="font-body text-xs font-semibold text-ink block">
                      Nama Anggota
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Contoh: Ibu Siti"
                      className="w-full px-4 py-2.5 rounded-xl bg-mist dark:bg-black/30 border border-muted/25 text-ink font-body text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-body text-xs font-semibold text-ink block">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full px-4 py-2.5 rounded-xl bg-mist dark:bg-black/30 border border-muted/25 text-ink font-mono text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-body text-xs font-semibold text-ink block">
                      Hubungan
                    </label>
                    <select
                      value={newRelation}
                      onChange={(e) => setNewRelation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-mist dark:bg-[#101D19] border border-muted/25 text-ink font-body text-sm outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Anak">Anak</option>
                      <option value="Pasangan">Pasangan</option>
                      <option value="Kerabat">Kerabat</option>
                      <option value="Keluarga">Keluarga</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-primary text-white font-body font-bold text-sm shadow-xs hover:bg-primary/90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Menambahkan..." : "Tambah ke Daftar Kontak"}
                  </button>
                </form>
              </div>

              {/* Members List (7 Cols) */}
              <div className="lg:col-span-7 p-7 rounded-3xl bg-white/80 dark:bg-[#101D19]/80 backdrop-blur-xl border border-muted/20 space-y-5 text-left shadow-xs">
                <div className="flex items-center justify-between border-b border-muted/15 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="font-display font-bold text-xl text-ink">
                      Daftar Anggota Terlindungi
                    </h3>
                    <p className="font-body text-xs text-muted">
                      {members.length} anggota keluarga terdaftar dalam jaringan proteksi.
                    </p>
                  </div>
                </div>

                {members.length === 0 ? (
                  <div className="py-12 text-center text-muted font-body text-sm space-y-2">
                    <p>Belum ada anggota keluarga yang didaftarkan.</p>
                    <p className="text-xs">Gunakan formulir di samping untuk mendaftarkan kontak orang tua atau anak.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 rounded-2xl bg-mist/60 dark:bg-white/[0.02] border border-muted/15 flex items-center justify-between gap-4"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-bold text-base text-ink">
                              {member.name}
                            </h4>
                            <span className="font-mono text-2xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase">
                              {member.relation}
                            </span>
                          </div>
                          <p className="font-mono text-xs text-muted flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faPhone} className="w-3 h-3" />
                            <span>{member.phone_number}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-mono text-primary font-bold">
                          <FontAwesomeIcon icon={faCircleCheck} className="w-3.5 h-3.5" />
                          <span>Terlindungi</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
