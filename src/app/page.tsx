import React from "react";
import Link from "next/link";
import { ShieldCheck, Users, Sparkles, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Verifikasi Cepat",
      description:
        "Periksa suara, video, atau pesan yang mencurigakan dalam waktu singkat untuk memastikan keasliannya.",
    },
    {
      icon: Users,
      title: "Pendamping Keluarga",
      description:
        "Bantu jaga orang tersayang tanpa mengawasi atau mengganggu privasi isi percakapan mereka.",
    },
    {
      icon: Sparkles,
      title: "Belajar Mengenali Pola",
      description:
        "Latihan mengenali pola penipuan AI dan deepfake melalui simulasi nyata yang mudah dipahami.",
    },
  ];

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink">
      {/* Navbar Global */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-20 md:py-24 space-y-20 sm:space-y-28">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-8 sm:space-y-10">
          <div className="space-y-4 sm:space-y-6">
            <h1 className="font-display font-semibold text-4xl sm:text-5xl md:text-6xl text-ink tracking-tight leading-[1.15] sm:leading-[1.18]">
              Ragu itu wajar. <br className="hidden sm:inline" />
              Mari periksa bersama.
            </h1>
            <p className="font-body text-muted text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto">
              Waskita membantu Anda memeriksa panggilan telepon, video, atau
              pesan yang mencurigakan dalam hitungan detik — dengan tenang, aman,
              dan tanpa rasa cemas.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <Link
              href="/verifikasi"
              className="inline-flex items-center justify-center gap-3 bg-primary text-white font-body font-medium text-lg sm:text-xl px-8 py-4 sm:px-10 sm:py-5 rounded-2xl shadow-sm hover:bg-primary/90 active:scale-[0.99] transition-all duration-200 cursor-pointer group"
            >
              <span>Mulai Periksa</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {/* 3 Key Feature Cards Section */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-8 sm:p-9 rounded-2xl border border-muted/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-start space-y-5"
                >
                  <div className="w-13 h-13 rounded-xl bg-mist flex items-center justify-center text-primary border border-muted/20">
                    <Icon className="w-6 h-6" strokeWidth={2.2} />
                  </div>
                  <div className="space-y-2.5">
                    <h2 className="font-display font-semibold text-2xl text-ink">
                      {feature.title}
                    </h2>
                    <p className="font-body text-muted text-base sm:text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer Global */}
      <Footer />
    </div>
  );
}
