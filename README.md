# Waskita — Platform Verifikasi Konten AI & Deepfake

<p align="center">
  <strong>Instrumen Literasi & Penapisan Awal Perlindungan Digital Berbasis AI & Forensik Akustik di Indonesia</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js%2016%20(App%20Router)-2F6F62?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Backend-FastAPI%20(Python%203.13)-10322C?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/AI_Audio-Wav2Vec2_%26_Whisper-D9A441?style=for-the-badge&logo=huggingface&logoColor=white" alt="Wav2Vec2" />
  <img src="https://img.shields.io/badge/AI_Vision-Vision_Transformer_(ViT)-2F6F62?style=for-the-badge&logo=pytorch&logoColor=white" alt="ViT" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL_%2F_SQLite-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="Database" />
  <img src="https://img.shields.io/badge/Security-Bcrypt_%26_Zero_Retention-success?style=for-the-badge&logo=shield&logoColor=white" alt="Security" />
</p>

---

## 🌟 Tentang Waskita

**Waskita** (*Kewaspadaan Kita*) adalah platform penapisan awal multi-modalitas (*early triage & educational verification*) yang dirancang khusus untuk melindungi masyarakat Indonesia dan kelompok rentan (seperti lansia dan keluarga) dari gelombang kejahatan siber modern berbasis kecerdasan buatan (*AI-powered cyberfraud*):
- **Kloning Suara AI (*Deepfake Voice*)**: Peniruan suara anak, atasan, atau keluarga yang meminta transfer uang darurat.
- **Manipulasi Video & Citra (*Deepfake Visual*)**: Rekayasa visual tokoh publik atau keluarga untuk penipuan bantuan finansial.
- **Rekayasa Sosial Bertekanan Waktu (*Social Engineering*)**: Pola percakapan ancaman intimidasi, isolasi rahasia (*secrecy*), dan desakan transfer cepat.
- **Tautan Phishing & APK Berbahaya**: Penipuan undian palsu, surat tilang palsu, dan tautan perbankan tiruan (*typosquatting*).

Aplikasi dibangun menggunakan arsitektur **Unified Full-Stack Workspace**, menyatukan frontend Next.js 16 modern dengan backend FastAPI berkinerja tinggi yang berjalan mulus dengan satu perintah eksekusi.

---

## 🛡️ Fitur Utama Platform

### 1. Radar Kejernihan (*Semicircle Clarity Gauge*)
- Visualisasi skor risiko 0 - 100% yang intuitif dengan 3 zona ramah awam: **Tenang** (0-39%), **Perlu Diperiksa** (40-70%), dan **Sangat Waspada** (71-100%).
- Menyajikan rekomendasi tindakan nyata (*actionable advice*) tanpa menghakimi pengguna awam.

### 2. Analisis Wacana Berpagar Niat (*Intent-Gated Discourse Engine*)
- Menggabungkan transkripsi **Whisper ASR** lokal dan pemrosesan bahasa alami (NLP) bahasa Indonesia untuk membedakan:
  - Narasi edukasi/informasi publik (misal: *"Hati-hati penipuan yang minta transfer segera..."*) -> **Aman / Zona Tenang**.
  - Serangan imperatif langsung (misal: *"Saya dari kepolisian, segera transfer 5 juta dalam 15 menit!"*) -> **Bahaya / Zona Sangat Waspada**.

### 3. Perlindungan Keluarga (*Family Protection Shield*)
- **Safe Word (Kata Sandi Rahasia Keluarga)**: Kode verifikasi internal keluarga untuk membuktikan keaslian panggilan telepon darurat.
- **Duress Code (Kode Sandera / Paksaan)**: Kode sinyal bahaya terselubung jika pengguna dipaksa pelaku penipuan untuk mengonfirmasi sandi.

### 4. Modul Literasi & Simulasi Interaktif (`/belajar`)
- Laboratorium skenario nyata: simulasi interaktif menghadapi modus kloning suara pejabat, telepon penculikan anak palsu, hingga file APK undangan nikah bodong.

---

## 🔒 Kebijakan Privasi & Keamanan Data (*Privacy by Design*)

Privasi pengguna dan keamanan data keluarga dikelola secara ketat dengan standar kepatuhan UU Pelindungan Data Pribadi (UU PDP No. 27/2022):

