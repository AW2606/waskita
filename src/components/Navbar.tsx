"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react";

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

  // Fungsi mengganti tema
  const toggleTheme = () => {
    const newDark = !isDark;

    setIsDark(newDark);

    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
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
<header className="sticky top-0 z-50 w-full bg-mist/90 backdrop-blur-md border-b border-muted/20">      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <span className="font-display font-bold text-xl leading-none">
              W
            </span>
          </div>

          <span className="font-display font-semibold text-2xl tracking-tight text-ink dark:text-white">
            Waskita
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-base font-body transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                    : "text-ink/80 dark:text-gray-300 hover:text-ink dark:hover:text-white hover:bg-muted/10 dark:hover:bg-gray-800 font-medium"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-3">

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center
              text-ink dark:text-white
              hover:bg-muted/15 dark:hover:bg-gray-800
              border border-muted/20 dark:border-gray-700
              transition-all duration-200 hover:scale-105 cursor-pointer"
            title={isDark ? "Mode Terang" : "Mode Gelap"}
            aria-label={isDark ? "Mode Terang" : "Mode Gelap"}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Desktop Auth Section */}
          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-3">

              {/* User Profile */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-muted/20 dark:border-gray-700 shadow-2xs">
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-body text-muted dark:text-gray-400 hover:text-ink dark:hover:text-white hover:bg-muted/15 dark:hover:bg-gray-800 transition-all cursor-pointer"
                title="Keluar dari akun"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-body font-medium text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
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
              hover:bg-muted/15 dark:hover:bg-gray-800
              border border-muted/20 dark:border-gray-700
              transition-all cursor-pointer"
            title={isDark ? "Mode Terang" : "Mode Gelap"}
            aria-label={isDark ? "Mode Terang" : "Mode Gelap"}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 rounded-xl text-ink dark:text-white hover:bg-muted/15 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-muted/20 dark:border-gray-700 px-6 py-4 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">

          {navLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-body transition-all ${
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-ink dark:text-gray-300 hover:bg-mist dark:hover:bg-gray-800 font-medium"
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-muted/20 dark:border-gray-700">

            {status === "authenticated" && session?.user ? (
              <div className="space-y-2">

                {/* Mobile User */}
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-body text-muted dark:text-gray-400">
                  <User className="w-4 h-4 text-primary" />
                  <span className="truncate">
                    {session.user.name || session.user.email}
                  </span>
                </div>

                {/* Mobile Logout */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-body bg-mist dark:bg-gray-800 text-ink dark:text-white hover:bg-muted/20 dark:hover:bg-gray-700 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white font-body font-medium text-base px-4 py-3 rounded-xl shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}