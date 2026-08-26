"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Users,
  UserPlus,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  LogIn,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
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

  // Safe Word & Duress Code State (Server-Hashed, Zero-Leakage)
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

  // Fetch family members & safe word status for authenticated user
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
          getFamilyMembers(token).catch((err) => {
            console.warn("Gagal memuat anggota keluarga:", err);
            return [];
          }),
          getFamilySafeWord(token).catch((err) => {
            console.warn("Gagal memuat status kata sandi keluarga:", err);
            return { has_safe_word: false, has_duress_code: false, safe_word_updated_at: null };
          }),
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
    if (!newName.trim() || !newPhone.trim()) return;

    if (!token) {
      setErrorMessage("Silakan masuk ke akun Anda untuk menambahkan anggota keluarga.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await addFamilyMember(
        {
          member_name: newName.trim(),
          member_phone: newPhone.trim(),
          relation: newRelation,
        },
        token
      );

      setMembers([created, ...members]);
      setNewName("");
      setNewPhone("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    } catch (err: unknown) {
      console.error("Error adding family member:", err);
      const msg = err instanceof Error ? err.message : "Gagal menambahkan anggota keluarga.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSafeWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!inputSafeWord.trim()) {
      setSafeWordError("Kata sandi aman utama tidak boleh kosong.");
      return;
    }

    setIsSavingSafeWord(true);
    setSafeWordError(null);

    try {
      const updated = await updateFamilySafeWord(
        {
          safe_word: inputSafeWord.trim(),
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
      console.error("Error saving safe word:", err);
      const msg = err instanceof Error ? err.message : "Gagal menyimpan kata sandi aman keluarga.";
      setSafeWordError(msg);
    } finally {
      setIsSavingSafeWord(false);
    }
  };

  const handleVerifySafeWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !verifyCodeInput.trim()) return;

    setIsVerifyingCode(true);
    setVerifyError(null);
    setVerifyResult(null);

    try {
      const res = await verifyFamilySafeWord(verifyCodeInput.trim(), token);
      setVerifyResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal melakukan verifikasi kata sandi.";
      setVerifyError(msg);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10 sm:space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            Mode Pendamping & Pertahanan Keluarga
          </div>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
            Bantu jaga orang tersayang, tanpa mengawasi.
          </h1>
          <p className="font-body text-muted text-base sm:text-lg">
            Lindungi orang tua dan kerabat dari jeratan penipuan kloning suara AI dengan sistem Kata Kunci Rahasia dan pemantauan mandiri.
          </p>
        </div>

        {/* Unauthenticated Banner */}
        {status === "unauthenticated" && (
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-muted/20 shadow-sm text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20 shadow-xs">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="font-display font-semibold text-2xl text-ink">
                Masuk untuk Mengelola Keluarga
              </h2>
              <p className="font-body text-muted text-sm sm:text-base">
                Daftar anggota keluarga dan Kata Sandi Rahasia tersimpan secara terenkripsi khusus untuk akun Anda.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-body font-medium text-base px-6 py-3 rounded-xl shadow-xs transition-all w-full sm:w-auto"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </Link>
              <Link
                href="/daftar"
                className="inline-flex items-center justify-center gap-2 bg-mist hover:bg-mist/80 text-ink border border-muted/30 font-body font-medium text-base px-6 py-3 rounded-xl transition-all w-full sm:w-auto"
              >
                <span>Daftar Akun Baru</span>
              </Link>
            </div>
          </div>
        )}

        {/* Safe Word & Duress Code Defense Section */}
        {status === "authenticated" && (
          <div className="bg-white p-7 sm:p-10 rounded-3xl border border-muted/20 shadow-sm space-y-7">
            <div className="border-b border-muted/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="font-display font-semibold text-xl text-ink flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Benteng Pertahanan: Kata Kunci Rahasia Keluarga
                </h2>
                <p className="font-body text-xs text-muted">
                  Kunci verifikasi verbal manual saat anggota keluarga menerima telepon darurat mencurigakan.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                  Zero-Retention Hash (Bcrypt)
                </span>
              </div>
            </div>

            {/* Current Security Status Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-mist/60 border border-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-xs text-ink uppercase tracking-wider">
                      Kata Sandi Aman Utama
                    </div>
                    <div className="font-body text-xs text-muted">
                      {safeWordData.has_safe_word
                        ? "Aktif & Terenkripsi di Server"
                        : "Belum Dikonfigurasi"}
                    </div>
                  </div>
                </div>
                <span
                  className={`font-mono text-2xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    safeWordData.has_safe_word
                      ? "bg-primary/15 text-primary"
                      : "bg-muted/20 text-muted"
                  }`}
                >
                  {safeWordData.has_safe_word ? "Terlindungi" : "Kosong"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-mist/60 border border-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-caution/15 text-caution flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-xs text-ink uppercase tracking-wider">
                      Kode Darurat Sandera
                    </div>
                    <div className="font-body text-xs text-muted">
                      {safeWordData.has_duress_code
                        ? "Aktif & Terenkripsi di Server"
                        : "Opsional / Belum Diatur"}
                    </div>
                  </div>
                </div>
                <span
                  className={`font-mono text-2xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    safeWordData.has_duress_code
                      ? "bg-caution/20 text-caution"
                      : "bg-muted/20 text-muted"
                  }`}
                >
                  {safeWordData.has_duress_code ? "Siaga" : "Belum Diatur"}
                </span>
              </div>
            </div>

            {/* Form Setup / Update Kata Sandi */}
            <form onSubmit={handleSaveSafeWord} className="space-y-5 pt-1 border-t border-muted/15">
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-base text-ink">
                  {safeWordData.has_safe_word ? "Perbarui Kata Kunci Keluarga" : "Atur Kata Kunci Keluarga Baru"}
                </h3>
                <p className="font-body text-xs text-muted">
                  Kata sandi di-hash secara satu arah (*bcrypt salt*) di backend. Kode rahasia Anda tidak pernah disimpan dalam bentuk teks biasa dan tidak dapat dibaca oleh siapa pun.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. Primary Safe Word Input */}
                <div className="p-5 rounded-2xl bg-mist/40 border border-muted/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-sm text-ink">
                        1. Kata Sandi Aman Utama (Safe Word)
                      </h4>
                      <p className="font-body text-2xs text-muted">
                        Dipakai untuk memastikan identitas asli saat telepon darurat.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type={showSafeWord ? "text" : "password"}
                      required
                      placeholder="Masukkan kata sandi rahasia baru"
                      value={inputSafeWord}
                      onChange={(e) => setInputSafeWord(e.target.value)}
                      className="w-full p-3 pr-10 rounded-xl border border-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white text-ink font-body text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSafeWord(!showSafeWord)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                    >
                      {showSafeWord ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="font-body text-2xs text-muted">
                    💡 Contoh: *KucingBelang123*, *MartabakManis*. Beritahu hanya kepada keluarga inti secara langsung.
                  </p>
                </div>

                {/* 2. Secondary Duress Code Input */}
                <div className="p-5 rounded-2xl bg-caution/10 border border-caution/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-caution/20 text-caution flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-sm text-ink">
                        2. Kode Darurat Sandera (Duress Code)
                      </h4>
                      <p className="font-body text-2xs text-muted">
                        Dipakai jika dipaksa/diancam untuk memberi sinyal bahaya rahasia.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type={showDuressCode ? "text" : "password"}
                      placeholder="Opsional: Kata sinyal bahaya (misal: MerakBiru)"
                      value={inputDuressCode}
                      onChange={(e) => setInputDuressCode(e.target.value)}
                      className="w-full p-3 pr-10 rounded-xl border border-muted/30 focus:border-caution focus:ring-2 focus:ring-caution/20 bg-white text-ink font-body text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDuressCode(!showDuressCode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
                    >
                      {showDuressCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="font-body text-2xs text-muted">
                    ⚠️ Jika penelepon mengucapkan kode ini, artinya ia sedang dalam bahaya/ancaman!
                  </p>
                </div>
              </div>

              {safeWordSuccess && (
                <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl text-primary font-body text-sm flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4" />
                  Kata Kunci Rahasia dan Kode Darurat berhasil di-hash dan disimpan dengan aman ke basis data!
                </div>
              )}

              {safeWordError && (
                <div className="p-3.5 bg-caution/15 border border-caution/40 rounded-xl text-ink font-body text-sm flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-caution" />
                  {safeWordError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSafeWord}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-body font-medium text-sm rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-2"
                >
                  {isSavingSafeWord && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSavingSafeWord ? "Menyimpan Hash..." : "Simpan Kata Sandi Keluarga"}</span>
                </button>
              </div>
            </form>

            {/* Zero-Leakage Verification Interactive Tester */}
            {safeWordData.has_safe_word && (
              <div className="p-6 rounded-2xl bg-mist/50 border border-primary/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-display font-semibold text-sm text-ink flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Uji Kecocokan Kata Sandi (Zero-Leakage Verifier)
                    </h4>
                    <p className="font-body text-2xs text-muted">
                      Uji coba apakah ucapan kata sandi cocok dengan hash di server tanpa mengekspos kata sandi aslinya.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleVerifySafeWord} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Ketik kata sandi untuk diuji..."
                    value={verifyCodeInput}
                    onChange={(e) => setVerifyCodeInput(e.target.value)}
                    className="flex-1 p-3 rounded-xl border border-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white text-ink font-body text-sm outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isVerifyingCode || !verifyCodeInput.trim()}
                    className="px-5 py-3 bg-ink hover:bg-ink/90 text-white font-body font-medium text-sm rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                  >
                    {isVerifyingCode && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Uji Kecocokan</span>
                  </button>
                </form>

                {verifyResult && (
                  <div
                    className={`p-3.5 rounded-xl border font-body text-xs sm:text-sm flex items-center gap-2 animate-in fade-in ${
                      verifyResult.is_match
                        ? verifyResult.matched_type === "duress_code"
                          ? "bg-caution/15 border-caution/40 text-caution font-semibold"
                          : "bg-primary/10 border-primary/30 text-primary font-medium"
                        : "bg-muted/15 border-muted/30 text-ink/80"
                    }`}
                  >
                    {verifyResult.is_match ? (
                      <CheckCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{verifyResult.message}</span>
                  </div>
                )}

                {verifyError && (
                  <div className="p-3.5 bg-caution/15 border border-caution/40 rounded-xl text-ink font-body text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-caution" />
                    <span>{verifyError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Form Tambah Anggota (Only when authenticated) */}
        {status === "authenticated" && (
          <div className="bg-white p-7 sm:p-10 rounded-3xl border border-muted/20 shadow-sm space-y-6">
            <div className="border-b border-muted/20 pb-4 flex items-center justify-between">
              <h2 className="font-display font-semibold text-xl text-ink flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Daftarkan Anggota Keluarga Baru
              </h2>
              <span className="font-mono text-xs text-primary font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Khusus Akun: {session?.user?.name || session?.user?.email}
              </span>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-body font-medium text-sm text-ink block">
                    Nama Lengkap / Panggilan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ibu Siti, Kakek Wardiman"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-mist/40 text-ink font-body text-base placeholder:text-muted/60 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-body font-medium text-sm text-ink block">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 0812-3456-7890"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-mist/40 text-ink font-body text-base placeholder:text-muted/60 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Note Kebijakan Privasi */}
              <div className="p-4 bg-mist rounded-xl border border-muted/30 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="font-body text-xs sm:text-sm text-ink/80 leading-relaxed">
                  <strong>Prinsip Privasi Waskita:</strong> Kami tidak pernah menyadap, merekam, atau membaca isi percakapan. Data keluarga terikat secara privat pada akun Anda.
                </p>
              </div>

              {showSuccess && (
                <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl text-primary font-body text-sm flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4" />
                  Anggota keluarga berhasil tersimpan di basis data akun Anda!
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 bg-caution/15 border border-caution/40 rounded-xl text-ink font-body text-sm flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-caution" />
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-white font-body font-medium text-base rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Tambahkan ke Pendamping</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Daftar Anggota Keluarga Aktif */}
        {status === "authenticated" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-muted/20 pb-3">
              <h3 className="font-display font-semibold text-xl text-ink">
                Keluarga yang Sedang Dilindungi ({members.length})
              </h3>
              <span className="font-mono text-xs text-muted">Tersimpan di Database</span>
            </div>

            {loading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                <p className="font-mono text-xs text-muted">Memuat data dari database...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-muted/20 text-center space-y-2">
                <p className="font-body text-muted text-base">
                  Belum ada anggota keluarga yang didaftarkan pada akun ini.
                </p>
                <p className="font-body text-xs text-muted">
                  Gunakan formulir di atas untuk menambahkan kerabat yang ingin Anda dampingi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white p-6 rounded-2xl border border-muted/20 shadow-2xs space-y-4 hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-display font-semibold text-lg text-ink">
                          {member.member_name}
                        </h4>
                        <p className="font-mono text-xs text-muted">
                          {member.member_phone}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        {member.status}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-muted/15 flex items-center justify-between text-xs font-body text-muted">
                      <span>ID Anggota: #{member.id}</span>
                      <span className="font-mono">
                        {new Date(member.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
