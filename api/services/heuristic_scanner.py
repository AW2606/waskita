import re
from typing import Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from api.models.reported_number import ReportedNumber

# Common Indonesian Slang, Typos, and Abbreviations in Cyber Scams
SLANG_NORMALIZATION_MAP = {
    r"\b(trf|trfd|tf|trnsfr|tfr|trsf)\b": "transfer",
    r"\b(skrg|skrang|skr|skrg juga)\b": "sekarang",
    r"\b(sgr|sgera|segr)\b": "segera",
    r"\b(jgn|jgan|jngn)\b": "jangan",
    r"\b(ksh|kasi|kash|ksih)\b": "kasih",
    r"\b(tau|tw|beritau|ksh tau)\b": "beritahu",
    r"\b(klw|klo|kalo)\b": "kalau",
    r"\b(gbs|gk bsa|ga bisa|gabisa)\b": "tidak bisa",
    r"\b(rek|rekeningnya)\b": "rekening",
    r"\b(buru2|buruan|cpt|cpet)\b": "cepat",
    r"\b(pls|tlg|tlng)\b": "tolong",
    r"\b(mksd|mksud)\b": "maksud",
    r"\b(org|org2)\b": "orang",
    r"\b(dpt|dapet)\b": "dapat",
    r"\b(sdh|udh|uda)\b": "sudah",
    r"\b(blm|blom)\b": "belum",
    r"\b(bca|bri|bni|mandiri)[-\s_]?(link|auth|verif|klik)\b": "phishing perbankan",
}

# High-Risk Indonesian Keyword Clusters for Social Engineering Detection
KEYWORD_CLUSTERS = {
    "urgensi": {
        "weight": 0.30,
        "label": "Desakan Waktu Palsu (Urgency)",
        "keywords": [
            "transfer sekarang", "segera transfer", "kirim sekarang", "dalam 15 menit", "dalam 10 menit",
            "dalam 5 menit", "mendesak", "darurat", "sekarang juga", "jangan tunda", "cepat kirim",
            "tolong segera", "butuh uang cepat", "segera bayar", "harus hari ini", "buru buru",
            "sebelum terlambat", "sebelum diblokir", "sebelum diproses", "secepatnya", "langsung transfer",
            "batas waktu", "hari ini juga", "sekarang transfer", "cepat transfer",
        ],
    },
    "kerahasiaan": {
        "weight": 0.35,
        "label": "Isolasi Korban & Kerahasiaan (Secrecy)",
        "keywords": [
            "jangan bilang siapa-siapa", "rahasia", "antara kita saja", "jangan beritahu",
            "jangan hubungi kantor", "jangan telepon balik", "jangan ceritakan ke keluarga",
            "khusus untuk kamu", "jangan ngomong ke orang lain", "jangan kasih tahu siapapun",
            "rahasia perusahaan", "jangan ditutup teleponnya", "jangan matikan telepon",
            "jangan cerita ke siapapun", "hanya kamu yang tahu", "jangan konfirmasi ke",
        ],
    },
    "kredensial": {
        "weight": 0.40,
        "label": "Pencurian Kredensial & Kode OTP",
        "keywords": [
            "kode otp", "kode verifikasi", "password", "pin atm", "nomor kartu",
            "cvv", "6 digit", "angka verifikasi", "link konfirmasi", "klik tautan ini",
            "sebutkan kodenya", "bacakan otp", "kirimkan kode", "digit terakhir", "nomor rekening",
            "baca sms", "kode masuk", "token aktivasi", "foto ktp", "foto buku tabungan",
        ],
    },
    "otoritas_palsu": {
        "weight": 0.35,
        "label": "Intimidasi & Catut Nama Aparat / Pejabat",
        "keywords": [
            "surat penangkapan", "polisi", "kepolisian", "polda", "polres", "bareskrim",
            "kejaksaan", "kasus narkoba", "pencucian uang", "blokir rekening", "bea cukai",
            "kantor pajak", "proses hukum", "surat sita", "rekening dibekukan", "ditangkap",
            "ditahan", "sidang", "pemeriksaan", "panggilan darurat", "penyidikan", "oknum",
            "satreskrim", "panggilan sidang", "tilang elektronik", "file apk",
        ],
    },
    "kecelakaan_tebusan": {
        "weight": 0.40,
        "label": "Modus Darurat Medis / Kecelakaan / Tebusan",
        "keywords": [
            "anak kecelakaan", "keluarga kecelakaan", "tabrakan", "kritis", "masuk igd",
            "rumah sakit", "butuh uang operasi", "uang jaminan", "uang tebusan", "tebusan",
            "ganti rugi", "damai di tempat", "jangan lapor polisi", "butuh darah", "darurat medis",
            "menabrak orang", "sekarang di kantor polisi", "tahan motor", "darah gol",
        ],
    },
    "iming_iming": {
        "weight": 0.25,
        "label": "Iming-iming Hadiah / Undian / Pekerjaan Palsu",
        "keywords": [
            "menang undian", "hadiah tunai", "dana talangan", "uang kas kantor",
            "komisi harian", "pinjaman tanpa jaminan", "investasi kilat", "transfer balik",
            "dapat reward", "bonus spesial", "pemenang promo", "saldo masuk", "klaim hadiah",
            "like share dapat uang", "kerja paruh waktu", "tugas komisi",
        ],
    },
}

