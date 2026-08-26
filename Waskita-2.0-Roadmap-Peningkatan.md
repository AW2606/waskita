# WASKITA 2.0 — Evaluasi Kritis & Roadmap Menuju Platform Siap Publik

> Dokumen ini disusun berdasarkan PRD, rangkuman fitur, dan struktur codebase yang sudah Anda bangun. Tujuannya bukan mengganti arah proyek, tapi mengangkatnya dari "prototipe lomba yang jalan" menjadi "sistem yang layak dipercaya publik untuk hal sesensitif penipuan dan deepfake."

---

## 1. Diagnosis Jujur Kondisi Saat Ini

Yang sudah kuat:
- Konsep dual-dimensi (keaslian akustik vs isi percakapan) itu **ide bagus** dan jarang dilakukan kompetitor sejenis — jangan dibuang.
- Zero-retention policy dan bahasa non-menghakimi ("Tenang/Perlu Diperiksa/Sangat Waspada") adalah nilai jual yang secara etis kuat.
- Stack teknis (FastAPI + Next.js + HF Transformers) sudah tepat untuk skala MVP.

Yang membuatnya belum layak terbit:
1. **Fusion skor naif.** `final_score = max(acoustic, content, hybrid)` tidak dikalibrasi — satu sinyal false-positive langsung mendominasi hasil akhir tanpa bobot atau konteks.
2. **Model deteksi video terlalu tipis.** 5 frame statis + ViT classifier tanpa analisis temporal sangat mudah "ditipu" oleh video yang sudah dikompres ulang (khas video yang diforward di WhatsApp).
3. **Model audio deepfake dari komunitas HF** (`Gustking/wav2vec2-...`) kemungkinan besar dilatih pada dataset audio studio berkualitas tinggi, bukan audio telepon 8kHz yang penuh kompresi — ini bisa membuat akurasi drop signifikan di kondisi nyata.
4. **NLP scanner murni rule-based (regex/keyword)** — mudah dihindari penipu hanya dengan mengganti frasa ("transfer sekarang" → "transfer aja ya sekarang", dsb), dan rentan false-positive pada percakapan normal yang kebetulan memakai kata serupa.
5. **Pipeline lambat karena arsitektur, bukan cuma karena Whisper.** Model kemungkinan dimuat ulang tiap request (bukan preloaded di startup), tidak ada caching, dan proses berjalan sekuensial padahal beberapa tahap bisa paralel.
6. **Tidak ada mekanisme belajar dari kesalahan** — sekali model salah, akan terus salah karena tidak ada feedback loop atau human review untuk kasus ambigu.

---

## 2. Soal Whisper STT — Jangan Dihapus, Tapi Diubah Strateginya

Saya paham alasan Anda: `whisper-tiny` di CPU memang lambat dan sering jadi bottleneck. Tapi sebelum menghapusnya total, pertimbangkan ini — **STT adalah satu-satunya cara sistem tahu "apa isi yang diucapkan"**. Tanpa itu, jalur suara Anda cuma bisa bilang "ini kloning AI atau bukan" — padahal skenario paling berbahaya di PRD Anda sendiri (voice note anak "kecelakaan", telepon "atasan minta transfer") justru **penipuan dengan suara ASLI manusia**, bukan hasil AI. Kalau STT dihapus, dua dari lima skenario simulasi Anda kehilangan fitur pendeteksiannya di dunia nyata.

**Rekomendasi — percepat, jangan hilangkan:**

| Solusi | Dampak |
|---|---|
| Ganti `whisper-tiny` (vanilla) → **faster-whisper** (CTranslate2, int8 quantized) | 3–4x lebih cepat di CPU yang sama, akurasi setara/lebih baik |
| Preload model saat startup FastAPI (`@app.on_event("startup")`), bukan per-request | Menghilangkan overhead loading berulang, ini sering jadi penyebab "lambat" yang sebenarnya |
| Transkripsi hanya N detik pertama + potongan tempat kata kunci terdeteksi (jika audio panjang) | Memangkas waktu proses tanpa kehilangan konten krusial |
| Jalankan **acoustic engine dan STT secara paralel** (`asyncio.gather`), bukan berurutan | Total waktu = max(keduanya), bukan jumlah keduanya |
| Tambahkan **caching berbasis hash audio** (pakai Redis yang sudah ada di stack Anda) | Audio yang sama/mirip (misal video viral yang diunggah banyak orang) tidak perlu diproses ulang |

