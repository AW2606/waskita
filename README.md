# Waskita — Platform Verifikasi Konten AI & Deepfake

<p align="center">
  <strong>Instrumen Literasi & Penapisan Awal Perlindungan Digital Berbasis AI & Forensik Akustik di Indonesia</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js%20(App%20Router)-2F6F62?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Backend-FastAPI%20(Python)-10322C?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/AI_Audio-Voice_Biometrics_%26_Whisper-D9A441?style=for-the-badge&logo=huggingface&logoColor=white" alt="AI Audio" />
  <img src="https://img.shields.io/badge/AI_Vision-Vision_Transformer_(ViT)-2F6F62?style=for-the-badge&logo=pytorch&logoColor=white" alt="ViT" />
  <img src="https://img.shields.io/badge/Security-Bcrypt_%26_Zero_Retention-success?style=for-the-badge&logo=shield&logoColor=white" alt="Security" />
</p>

---

## 🌟 Tentang Waskita

**Waskita** (*Kewaspadaan Kita*) adalah platform penapisan awal multi-modalitas (*early triage & educational verification*) yang dirancang untuk melindungi masyarakat dan keluarga dari berbagai modus kejahatan siber berbasis AI (*AI-powered cyberfraud*):

* **Kloning Suara AI (*Deepfake Audio*)**: Deteksi sintesis vokal tiruan yang memanfaatkan suara keluarga/atasan untuk desakan dana darurat.
* **Manipulasi Video & Wajah (*Deepfake Visual*)**: Analisis kejanggalan visual frame wajah dan inkonsistensi forensik video.
* **Rekayasa Sosial & Phishing (*Social Engineering*)**: Deteksi pola manipulasi psikologis, desakan waktu (*urgency*), isolasi kontak, dan link berbahaya.
* **Database Laporan Nomor Komunitas**: Pengecekan dan pelaporan nomor telepon mencurigakan secara terdesentralisasi dan aman.

---

## 🛡️ Fitur Utama

### 1. Radar Kejernihan (*Clarity Gauge*)
Skor risiko komprehensif (0–100%) dengan 3 tingkatan intuitif: **Tenang**, **Perlu Diperiksa**, dan **Sangat Waspada**, dilengkapi panduan langkah bijak yang dapat langsung diambil pengguna.

### 2. Multi-Signal AI & Acoustic Forensics
* **Audio & Suara**: Menggabungkan Whisper ASR (transkripsi lokal), ekstraksi fitur akustik 60-dimensi, dan klasifikasi wacana berpagar niat (*Intent-Gated Engine*).
* **Video & Citra**: Ekstraksi frame adaptif, Vision Transformer (ViT), dan analisis forensik spasial (Error Level Analysis, konsistensi noise, dan domain frekuensi).
* **Pesan Teks & URL**: Pemindai heuristik pola penipuan lokal Indonesia dan pendeteksi phishing link.

### 3. Pelaporan Nomor Mencurigakan (*Community Report Registry*)
Pengguna terdaftar dapat melaporkan nomor telepon mencurigakan disertai alasan singkat. Sistem menghitung akumulasi pelaporan publik untuk melindungi seluruh komunitas dengan tetap menjaga kerahasiaan identitas pelapor.

### 4. Perlindungan Keluarga (*Family Defense Shield*)
* **Safe Word (Kata Sandi Rahasia Keluarga)**: Kode verifikasi internal keluarga untuk memvalidasi keaslian panggilan darurat.
* **Duress Code (Kode Sinyal Paksaan)**: Kode alternatif untuk memberi sinyal bahaya terselubung jika pengguna berada di bawah tekanan penipu.

### 5. Laboratorium Literasi Digital (`/belajar`)
Modul interaktif berisi simulasi berbagai skenario penipuan digital nyata di Indonesia untuk meningkatkan literasi masyarakat.

---

## 🔒 Privasi & Keamanan (*Privacy by Design*)

