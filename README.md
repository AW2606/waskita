# Waskita — Platform Verifikasi Konten AI & Deepfake

<p align="center">
  <strong>Instrumen Literasi & Penapisan Awal Perlindungan Digital Berbasis AI & Forensik Akustik di Indonesia</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js%2016%20(App%20Router)-2F6F62?style=flat-square" alt="Next.js" />
  <img src="https://img.shields.io/badge/Backend-FastAPI%20(Python)-10322C?style=flat-square" alt="FastAPI" />
  <img src="https://img.shields.io/badge/AI_Audio-Wav2Vec2_%26_Whisper-D9A441?style=flat-square" alt="Wav2Vec2" />
  <img src="https://img.shields.io/badge/AI_Vision-Vision_Transformer_(ViT)-2F6F62?style=flat-square" alt="ViT" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL_%2F_SQLite-blue?style=flat-square" alt="Database" />
  <img src="https://img.shields.io/badge/Status-Fungsional_untuk_Demonstrasi-green?style=flat-square" alt="Status" />
</p>

---

## 🌟 Tentang Waskita

**Waskita** adalah platform penapisan awal multi-modalitas (*early triage & educational verification*) yang dirancang untuk membantu masyarakat dan kelompok rentan mengenali indikasi penipuan siber modern: kloning suara (*voice spoofing*), manipulasi video (*deepfake*), pesan rekayasa sosial bertekanan waktu (*social engineering*), serta tautan phishing perbankan.

Aplikasi ini dibangun dengan arsitektur **Unified Full-Stack Workspace**, mengintegrasikan frontend Next.js 16 dan backend FastAPI (Python 3.13) yang dapat dijalankan bersamaan dengan satu perintah.

---

## 🔒 Kebijakan Privasi & Keamanan Data Tunggal

Privasi pengguna dan keamanan data keluarga dikelola dengan standar kepatuhan UU PDP No. 27/2022:

1. **Pemrosesan Media Tanpa Retensi (*Zero-Retention Policy*)**:
   - File rekaman suara dan video yang diunggah pengguna diproses secara *ephemeral* di memori RAM server selama inferensi.
   - Segera setelah proses analisis selesai, file media mentah **seketika dimusnahkan secara permanen dari server** melalui blok `finally`. Tidak ada salinan file media yang disimpan ke disk atau database.
2. **Kata Sandi Rahasia Keluarga Terenkripsi (*Bcrypt Server-Side Hashing*)**:
   - *Safe Word* (Kata Sandi Aman Utama) dan *Duress Code* (Kode Darurat Sandera) di-hash satu arah menggunakan algoritma **bcrypt** di backend sebelum disimpan ke basis data.
   - Kode rahasia **tidak pernah disimpan dalam bentuk teks biasa di server** dan **tidak pernah disimpan di `localStorage` / `sessionStorage` peramban**.
   - Endpoint verifikasi hanya mengembalikan status kecocokan (*boolean `true/false`*), tanpa pernah mengekspos kata sandi aslinya ke antarmuka pengguna (*Zero-Leakage Design*).
3. **Batasan Mode Offline (*Privacy-Guarded Fallback*)**:
   - Mode analisis lokal di sisi klien **dibatasi secara ketat hanya untuk fitur non-sensitif** (pemindaian kata kunci teks publik dan pola domain phishing) yang berjalan murni di memori tanpa menyimpan data pribadi.
   - Fitur yang menyentuh data pribadi/rahasia (Kata Sandi Keluarga, Duress Code, riwayat akun, dan daftar anggota keluarga) **wajib terhubung ke server backend**. Jika server tidak dapat diakses, sistem menampilkan pemberitahuan transparan bahwa koneksi diperlukan guna menjaga keamanan data pengguna.

---

## 🧠 Arsitektur & Model AI yang Digunakan

Waskita memadukan model pembelajaran mendalam (*deep learning*) dan analisis forensik sinyal:

### 1. Jalur Audio & Vokal (Voice Cloning & Acoustic Forensics)
- **Speech-to-Text**: [`openai/whisper-tiny`](https://huggingface.co/openai/whisper-tiny) untuk transkripsi ucapan bahasa Indonesia secara lokal.
- **Model Akustik**: [`Gustking/wav2vec2-large-xlsr-deepfake-audio-classification`](https://huggingface.co/Gustking/wav2vec2-large-xlsr-deepfake-audio-classification).
- **Physical Forensic Features**:
  - *Pitch Micro-Jitter*: Mengukur perturbasi frekuensi dasar F0 vokal.
  - *Silence Noise-Gate Analysis*: Mendeteksi jeda hening tanpa *ambient room noise*.
  - *Spectral Rolloff & Centroid*: Memeriksa batas frekuensi kompresi *neural vocoder*.
- **Intent-Gated Discourse Classifier**: Membedakan narasi informasi/edukasi pihak ketiga dari instruksi serangan imperatif langsung guna mencegah alarm palsu (*false positive*).

### 2. Jalur Video & Citra (Visual Deepfake Detection)
- **Model Pretrained**: [`prithivMLmods/Deep-Fake-Detector-v2-Model`](https://huggingface.co/prithivMLmods/Deep-Fake-Detector-v2-Model) (Vision Transformer / ViT).
- **Metode**: *Uniform temporal sampling* (5 frame representatif via OpenCV) dipadukan dengan analisis kompresi berulang (*macroblocking degradation*).

### 3. Jalur Teks Chat & Tautan Phishing
- **Heuristik NLP Bahasa Indonesia**: Pemetaan singkatan gaul siber (`"trfd skrg"`, `"tf bsk"`, `"jgn ksh tau"`) dan klasifikasi 6 klaster modus rekayasa sosial.
- **Phishing URL Scanner**: Deteksi pemendek tautan (*shortlinks*) dan domain *typosquatting* peniru perbankan/layanan publik.

### 4. Pencocokan Sidik Jari Komunitas (SHA-256 Exact Match)
- Mendeteksi apakah file yang persis sama pernah diperiksa sebelumnya melalui pencocokan hash SHA-256, mengurangi komputasi berulang untuk file identik (*byte-for-byte exact match*). Mekanisme ini tidak ditujukan untuk menangkap varian yang telah dikompresi ulang oleh aplikasi pihak ketiga.

---

## 📊 Hasil Pengujian Empiris & Keterbatasan Model

> **Catatan Transparansi & Responsible AI:**  
> Seluruh model dan ambang batas yang digunakan dalam Waskita dikalibrasi berdasarkan pengujian awal terhadap sampel uji terbatas. Sistem ini dirancang sebagai instrumen edukasi dan penapisan awal (*triage support*), bukan sebagai alat pembuktian forensik hukum mutlak.

### Ringkasan Hasil Pengujian Terbatas:
1. **Pengujian Sampel Audio (10 Sampel Baseline + 2 Sampel Uji Menantang)**:
   - Pada pengujian terhadap sampel AI Neural TTS berbahasa Indonesia (Edge-TTS *ArdiNeural* & *GadisNeural*), sistem berhasil mengidentifikasi **5 dari 5 (100%)** sampel AI sebagai suara sintetik dengan keyakinan 96.0%.
   - Pada 5 sampel suara vokal manusia alami standar, sistem berhasil mengidentifikasi **5 dari 5 (100%)** sebagai suara manusia asli.
   - Akurasi keseluruhan pada 10 sampel baseline mencapai **10 dari 10 (100.0%)**, dan pada 12 sampel (termasuk sampel menantang jeda artifisial dan filter kompresi telepon) mencapai **10 dari 12 (83.3%)**.
2. **Pengujian Sampel Gambar (8 Sampel: 4 AI-Generated/Deepfake & 4 Foto Asli)**:
   - Model Vision Transformer berhasil mendeteksi **4 dari 4 (100%)** sampel manipulasi AI pada pengujian awal.
   - Total akurasi awal pada 8 sampel uji gambar statis adalah **4 dari 8 (50.0%)**.

---

## 🚀 Panduan Menjalankan Sistem

### Prasyarat:
- Node.js 18+ & npm
- Python 3.10 - 3.13

### Instalasi & Menjalankan:
```bash
# 1. Setup dependensi Python Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# 2. Setup dependensi Frontend
npm install

# 3. Jalankan Frontend (Port 3000) dan Backend (Port 8000) sekaligus:
npm run dev
```

Aplikasi dapat dibuka melalui:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Dokumentasi API FastAPI**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📁 Struktur Repositori

```text
waskita/
├── api/                     # Backend API (Python FastAPI)
│   ├── core/                # Konfigurasi DB, keamanan JWT & bcrypt
│   ├── models/              # Model database SQLAlchemy (User, Verification, Family)
│   ├── routers/             # Endpoint API (/auth, /verify, /family, /scenarios)
│   ├── schemas/             # Validasi Pydantic
│   └── services/            # Engine AI, Forensik Akustik, & Intent NLP
├── src/                     # Frontend Web App (Next.js 16 App Router)
│   ├── app/                 # Halaman (/verifikasi, /belajar, /keluarga, /login)
│   ├── components/          # Komponen UI (ClarityGauge, Navbar, Footer)
│   └── lib/                 # API Client (api.ts) & Konfigurasi Auth
├── kesimpulan.md            # Dokumentasi evaluasi dan arsitektur lengkap
└── package.json             # Dependensi frontend & runner skrip
```

---

## ⚖️ Status Kesiapan & Lisensi

Waskita berstatus **fungsional untuk demonstrasi dan evaluasi akademik/kompetisi**, telah diuji dengan sampel terbatas, dan siap dikembangkan lebih lanjut dengan dataset berskala lebih besar.