# Educational, Meta-Discourse, and Public Awareness Markers (Indonesian)
EDUCATIONAL_MARKERS = [
    "hati hati", "hati-hati", "waspada", "waspadalah", "kenali ciri", "ciri-ciri penipuan",
    "modus penipuan", "modus jahat", "modus ini", "penipuan jaman sekarang", "penipuan zaman sekarang",
    "pelaku akan", "pelaku biasanya", "penipu biasanya", "penipu akan", "pura-pura", "pura pura", "berpura-pura",
    "mengaku sebagai", "mengatasnamakan", "cuma butuh", "bisa mengkloning", "kloning suara",
    "secara psikologis", "secara mencegahnya", "cara mencegahnya", "tips mencegah", "langkah terbaik",
    "buatlah kata sandi", "kata sandi rahasia", "katasandi rahasia", "safe word",
    "matikan telepon", "matikan telefon", "hubungi langsung nomor asli", "hubungi nomor resmi",
    "jangan panik", "jangan langsung percaya", "jangan mudah percaya", "kurangi mengunggah", "kurangi mengungga",
    "secara publik", "sudah memakan banyak korban", "memakan banyak korban", "banyak korban",
    "yuk bagikan", "bagikan video", "agar keluarga kita tetap aman", "tetap aman", "sebarkan informasi",
    "edukasi", "pembelajaran", "tips keamanan", "himbauan", "peringatan dini",
]

# Direct Attack / Imperative Exploitation Markers (Indonesian)
DIRECT_ATTACK_PATTERNS = [
    r"\b(kamu|anda|kau|saudara)\s+(harus|wajib|segera|langsung)\s+(transfer|kirim|bayar|kasih)\b",
    r"\b(transfer|kirim)\s+(ke\s+rekening\s+ini|sekarang\s+juga|dalam\s+\d+\s+menit)\b",
    r"\b(bacakan|kirimkan|sebutkan)\s+(kode\s+otp|sms\s+verifikasi|pin)\b",
    r"\b(jangan\s+tutup|jangan\s+matikan)\s+telepon(nya)?\b",
    r"\b(jangan\s+kasih\s+tahu|jangan\s+bilang)\s+(siapa[- ]siapa|keluarga|orang\s+lain)\b",
    r"\b(saya\s+dari\s+(polisi|kepolisian|kejaksaan))\s+.*\s+(transfer|dana|uang)\b",
]

# Suspicious Link Shorteners & Phishing Domain Patterns
SUSPICIOUS_SHORTENERS = [
    "bit.ly", "tinyurl.com", "s.id", "cutt.ly", "linktr.ee", "is.gd", "t.me", "wa.me",
    "shorturl.at", "rebrand.ly", "rb.gy", "v.ht",
]

SUSPICIOUS_TLDS = [
    ".xyz", ".online", ".site", ".top", ".tk", ".app", ".club", ".space", ".cf", ".ml",
    ".ga", ".gq", ".vip", ".work", ".info", ".cc", ".link",
]

BRAND_TARGETS = [
    "bca", "bri", "mandiri", "bni", "cimb", "bsi", "danamon", "permata",
    "pajak", "djp", "bpjs", "pln", "ojk", "kemkominfo", "polri", "beacukai",
    "dana", "gopay", "ovo", "shopee", "tokopedia", "lazada",
]


