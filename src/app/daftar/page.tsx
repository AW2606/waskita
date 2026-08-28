"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faArrowRight,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { AuthLayoutCard } from "@/components/auth/AuthLayoutCard";
import { registerUser } from "@/lib/api";

const SECURITY_QUESTIONS = [
  "Apa nama hewan peliharaan pertama Anda?",
  "Di kota mana orang tua Anda pertama kali bertemu?",
  "Apa nama sekolah dasar pertama Anda?",
  "Apa makanan favorit masa kecil Anda?",
  "Apa nama jalan tempat tinggal masa kecil Anda?",
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter.");
      return;
    }

    if (!securityAnswer.trim()) {
      setErrorMessage("Harap isi jawaban pertanyaan pemulihan keamanan.");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        name,
        email,
        password,
        security_question: securityQuestion,
        security_answer: securityAnswer,
      });

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!signInRes || signInRes.error) {
        router.push("/login");
      } else {
        router.push("/verifikasi");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      let msg = "Terjadi kesalahan saat mendaftar.";
      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
          msg = "Tidak dapat terhubung ke server backend FastAPI.";
        } else {
          msg = err.message;
        }
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayoutCard title="Register">
      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-[#E85D4E]/15 border border-[#E85D4E]/30 text-[#FFB2A8] text-xs flex items-center gap-2.5 animate-in fade-in">
          <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 text-[#FF8E80] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name Field */}
        <div className="space-y-1 text-left">
          <label className="block text-xs font-semibold text-[#D4E8E1] tracking-wide">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-5 py-2.5 rounded-full bg-[#0D241D]/90 border border-white/15 text-white placeholder-white/30 text-sm focus:border-[#4EA699] focus:ring-2 focus:ring-[#4EA699]/30 outline-none transition-all shadow-inner"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-1 text-left">
          <label className="block text-xs font-semibold text-[#D4E8E1] tracking-wide">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-5 py-2.5 rounded-full bg-[#0D241D]/90 border border-white/15 text-white placeholder-white/30 text-sm focus:border-[#4EA699] focus:ring-2 focus:ring-[#4EA699]/30 outline-none transition-all shadow-inner"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1 text-left">
          <label className="block text-xs font-semibold text-[#D4E8E1] tracking-wide">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            className="w-full px-5 py-2.5 rounded-full bg-[#0D241D]/90 border border-white/15 text-white placeholder-white/30 text-sm focus:border-[#4EA699] focus:ring-2 focus:ring-[#4EA699]/30 outline-none transition-all shadow-inner"
          />
        </div>

        {/* Security Backup Question (Pertanyaan Pemulihan) */}
        <div className="space-y-1 text-left pt-1">
          <label className="block text-xs font-semibold text-[#D4E8E1] tracking-wide">
            Pertanyaan Keamanan (Pemulihan Sandi)
          </label>
          <select
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full bg-[#0D241D]/90 border border-white/15 text-white text-xs sm:text-sm focus:border-[#4EA699] focus:ring-2 focus:ring-[#4EA699]/30 outline-none transition-all cursor-pointer"
          >
            {SECURITY_QUESTIONS.map((q, idx) => (
              <option key={idx} value={q} className="bg-[#143229] text-white">
                {q}
              </option>
            ))}
          </select>
        </div>

        {/* Security Answer Field */}
        <div className="space-y-1 text-left">
          <input
            type="text"
            required
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            placeholder="Jawaban pemulihan Anda"
            className="w-full px-5 py-2.5 rounded-full bg-[#0D241D]/90 border border-white/15 text-white placeholder-white/30 text-sm focus:border-[#4EA699] focus:ring-2 focus:ring-[#4EA699]/30 outline-none transition-all shadow-inner"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-full bg-[#4E9B8F] hover:bg-[#5CB4A6] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(78,155,143,0.35)] hover:shadow-[0_6px_22px_rgba(78,155,143,0.5)] transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faCircleNotch} className="w-4 h-4 animate-spin" />
                <span>Mendaftarkan Akun...</span>
              </>
            ) : (
              <>
                <span>Register to Waskita</span>
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-2 text-xs text-[#9DC4B9]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#54B7A5] hover:text-white font-semibold underline underline-offset-2 transition-colors"
        >
          Login Now
        </Link>
      </div>
    </AuthLayoutCard>
  );
}
