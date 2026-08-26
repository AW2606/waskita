import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-muted/20 bg-white/70 backdrop-blur-xs mt-20">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1.5">
          <Link href="/" className="font-display font-semibold text-xl text-ink hover:opacity-90 inline-block">
            Waskita <span className="text-primary text-sm font-mono font-normal">2.0</span>
          </Link>
          <p className="font-mono text-xs text-muted">
            [ WASKITA CORE // SISTEM VERIFIKASI KONTEN AI, DEEPFAKE & SOCIAL ENGINEERING ]
          </p>
        </div>
        <div className="space-y-1.5 max-w-md text-xs font-body text-muted">
          <p className="text-sm text-ink/90 font-medium">
            Platform pelindung masyarakat dari ancaman manipulasi digital berbasis empati, kecerdasan buatan, dan privasi penuh.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-2xs font-mono">
            <span className="inline-flex items-center gap-1 text-primary">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero-Retention Policy
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-muted">
              <Lock className="w-3.5 h-3.5" /> Kepatuhan UU PDP No. 27/2022
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
