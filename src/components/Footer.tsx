import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-muted/20 bg-white/60 backdrop-blur-xs mt-20">
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1.5">
          <Link href="/" className="font-display font-semibold text-xl text-ink hover:opacity-90 inline-block">
            Waskita
          </Link>
          <p className="font-mono text-xs text-muted">
            [ WASKITA CORE // SISTEM VERIFIKASI KONTEN AI & DEEPFAKE ]
          </p>
        </div>
        <p className="font-body text-sm text-muted max-w-md">
          Platform pelindung kelompok rentan dari ancaman manipulasi digital berbasis empati dan kejernihan.
        </p>
      </div>
    </footer>
  );
}