Kalau setelah semua ini tetap terasa berat untuk demo, jadikan transkripsi sebagai **mode opsional** ("Analisis Mendalam") yang bisa di-skip untuk hasil cepat, bukan dihapus permanen dari arsitektur.

---

## 3. Upgrade Per-Pipeline

### A. Audio
- Tambahkan **speaker diarization ringan** (siapa bicara kapan) agar sistem tahu suara siapa yang dianalisis saat rekaman melibatkan 2 pihak.
- Uji model deepfake audio dengan sampel **telepon asli Indonesia berkualitas rendah** sebelum publikasi — jika akurasi drop, pertimbangkan fine-tuning ringan (LoRA) di atas dataset lokal kecil, bukan ganti model dari nol.
- Deteksi **replay attack** (rekaman suara asli yang diputar ulang lewat speaker) — ini modus yang tidak tercakup baik oleh deteksi "AI-generated" maupun "manusia asli".

### B. Video
- Tambah **analisis temporal** (bukan cuma 5 frame independen) — minimal deteksi konsistensi wajah antar-frame, kedipan mata, dan artefak batas wajah (blending boundary).
- Deteksi **kompresi berulang** (video yang sudah di-reupload berkali-kali kehilangan sinyal forensik asli) — beri disclaimer khusus untuk kasus ini alih-alih skor yang menyesatkan.
- Pertimbangkan model yang lebih baru dan lebih robust terhadap kompresi media sosial (arsitektur ensemble dua model kecil bisa lebih stabil daripada satu ViT besar).

### C. Teks / NLP Scanner
- Ubah dari **pure rule-based** menjadi **hybrid**: heuristic (existing) sebagai fallback cepat + model klasifikasi kecil (fine-tuned IndoBERT/DistilBERT) yang dilatih pada korpus rekayasa sosial Indonesia untuk menangkap variasi bahasa yang tidak ada di daftar kata kunci.
- Tangani **bahasa gaul/typo/singkatan** ("wa aja ya", "trfd skrg") — regex kaku akan gagal di sini.
- Deteksi **link phishing** yang sering menyertai pesan penipuan (cek domain mencurigakan, typosquatting nama bank/instansi).

### D. Reputasi Nomor Telepon
- Ini bagian paling lemah secara teknis saat ini (hanya format + DB internal). Prioritaskan integrasi **community fingerprint database** (lihat §4) sebagai pengganti sementara sebelum kerja sama resmi dengan OJK/AFTECH terwujud.

---

## 4. Inovasi Tambahan (Pemikiran Lebih Luas)

Ini bagian yang saya rasa akan paling mengangkat nilai proyek Anda dari "alat deteksi" menjadi "platform perlindungan":

1. **Fingerprint Database Komunitas (Privacy-Preserving).**
   Saat pengguna memverifikasi audio/video/nomor yang terbukti penipuan, simpan **hash** (bukan file mentahnya) ke database bersama. Verifikasi berikutnya untuk konten yang sama cukup cek hash — instan, tanpa re-inference model. Ini sekaligus mempercepat sistem DAN membangun efek jaringan (makin banyak pengguna, makin pintar sistemnya) — sesuai roadmap "database komunitas" di PRD Anda, tapi bisa masuk MVP karena implementasinya ringan.

2. **Bot WhatsApp/Kanal Non-App.**
   Persona "pengguna rentan" (55+ tahun) di PRD Anda kemungkinan besar tidak akan install aplikasi baru saat panik menerima telepon mencurigakan. Bot WhatsApp yang bisa langsung menerima forward rekaman/pesan jauh lebih realistis untuk demografi ini daripada mengarahkan mereka ke web app.

3. **Fusion Score dengan Model Terlatih, Bukan `max()`.**
   Kumpulkan skor per-modalitas sebagai fitur, latih meta-classifier ringan (logistic regression cukup) di atas data berlabel untuk kalibrasi yang lebih adil — mengurangi false alarm dari satu sinyal lemah yang mendominasi.

4. **"Kode Darurat" sebagai Pelengkap Safe Word.**
   Safe word bisa "dipaksa keluar" dari korban di bawah tekanan/ancaman. Tambahkan opsi kode darurat kedua yang secara diam-diam berarti "saya dalam bahaya, hubungi pihak lain" — konsep umum di sistem anti-penculikan.

