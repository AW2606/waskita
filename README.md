# Waskita

**Waskita** adalah platform verifikasi konten berbasis AI dan deepfake yang dirancang untuk melindungi kelompok rentan dari ancaman penipuan digital melalui deteksi cepat, edukasi interaktif, dan transparansi analisis media.

Proyek ini menggunakan struktur **Unified Full-Stack Workspace** (Next.js frontend + FastAPI backend dalam satu root direktori) sehingga Anda dapat menjalankan dan mengembangkan seluruh sistem secara langsung dari root tanpa perlu berpindah-pindah folder.

---

## 🧠 Arsitektur & Model AI yang Digunakan

Waskita menerapkan sistem deteksi multi-jalur (*multi-modal verification pipeline*) yang memisahkan pemrosesan media berbasis **Deep Learning Pretrained Models** dan analisis teks/kontak berbasis **Heuristik Bahasa Indonesia & Basis Data Reputasi**:

### 1. Jalur Audio (Voice Spoof & Deepfake Speech Detection)
- **Model Pretrained**: [`MelodyMachine/Deepfake-audio-detection-V2`](https://huggingface.co/MelodyMachine/Deepfake-audio-detection-V2)
- **Arsitektur Dasar**: **Wav2Vec2 / Hubert Neural Transformer**
- **Metode Pemrosesan**:
  - Audio di-decode dan di-resample ke format **16kHz mono**.
  - Ekstraksi representasi akustik dan diskontinuitas fase frekuensi (*spectral artifacts*).
  - Klasifikasi probabilitas sintesis suara AI (*voice cloning / neural TTS*) vs suara manusia alami (*bonafide*).
- **Fallback Engine**: *Waskita Spectral & Harmonic Analyzer* (menghitung *zero-crossing rate* dan konsistensi dinamika pitch vokal).

### 2. Jalur Video (Visual Deepfake & Face Synthesis Detection)
- **Model Pretrained**: [`dima806/deepfake_vs_real_image_detection`](https://huggingface.co/dima806/deepfake_vs_real_image_detection)
- **Arsitektur Dasar**: **Vision Transformer (ViT-Base-Patch16-224)**
- **Metode Pemrosesan**:
  - Video diekstraksi secara merata menjadi **5 frame representatif** (*uniform temporal sampling*).
  - Setiap frame diproses melalui pipeline ViT untuk mendeteksi distorsi artefak tepi wajah, inkonsistensi pencahayaan, dan pola sintetis GAN/Diffusion.
  - Skor probabilitas akhir dihitung dari rata-rata (*temporal ensemble average*) seluruh frame sampel.

### 3. Jalur Teks Chat (Indonesian Social Engineering Heuristic)
- **Modul**: `api/services/heuristic_scanner.py`
- **Pendekatan**: Klasifikasi berbasis aturan NLP bahasa Indonesia dengan **5 klaster pola risiko tinggi**:
  1. *Urgensi Tinggi / Tekanan Waktu* (e.g., "transfer sekarang", "dalam 15 menit", "darurat", "jangan tunda")
  2. *Kerahasiaan Palsu* (e.g., "jangan bilang siapa-siapa", "rahasia antara kita", "jangan telepon balik")
  3. *Kredensial & Akses Rahasia* (e.g., "kode OTP", "kode verifikasi", "PIN", "password", "CVV")
  4. *Otoritas Palsu & Ancaman Hukum* (e.g., "polisi", "kejaksaan", "kasus narkoba", "blokir rekening")
  5. *Iming-iming Finansial* (e.g., "menang undian", "dana talangan", "komisi kilat", "uang kas kantor")

### 4. Jalur Nomor Telepon (Community Fraud Registry)
- **Basis Data**: Tabel `reported_numbers` di PostgreSQL/SQLite.
- **Pencocokan**: Normalisasi nomor telepon (`+62...` dan `08...`), memeriksa riwayat pelaporan penipuan dari komunitas serta modus pencatutan nama.

### 5. Modul Penerjemah Risiko (`risk_translator.py`)
Semua skor probabilitas mentah (0.0 – 1.0) dari seluruh jalur dinormalisasi melalui satu gerbang:
- **Tenang** (`< 0.40`) : Pola wajar dan alami.
- **Perlu Diperiksa** (`0.40 – 0.70`) : Terdapat indikasi anomali sintetis/urgensi.
- **Sangat Perlu Waspada** (`> 0.70`) : Indikasi kuat rekayasa AI atau penipuan aktif.
- **Prinsip Empati**: Selalu menyertakan disclaimer bahwa hasil merupakan penilaian komputasi awal dan bukan bukti mutlak, disertai rekomendasi tindakan bijak.

---

## 📁 Struktur Direktori

```text
waskita/
├── api/                     # Backend API (Python FastAPI)
│   ├── core/                # Konfigurasi & koneksi database
│   │   ├── config.py
│   │   └── database.py
│   ├── models/              # Model database SQLAlchemy
│   │   ├── family.py
│   │   ├── reported_number.py
│   │   ├── user.py
│   │   └── verification.py
│   ├── routers/             # Endpoint API (/api/verify, /api/family)
│   │   ├── family.py
│   │   └── verify.py
│   ├── schemas/             # Pydantic validation schemas
│   ├── services/            # Logika AI, Heuristik, & Risk Translator
│   │   ├── heuristic_scanner.py
│   │   ├── ml_models.py
│   │   └── risk_translator.py
│   └── main.py              # Entry point FastAPI & startup lifespan
│
├── src/                     # Frontend Web App (Next.js App Router)
│   ├── app/                 # Pages (/verifikasi, /keluarga, /belajar)
│   ├── components/          # Reusable UI (Navbar, Footer, ClarityGauge)
│   ├── lib/                 # API client (api.ts) & auth
│   └── styles/              # Custom styling
│
├── public/                  # Static assets
├── docs/                    # PRD dan catatan desain
├── docker-compose.yml       # PostgreSQL 16 & Redis 7
├── .env.example             # Template konfigurasi environment variables
├── requirements.txt         # Dependensi Python Backend (PyTorch, Transformers, dll.)
├── package.json             # Dependensi Frontend & unified dev runner
├── tsconfig.json
├── next.config.ts
├── .gitignore
└── README.md
```

---

## 🚀 Panduan Menjalankan Secara Lokal

### 1. Persiapan Awal (Hanya Sekali)

1. **Setup Python Virtual Environment & Install Model Libraries**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     pip install -r requirements.txt
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     pip install -r requirements.txt
     ```

2. **Setup Node.js Dependencies**:
   ```bash
   npm install
   ```

3. **Salin Environment Variables**:
   ```bash
   cp .env.example .env
   ```

---

### 2. Jalankan Database & Cache (Docker Compose)
Pastikan Docker Desktop sudah aktif, lalu jalankan:

```bash
docker compose up -d
```
- **PostgreSQL**: `localhost:5432` (DB: `waskita_db`, User: `postgres`, Pass: `postgres`)
- **Redis**: `localhost:6379`

---

### 3. Menjalankan Frontend & Backend Sekaligus

Cukup jalankan satu perintah dari root folder:

```bash
npm run dev
```

Perintah di atas akan otomatis mengaktifkan:
- 🌐 **Frontend (Next.js)**: [http://localhost:3000](http://localhost:3000)
- ⚙️ **Backend (FastAPI)**: [http://localhost:8000](http://localhost:8000)
  - Health Check: [http://localhost:8000/health](http://localhost:8000/health)
  - Swagger UI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 4. Menjalankan Terpisah (Opsional)

Jika hanya ingin menjalankan salah satu service:
- **Hanya Frontend**: `npm run dev:next`
- **Hanya Backend**: `npm run dev:api`
