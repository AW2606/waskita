"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";

export function Footer() {
  return (
    <footer className="w-full bg-white/80 dark:bg-[#07100D] text-ink dark:text-[#F2F7F5] border-t border-muted/20 dark:border-white/10 mt-10 sm:mt-24 pt-8 sm:pt-16 pb-14 sm:pb-12 relative z-20 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* =========================================================================
            MOBILE FOOTER (Compact, Clean & App-Like)
            ========================================================================= */}
        <div className="md:hidden space-y-5 text-left pb-6">
          {/* Brand & Tagline */}
          <div className="space-y-1.5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-display font-bold text-xl text-ink dark:text-white hover:text-primary transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-white/95 flex items-center justify-center p-0.5 shadow-2xs border border-muted/20 shrink-0">
                <Image
                  src="/logoweb.png"
                  alt="Waskita Logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span>Waskita</span>
            </Link>
            <p className="font-body text-xs text-muted dark:text-[#9DB0AA] leading-relaxed">
              Platform forensik mandiri pendeteksi manipulasi suara AI, deepfake, dan rekayasa digital.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 border-t border-muted/15 dark:border-white/5 text-xs font-body font-medium text-ink/80 dark:text-[#C5D5CF]">
            <Link href="/verifikasi" className="hover:text-primary transition-colors py-1">
              Verifikasi Media
            </Link>
            <span className="text-muted/40">·</span>
            <Link href="/keluarga" className="hover:text-primary transition-colors py-1">
              Pendamping Keluarga
            </Link>
            <span className="text-muted/40">·</span>
            <Link href="/belajar" className="hover:text-primary transition-colors py-1">
              Simulasi Modus AI
            </Link>
          </div>

          {/* Trust & Security Highlights (Compact Pill Row) */}
          <div className="space-y-2 text-[11px] font-body text-muted dark:text-[#9DB0AA]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/10 dark:bg-white/[0.03] border border-muted/15 dark:border-white/5">
              <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">
                <strong className="text-ink dark:text-white font-semibold">Zero-Retention:</strong> Memori volatil terhapus otomatis
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/10 dark:bg-white/[0.03] border border-muted/15 dark:border-white/5">
              <FontAwesomeIcon icon={faScaleBalanced} className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">
                Kepatuhan UU PDP No. 27 Tahun 2022
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            DESKTOP FOOTER (Spacious 3-Column Architecture)
            ========================================================================= */}
        <div className="hidden md:grid md:grid-cols-12 gap-12 pb-12 border-b border-muted/20 dark:border-white/10">
          
          {/* Kolom 1: Identitas & Visi Produk (5 Cols) */}
          <div className="md:col-span-5 space-y-4 text-left">
            <Link
              href="/"
              className="inline-flex items-center gap-3 font-display font-bold text-2xl text-ink dark:text-white hover:text-primary transition-colors"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white dark:bg-white/95 flex items-center justify-center p-1 shadow-2xs border border-muted/20 shrink-0">
                <Image
                  src="/logoweb.png"
                  alt="Waskita Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span>Waskita</span>
            </Link>
            <p className="font-body text-sm text-muted dark:text-[#9DB0AA] leading-relaxed max-w-sm">
              Platform forensik mandiri untuk mendeteksi rekayasa suara AI, video deepfake, dan manipulasi digital guna menjaga keamanan masyarakat serta ketenangan keluarga.
            </p>
          </div>

          {/* Kolom 2: Navigasi Produk (3 Cols) */}
          <div className="md:col-span-3 space-y-3 text-left">
            <div className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              Navigasi
            </div>
            <ul className="space-y-2.5 font-body text-sm text-muted dark:text-[#9DB0AA]">
              <li>
                <Link href="/verifikasi" className="hover:text-primary dark:hover:text-white transition-colors">
                  Verifikasi Media
                </Link>
              </li>
              <li>
                <Link href="/keluarga" className="hover:text-primary dark:hover:text-white transition-colors">
                  Pendamping Keluarga
                </Link>
              </li>
              <li>
                <Link href="/belajar" className="hover:text-primary dark:hover:text-white transition-colors">
                  Simulasi Modus AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kepatuhan Hukum & Etika Privasi (4 Cols) */}
          <div className="md:col-span-4 space-y-3 text-left">
            <div className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              Jaminan Keamanan
            </div>
            <div className="space-y-3 font-body text-xs text-muted dark:text-[#9DB0AA]">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/5 dark:bg-white/[0.02] border border-muted/15 dark:border-white/5">
                <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="leading-relaxed">
                  <strong className="text-ink dark:text-white">Zero-Retention Policy:</strong> Media diproses di memori volatil terenkripsi dan langsung dimusnahkan.
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/5 dark:bg-white/[0.02] border border-muted/15 dark:border-white/5">
                <FontAwesomeIcon icon={faScaleBalanced} className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="leading-relaxed">
                  Kepatuhan penuh pada regulasi perlindungan data pribadi UU PDP No. 27 Tahun 2022.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Baris Bawah: Copyright & Telemetry Status */}
        <div className="pt-5 sm:pt-8 border-t md:border-t-0 border-muted/15 dark:border-white/5 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-4 font-mono text-[11px] sm:text-xs text-muted dark:text-[#62756E] text-center sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} Waskita. Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-2 text-primary font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
            <span>Sistem Forensik Aktif</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
