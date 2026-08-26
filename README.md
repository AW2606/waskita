# Waskita — Platform Verifikasi Konten AI & Deepfake

<p align="center">
  <strong>Melindungi Kelompok Rentan dari Ancaman Penipuan Digital Berbasis AI & Deepfake</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js%2016%20(App%20Router)-2F6F62?style=flat-square" alt="Next.js" />
  <img src="https://img.shields.io/badge/Backend-FastAPI%20(Python)-10322C?style=flat-square" alt="FastAPI" />
  <img src="https://img.shields.io/badge/AI_Audio-Wav2Vec2-D9A441?style=flat-square" alt="Wav2Vec2" />
  <img src="https://img.shields.io/badge/AI_Vision-Vision_Transformer_(ViT)-2F6F62?style=flat-square" alt="ViT" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL_%2F_SQLite-blue?style=flat-square" alt="Database" />
  <img src="https://img.shields.io/badge/Cache-Redis_7-C98A3B?style=flat-square" alt="Redis" />
</p>

---

## 🌟 Tentang Waskita

**Waskita** adalah platform verifikasi konten multi-jalur (*multi-modal AI verification*) yang dirancang khusus untuk melindungi masyarakat dan kelompok rentan (seperti lansia dan keluarga) dari jeratan kejahatan digital modern: kloning suara (*voice spoofing*), manipulasi video (*deepfake*), pesan rekayasa sosial bertekanan waktu, dan nomor telepon penipuan.

Proyek ini dibangun dengan arsitektur **Unified Full-Stack Workspace**, menyatukan frontend Next.js dan backend FastAPI dalam satu root repositori sehingga seluruh layanan dapat dijalankan dengan satu perintah tunggal.

---

## 🗄️ Status & Cara Kerja Database (Dual-Engine System)

Aplikasi Waskita dilengkapi mekanisme **Dual-Engine Database** yang cerdas dan tangguh (*fault-tolerant*):

1. **Mode Lokal Otomatis (SQLite — `waskita_dev.db`) [Aktif Default]**:
   - Jika Anda menjalankan aplikasi tanpa Docker, backend otomatis membuat dan menggunakan database lokal **`waskita_dev.db`**.
   - *Zero-configuration*: Anda tidak perlu menginstal software database tambahan untuk langsung mencoba dan mengembangkan aplikasi.
   - Menyimpan tabel: `users`, `verifications`, `family_links`, `reported_numbers`, dan `scenarios`.

2. **Mode Production (PostgreSQL 16 & Redis 7)**:
   - Dijalankan melalui container Docker:
     ```bash
     docker compose up -d
     ```
   - Menyediakan skalabilitas tinggi dan isolasi database skala industri.

---

## 🔒 Kebijakan Retensi Data Sensitif (*Zero Permanent Media Storage*)

Privasi pengguna dan keamanan data keluarga adalah prioritas utama Waskita:

1. **Pemrosesan Sementara di Memori (*In-Memory / Temp Processing*)**: File rekaman suara atau video yang diunggah pengguna hanya ditempatkan pada memori sementara (*temporary buffer*) selama siklus inferensi model AI berlangsung.
2. **Pembersihan Seketika (*Instant Purge*)**: Segera setelah proses analisis selesai (baik berhasil maupun gagal), file media mentah **langsung dihapus secara permanen dari memori dan disk server** melalui blok `finally`.
3. **Hanya Metadata yang Disimpan**: Database **hanya menyimpan teks hasil temuan, skor risiko, dan penjelasan awam**, bukan file rekaman audio atau video aslinya.

---

## 🧠 Arsitektur & Model AI yang Digunakan

Waskita menerapkan pendekatan multi-jalur (*multi-modal verification pipeline*) yang memadukan **Deep Learning Pretrained Models** dan **Heuristik NLP Bahasa Indonesia**:

