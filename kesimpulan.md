# DOKUMENTASI & LAPORAN STATUS EVALUASI PROYEK WASKITA 2.1

> **WASKITA (Waspada & Kita) — Versi 2.1 (Intent-Gated & Multi-Feature Forensics Edition)**  
> *Platform Penapisan Awal & Literasi Digital Berbasis AI untuk Menangkal Penipuan Siber, Deepfake Vokal/Visual, dan Rekayasa Sosial di Indonesia.*

---

## 1. Filosofi & Visi Proyek

**WASKITA 2.1** adalah instrumen penapisan awal (*early triage*) dan literasi keamanan digital yang dirancang untuk konteks sosiokultural masyarakat Indonesia. Di tengah maraknya penipuan digital berbasis kecerdasan buatan (*AI-driven fraud*) seperti kloning suara keluarga, video *deepfake* tokoh publik, pencurian OTP, dan penyebaran malware APK, Waskita memadukan **kecerdasan buatan multi-modalitas**, **kecepatan inferensi paralel**, **efek jaringan komunitas**, serta **protokol pertahanan keluarga**.

### Prinsip Utama Waskita 2.1:
1. **Empati & Human-Centric AI**: Mengganti istilah teknis yang menakutkan dengan indikator **"Radar Kejernihan"** (*Tenang*, *Perlu Diperiksa*, *Sangat Waspada*) serta panduan langkah bijak yang menenangkan.
2. **Intent-Gated Intelligence (Pemahaman Konteks & Niat)**: Tidak sekadar mencocokkan kata kunci mentah (*keyword matching*), tetapi menganalisis **bingkai wacana (discourse frame)** untuk membedakan narasi edukasi publik dari serangan penipuan imperatif aktif.
3. **Privasi Penuh & Kepatuhan UU PDP (*Zero-Retention Policy*)**: Seluruh file media mentah (audio dan video) diproses secara *ephemeral* di memori RAM dan **seketika dimusnahkan** pasca-analisis tanpa disimpan di penyimpanan permanen, sesuai amanat UU PDP No. 27/2022.
4. **Keamanan Data Keluarga (*Server-Side Bcrypt Hashing & Zero-Leakage*)**: Kata sandi rahasia keluarga (*Safe Word* & *Duress Code*) di-hash satu arah di server dan **tidak pernah disimpan di `localStorage` / `sessionStorage` peramban**.

---

## 2. Fitur-Fitur Utama yang Telah Diimplementasikan

### A. Verifikasi Media Multi-Format Cerdas (`/verifikasi`)
1. **Rekaman Suara / Audio Voice Note / Panggilan Telepon (`suara`)**:
   - Ekstraksi *Acoustic Deepfake Forensics* + *OpenAI Whisper ASR*.
   - Analisis fisik vokal: **Pitch Micro-Jitter**, keteraturan fase harmonik vocoder, rasio hening digital (*silence gating*), dan *spectral rolloff*.
   - Mendukung format `.mp3`, `.wav`, `.m4a`, `.ogg`, `.flac`, `.aac` (hingga 25MB) dengan fitur *Preset Sample Generator in-memory* untuk pengujian instan.
2. **Video & Foto Deepfake (`video`)**:
   - *Vision Transformer (ViT)* dengan sampling frame terdistribusi seragam via OpenCV.
   - Deteksi inkonsistensi temporal antar-frame dan artefak kompresi berulang (*WhatsApp Macroblocking Degradation*).
   - Mendukung `.mp4`, `.mov`, `.avi`, `.webm`, `.jpg`, `.png` (hingga 50MB).
3. **Pesan Teks / Chat WhatsApp / SMS (`pesan`)**:
   - Normalisasi bahasa gaul, singkatan siber, dan *typo* Indonesia (`"trfd skrg"`, `"tf bsk"`, `"jgn ksh tau"`, `"gbs"`).
   - Pemindai tautan berbahaya: deteksi *shortlink* (`bit.ly`, `s.id`, `cutt.ly`) dan domain *phishing typosquatting* perbankan/pemerintah (`bca-klik-auth.online`, `bri-link.xyz`).
4. **Pemeriksaan Reputasi Nomor Telepon (`telepon`)**:
   - Normalisasi multi-format (+62, 62, 08) terhadap basis data *blacklist* nomor penipuan komunitas.

---

### B. Radar Kejernihan & Explainable AI (XAI) (`/verifikasi/hasil`)
1. **Semicircle Clarity Gauge (Radar Kejernihan)**:
2. **Penilaian Terpadu & Human-Centric (*Unified Risk Synthesis*)**:
   - Menyatukan analisis akustik deepfake dan pemahaman niat kalimat ke dalam satu kesatuan indikator kualitatif ramah awam tanpa membebani pengguna dengan persentase ganda yang membingungkan.
