import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.core.config import settings
from api.core.database import init_db, SessionLocal
from api.models.reported_number import ReportedNumber
from api.models.scenario import Scenario
from api.services.ml_models import get_model_manager
from api.routers import auth, verify, family, scenarios, report


def seed_reported_numbers():
    """Seed initial fraudulent/suspicious phone numbers for heuristic matching."""
    db = SessionLocal()
    try:
        if db.query(ReportedNumber).count() == 0:
            sample_numbers = [
                ReportedNumber(
                    phone_number="+6282199887766",
                    report_count=18,
                    category="Penipuan Catut Nama Atasan / Kloning Suara",
                ),
                ReportedNumber(
                    phone_number="081234567890",
                    report_count=7,
                    category="Permintaan Kode OTP & Rekening Kas Darurat",
                ),
                ReportedNumber(
                    phone_number="+6285711223344",
                    report_count=24,
                    category="Pinjaman Online Ilegal & Teror Kontak",
                ),
                ReportedNumber(
                    phone_number="085612345678",
                    report_count=12,
                    category="Kloning Suara Anak Menangis Minta Tebusan",
                ),
            ]
            db.add_all(sample_numbers)
            db.commit()
    except Exception as e:
        print("Reported numbers seed notice:", e)
    finally:
        db.close()