def normalize_text_slang(text: str) -> str:
    """
    Normalizes Indonesian slang words, typos, and cyber-scam shorthand to standard phrases.
    """
    normalized = text.lower()
    for pattern, replacement in SLANG_NORMALIZATION_MAP.items():
        normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)
    return normalized


def classify_discourse_intent(text: str) -> Dict[str, Any]:
    """
    Discourse Frame & Intent-Gated Classification:
    Differentiates between:
    1. 'edukasi_informasi': Educational / Informational / 3rd-person awareness narrative.
    2. 'serangan_langsung': Active imperative direct-target scam attack against the listener.
    3. 'netral_ambigu': Ambiguous / Casual / Neutral context.
    """
    if not text or not text.strip():
        return {
            "intent_frame": "netral_ambigu",
            "intent_multiplier": 0.50,
            "intent_label": "Konteks Netral / Umum",
            "context_summary": "Teks kosong atau tidak memuat ucapan terdeteksi.",
            "educational_matches": [],
            "direct_attack_matches": [],
        }

    raw_lower = text.lower()
    normalized_text = normalize_text_slang(text)

    # 1. Match Educational / Public Awareness Cues
    educational_matches = []
    for marker in EDUCATIONAL_MARKERS:
        if marker in raw_lower or marker in normalized_text:
            educational_matches.append(marker)

    # 2. Match Direct Attack / Imperative Threat Cues
    direct_attack_matches = []
    for pattern in DIRECT_ATTACK_PATTERNS:
        matches = re.findall(pattern, raw_lower) or re.findall(pattern, normalized_text)
        if matches:
            direct_attack_matches.append(pattern)

    edu_count = len(educational_matches)
    attack_count = len(direct_attack_matches)

    # Classification Logic
    if edu_count >= 2 and attack_count == 0:
        intent_frame = "edukasi_informasi"
        intent_multiplier = 0.10  # Damping multiplier: suppresses false positives by 90%
        intent_label = "Narasi Edukasi & Peringatan Modus Penipuan (Bukan Serangan Langsung)"
        context_summary = (
            "Konten terdeteksi sebagai narasi edukasi / tips pencegahan modus penipuan, "
            "bukan instruksi jahat yang menuntut tindakan dari Anda secara langsung."
        )
    elif edu_count > attack_count and edu_count >= 3:
        intent_frame = "edukasi_informasi"
        intent_multiplier = 0.15
        intent_label = "Narasi Edukasi & Informasi Publik"
        context_summary = (
            "Konten memuat penjelasan tentang modus kejahatan dalam kerangka edukasi dan kewaspadaan publik."
        )
    elif attack_count >= 1:
        intent_frame = "serangan_langsung"
        intent_multiplier = 1.0  # Full threat escalation
        intent_label = "Instruksi Desakan / Percakapan Berbahaya Langsung (Direct Attack)"
        context_summary = (
            "Kalimat menggunakan kata kerja imperatif langsung yang menuntut transfer, kode OTP, atau isolasi kontak."
        )
    else:
        intent_frame = "netral_ambigu"
        intent_multiplier = 0.50
        intent_label = "Percakapan Biasa / Konteks Netral"
        context_summary = "Tidak ditemukan pola kalimat penyerangan langsung maupun indikator edukasi yang menonjol."

    return {
        "intent_frame": intent_frame,
        "intent_multiplier": intent_multiplier,
        "intent_label": intent_label,
        "context_summary": context_summary,
        "educational_matches": educational_matches,
        "direct_attack_matches": direct_attack_matches,
    }


