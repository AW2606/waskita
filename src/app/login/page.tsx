"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink">
      <Navbar />

      <main className="flex-1 w-full max-w-md mx-auto px-6 py-12 sm:py-16 flex flex-col justify-center">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-muted/20 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20 shadow-xs mb-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display font-semibold text-2xl sm:text-3xl text-ink">
              Masuk ke Waskita
            </h1>
            <p className="font-body text-muted text-sm sm:text-base">
              Akses riwayat verifikasi dan pemantauan perlindungan keluarga Anda.
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
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                  <span>Memeriksa Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link to Register */}
          <div className="pt-2 text-center border-t border-muted/20">
            <p className="font-body text-sm text-muted">
              Belum memiliki akun?{" "}
              <Link href="/daftar" className="text-primary font-semibold hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
