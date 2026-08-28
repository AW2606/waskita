"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faArrowRight,
  faCircleCheck,
  faExclamationCircle,
  faKey,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { AuthLayoutCard } from "@/components/auth/AuthLayoutCard";
import { getSecurityQuestion, resetPasswordWithSecurityAnswer } from "@/lib/api";

export default function LupaSandiPage() {
  const router = useRouter();
  
  // Step 1: Email Lookup -> Step 2: Answer & Reset -> Step 3: Success
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Cari Pertanyaan Keamanan
  const handleLookupEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await getSecurityQuestion(email);
      setSecurityQuestion(res.security_question);
      setStep(2);
    } catch (err: unknown) {
      console.error("Lookup error:", err);
      let msg = "Akun tidak ditemukan atau belum mengatur pertanyaan keamanan.";
      if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verifikasi Jawaban & Set Password Baru
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordWithSecurityAnswer({
        email,
        security_answer: securityAnswer,
        new_password: newPassword,
      });

      setStep(3);
    } catch (err: unknown) {
      console.error("Reset error:", err);
      let msg = "Jawaban pertanyaan keamanan salah. Silakan coba kembali.";
      if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayoutCard title="Reset Password">
      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-[#E85D4E]/15 border border-[#E85D4E]/30 text-[#FFB2A8] text-xs flex items-center gap-2.5 animate-in fade-in">
          <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 text-[#FF8E80] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* =========================================================
          STEP 1: EMAIL LOOKUP
          ========================================================= */}
      {step === 1 && (
        <form onSubmit={handleLookupEmail} className="space-y-4 animate-in fade-in">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-[#D4E8E1] tracking-wide">
              Masukkan Alamat Email Terdaftar
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              className="w-full px-5 py-3.5 rounded-full bg-[#0D241D]/90 border border-white/15 text-white placeholder-white/30 text-sm focus:border-[#4EA699] focus:ring-2 focus:ring-[#4EA699]/30 outline-none transition-all shadow-inner"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full bg-[#4E9B8F] hover:bg-[#5CB4A6] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(78,155,143,0.35)] hover:shadow-[0_6px_22px_rgba(78,155,143,0.5)] transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} className="w-4 h-4 animate-spin" />
                  <span>Mencari Akun...</span>
                </>
              ) : (
                <>
                  <span>Lanjutkan Pemulihan</span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* =========================================================
          STEP 2: ANSWER SECURITY QUESTION & SET NEW PASSWORD
          ========================================================= */}
      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-3.5 animate-in fade-in">
          {/* Question Display Card */}
          <div className="p-3.5 rounded-2xl bg-[#0D241D]/90 border border-[#4EA699]/40 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-[#54B7A5] text-[11px] font-bold uppercase tracking-wider">
              <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3" />
              <span>Pertanyaan Keamanan Anda:</span>
            </div>
            <p className="text-white text-xs sm:text-sm font-semibold">
              &quot;{securityQuestion}&quot;
            </p>
          </div>

          {/* Security Answer Field */}
          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold text-[#D4E8E1] tracking-wide">
              Jawaban Keamanan
            </label>
            <input
              type="text"
              required
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              placeholder="Masukkan jawaban pemulihan"
              className="w-full px-5 py-2.5 rounded-full bg-[#0D241D]/90 border border-white/15 text-white placeholder-white/30 text-sm focus:border-[#4EA699] focus:ring-2 focus:ring-[#4EA699]/30 outline-none transition-all shadow-inner"
            />
          </div>

          {/* New Password Field */}
          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold text-[#D4E8E1] tracking-wide">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 karakter"
              className="w-full px-5 py-2.5 rounded-full bg-[#0D241D]/90 border border-white/15 text-white placeholder-white/30 text-sm focus:border-[#4EA699] focus:ring-2 focus:ring-[#4EA699]/30 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Confirm New Password Field */}
          <div className="space-y-1 text-left">
            <label className="block text-xs font-semibold text-[#D4E8E1] tracking-wide">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              className="w-full px-5 py-2.5 rounded-full bg-[#0D241D]/90 border border-white/15 text-white placeholder-white/30 text-sm focus:border-[#4EA699] focus:ring-2 focus:ring-[#4EA699]/30 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full bg-[#4EA699] hover:bg-[#5CB4A6] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(78,155,143,0.35)] hover:shadow-[0_6px_22px_rgba(78,155,143,0.5)] transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} className="w-4 h-4 animate-spin" />
                  <span>Memperbarui Sandi...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faKey} className="w-3.5 h-3.5" />
                  <span>Simpan Kata Sandi Baru</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* =========================================================
          STEP 3: SUCCESS STATE
          ========================================================= */}
      {step === 3 && (
        <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-[#38A189]/20 border border-[#38A189]/40 text-[#4EE3C1] mx-auto flex items-center justify-center">
            <FontAwesomeIcon icon={faCircleCheck} className="w-7 h-7 text-[#4EE3C1]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">
              Kata Sandi Berhasil Diperbarui!
            </h2>
            <p className="text-xs text-[#9DC4B9] max-w-xs mx-auto">
              Akun Anda telah diamankan. Silakan masuk menggunakan kata sandi baru.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full py-3.5 px-6 rounded-full bg-[#4E9B8F] hover:bg-[#5CB4A6] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(78,155,143,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Masuk Sekarang</span>
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Switch to Login Link */}
      <div className="text-center pt-2 text-xs text-[#9DC4B9]">
        Ingat kata sandi Anda?{" "}
        <Link
          href="/login"
          className="text-[#54B7A5] hover:text-white font-semibold underline underline-offset-2 transition-colors"
        >
          Masuk ke Akun
        </Link>
      </div>
    </AuthLayoutCard>
  );
}