def seed_scenarios():
    """Seed 5 realistic Indonesian AI and social engineering scam scenarios."""
    db = SessionLocal()
    try:
        if db.query(Scenario).count() == 0:
            initial_scenarios = [
                Scenario(
                    title="Skenario 1: Telepon Suara Atasan Minta Transfer Darurat",
                    narrative=(
                        "Anda menerima panggilan telepon dari nomor baru yang mengaku sebagai pimpinan di kantor Anda. "
                        "Suara penelepon terdengar sangat persis seperti atasan Anda, meminta Anda segera mentransfer dana kas kantor sebesar Rp 5.000.000 ke rekening vendor dalam waktu 15 menit karena ia sedang berada di dalam rapat tertutup. "
                        "Penelepon menegaskan bahwa urusan ini adalah 'rahasia perusahaan' dan meminta Anda untuk tidak memberitahukan kepada staf kantor lainnya."
                    ),
                    choice_a="Segera mentransfer dana kas tersebut agar pekerjaan kantor tidak terhambat, karena suaranya memang terdengar sangat meyakinkan seperti atasan Anda.",
                    choice_b="Menunda transfer dan menghubungi nomor telepon kantor resmi atasan yang sudah lama tersimpan di kontak Anda untuk melakukan verifikasi ulang.",
                    correct_choice="b",
                    explanation=(
                        "Ciri utama penipuan kloning suara AI adalah memadukan teknologi sintesis vokal dengan taktik rekayasa sosial: "
                        "menciptakan 'urgensi waktu palsu' (harus selesai dalam 15 menit), memanfaatkan rasa hormat pada figur otoritas, "
                        "serta melarang Anda bertanya ke orang lain dengan dalih rahasia. "
                        "Memutus rantai urgensi dan melakukan verifikasi silang (cross-check) lewat jalur komunikasi yang sudah dipercaya adalah pertahanan terbaik."
                    ),
                ),
                Scenario(
                    title="Skenario 2: Video Singkat Pejabat Membagikan Bantuan Uang",
                    narrative=(
                        "Sebuah video berdurasi 7 detik beredar luas di media sosial dan grup chat keluarga, menampilkan wajah seorang pejabat publik ternama yang sedang mengumumkan program bantuan uang tunai langsung Rp 5.000.000 bagi warga yang mendaftar hari ini. "
                        "Di video tersebut, tampak gerakan bibir pejabat sedikit kaku namun suaranya mirip, dan terdapat tulisan berjalan yang mengarahkan penonton untuk mengeklik tautan di kolom komentar."
                    ),
                    choice_a="Mengabaikan tautan di media sosial dan mengecek kebenaran program bantuan tersebut melalui portal berita resmi pemerintah atau kanal informasi instansi terkait.",
                    choice_b="Langsung mengeklik tautan tersebut dan mengisi data KTP serta nomor rekening agar tidak ketinggalan kuota bantuan yang diumumkan.",
                    correct_choice="a",
                    explanation=(
                        "Video tersebut merupakan contoh 'Lip-Sync Deepfake' di mana rekaman video asli tokoh publik dimanipulasi gerakan bibir dan audionya menggunakan AI generator. "
                        "Pelaku sengaja membuat durasi video sangat singkat (5-10 detik) agar penonton tidak sempat mengamati kejanggalan visual dan langsung terpancing mengeklik tautan phishing pencuri data pribadi."
                    ),
                ),
                Scenario(
                    title="Skenario 3: Pesan Suara Anak Mengaku Kecelakaan",
                    narrative=(
                        "Anda menerima pesan suara (voice note) dari nomor asing dengan suara anak Anda yang menangis panik dan terisak-isak. "
                        "Suara tersebut mengatakan bahwa ia baru saja menabrak pengendara lain di jalan dan sedang ditahan, lalu meminta Anda segera mengirimkan uang ganti rugi Rp 3.000.000 ke rekening orang di sebelahnya. "
                        "Saat Anda mencoba menelepon balik lewat video call, panggilan dialihkan ke chat teks dengan alasan 'kamera ponsel pecah dan sinyal buruk'."
                    ),
                    choice_a="Tetap tenang, tidak mentransfer uang secara terburu-buru, dan segera menelepon nomor pribadi anak Anda atau menghubungi teman/rekan kerjanya yang biasa bersama dia.",
                    choice_b="Langsung mentransfer uang tersebut karena merasa panik dan tidak tega mendengar suara tangisan anak Anda.",
                    correct_choice="a",
                    explanation=(
                        "Modus penipuan ini memanfaatkan manipulasi psikologis rasa cemas orang tua (fear induction). "
                        "Pelaku sering mengunduh sampel suara anak dari media sosial (seperti video story atau TikTok) lalu menirunya dengan generator AI. "
                        "Tanda paling mencolok adalah pelaku selalu menolak video call langsung untuk menghindari kebohongan visual terungkap."
                    ),
                ),
                Scenario(
                    title="Skenario 4: Petugas Bank Meminta Kode OTP untuk Pembatalan",
                    narrative=(
                        "Seseorang menelepon Anda dengan nada bicara sangat formal dan fasih, mengaku sebagai petugas layanan keamanan bank tempat Anda menabung. "
                        "Ia mengabarkan bahwa saat ini sedang terjadi upaya pembobolan rekening Anda senilai puluhan juta rupiah dari lokasi yang jauh. "
                        "Untuk membatalkan transaksi mencurigakan tersebut, petugas tersebut meminta Anda membacakan 6 digit angka kode OTP yang baru saja masuk melalui SMS ke ponsel Anda."
                    ),
                    choice_a="Membacakan kode OTP kepada petugas tersebut agar transaksi pembobolan rekening bisa segera dibatalkan oleh pihak bank.",
                    choice_b="Menolak memberikan kode OTP, menutup panggilan telepon, dan langsung menghubungi call center resmi bank yang tertera di bagian belakang kartu ATM Anda.",
                    correct_choice="b",
                    explanation=(
                        "Petugas bank resmi TIDAK PERNAH meminta kode OTP, PIN, atau kata sandi Anda dalam kondisi apa pun. "
                        "Kode OTP adalah kunci pengaman satu kali pakai yang berfungsi untuk mengesahkan transaksi keluar. "
                        "Pelaku sengaja menciptakan suasana panik seolah-olah rekening Anda sedang dibobol agar Anda secara sukarela menyerahkan kunci pengaman tersebut."
                    ),
                ),
                Scenario(
                    title="Skenario 5: Kenalan Baru Menolak Bertemu dan Minta Pinjaman",
                    narrative=(
                        "Seorang kenalan baru di aplikasi media sosial telah berkomunikasi intensif dan ramah dengan Anda selama dua minggu. "
                        "Foto profilnya tampak sangat rapi dan profesional, serta ia selalu bersikap sopan dan penuh perhatian. "
                        "Namun, ia selalu menolak setiap kali diajak melakukan video call dengan alasan sibuk tugas luar kota. "
                        "Hari ini, ia mengirimkan pesan bahwa ia tertahan di bandara dan memohon pinjaman dana mendesak sebesar Rp 2.500.000 untuk tiket kepulangan."
                    ),
                    choice_a="Mengirimkan pinjaman dana karena merasa sudah mengenalnya dengan baik selama dua minggu dan foto profilnya terlihat meyakinkan.",
                    choice_b="Menolak mengirimkan uang kepada orang yang belum pernah Anda temui secara langsung atau melalui video call yang interaktif.",
                    correct_choice="b",
                    explanation=(
                        "Ini adalah pola klasik 'Romance Scam' atau rekayasa kedekatan emosional buatan. "
                        "Foto profil yang digunakan seringkali merupakan hasil kompilasi foto orang lain atau avatar hasil generasi AI (seperti StyleGAN/Midjourney) yang tidak berwujud nyata. "
                        "Pelaku membangun rasa percaya semu sebelum akhirnya melancarkan permintaan finansial mendesak."
                    ),
                ),
            ]
            db.add_all(initial_scenarios)
            db.commit()
    except Exception as e:
        print("Scenarios seed notice:", e)
    finally:
        db.close()


# Ensure tables and seed are ready immediately
try:
    init_db()
    seed_reported_numbers()
    seed_scenarios()
except Exception as e:
    print("Initial DB setup notice:", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize database tables & seeds
    try:
        init_db()
        seed_reported_numbers()
        seed_scenarios()
    except Exception as e:
        print("Lifespan DB setup notice:", e)

    # 2. Preload AI models in background so startup remains snappy
    asyncio.create_task(asyncio.to_thread(get_model_manager().load_models))

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(verify.router)
app.include_router(family.router)
app.include_router(scenarios.router)
app.include_router(report.router)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }
