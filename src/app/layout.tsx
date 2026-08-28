import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Waskita — Platform Verifikasi Keaslian AI & Deepfake",
    template: "%s | Waskita",
  },
  description:
    "Waskita (Kewaspadaan Kita) - Platform verifikasi mandiri dan literasi perlindungan keluarga dari manipulasi suara AI, video deepfake, dan rekayasa siber di Indonesia.",
  applicationName: "Waskita",
  authors: [{ name: "Tim Waskita" }],
  keywords: [
    "Waskita",
    "Verifikasi AI",
    "Deteksi Deepfake",
    "Voice Cloning",
    "Forensik Akustik",
    "Perlindungan Keluarga",
    "Anti Penipuan AI",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo_shield.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/logo_shield.png",
    apple: "/logo_shield.png",
  },
  openGraph: {
    title: "Waskita - Platform Verifikasi Keaslian AI & Deepfake",
    description:
      "Melindungi keluarga dan masyarakat dari manipulasi digital, kloning suara AI, video deepfake, dan rekayasa sosial.",
    siteName: "Waskita",
    images: [
      {
        url: "/logo_full.png",
        width: 800,
        height: 800,
        alt: "Waskita Platform Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