3. **Kartu Klasifikasi Niat & Konteks Pembicaraan (*Intent-Gated XAI Box*)**:
   - Menampilkan label niat wacana (misal: *"Narasi Edukasi & Peringatan Modus Penipuan (Bukan Serangan Langsung)"*) beserta ringkasan alasan sistem.
   - Menyorot kata kunci terdeteksi dalam bingkai kontekstualnya (membedakan frasa dalam tips pencegahan vs frasa ancaman aktif).
4. **Peringatan Tautan Phishing & Kompresi Video**:
   - Menampilkan kotak peringatan saat terdeteksi tautan palsu perbankan atau penurunan kualitas kompresi media sosial.
5. **Widget Feedback Loop (*Human-in-the-Loop*)**:
   - Tombol interaktif masukan pengguna (*"Akurat & Membantu"* vs *"Laporkan Koreksi"*), meningkatkan catatan akurasi sistem.
6. **Akordeon Transparansi Teknis (*"Kenapa hasil ini begini?"*)**:
   - Menampung rincian teknis mendalam: transkripsi Whisper ASR, frekuensi spectral rolloff, micro-jitter vokal, serta **Catatan Etika & Tanggung Jawab AI (Responsible AI Disclaimer)**.
7. **Langkah Bijak yang Disarankan**:
   - Panduan aksi konkret: memutus panggilan, menghubungi nomor resmi buku telepon pribadi, dan menguji *Safe Word* keluarga.

---

### C. Modul Belajar & Simulasi Edukasi Interaktif (`/belajar`)
- 5 Skenario interaktif simulasi penipuan nyata di Indonesia:
  1. *Skenario 1: Telepon Suara Atasan Minta Transfer Darurat (Voice Cloning & Urgency)*
  2. *Skenario 2: Video Singkat Pejabat Membagikan Bantuan Uang (Lip-Sync Deepfake)*
  3. *Skenario 3: Pesan Suara Anak Mengaku Kecelakaan (Fear Induction & Voice Synthesis)*
  4. *Skenario 4: File Undangan Nikah Digital .APK di WhatsApp (Malware Sniffing OTP)*
  5. *Skenario 5: Tawaran Kerja Freelance Like Video YouTube (Pig Butchering Scam)*
- Evaluasi instan jawaban pengguna disertai penjelasan psikologis dan taktik mitigasi teknis.

---

### D. Jaringan Keamanan Keluarga & Kata Sandi Darurat (`/keluarga`)
- **Kata Sandi Aman Utama (Family Safe Word)**: Di-hash satu arah dengan bcrypt di backend, digunakan untuk memverifikasi keaslian panggilan saat terjadi dugaan kloning suara.
- **Kode Darurat Sandera (Duress Code)**: Di-hash satu arah dengan bcrypt di backend, memberi sinyal bahaya rahasia jika anggota keluarga dipaksa penipu.
- **Zero-Leakage Verifier**: Menyediakan form uji kecocokan kata sandi yang hanya memvalidasi kesesuaian hash tanpa mengekspos teks aslinya.
- **Manajemen Kontak Terlindungi**: Menyimpan daftar anggota keluarga secara privat terikat akun pengguna di server.

---

### E. Autentikasi & Batasan Privasi Mode Offline
- **Mode Tamu (Guest Mode)**: Verifikasi media publik secara instan tanpa perlu mendaftar.
- **Mode Pengguna Terdaftar (Authenticated)**: Terintegrasi dengan NextAuth.js JWT.
- **Batasan Mode Offline**: Analisis offline lokal di sisi klien **hanya beroperasi untuk pemindaian teks publik dan link phishing** tanpa menyimpan kredensial. Fitur data keluarga dan kata sandi rahasia **wajib terhubung ke server backend** guna menjamin keamanan data pribadi.

---

## 3. Hasil Pengujian Nyata (Empirical Benchmark) & Evaluasi Keterbatasan

> [!NOTE]
> Sistem ini dikalibrasi menggunakan sampel uji terbatas dan dirancang sebagai instrumen edukasi serta penapisan awal (*triage support*). Angka pengujian di bawah ini merupakan hasil pencatatan riil terhadap sampel uji yang dievaluasi langsung pada pipeline sistem Waskita.

### 🧪 Pengujian Sampel Audio (10 Sampel Baseline + 2 Sampel Uji Menantang)

