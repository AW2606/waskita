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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setErrorMessage("Email atau kata sandi tidak cocok. Silakan coba kembali.");
      } else {
        router.push("/verifikasi");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Terjadi kendala saat menghubungkan ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayoutCard title="Login">
      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-[#E85D4E]/15 border border-[#E85D4E]/30 text-[#FFB2A8] text-xs flex items-center gap-2.5 animate-in fade-in">
          <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 text-[#FF8E80] shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username / Email Field */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-[#D4E8E1] tracking-wide">
            Username / Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-5 py-3 rounded-full bg-[#0D241D]/90 border border-white/15 text-white placeholder-white/30 text-sm focus:border-[#4EA699] focus:ring-2 focus:ring-[#4EA699]/30 outline-none transition-all shadow-inner"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-[#D4E8E1] tracking-wide">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-5 py-3 rounded-full bg-[#0D241D]/90 border border-white/15 text-white placeholder-white/30 text-sm focus:border-[#4EA699] focus:ring-2 focus:ring-[#4EA699]/30 outline-none transition-all shadow-inner"
          />
          <div className="text-right pt-0.5">
            <Link
              href="/lupa-sandi"
              className="text-[11px] text-[#54B7A5] hover:text-[#78DFCEx] hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Submit Button (Pill Seafoam Teal) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-full bg-[#4E9B8F] hover:bg-[#5CB4A6] text-white font-bold text-sm sm:text-base shadow-[0_4px_16px_rgba(78,155,143,0.35)] hover:shadow-[0_6px_22px_rgba(78,155,143,0.5)] transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faCircleNotch} className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <span>Login to Waskita</span>
                <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Switch to Register */}
      <div className="text-center pt-2 text-xs text-[#9DC4B9]">
        Don&apos;t have an account?{" "}
        <Link
          href="/daftar"
          className="text-[#54B7A5] hover:text-white font-semibold underline underline-offset-2 transition-colors"
        >
          Register Now
        </Link>
      </div>
    </AuthLayoutCard>
  );
}