Waskita mematuhi prinsip pelindungan data pribadi (UU PDP No. 27/2022):

1. **Zero Permanent Media Retention**: File audio, video, dan gambar diproses sementara di memori RAM dan **seketika dimusnahkan secara permanen** setelah inferensi selesai. Tidak ada media mentah yang disimpan ke disk penyimpanan atau basis data.
2. **Enkripsi Satu Arah (*One-Way Hashing*)**: Kata sandi akun, *Safe Word*, dan *Duress Code* di-hash menggunakan **bcrypt** sebelum disimpan ke database.
3. **Privasi Pelaporan Komunitas**: Identitas pelapor nomor telepon tidak pernah diekspos ke publik; antarmuka hanya menampilkan jumlah agregat laporan demi perlindungan bersama.

---

## 🚀 Panduan Instalasi & Menjalankan

### Prasyarat:
* **Node.js**: v18.0+ & npm
* **Python**: v3.10 – v3.13

### Langkah Menjalankan:

```bash
# 1. Clone repositori
git clone https://github.com/AW2606/waskita.git
cd waskita

# 2. Salin konfigurasi environment
cp .env.example .env

# 3. Setup Virtual Environment & Dependensi Backend
python -m venv .venv

# Aktivasi venv (Windows PowerShell):
.venv\Scripts\Activate.ps1
# Aktivasi venv (Linux / macOS):
# source .venv/bin/activate

pip install -r requirements.txt

# 4. Install Dependensi Frontend
npm install

# 5. Jalankan Aplikasi
# Windows:
npm run dev
# Linux / macOS:
npm run dev:unix
```

Aplikasi dapat diakses di:
* **Frontend Web App**: `http://localhost:3000`
* **Dokumentasi API (FastAPI Swagger)**: `http://localhost:8000/docs`
* **Health Check**: `http://localhost:8000/health`

---

## 🛠️ Konfigurasi Environment (`.env`)

Konfigurasi default telah dirancang *plug-and-play* menggunakan SQLite lokal:

| Variabel | Deskripsi | Default Pengembangan |
| :--- | :--- | :--- |
| `DATABASE_URL` | Koneksi database (SQLite / PostgreSQL) | `sqlite:///./waskita_dev.db` |
| `NEXT_PUBLIC_API_URL` | URL endpoint API FastAPI | `http://localhost:8000` |
| `NEXTAUTH_SECRET` | Secret key enkripsi sesi autentikasi | String acak aman |
| `NEXTAUTH_URL` | Base URL frontend Next.js | `http://localhost:3000` |
| `BACKEND_PORT` | Port server FastAPI | `8000` |

---

## 📁 Struktur Repositori

```text
waskita/
├── api/                             # Backend API (FastAPI Python)
│   ├── core/                        # Konfigurasi database & keamanan JWT/bcrypt
│   ├── models/                      # Skema tabel database SQLAlchemy
│   ├── routers/                     # Endpoint API (/auth, /verify, /family, /scenarios, /report-number)
│   ├── schemas/                     # Validasi model request & response Pydantic
│   └── services/                    # Engine AI, Forensik Akustik, ViT, & Heuristik NLP
├── src/                             # Frontend Web Application (Next.js 16 App Router)
│   ├── app/                         # Rute halaman (/verifikasi, /belajar, /keluarga, /login, /daftar)
│   ├── components/                  # Komponen UI modular (ClarityGauge, Navbar, Footer, Modal)
│   └── lib/                         # Client API & manajemen sesi
├── requirements.txt                 # Dependensi Python Backend
└── package.json                     # Dependensi Frontend
```

---

## ⚖️ Catatan Responsible AI

Waskita dirancang sebagai instrumen edukasi, peningkatan kewaspadaan publik, dan penapisan awal (*early triage support*). Sistem ini mengedepankan transparansi penjelasan hasil (*Explainable AI*) untuk membantu pengguna mengambil keputusan yang bijak secara mandiri.
