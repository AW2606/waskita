"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faRightToBracket,
  faRightFromBracket,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Membaca tema yang tersimpan
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  // Fungsi mengganti tema dengan transisi mulus
  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    
    const newDark = !isDark;
    setIsDark(newDark);

    if (newDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 450);
  };

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Verifikasi", href: "/verifikasi" },
    { name: "Pendamping Keluarga", href: "/keluarga" },
    { name: "Belajar", href: "/belajar" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#070F0D]/80 backdrop-blur-2xl border-b border-muted/15 dark:border-white/10 shadow-2xs transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 sm:gap-3 transition-transform active:scale-95"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white dark:bg-white/95 flex items-center justify-center p-1 shadow-xs border border-muted/25 transition-transform duration-300 group-hover:scale-105 shrink-0">
            <Image
              src="/logoweb.png"
              alt="Waskita Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain rounded-full"
              priority
            />
          </div>

          <span className="font-display font-extrabold text-2xl tracking-tight text-ink dark:text-white">
            Waskita
          </span>
        </Link>

        {/* Desktop Nav Deck with Smooth Floating Pill */}
        <nav className="hidden md:inline-flex items-center p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-muted/15 dark:border-white/5 backdrop-blur-md">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-xl text-sm font-body transition-all duration-300 ease-out ${
                  active
                    ? "bg-white dark:bg-[#13221E] text-primary dark:text-[#38A189] font-bold shadow-xs border border-muted/15 dark:border-white/10 scale-[1.02]"
                    : "text-ink/70 dark:text-gray-300 hover:text-ink dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.03] font-medium"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-3">

          {/* Theme Toggle with Smooth Icon Morph */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center
              text-ink dark:text-white
              hover:bg-black/[0.04] dark:hover:bg-white/10
              border border-muted/20 dark:border-white/10
              transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            title={isDark ? "Mode Terang" : "Mode Gelap"}
            aria-label={isDark ? "Mode Terang" : "Mode Gelap"}
          >
            <FontAwesomeIcon
              icon={isDark ? faSun : faMoon}
              className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-12"
            />
          </button>

          {/* Desktop Auth Section */}
          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-3">

              {/* User Profile */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#13221E] border border-muted/20 dark:border-white/10 shadow-2xs">
                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold">
                  {session.user.name
                    ? session.user.name[0].toUpperCase()
                    : "U"}
                </div>

                <span className="font-body text-sm font-medium text-ink dark:text-white max-w-[120px] truncate">
                  {session.user.name || session.user.email}
                </span>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-body text-muted hover:text-ink dark:text-gray-400 dark:hover:text-white hover:bg-muted/15 dark:hover:bg-white/5 transition-all cursor-pointer"
                title="Keluar dari akun"
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-body font-bold text-sm px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <FontAwesomeIcon icon={faRightToBracket} className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </Link>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-2">

          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center
              text-ink dark:text-white
              hover:bg-black/[0.04] dark:hover:bg-white/10
              border border-muted/20 dark:border-white/10
              transition-all duration-200 cursor-pointer"
            title={isDark ? "Mode Terang" : "Mode Gelap"}
            aria-label={isDark ? "Mode Terang" : "Mode Gelap"}
          >
            <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center
              text-ink dark:text-white
              hover:bg-black/[0.04] dark:hover:bg-white/10
              border border-muted/20 dark:border-white/10
              transition-all duration-200 cursor-pointer"
            aria-expanded={isOpen}
            aria-label="Toggle Menu"
          >
            <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Nav Menu Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-muted/15 bg-white/95 dark:bg-[#070F0D]/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-body transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-ink dark:text-gray-200 hover:bg-muted/10 font-medium"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-muted/15 flex flex-col space-y-3">
            {status === "authenticated" && session?.user ? (
              <div className="space-y-3">
                <div className="px-4 py-2 text-sm text-muted font-body">
                  Masuk sebagai: <strong className="text-ink dark:text-white">{session.user.name || session.user.email}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-muted/15 text-ink dark:text-white font-body text-base font-medium cursor-pointer"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-body text-base font-semibold shadow-xs cursor-pointer"
              >
                <FontAwesomeIcon icon={faRightToBracket} className="w-4 h-4" />
                <span>Masuk Akun</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}