5. **Mode Offline/Ringan untuk Konektivitas Terbatas.**
   Scanner teks heuristik (bukan model AI) bisa jalan client-side/offline untuk daerah dengan internet terbatas — memberi jawaban cepat "Perlu Diperiksa" sebelum verifikasi penuh online.

6. **Human-in-the-loop untuk Kasus Ambigu.**
   Untuk skor di zona abu-abu (mis. 40–60%), alih-alih memberi jawaban pasti yang mungkin salah, arahkan ke antrian **peninjauan komunitas/relawan terverifikasi** — ini juga jadi sumber data untuk melatih ulang model dari waktu ke waktu.

7. **Ekstensi Browser untuk Link & Halaman Phishing.**
   Banyak penipuan berlanjut ke halaman web palsu (form OTP, halaman "menang undian"). Cakupan ini melengkapi deteksi pesan/suara.

---

## 5. Perbaikan Arsitektur & Tata Kelola (agar layak publik, bukan cuma demo)

- **Observability nyata**: dashboard akurasi internal (sudah disebut di PRD) + logging tanpa menyimpan konten mentah, agar bisa diaudit tanpa melanggar privasi.
- **Feedback loop**: tombol "hasil ini salah" di UI hasil verifikasi → masuk antrian review → dipakai untuk retraining berkala. Tanpa ini, akurasi sistem stagnan selamanya.
- **Kepatuhan UU PDP**: karena memproses suara/video (data pribadi sensitif), pastikan ada consent flow eksplisit, dokumentasi retensi (walau zero-retention), dan mekanisme permintaan penghapusan data akun.
- **Rate limiting & anti-abuse**: penting begitu publik, agar API tidak dibanjiri untuk hal di luar tujuan (mis. dipakai menguji cara mengelabui detektor).
- **Uji bias**: aksen/dialek daerah (Jawa, Sunda, Batak, dll.) memengaruhi akurasi ASR dan pola bahasa penipuan — uji lintas dialek sebelum klaim "untuk masyarakat Indonesia" secara luas.

---

## 6. Prioritas Implementasi

| Fase | Fokus |
|---|---|
| **Sebelum demo/lomba** | Preload model, faster-whisper, paralelisasi audio pipeline, perbaikan fusion score sederhana (weighted, bukan pure max) |
| **Pasca-lomba, sebelum soft-launch** | Fingerprint DB komunitas, hybrid NLP classifier, analisis temporal video, feedback loop dasar |
| **Menuju publik luas** | Bot WhatsApp, ekstensi browser, human-in-the-loop, audit bias & UU PDP, kerja sama data dengan OJK/AFTECH |

---

## 7. Kesimpulan Terpadu

Waskita saat ini sudah punya pondasi konsep yang benar — deteksi dua dimensi, bahasa yang menenangkan, dan privasi sebagai prinsip, bukan tambahan — tapi baru berhenti di level "prototipe yang membuktikan ide bisa jalan", belum di level "sistem yang bisa dipercaya jutaan orang awam saat mereka benar-benar panik menerima telepon mencurigakan". Untuk sampai ke sana, tiga hal harus terjadi bersamaan: **pipeline dipercepat lewat arsitektur (preload, paralelisasi, caching) bukan lewat memotong kemampuan inti seperti transkripsi ucapan**; **model-model tunggal saat ini (ViT 5-frame, wav2vec2 generik, NLP rule-based) diperkuat menjadi sistem hybrid yang saling menutupi kelemahan satu sama lain lewat fusion score yang dikalibrasi, bukan sekadar `max()`**; dan **sistem dibuat bisa belajar dari kesalahannya sendiri** lewat feedback loop, fingerprint komunitas, dan human-in-the-loop untuk kasus abu-abu — karena penipuan berbasis AI akan terus berevolusi lebih cepat daripada siklus rilis model manapun. Inovasi tambahan seperti bot WhatsApp, kode darurat, dan fingerprint privacy-preserving bukan sekadar fitur pemanis, melainkan jawaban langsung atas kesenjangan antara siapa yang butuh alat ini (lansia, orang tua awam teknologi) dan bagaimana mereka sebenarnya akan mengaksesnya di momen genting. Jika prioritas fase di atas dijalankan bertahap, proyek ini realistis bergerak dari "menang lomba" menjadi "layak dipakai orang sungguhan" — dan itu sejalan persis dengan filosofi yang sudah Anda tulis sendiri di PRD: AI sebagai alat bantu, keputusan akhir tetap di tangan manusia yang diberi informasi jujur, bukan divonis.