| No | File Uji | Target Sebenarnya | Output Probabilitas AI | Hasil Klasifikasi Sistem | Keterangan Forensik Akustik |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `tts_1_ardi_edukasi.mp3` | **AI (TTS)** | **96.0%** | **AI (TTS)** ✅ | Jeda hening digital mutlak (15.7% zero) & formant vocoder. |
| 2 | `tts_2_gadis_bank.mp3` | **AI (TTS)** | **96.0%** | **AI (TTS)** ✅ | *Silence gating* (13.3% zero) & profil HiFi-GAN vocoder. |
| 3 | `tts_3_ardi_scam.mp3` | **AI (TTS)** | **96.0%** | **AI (TTS)** ✅ | Terdeteksi spectral centroid & batas vocoder AI. |
| 4 | `tts_4_gadis_safeword.mp3` | **AI (TTS)** | **96.0%** | **AI (TTS)** ✅ | Jeda hening mutlak (11.1% zero) tanpa noise ADC fisik. |
| 5 | `tts_5_ardi_formal.mp3` | **AI (TTS)** | **96.0%** | **AI (TTS)** ✅ | Kompresi filter vocoder (18.3% zero, pause var $3.4\times 10^{-10}$). |
| 6 | `human_natural_1.wav` | **Manusia Asli** | **29.7%** | **Manusia Asli** ✅ | Noise latar ruangan kontinu (var $1.9\times 10^{-1}$), centroid alami. |
| 7 | `human_natural_2.wav` | **Manusia Asli** | **42.6%** | **Manusia Asli** ✅ | Noise termal mikrofon kontinu, bebas jeda digital nol. |
| 8 | `human_natural_3.wav` | **Manusia Asli** | **37.9%** | **Manusia Asli** ✅ | Spektrum vokal alami manusia (Centroid 600 Hz). |
| 9 | `human_natural_4.wav` | **Manusia Asli** | **4.0%** | **Manusia Asli** ✅ | Variansi pitch biologis & ambiens akustik fisik. |
| 10 | `human_natural_5.wav` | **Manusia Asli** | **4.0%** | **Manusia Asli** ✅ | Teridentifikasi noise lantai alami (-0.45 human modifier). |
| 11 | `human_speech_pauses.wav` | **Manusia Asli** | 62.2% | AI (TTS) ⚠️ | Sampel menantang: jeda bicara artifisial dengan noise lantai rendah. |
| 12 | `human_telephone_bandpass.wav` | **Manusia Asli** | 52.1% | AI (TTS) ⚠️ | Sampel menantang: modulasi filter kompresi pita telepon. |

**Hasil Rekapitulasi Audio:**
- Deteksi Sampel AI Neural TTS: **5 dari 5 (100%)** terdeteksi dengan keyakinan sangat tinggi (96.0%).
- Klasifikasi Sampel Suara Alami Standar: **5 dari 5 (100%)** terdeteksi sebagai Manusia Asli.
- Akurasi pada 10 Sampel Baseline: **10 dari 10 (100.0%)**.
- Akurasi pada 12 Sampel (termasuk sampel menantang jeda bicara dan filter telepon): **10 dari 12 (83.3%)**.

---

### 🧪 Pengujian Sampel Gambar / Video (8 Sampel Uji: 4 AI Deepfake & 4 Foto Asli)

| No | File Uji | Target Sebenarnya | Output Probabilitas AI | Hasil Klasifikasi Sistem |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `ai_deepfake_1.jpg` | **AI / Deepfake** | **65.9%** | **AI / Deepfake** ✅ |
| 2 | `ai_deepfake_2.jpg` | **AI / Deepfake** | **65.9%** | **AI / Deepfake** ✅ |
| 3 | `ai_deepfake_3.jpg` | **AI / Deepfake** | **65.9%** | **AI / Deepfake** ✅ |
| 4 | `ai_deepfake_4.jpg` | **AI / Deepfake** | **65.9%** | **AI / Deepfake** ✅ |
| 5 | `real_photo_1.jpg` | **Foto Asli** | 52.6% | AI / Deepfake ❌ |
| 6 | `real_photo_2.jpg` | **Foto Asli** | 55.4% | AI / Deepfake ❌ |
| 7 | `real_photo_3.jpg` | **Foto Asli** | 52.6% | AI / Deepfake ❌ |
| 8 | `real_photo_4.jpg` | **Foto Asli** | 53.7% | AI / Deepfake ❌ |

**Hasil Rekapitulasi Gambar/Video:**
- Deteksi Sampel AI Manipulasi: **4 dari 4 (100%)** terdeteksi dengan tepat.
- Akurasi Keseluruhan pada Sampel Frame Statis: **4 dari 8 (50.0%)**. Model Vision Transformer open-source menunjukkan kecenderungan sensitivitas tinggi (*over-sensitive*) pada frame statis tanpa delta temporal video.

