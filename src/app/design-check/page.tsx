import React from "react";

export default function DesignCheckPage() {
  const colorSwatches = [
    {
      name: "Background (Mist)",
      className: "bg-mist",
      hex: "#F3F6F4",
      textColor: "text-ink",
      border: "border-2 border-muted/40",
      description: "Warna latar belakang utama yang tenang dan ramah mata",
    },
    {
      name: "Ink",
      className: "bg-ink",
      hex: "#10322C",
      textColor: "text-mist",
      border: "border-none",
      description: "Warna utama untuk teks, headline, dan elemen berbobot tinggi",
    },
    {
      name: "Primary",
      className: "bg-primary",
      hex: "#2F6F62",
      textColor: "text-white",
      border: "border-none",
      description: "Warna tombol aksi, tautan interaktif, dan fokus utama",
    },
    {
      name: "Accent",
      className: "bg-accent",
      hex: "#D9A441",
      textColor: "text-ink",
      border: "border-none",
      description: "Aksen hangat untuk sorotan khusus (digunakan hemat)",
    },
    {
      name: "Muted",
      className: "bg-muted",
      hex: "#8A938E",
      textColor: "text-white",
      border: "border-none",
      description: "Warna teks sekunder, garis batas (border), dan ikon pembantu",
    },
    {
      name: "Caution",
      className: "bg-caution",
      hex: "#C98A3B",
      textColor: "text-white",
      border: "border-none",
      description: "Status 'Perlu Diperiksa' (hangat dan mendidik, bukan alarm merah)",
    },
  ];

  return (
    <main className="min-h-screen bg-mist text-ink p-6 sm:p-12 max-w-5xl mx-auto space-y-12">
      {/* Header Info */}
      <div className="space-y-3 border-b border-muted/30 pb-6">
        <div className="inline-block bg-primary/10 text-primary font-mono text-xs px-3 py-1 rounded-full uppercase tracking-wider">
          Design System & Token Verification
        </div>
        <h1 className="font-display font-semibold text-4xl sm:text-5xl text-ink tracking-tight">
          Pemeriksaan Sistem Desain Waskita
        </h1>
        <p className="font-body text-muted text-lg">
          Halaman verifikasi token tipografi, palet warna semantik, dan kelembutan sudut (border-radius).
        </p>
      </div>

      {/* Typography Section */}
      <section className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-muted/20">
        <div className="flex items-center justify-between border-b border-muted/20 pb-4">
          <h2 className="font-display text-2xl font-semibold text-ink">
            1. Uji Tipografi
          </h2>
          <span className="font-mono text-xs text-muted">next/font/google</span>
        </div>

        {/* Display Font */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
            [font-display] Fraunces (Weight 600 / 400)
          </span>
          <h2 className="font-display text-3xl sm:text-4xl text-ink font-semibold leading-tight">
            Melindungi Setiap Warga dari Manipulasi Digital
          </h2>
        </div>

        {/* Body Font */}
        <div className="space-y-2 pt-2">
          <span className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
            [font-body] Atkinson Hyperlegible (Weight 400 / 700) — Base 18px
          </span>
          <p className="font-body text-ink leading-relaxed">
            Platform Waskita dirancang khusus dengan keterbacaan ekstra tinggi untuk memastikan informasi verifikasi konten deepfake dapat dipahami dengan mudah, jelas, dan tanpa kebingungan oleh seluruh lapisan masyarakat, termasuk kelompok lansia.
          </p>
        </div>

        {/* Mono Font */}
        <div className="space-y-2 pt-2">
          <span className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
            [font-mono] IBM Plex Mono (Weight 400)
          </span>
          <div className="p-3 bg-mist rounded-xl font-mono text-sm text-ink border border-muted/30">
            HASH: SHA256-8f4b29c0e1 // DETEKSI_STATUS: PERLU_DIPERIKSA // CONFIDENCE: 87.4%
          </div>
        </div>
      </section>

      {/* Color Palette Swatches */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-muted/30 pb-4">
          <h2 className="font-display text-2xl font-semibold text-ink">
            2. Palet Warna Semantik
          </h2>
          <span className="font-mono text-xs text-muted">Semantic Color Swatches</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {colorSwatches.map((color) => (
            <div
              key={color.name}
              className={`p-6 rounded-xl ${color.className} ${color.textColor} ${color.border} shadow-sm transition-transform hover:scale-[1.02] flex flex-col justify-between min-h-[160px]`}
            >
              <div>
                <span className="font-mono text-xs tracking-wider opacity-80 uppercase block mb-1">
                  {color.hex}
                </span>
                <h3 className="font-display text-xl font-semibold">
                  {color.name}
                </h3>
              </div>
              <p className="text-xs opacity-90 mt-4 leading-relaxed">
                {color.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Elements & Border Radius Check */}
      <section className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-muted/20">
        <div className="flex items-center justify-between border-b border-muted/20 pb-4">
          <h2 className="font-display text-2xl font-semibold text-ink">
            3. Komponen Uji (Border Radius & Button Styles)
          </h2>
          <span className="font-mono text-xs text-muted">Soft Corners 12-16px</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer">
            Tombol Utama (bg-primary)
          </button>
          
          <button className="px-6 py-3 bg-accent text-ink font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer">
            Aksen Hangat (bg-accent)
          </button>

          <button className="px-6 py-3 bg-caution text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer">
            Status Periksa (bg-caution)
          </button>

          <button className="px-6 py-3 border-2 border-muted text-ink font-medium rounded-xl hover:bg-mist transition-colors cursor-pointer">
            Sekunder (border-muted)
          </button>
        </div>

        {/* Sample Verification Card */}
        <div className="p-6 bg-mist rounded-2xl border border-muted/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs px-2.5 py-1 bg-caution/15 text-caution font-semibold rounded-md">
              PERLU DIPERIKSA
            </span>
            <span className="font-mono text-xs text-muted">ID: #WSK-2026-08</span>
          </div>
          <h3 className="font-display text-xl font-semibold text-ink">
            Contoh Kartu Hasil Analisis Media
          </h3>
          <p className="font-body text-ink text-base">
            Kartu ini menggunakan warna latar <code className="font-mono bg-white px-1.5 py-0.5 rounded text-xs">bg-mist</code> dengan sudut membulat <code className="font-mono bg-white px-1.5 py-0.5 rounded text-xs">rounded-2xl (16px)</code> untuk memberikan kesan ramah dan tidak mengintimidasi.
          </p>
        </div>
      </section>
    </main>
  );
}