1. **Pemrosesan Media Tanpa Retensi (*Zero-Retention Policy*)**:
   - File rekaman suara, video, dan gambar yang diunggah pengguna diproses secara *ephemeral* di memori RAM server selama siklus inferensi AI.
   - Segera setelah hasil evaluasi dikembalikan, file media mentah **seketika dimusnahkan secara permanen dari server** melalui blok *cleanup* `finally`. Tidak ada salinan file media yang disimpan ke disk penyimpanan atau basis data.
2. **Kata Sandi Rahasia Keluarga Terenkripsi (*Server-Side Bcrypt Hashing*)**:
   - *Safe Word* dan *Duress Code* di-hash satu arah menggunakan algoritma **bcrypt (12 rounds)** di backend sebelum disimpan ke basis data.
   - Kode rahasia **tidak pernah disimpan dalam bentuk teks biasa (plaintext) di database** dan **dilarang disimpan di `localStorage` / `sessionStorage` peramban**.
   - Endpoint verifikasi hanya mengembalikan status kecocokan (*boolean `true/false`*), tanpa pernah mengekspos kata sandi aslinya ke antarmuka pengguna (*Zero-Leakage Architecture*).
3. **Batasan Mode Offline (*Privacy-Guarded Fallback*)**:
   - Mode analisis lokal di sisi klien **dibatasi secara ketat hanya untuk fitur non-sensitif** (pemindaian pola kata kunci teks publik dan heuristik domain phishing) yang berjalan murni di memori browser tanpa menyimpan data pribadi.
   - Seluruh fitur sensitif (Safe Word, riwayat akun terenkripsi, manajemen anggota keluarga) **wajib terhubung ke server backend terautentikasi**.

---

## 🧠 Arsitektur AI & Forensik Sinyal

Waskita memadukan model pembelajaran mendalam (*deep learning*) dan teknik forensik sinyal digital:

```
                              ┌───────────────────────────────────────────────┐
                              │           MEDIA INPUT PENGGUNA                │
                              └──────┬────────────────┬───────────────┬───────┘
                                     │                │               │
                              [Suara / Audio]  [Video / Foto]  [Teks / Telepon]
                                     │                │               │
     ┌───────────────────────────────┴────────┐       │               │
     │ Whisper ASR + Wav2Vec2 + DSP Forensics │       │               │
     │ • Hardware ADC Silence vs Neural Zeros │       │               │
     │ • Spectral Centroid & HiFi-GAN Formant │       │               │
     │ • Intent-Gated Discourse Classifier    │       │               │
     └───────────────┬────────────────────────┘       │               │
                     │                                │               │
                     │          ┌─────────────────────┴──────────┐    │
                     │          │ Vision Transformer (ViT)       │    │
                     │          │ • Calibrated Logit Margin      │    │
                     │          │ • Temporal Frame Sampling (5x) │    │
                     │          │ • Single-Frame Uncertainty Tag │    │
                     │          └─────────────────────┬──────────┘    │
                     │                                │               │
                     │                                │       ┌───────┴───────────────┐
                     │                                │       │ Indonesian Cyber NLP  │
                     │                                │       │ • Slang Cyber De-obf  │
                     │                                │       │ • 6 Scam Clusters     │
                     │                                │       │ • Typosquatting Check │
                     │                                │       └───────┬───────────────┘
                     │                                │               │
                     └────────────────►   FUSION ENGINE   ◄───────────┘
                                              │
                                              ▼
                                ┌───────────────────────────┐
                                │     RADAR KEJERNIHAN      │
                                │   (Unified Risk Score)    │
                                └───────────────────────────┘
```

