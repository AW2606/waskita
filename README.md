# Waskita

**Waskita** adalah platform verifikasi konten berbasis AI dan deepfake yang dirancang untuk melindungi kelompok rentan dari ancaman penipuan digital melalui deteksi cepat, edukasi interaktif, dan transparansi analisis media.

Proyek ini menggunakan struktur **Unified Full-Stack Workspace** (Next.js frontend + FastAPI backend dalam satu root direktori) sehingga Anda dapat menjalankan dan mengembangkan seluruh sistem secara langsung dari root tanpa perlu berpindah-pindah folder.

---

## 📁 Struktur Direktori

```text
waskita/
├── api/                     # Backend API (Python FastAPI)
│   ├── core/                # Konfigurasi aplikasi & settings
│   │   ├── __init__.py
│   │   └── config.py
│   ├── models/              # Model database (SQLAlchemy / Pydantic)
│   │   └── __init__.py
│   ├── routers/             # Endpoint router modular
│   │   └── __init__.py
│   ├── services/            # Logika bisnis & verifikasi
│   │   └── __init__.py
│   ├── __init__.py
│   └── main.py              # Entry point FastAPI & endpoint /health
│
├── src/                     # Frontend Web App (Next.js App Router)
│   ├── app/                 # Pages, layout, dan route handler NextAuth
│   ├── components/          # Komponen UI bersama
│   ├── lib/                 # Konfigurasi NextAuth & utils
│   └── styles/              # Custom styling
│
├── public/                  # Static assets
├── docs/                    # PRD dan catatan desain
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

### 1. Persiapan Awal (Hanya Sekali)

1. **Setup Python Virtual Environment**:
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
