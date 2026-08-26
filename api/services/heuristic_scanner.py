import re
from typing import Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from api.models.reported_number import ReportedNumber

# High-Risk Indonesian Keyword Clusters for Social Engineering Detection
KEYWORD_CLUSTERS = {
    "urgensi": {
        "weight": 0.25,
        "keywords": [
            "transfer sekarang", "segera transfer", "dalam 15 menit", "dalam 10 menit",
            "mendesak", "darurat", "sekarang juga", "jangan tunda", "cepat kirim",
            "tolong segera", "butuh uang cepat", "segera bayar",
        ],
    },
    "kerahasiaan": {
        "weight": 0.30,
        "keywords": [
            "jangan bilang siapa-siapa", "rahasia", "antara kita saja", "jangan beritahu",
            "jangan hubungi kantor", "jangan telepon balik", "jangan ceritakan ke keluarga",
            "khusus untuk kamu",
        ],
    },
    "kredensial": {
        "weight": 0.35,
        "keywords": [
            "kode otp", "kode verifikasi", "password", "pin atm", "nomor kartu",
            "cvv", "6 digit", "angka verifikasi", "link konfirmasi", "klik tautan ini",
        ],
    },
    "otoritas_palsu": {
        "weight": 0.30,
        "keywords": [
            "surat penangkapan", "polisi", "kejaksaan", "kasus narkoba", "blokir rekening",
            "bea cukai", "kantor pajak", "proses hukum", "surat sita", "rekening dibekukan",
        ],
    },
    "iming_iming": {
        "weight": 0.20,
        "keywords": [
            "menang undian", "hadiah tunai", "dana talangan", "uang kas kantor",
            "komisi harian", "pinjaman tanpa jaminan", "investasi kilat", "transfer balik",
        ],
    },
}


def normalize_phone(phone: str) -> str:
    """Normalizes phone number to alphanumeric digits."""
    return re.sub(r"[^\d+]", "", phone.strip())


def scan_text(text: str) -> Tuple[float, Dict[str, Any]]:
    """
    Scans text message for scam, extortion, and AI social engineering patterns.
    Returns (raw_score: 0.0 - 1.0, metadata: dict).
    """
    if not text or not text.strip():
        return 0.1, {
            "model_name": "Waskita Heuristic Text Scanner v1.0",
            "matched_keywords": [],
            "notes": ["Teks kosong atau terlalu singkat untuk dianalisis."],
        }

    lower_text = text.lower()
    matched_keywords: List[str] = []
    total_score = 0.0
    matched_clusters = []

    for cluster_name, data in KEYWORD_CLUSTERS.items():
        cluster_matched = False
        for kw in data["keywords"]:
            if kw in lower_text:
                matched_keywords.append(kw)
                if not cluster_matched:
                    total_score += data["weight"]
                    cluster_matched = True
                    matched_clusters.append(cluster_name)

    # Base score for clean text
    if not matched_keywords:
        score = 0.12  # Low, clean
    else:
        # Boost score if multiple clusters match (e.g. urgency + credential + secret)
        if len(matched_clusters) >= 3:
            total_score += 0.25
        elif len(matched_clusters) == 2:
            total_score += 0.10
        score = min(0.95, max(0.42, total_score))

    notes = []
    if "kredensial" in matched_clusters:
        notes.append("Peringatan: Terdapat permintaan kode verifikasi atau kredensial rahasia.")
    if "urgensi" in matched_clusters:
        notes.append("Peringatan: Pola kalimat menggunakan desakan waktu buatan (time pressure).")
    if "otoritas_palsu" in matched_clusters:
        notes.append("Peringatan: Modus intimidasi mencatut nama instansi penegak hukum.")

    metadata = {
        "model_name": "Waskita Heuristic Text Classifier (Indonesian NLP)",
        "matched_keywords": matched_keywords,
        "matched_clusters": matched_clusters,
        "notes": notes,
    }

    return score, metadata


def scan_phone(phone_number: str, db: Session) -> Tuple[float, Dict[str, Any]]:
    """
    Checks phone number against reported spam/deepfake numbers database.
    Returns (raw_score: 0.0 - 1.0, metadata: dict).
    """
    if not phone_number or not phone_number.strip():
        return 0.1, {
            "model_name": "Waskita Phone Reputation Registry",
            "notes": ["Nomor telepon tidak diisi."],
        }

    clean_phone = normalize_phone(phone_number)
    # Search with multiple standard formats (with and without +62 or 08)
    search_terms = [clean_phone]
    if clean_phone.startswith("+62"):
        search_terms.append("0" + clean_phone[3:])
    elif clean_phone.startswith("62"):
        search_terms.append("0" + clean_phone[2:])
    elif clean_phone.startswith("0"):
        search_terms.append("+62" + clean_phone[1:])

    # Query database
    reported = (
        db.query(ReportedNumber)
        .filter(ReportedNumber.phone_number.in_(search_terms))
        .first()
    )

    if reported:
        report_count = reported.report_count
        category = reported.category
        
        # Calculate risk score based on reports
        if report_count >= 10:
            score = 0.92
        elif report_count >= 5:
            score = 0.78
        else:
            score = 0.65

        metadata = {
            "model_name": "Waskita Community Fraud Registry",
            "report_count": report_count,
            "category": category,
            "notes": [
                f"Nomor ini tercatat memiliki {report_count} laporan penipuan dari masyarakat.",
                f"Kategori modus terdaftar: {category}.",
            ],
        }
        return score, metadata

    # Check for suspicious prefix or length
    digits_only = re.sub(r"\D", "", clean_phone)
    if len(digits_only) < 9 or len(digits_only) > 15:
        return 0.48, {
            "model_name": "Waskita Phone Reputation Registry",
            "notes": ["Format panjang digit nomor telepon tidak sesuai standar telekomunikasi umum."],
        }

    # Clean number
    return 0.15, {
        "model_name": "Waskita Phone Reputation Registry",
        "notes": [
            "Nomor belum pernah dilaporkan dalam basis data penipuan.",
            "Tetap pastikan identitas penelepon secara langsung bila meminta tindakan mendadak.",
        ],
    }