def scan_links_and_domains(text: str) -> Tuple[float, List[str], List[str]]:
    """
    Extracts URLs and assesses risk of phishing links, domain typosquatting, and obfuscated shorteners.
    Returns: (phishing_risk_score: 0.0 - 1.0, detected_links: list, risk_reasons: list)
    """
    url_pattern = r"(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*|(?:[a-zA-Z0-9-]+\.)+(?:com|id|net|org|xyz|online|site|top|tk|app|club|space|info|link)(?:\/[^\s]*)?"
    found_urls = re.findall(url_pattern, text, re.IGNORECASE)
    
    if not found_urls:
        return 0.0, [], []

    risk_score = 0.0
    detected_links = []
    risk_reasons = []

    for url in found_urls:
        clean_url = url.lower()
        detected_links.append(url)
        is_risky = False

        # 1. Check for URL Shorteners
        for shortener in SUSPICIOUS_SHORTENERS:
            if shortener in clean_url:
                risk_score = max(risk_score, 0.65)
                risk_reasons.append(f"Tautan shortlink mencurigakan terdeteksi ({shortener}) yang sering menyembunyikan alamat situs phishing.")
                is_risky = True
                break

        # 2. Check for Typosquatting / Brand Spoofing (e.g. bca-klik-auth.online)
        for brand in BRAND_TARGETS:
            if brand in clean_url:
                has_suspicious_words = any(w in clean_url for w in ["klik", "auth", "verif", "login", "bantuan", "hadiah", "klaim", "reward", "ebilling", "undian"])
                has_suspicious_tld = any(clean_url.endswith(tld) or (tld + "/") in clean_url for tld in SUSPICIOUS_TLDS)
                
                if has_suspicious_words or has_suspicious_tld or "-" in clean_url:
                    risk_score = max(risk_score, 0.90)
                    risk_reasons.append(f"Tautan terindikasi situs phishing perbankan/instansi palsu ({brand}) yang meniru domain resmi.")
                    is_risky = True
                    break

        # 3. Check for Suspicious TLDs
        if not is_risky:
            for tld in SUSPICIOUS_TLDS:
                if clean_url.endswith(tld) or (tld + "/") in clean_url:
                    risk_score = max(risk_score, 0.70)
                    risk_reasons.append(f"Domain menggunakan ekstensi berisiko tinggi ({tld}) yang umum disalahgunakan penipuan digital.")
                    break

    return risk_score, detected_links, risk_reasons


def normalize_phone(phone: str) -> str:
    """Normalizes phone number to alphanumeric digits."""
    return re.sub(r"[^\d+]", "", phone.strip())