### 1. Jalur Audio (Voice Spoofing & AI Speech Classification)
- **Model Pretrained**: [`Gustking/wav2vec2-large-xlsr-deepfake-audio-classification`](https://huggingface.co/Gustking/wav2vec2-large-xlsr-deepfake-audio-classification)
- **Arsitektur**: **Wav2Vec2-Large-XLSR Neural Audio Transformer**
- **Library**: `transformers.AutoModelForAudioClassification`, `transformers.AutoFeatureExtractor`, `torch`
- **Metode**: Audio di-decode dan di-resample ke format **16kHz mono**, diekstraksi representasi akustiknya, dan diklasifikasikan probabilitas sintesis suara AI (`fake`) vs ucapan manusia alami (`real`).
- **Singleton Memory**: Dimuat sekali ke memori saat startup aplikasi (*ModelManager Singleton*) untuk latensi instan.

### 2. Jalur Video (Visual Deepfake & Face Synthesis Detection)
- **Model Pretrained**: [`prithivMLmods/Deep-Fake-Detector-v2-Model`](https://huggingface.co/prithivMLmods/Deep-Fake-Detector-v2-Model)
- **Arsitektur**: **Vision Transformer (ViT / ViTForImageClassification)**
- **Library**: `transformers.AutoModelForImageClassification`, `transformers.AutoImageProcessor`, `opencv-python-headless`, `PIL`
- **Metode**: Menggunakan OpenCV untuk mengekstraksi **5 frame sampel representatif** yang tersebar merata (*uniform temporal sampling*). Setiap frame dinilai probabilitas deepfake-nya dan dirata-ratakan (*ensemble average*), dengan rincian skor per-frame disimpan untuk transparansi.

### 3. Jalur Teks Chat (Indonesian Social Engineering Heuristic)
- **Modul**: `api/services/heuristic_scanner.py`
- **Metode**: Analisis berbasis aturan NLP bahasa Indonesia dengan **5 klaster pola risiko tinggi**:
  1. *Urgensi Tinggi / Tekanan Waktu* (contoh: "transfer sekarang", "dalam 15 menit", "darurat", "jangan tunda")
  2. *Kerahasiaan Palsu* (contoh: "jangan bilang siapa-siapa", "rahasia antara kita", "jangan telepon balik")
  3. *Kredensial & Akses Rahasia* (contoh: "kode OTP", "kode verifikasi", "PIN", "password", "CVV")
  4. *Otoritas Palsu & Ancaman Hukum* (contoh: "polisi", "kejaksaan", "kasus narkoba", "blokir rekening")
  5. *Iming-iming Finansial* (contoh: "menang undian", "dana talangan", "komisi kilat", "uang kas kantor")

### 4. Jalur Nomor Telepon (Community Fraud Registry)
- **Basis Data**: Tabel `reported_numbers`
- **Metode**: Normalisasi format nomor internasional dan lokal (`+62...` / `08...`) serta pencocokan riwayat laporan modus penipuan dan pencatutan nama.

### 5. Modul Penerjemah Risiko Terpusat (`risk_translator.py`)
Seluruh skor probabilitas mentah (0.0 – 1.0) dipetakan secara terpusat:
- **Tenang** (`< 0.40`) : Pola wajar dan alami.
- **Perlu Diperiksa** (`0.40 – 0.70`) : Terdeteksi anomali atau desakan yang meragukan.
- **Sangat Perlu Waspada** (`> 0.70`) : Indikasi kuat rekayasa AI atau penipuan aktif.
- **Prinsip Empati**: Penjelasan bahasa Indonesia awam yang ramah dan **selalu menyertakan disclaimer bahwa hasil merupakan penilaian komputasi awal dan bukan bukti mutlak**, serta menyarankan verifikasi manual.

---

## 🔐 Autentikasi & Isolasi Data Multi-Tenant

- **NextAuth + FastAPI Auth**: Autentikasi credentials menggunakan hashing **`bcrypt`** dan sesi bertanda tangan **JWT (JSON Web Token)**.
- **Isolasi Data Per-User**: Data anggota keluarga (`family_links`) dan riwayat verifikasi (`verifications`) terisolasi 100% per akun pengguna. Pengguna lain tidak dapat melihat atau mengakses data akun lain (`403 Forbidden`).

---

## ⚡ Redis Caching

- Endpoint daftar skenario simulasi (`GET /api/scenarios`) di-cache di Redis (`waskita:scenarios:list`) dengan TTL 300 detik (5 menit).
- Dilengkapi mekanisme *fallback* otomatis yang mulus bila service Redis sedang offline.

---

## 📁 Struktur Direktori Proyek

```text
waskita/
├── api/                     # Backend API (Python FastAPI)
│   ├── core/                # Konfigurasi, DB Engine, & Keamanan JWT/bcrypt
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/              # Model database SQLAlchemy
│   │   ├── family.py
│   │   ├── reported_number.py
│   │   ├── scenario.py
│   │   ├── user.py
│   │   └── verification.py
│   ├── routers/             # Endpoint API modular
│   │   ├── auth.py          # /api/auth/register & /api/auth/login
│   │   ├── family.py        # /api/family
│   │   ├── scenarios.py     # /api/scenarios
│   │   └── verify.py        # /api/verify
│   ├── schemas/             # Schema validasi Pydantic
│   ├── services/            # Engine AI, Heuristik, & Risk Translator
│   │   ├── heuristic_scanner.py
│   │   ├── ml_models.py
│   │   └── risk_translator.py
│   └── main.py              # Entry point FastAPI & startup lifespan
│
├── src/                     # Frontend Web App (Next.js 16 App Router)
│   ├── app/                 # Pages & Layouts
│   │   ├── belajar/         # Halaman simulasi edukasi dinamis
│   │   ├── daftar/          # Halaman registrasi akun baru
│   │   ├── keluarga/        # Halaman pendamping keluarga
│   │   ├── login/           # Halaman masuk akun
│   │   ├── verifikasi/      # Alur verifikasi media (/proses, /hasil)
│   │   ├── globals.css      # Design token & warna kustom
│   │   └── layout.tsx       # Root layout & AuthProvider
│   ├── components/          # Reusable UI (Navbar, Footer, ClarityGauge, AuthProvider)
│   ├── lib/                 # API Client (api.ts) & NextAuth (auth.ts)
│   └── styles/              # Custom styling
│
├── docker-compose.yml       # PostgreSQL 16 & Redis 7
├── .env.example             # Template konfigurasi environment variables
├── requirements.txt         # Dependensi Python Backend
├── package.json             # Dependensi Frontend & unified dev runner
├── tsconfig.json
├── next.config.ts
├── .gitignore
└── README.md
```

---

## 🚀 Panduan Menjalankan Secara Lokal

### 1. Persiapan Dependensi (Hanya Sekali)

1. **Python Virtual Environment & Dependencies**:
   ```bash
   python -m venv .venv
   # Windows:
   .\.venv\Scripts\Activate.ps1
   # Linux/macOS:
   source .venv/bin/activate

   pip install -r requirements.txt
   ```

2. **Node.js Dependencies**:
   ```bash
   npm install
   ```

3. **Salin Konfigurasi Environment**:
   ```bash
   cp .env.example .env
   ```

---

### 2. Menjalankan Aplikasi (Frontend + Backend)

Cukup jalankan satu perintah dari root folder:

```bash
npm run dev
```

Perintah di atas akan otomatis mengaktifkan:
- 🌐 **Frontend (Next.js)**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **Backend (FastAPI)**: [http://localhost:8000](http://localhost:8000)
  - Dokumentasi Interaktif Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
  - Health Check: [http://localhost:8000/health](http://localhost:8000/health)

---

### 3. Menjalankan Docker Service (Opsional / Production Mode)

Bila ingin menggunakan PostgreSQL dan Redis di background:
```bash
docker compose up -d
```
*(Bila Docker tidak dijalankan, aplikasi tetap berjalan normal dengan SQLite lokal).*
