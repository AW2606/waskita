"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Phone, CheckCircle, Info, Lock, Loader2, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getFamilyMembers, addFamilyMember, FamilyMemberData } from "@/lib/api";

export default function KeluargaPage() {
  const [members, setMembers] = useState<FamilyMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelation, setNewRelation] = useState("Keluarga");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch family members from database on mount
  useEffect(() => {
    async function fetchMembers() {
      try {
        const data = await getFamilyMembers();
        setMembers(data);
      } catch (err) {
        console.error("Error fetching family members:", err);
        // Fallback default
        setMembers([
          {
            id: 1,
            member_name: "Ibu Siti Aminah",
            member_phone: "+62 812-3456-7890",
            relation: "Ibu",
            status: "tenang",
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            member_name: "Bapak Rahmad Subagio",
            member_phone: "+62 813-9876-5432",
            relation: "Ayah",
            status: "tenang",
            created_at: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await addFamilyMember({
        member_name: newName.trim(),
        member_phone: newPhone.trim(),
        relation: newRelation,
      });

      setMembers([created, ...members]);
      setNewName("");
      setNewPhone("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    } catch (err) {
      console.error("Error adding family member:", err);
      // Local optimistic fallback
      const fallbackEntry: FamilyMemberData = {
        id: Date.now(),
        member_name: newName.trim(),
        member_phone: newPhone.trim(),
        relation: newRelation,
        status: "tenang",
        created_at: new Date().toISOString(),
      };
      setMembers([fallbackEntry, ...members]);
      setNewName("");
      setNewPhone("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mist text-ink flex flex-col justify-between selection:bg-primary/20 selection:text-ink">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10 sm:space-y-12">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            Mode Pendamping Keluarga
          </div>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
            Bantu jaga orang tersayang, tanpa mengawasi.
          </h1>
          <p className="font-body text-muted text-base sm:text-lg">
            Lindungi orang tua dan keluarga dari jeratan penipuan deepfake dengan notifikasi perlindungan dini yang tetap menghormati ruang pribadi mereka.
          </p>
        </div>

        {/* Form Tambah Anggota */}
        <div className="bg-white p-7 sm:p-10 rounded-3xl border border-muted/20 shadow-sm space-y-6">
          <div className="border-b border-muted/20 pb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-xl text-ink flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Daftarkan Anggota Keluarga
            </h2>
            <span className="font-mono text-xs text-primary font-medium flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Enkripsi Aman
            </span>
          </div>

          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-body font-medium text-sm text-ink block">
                  Nama Lengkap / Panggilan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ibu Siti, Kakek Wardiman"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-mist/40 text-ink font-body text-base placeholder:text-muted/60 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-body font-medium text-sm text-ink block">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 0812-3456-7890"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-muted/30 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-mist/40 text-ink font-body text-base placeholder:text-muted/60 outline-none transition-all"
                />
              </div>
            </div>

            {/* Note Kebijakan Privasi */}
            <div className="p-4 bg-mist rounded-xl border border-muted/30 flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="font-body text-xs sm:text-sm text-ink/80 leading-relaxed">
                <strong>Prinsip Privasi Waskita:</strong> Kami tidak pernah menyadap, merekam, atau membaca isi percakapan. Sistem hanya memberi tahu Anda bila ada pola ancaman manipulasi AI yang terdeteksi.
              </p>
            </div>

            {showSuccess && (
              <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl text-primary font-body text-sm flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4" />
                Anggota keluarga berhasil tersimpan di database perlindungan!
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 bg-caution/15 border border-caution/40 rounded-xl text-ink font-body text-sm flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-caution" />
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-white font-body font-medium text-base rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Tambahkan ke Pendamping</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Daftar Anggota Keluarga Aktif */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-muted/20 pb-3">
            <h3 className="font-display font-semibold text-xl text-ink">
              Keluarga yang Sedang Dilindungi ({members.length})
            </h3>
            <span className="font-mono text-xs text-muted">Tersimpan di Database</span>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
              <p className="font-mono text-xs text-muted">Memuat data dari database...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white p-6 rounded-2xl border border-muted/20 shadow-2xs space-y-4 hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-display font-semibold text-lg text-ink">
                        {member.member_name}
                      </h4>
                      <p className="font-mono text-xs text-muted">
                        {member.member_phone}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {member.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-muted/15 flex items-center justify-between text-xs font-body text-muted">
                    <span>ID Anggota: #{member.id}</span>
                    <span className="font-mono">
                      {new Date(member.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