def scan_text(text: str) -> Tuple[float, Dict[str, Any]]:
    """
    Context-Aware & Intent-Gated Indonesian Social Engineering Scanner (Waskita 2.0):
    1. Normalizes Indonesian slang, typos, and abbreviations.
    2. Runs Discourse Frame & Intent Classifier (differentiates Educational vs Direct Attack).
    3. Scans for 6 high-risk social engineering keyword clusters.
    4. Scans for phishing links, obfuscated shortlinks, and brand typosquatting.
    5. Multiplies raw keyword score by the Intent Gating Factor (mitigating false positives).
    Returns: (calibrated_score: 0.0 - 1.0, metadata_dict).
    """
    if not text or not text.strip():
        return 0.1, {
            "model_name": "Waskita Indonesian Intent-Gated Social Engineering Scanner v2.0",
            "matched_keywords": [],
            "matched_clusters": [],
            "cluster_labels": [],
            "detected_links": [],
            "intent_frame": "netral_ambigu",
            "intent_label": "Konteks Netral",
            "intent_summary": "Teks kosong atau tidak memuat ucapan terdeteksi.",
            "notes": ["Teks kosong atau tidak memuat ucapan terdeteksi."],
        }

    # Step 1: Slang & Colloquial Normalization
    raw_lower = text.lower()
    normalized_text = normalize_text_slang(text)

    # Step 2: Intent & Discourse Frame Analysis (Intent-Gated Core)
    intent_data = classify_discourse_intent(text)

    # Step 3: Phishing Link & URL Scanner
    link_risk_score, detected_links, link_reasons = scan_links_and_domains(text)

    # Step 4: Keyword & Cluster Pattern Matching
    matched_keywords: List[str] = []
    raw_keyword_score = 0.0
    matched_clusters = []
    cluster_labels = []

    for cluster_name, data in KEYWORD_CLUSTERS.items():
        cluster_matched = False
        for kw in data["keywords"]:
            if kw in raw_lower or kw in normalized_text:
                matched_keywords.append(kw)
                if not cluster_matched:
                    raw_keyword_score += data["weight"]
                    cluster_matched = True
                    matched_clusters.append(cluster_name)
                    cluster_labels.append(data["label"])

    # Step 5: Calibrated Multi-Cluster Compound Score
    if not matched_keywords and not detected_links:
        base_score = 0.10
    else:
        # Multi-cluster compound escalation
        if len(matched_clusters) >= 3:
            raw_keyword_score += 0.30
        elif len(matched_clusters) == 2:
            raw_keyword_score += 0.15

        # Factor in Link Phishing Risk
        if link_risk_score > 0:
            raw_keyword_score = max(raw_keyword_score, link_risk_score)
            if matched_keywords:
                raw_keyword_score = min(0.98, raw_keyword_score + 0.15)
        
        # High impact singular threat escalations
        if "kecelakaan_tebusan" in matched_clusters or "kredensial" in matched_clusters:
            raw_keyword_score = max(raw_keyword_score, 0.82)
        elif "otoritas_palsu" in matched_clusters and "urgensi" in matched_clusters:
            raw_keyword_score = max(raw_keyword_score, 0.85)

        base_score = min(0.98, max(0.35, raw_keyword_score))

    # Step 6: Apply Intent-Gated Multiplier
    # If the text is classified as Educational/Narrative, drastically damp the scam score!
    if intent_data["intent_frame"] == "edukasi_informasi":
        calibrated_score = min(0.18, max(0.06, base_score * intent_data["intent_multiplier"]))
    elif intent_data["intent_frame"] == "serangan_langsung":
        calibrated_score = min(0.98, max(0.75, base_score * intent_data["intent_multiplier"]))
    else:
        calibrated_score = min(0.90, max(0.12, base_score * intent_data["intent_multiplier"]))

    notes = []
    notes.append(f"Klasifikasi Niat: {intent_data['intent_label']}.")
    notes.append(f"Konteks Niat: {intent_data['context_summary']}")

    if intent_data["intent_frame"] == "edukasi_informasi" and matched_keywords:
        notes.append(
            f"Catatan Kontekstual: Frasa berisiko ({', '.join(set(matched_keywords))}) muncul dalam konteks narasi edukatif / pencegahan modus, bukan instruksi penipuan aktif."
        )
    elif intent_data["intent_frame"] == "serangan_langsung":
        if "kredensial" in matched_clusters:
            notes.append("Peringatan Kritis: Terdeteksi pola permintaan kode OTP, PIN, kata sandi, atau kredensial rahasia.")
        if "kecelakaan_tebusan" in matched_clusters:
            notes.append("Peringatan Kritis: Modus kabar darurat kecelakaan / permintaan uang tebusan cepat.")
        if "otoritas_palsu" in matched_clusters:
            notes.append("Peringatan: Modus intimidasi mencatut nama instansi penegak hukum / kasus pidana.")
        if "urgensi" in matched_clusters:
            notes.append("Peringatan: Pola kalimat menggunakan desakan waktu bertekanan tinggi (time pressure).")
        if "kerahasiaan" in matched_clusters:
            notes.append("Peringatan: Upaya mengisolasi korban dengan melarang berbicara ke keluarga atau rekan.")
    
    # Add link notes
    notes.extend(link_reasons)

    metadata = {
        "model_name": "Waskita Intent-Gated Indonesian Social Engineering Scanner (NLP v2.1)",
        "intent_frame": intent_data["intent_frame"],
        "intent_label": intent_data["intent_label"],
        "intent_summary": intent_data["context_summary"],
        "matched_keywords": list(set(matched_keywords)),
        "matched_clusters": matched_clusters,
        "cluster_labels": cluster_labels,
        "detected_links": detected_links,
        "link_risk_score": link_risk_score,
        "raw_keyword_score": round(base_score, 3),
        "notes": notes,
    }

    return round(calibrated_score, 4), metadata


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
    search_terms = [clean_phone]
    if clean_phone.startswith("+62"):
        search_terms.append("0" + clean_phone[3:])
    elif clean_phone.startswith("62"):
        search_terms.append("0" + clean_phone[2:])
    elif clean_phone.startswith("0"):
        search_terms.append("+62" + clean_phone[1:])

    reported = (
        db.query(ReportedNumber)
        .filter(ReportedNumber.phone_number.in_(search_terms))
        .first()
    )

    if reported:
        report_count = reported.report_count
        category = reported.category
        
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

    digits_only = re.sub(r"\D", "", clean_phone)
    if len(digits_only) < 9 or len(digits_only) > 15:
        return 0.48, {
            "model_name": "Waskita Phone Reputation Registry",
            "notes": ["Format panjang digit nomor telepon tidak sesuai standar telekomunikasi umum."],
        }

    return 0.15, {
        "model_name": "Waskita Phone Reputation Registry",
        "notes": [
            "Nomor belum pernah dilaporkan dalam basis data penipuan.",
            "Tetap pastikan identitas penelepon secara langsung bila meminta tindakan mendadak.",
        ],
    }