---

## 4. Klarifikasi Pencocokan Sidik Jari Komunitas (SHA-256 Exact Match)

- Fitur **Community Fingerprint** beroperasi dengan menghitung *cryptographic hash* SHA-256 dari byte konten atau teks normalisasi.
- **Karakteristik & Batasan**:
  - Hanya mencocokkan file yang **persis sama secara byte-per-byte (exact match)** untuk mencegah komputasi inferensi berulang pada file yang identik.
  - Mekanisme ini **tidak menangkap varian yang telah mengalami kompresi ulang atau re-encoding** oleh platform WhatsApp atau media sosial, karena kompresi mengubah struktur byte file.
  - Jika hash tidak ditemukan di database, sistem secara otomatis dan mulus menjalankan pipeline inferensi AI penuh tanpa hambatan.

---

## 5. Model AI & Spesifikasi Komponen

| Komponen / Pipeline | Model / Algoritma yang Digunakan | Karakteristik & Peran |
| :--- | :--- | :--- |
| **Speech-to-Text (ASR)** | `openai/whisper-tiny` | Transkripsi ucapan Bahasa Indonesia secara lokal, chunking 30s. |
| **Acoustic Deepfake** | `Gustking/wav2vec2-large-xlsr-deepfake-audio-classification` | Klasifikasi fitur akustik vokal sintetik vs alami. |
| **Physical Vocal Forensics** | *Autocorrelation F0 Jitter* + *SciPy STFT* | Menghitung perturbasi siklus vokal, *spectral rolloff*, dan rasio hening digital. |
| **Vision Deepfake** | `prithivMLmods/Deep-Fake-Detector-v2-Model` | *Vision Transformer (ViT)* untuk evaluasi distorsi visual per-frame. |
| **Video Temporal Forensics** | *OpenCV Uniform Sampling* + *Structural Delta* | Analisis konsistensi antar-frame dan kompresi *macroblocking*. |
| **Discourse NLP Scanner** | *Waskita Intent-Gated Rule-Based NLP v2.1* | Normalisasi singkatan siber + klasifikasi bingkai wacana (Edukasi vs Serangan Langsung). |
| **Phishing Link Scanner** | *Typosquatting & Suspicious TLD Regex Scanner* | Memeriksa 12 URL shortener, 17 TLD berisiko, dan 22 target entitas perbankan/pemerintah. |

---

## 6. Stack Teknologi Keseluruhan

| Lapisan Sistem | Teknologi | Fungsi & Peran |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router)** + **React 19** + **TypeScript** | Antarmuka pengguna modern, SSR, Suspense boundary, dan state management. |
| **Styling & Design System** | **TailwindCSS v4** + **Lucide Icons** | Desain bertema *Forest Green* (`#2F6F62`), *Deep Pine* (`#10322C`), dan *Warm Cream Mist* (`#F3F6F4`). |
| **Autentikasi Klien** | **NextAuth.js v4** | Sesi berbasis JWT dengan penyedia kredensial dan dukungan akses tamu. |
| **Backend API Framework** | **FastAPI (Python 3.13)** + **Uvicorn** | REST API asinkron berperforma tinggi. |
| **Framework Deep Learning** | **PyTorch** + **Hugging Face Transformers** | Runtime inferensi model deep learning untuk audio, ASR, dan visual. |
| **Pemrosesan Sinyal Audio** | **SciPy** + **SoundFile** + **NumPy** | *Polyphase anti-aliased resampling* ke 16kHz dan ekstraksi fitur akustik DSP. |
| **Pemrosesan Citra/Video** | **OpenCV (`cv2`)** + **Pillow (PIL)** | Dekode video frame-by-frame dan ekstraksi matriks visual. |
| **Database & ORM** | **SQLAlchemy** + **PostgreSQL** / **SQLite** | Penyimpanan akun, data keluarga, blacklist nomor telepon, dan hash komunitas. |
| **Keamanan & Kriptografi** | **SHA-256** + **Bcrypt** + **PyJWT** | Hashing kata sandi akun, hashing Safe Word/Duress Code keluarga, dan token JWT. |

---

## 7. Status Kesiapan & Kesimpulan

Proyek **WASKITA 2.1** berstatus **Fungsional untuk demonstrasi dan evaluasi akademik/kompetisi**, telah diuji dengan sampel terbatas, dan siap dikembangkan lebih lanjut dengan dataset berskala lebih besar. Arsitektur sistem memprioritaskan privasi data (*Zero-Retention* & *Server-Side Bcrypt Hashing*), transparansi penalaran (*Intent-Gated Explainable AI*), serta edukasi preventif bagi masyarakat Indonesia.