### Rincian Komponen Model:
1. **Jalur Audio & Vokal (Voice Cloning & Acoustic Forensics)**:
   - **Speech-to-Text**: [`openai/whisper-tiny`](https://huggingface.co/openai/whisper-tiny) untuk transkripsi ucapan bahasa Indonesia secara lokal.
   - **Model Akustik**: [`Gustking/wav2vec2-large-xlsr-deepfake-audio-classification`](https://huggingface.co/Gustking/wav2vec2-large-xlsr-deepfake-audio-classification).
   - **Diskriminator Forensik Perangkat Keras (*Hardware ADC vs Neural Silence*)**: Membedakan jeda hening digital mutlak khas TTS AI ($7\% - 18\%$ zero-samples) dengan desis noise dasar termal mikrofon fisik ($<0.2\%$ zeros).
   - **Profil Formant Vocoder**: Analisis konsentrasi energi frekuensi menengah ($1.0 - 3.5\text{ kHz}$) dan *spectral rolloff*.

2. **Jalur Video & Citra (Visual Deepfake Detection)**:
   - **Model Pretrained**: [`prithivMLmods/Deep-Fake-Detector-v2-Model`](https://huggingface.co/prithivMLmods/Deep-Fake-Detector-v2-Model) (Vision Transformer / ViT).
   - **Metode**: *Uniform temporal sampling* (5 frame representatif via OpenCV) dipadukan dengan *Calibrated Logit Margin* dan penandaan ketidakpastian khusus citra diam (*single-frame disclaimer*).

3. **Jalur Teks Chat & Tautan Phishing**:
   - **Heuristik NLP Bahasa Indonesia**: Pemetaan singkatan gaul percakapan darurat (`"trfd skrg"`, `"tf bsk"`, `"jgn ksh tau"`) dan klasifikasi 6 klaster modus rekayasa sosial.
   - **Phishing URL Scanner**: Deteksi pemendek tautan (*shortlinks*) dan domain *typosquatting* peniru perbankan/layanan publik.

4. **Sidik Jari Komunitas (SHA-256 Exact Match Cache)**:
   - Pencocokan hash kriptografi SHA-256 untuk mendeteksi file identik yang pernah dilaporkan tanpa mengulang komputasi inferensi (*exact byte match*).

---

## 📊 Hasil Pengujian Empiris (Independent Holdout Benchmark)

> [!NOTE]
> **Catatan Transparansi & Responsible AI:**  
> Seluruh model dan ambang batas dalam Waskita diuji menggunakan **16 sampel data baru yang belum pernah dilihat sistem** (*holdout dataset*) untuk mencegah bias validasi melingkar (*circular validation*). Sistem ini dirancang sebagai instrumen edukasi dan penapisan awal (*triage support*), bukan sebagai alat pembuktian forensik hukum mutlak.

### 🧪 1. Hasil Pengujian Audio Holdout (8 Sampel Baru Independen)
| No | File Sampel Uji | Target Sebenarnya | Output Skor AI | Prediksi Sistem | Evaluasi Forensik |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | `holdout_tts_1_ardi_news.mp3` | **AI (TTS)** | **96.0%** | **AI (TTS)** ✅ | Jeda hening digital ($11.4\%$ zero), Centroid $1.141\text{ Hz}$. |
| 2 | `holdout_tts_2_gadis_casual.mp3` | **AI (TTS)** | **67.8%** | **AI (TTS)** ✅ | *Silence gating* ($17.4\%$ zero), Centroid $1.210\text{ Hz}$. |
| 3 | `holdout_tts_3_ardi_warning.mp3` | **AI (TTS)** | **96.0%** | **AI (TTS)** ✅ | Formant vocoder AI ($13.7\%$ zero), Rolloff $1.005\text{ Hz}$. |
| 4 | `holdout_tts_4_gadis_education.mp3` | **AI (TTS)** | **96.0%** | **AI (TTS)** ✅ | Jeda digital mutlak ($16.9\%$ zero), Centroid $1.279\text{ Hz}$. |
| 5 | `holdout_human_1_female_room.wav` | **Manusia Asli** | **39.8%** | **Manusia Asli** ✅ | Noise latar ruangan analog kontinu ($0.0\%$ digital zero). |
| 6 | `holdout_human_2_male_chest.wav` | **Manusia Asli** | **46.5%** | **Manusia Asli** ✅ | Resonansi dada alami (F0: 115Hz, Centroid $445\text{ Hz}$). |
| 7 | `holdout_human_3_conversational.wav` | **Manusia Asli** | **47.9%** | **Manusia Asli** ✅ | Jeda bicara wajar dengan noise termal mikrofon fisik. |
| 8 | `holdout_human_4_outdoor_phone.wav` | **Manusia Asli** | **4.0%** | **Manusia Asli** ✅ | Ambiens suara luar ruangan kontinu (-0.45 human modifier). |

* **Akurasi Nyata Audio Holdout**: **8 dari 8 (100.0%)**.

---

### 🧪 2. Hasil Pengujian Gambar Holdout (8 Sampel Baru Independen)
| No | File Sampel Uji | Target Sebenarnya | Output Skor AI | Prediksi Sistem | Evaluasi Visual |
| :---: | :--- | :---: | :---: | :---: | :--- |
| 1 | `holdout_ai_1_diffusion_portrait.jpg` | **AI / Deepfake** | **82.9%** | **AI / Deepfake** ✅ | Tekstur difusi halus tanpa sensor grain fisik. |
| 2 | `holdout_ai_2_faceswap.jpg` | **AI / Deepfake** | **56.8%** | **AI / Deepfake** ✅ | Inkonsistensi gradien batas tempelan wajah. |
| 3 | `holdout_ai_3_latent_grid.jpg` | **AI / Deepfake** | 25.4% | Foto Asli ❌ *(FN)* | Pola dekonvolusi kisi tidak terbaca oleh ViT. |
| 4 | `holdout_ai_4_gan_avatar.jpg` | **AI / Deepfake** | 25.4% | Foto Asli ❌ *(FN)* | Saturasi buatan tanpa artefak spasial standar. |
| 5 | `holdout_real_1_outdoor.jpg` | **Foto Asli** | **25.9%** | **Foto Asli** ✅ | Sensor grain ISO alami & gradien outdoor. |
| 6 | `holdout_real_2_indoor_portrait.jpg` | **Foto Asli** | **46.8%** | **Foto Asli** ✅ | Kedalaman fokus lensa optik dan kehalusan kulit. |
| 7 | `holdout_real_3_macro.jpg` | **Foto Asli** | **26.4%** | **Foto Asli** ✅ | Tekstur mikro alami dengan aberasi kromatik. |
| 8 | `holdout_real_4_lowlight.jpg` | **Foto Asli** | 58.8% | AI / Deepfake ❌ *(FP)* | Noise kromatik sensor minim cahaya terbaca anomali. |

* **Akurasi Nyata Gambar Holdout**: **5 dari 8 (62.5%)**.

---

### ⚠️ Keterbatasan yang Diketahui (*Known Limitations*) & Mitigasi Desain

1. **Sensitivitas Sinyal Akustik pada Rekaman Ekstrem**:
   - Model sinyal akustik rentan terhadap *false-positive* pada rekaman vokal manusia dengan karakteristik sinyal khusus (seperti kompresi pita telepon atau jeda buatan).
   - **Mitigasi (*Intent-Gated Protection*)**: Sistem menerapkan aturan ketat di mana anomali sinyal akustik semata pada percakapan normal/edukasi **dibatasi maksimal pada level 'Perlu Diperiksa' ($\le 65\%$) dan tidak akan pernah memicu vonis 'Sangat Waspada'**. Level bahaya tinggi hanya aktif jika terdeteksi kombinasi suara sintesis DAN pesan penipuan aktif (*serangan langsung*).
2. **Keterbatasan Analisis Citra Diam (*Static Single-Frame*)**:
   - Analisis citra statis mengevaluasi distorsi spasial per-frame tanpa informasi delta temporal. Sistem secara visual menyematkan *disclaimer* khusus pada hasil analisis foto tunggal untuk menyarankan verifikasi manual. Deteksi video multi-frame tetap menjadi pendekatan yang jauh lebih reliabel.

---

## 🚀 Panduan Menjalankan Sistem (Untuk Kontributor & Pengembang)

### Prasyarat:
- **Node.js**: v18.0 atau lebih baru & npm
- **Python**: v3.10 s.d. v3.13

---

### Langkah Instalasi Lengkap:

```bash
# 1. Clone repositori
git clone https://github.com/AW2606/waskita.git
cd waskita

# 2. Salin Konfigurasi Environment (.env)
# Windows (PowerShell / Command Prompt):
copy .env.example .env
# Linux / macOS:
cp .env.example .env

# 3. Setup Virtual Environment Python & Install Dependensi Backend
python -m venv .venv

# Aktivasi Virtual Environment:
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (CMD):
.venv\Scripts\activate.bat
# Linux / macOS:
source .venv/bin/activate

# Install dependensi Python:
pip install -r requirements.txt

# 4. Setup Dependensi Frontend
npm install

# 5. Jalankan Aplikasi (Frontend Port 3000 & Backend Port 8000)
# Windows:
npm run dev

# Linux / macOS:
npm run dev:unix
```

> [!TIP]
> **Opsi Menjalankan di 2 Terminal Terpisah (Lebih Mudah Debug):**
> - **Terminal 1 (Backend FastAPI):**
>   ```bash
>   .venv\Scripts\activate   # (atau source .venv/bin/activate di Linux/macOS)
>   python -m uvicorn api.main:app --reload --port 8000
>   ```
> - **Terminal 2 (Frontend Next.js):**
>   ```bash
>   npm run dev:next
>   ```

Aplikasi siap diakses melalui:
* **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
* **Dokumentasi Interaktif FastAPI (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check Backend**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🛠️ Panduan Environment (.env) & Database

File `.env.example` telah dikonfigurasi agar **langsung siap pakai (zero-config plug-and-play)**:

| Variabel | Default Lokal (Plug-and-Play) | Opsi Docker / PostgreSQL | Keterangan |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///./waskita_dev.db` | `postgresql://postgres:postgres@localhost:5432/waskita_db` | Database lokal SQLite dibuat otomatis tanpa instalasi tambahan. |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `http://localhost:8000` | URL API FastAPI yang dipanggil oleh antarmuka Next.js. |
| `NEXTAUTH_SECRET` | `waskita-dev-secret-token-key-2026` | String acak aman | Secret key untuk enkripsi session JWT login. |
| `NEXTAUTH_URL` | `http://localhost:3000` | `http://localhost:3000` | Base URL aplikasi Next.js. |
| `BACKEND_PORT` | `8000` | `8000` | Port server FastAPI. |

> Jika ingin menggunakan PostgreSQL + Redis via Docker:
> ```bash
> docker-compose up -d
> ```
> Lalu aktifkan baris `DATABASE_URL=postgresql://...` di file `.env`.

---

## ❓ FAQ & Troubleshooting Kontributor

### 1. Kenapa gagal saat "Daftar Akun" (`/daftar`) atau muncul "Gagal memproses verifikasi"?
* **Penyebab:** Server backend FastAPI (Port 8000) belum berjalan atau belum ada file `.env`.
* **Solusi:**
  1. Pastikan file `.env` sudah ada (`copy .env.example .env`).
  2. Pastikan backend aktif di `http://localhost:8000/docs`. Jika membuka URL tersebut muncul halaman Swagger, berarti backend sudah berjalan normal.
  3. Pastikan virtual environment `.venv` sudah terinstal paket `requirements.txt`.

### 2. Error `The system cannot find the path specified` saat `npm run dev` (di Linux/macOS):
* **Penyebab:** Perintah `npm run dev` default menggunakan path Windows (`.venv\Scripts\python`).
* **Solusi:** Gunakan perintah `npm run dev:unix` untuk Linux/macOS.

### 3. Error `ModuleNotFoundError` saat menjalankan backend:
* **Solusi:** Pastikan virtual environment aktif saat menginstall library:
  ```bash
  .venv\Scripts\activate
  pip install -r requirements.txt
  ```

---

## 📁 Struktur Repositori

```text
waskita/
├── api/                             # Backend API (FastAPI Python)
│   ├── core/                        # Konfigurasi database, keamanan JWT & bcrypt hashing
│   ├── models/                      # Skema tabel SQLAlchemy (User, Verification, FamilyMember, Scenario)
│   ├── routers/                     # Endpoint RESTful API (/auth, /verify, /family, /scenarios)
│   ├── schemas/                     # Validasi input & response Pydantic
│   └── services/                    # Engine AI, Forensik Akustik, Intent NLP, & Risk Translator
├── src/                             # Frontend Web Application (Next.js 16 App Router)
│   ├── app/                         # Routing halaman Next.js (/verifikasi, /belajar, /keluarga, /login)
│   ├── components/                  # Komponen UI modular (ClarityGauge, Navbar, Footer, SafeWordModal)
│   └── lib/                         # API Client (api.ts) & State Management Auth
├── kesimpulan.md                    # Laporan komprehensif arsitektur, kepatuhan privasi, & benchmark
├── requirements.txt                 # Dependensi Python Backend (PyTorch, Transformers, FastAPI, Librosa)
└── package.json                     # Dependensi Frontend (Next.js, React, TailwindCSS, Lucide)
```

---

## ⚖️ Status Kesiapan & Lisensi

Waskita berstatus **fungsional penuh untuk demonstrasi, evaluasi akademik, dan kompetisi inovasi digital**. Seluruh data pengujian disajikan secara transparan dan terbuka untuk pengembangan berkelanjutan demi ekosistem digital Indonesia yang lebih aman dan terpercaya.
