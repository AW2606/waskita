"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { User, Lock, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { registerUser } from "@/lib/api";

export default function DaftarPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call Backend Register
      await registerUser({ name, email, password });

      // 2. Automatically Sign In via NextAuth
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!signInRes || signInRes.error) {
        // Registration succeeded, route to login if auto-login failed
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
          msg = "Tidak dapat terhubung ke Server Backend (Port 8000). Pastikan server backend FastAPI sudah dijalankan.";
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
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink">
      <Navbar />

      <main className="flex-1 w-full max-w-md mx-auto px-6 py-12 sm:py-16 flex flex-col justify-center">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-muted/20 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20 shadow-xs mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink">
              Daftar Akun Waskita
            </h1>
            <p className="font-body text-muted text-sm sm:text-base">
              Mulai lindungi diri dan keluarga dari ancaman penipuan digital AI.
            </p>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-4 bg-caution/15 text-ink border border-caution/40 rounded-xl text-sm font-body">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-body text-sm font-medium text-ink">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-mist/30 text-ink font-body text-base outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-body text-sm font-medium text-ink">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-mist/30 text-ink font-body text-base outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-body text-sm font-medium text-ink">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-mist/30 text-ink font-body text-base outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-body font-medium text-base py-3.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Membuat Akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link to Login */}
          <div className="pt-2 text-center border-t border-muted/20">
            <p className="font-body text-sm text-muted">
              Sudah memiliki akun?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
