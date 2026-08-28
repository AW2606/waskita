from typing import Dict, Any, Optional


def translate_risk(
    raw_score: float,
    content_type: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Translates a raw probability score (0.0 - 1.0) into standardized risk levels,
    empathetic plain-language explanations with intent-gated reasoning,
    and calibrated multi-factor acoustic + contextual fusion.

    Thresholds:
    - score < 0.40          -> 'tenang'
    - 0.40 <= score <= 0.70 -> 'perlu_diperiksa'
    - score > 0.70          -> 'sangat_waspada'
    """
    metadata = metadata or {}

    # Fail-Closed Safety: If decoding/extraction failed, never return false safety
    if metadata.get("status") == "tidak_dapat_diperiksa" or raw_score is None:
        error_desc = metadata.get("error", "Format media tidak dapat didekode oleh sistem.")
        return {
            "risk_level": "tidak_dapat_diperiksa",
            "score": 0,
            "explanation": (
                "Media tidak dapat diproses oleh sistem (kemungkinan format atau codec video/audio tidak didukung). "
                "Sistem TIDAK DAPAT memastikan keaslian konten ini — sangat disarankan untuk melakukan verifikasi manual langsung ke pihak terkait."
            ),
            "technical_detail": (
                f"• Status: Gagal Memproses Media ({error_desc})\n"
                "• Prinsip Keamanan Fail-Closed: Sistem menolak memberikan vonis aman secara otomatis saat ekstraksi frame/audio gagal.\n"
                "• Rekomendasi Tindakan: Hubungi pihak pengirim melalui saluran alternatif resmi sebelum mengambil keputusan finansial atau administratif."
            ),
        }

    score_clamped = max(0.0, min(1.0, float(raw_score)))
    int_score = int(round(score_clamped * 100))

    # Threat Origin Flags & Intent Metadata
    acoustic_fake_score = float(metadata.get("fake_probability", 0.0))
    content_scam_score = float(metadata.get("content_scam_score", 0.0))
    link_risk_score = float(metadata.get("link_risk_score", 0.0))
    matched_keywords = metadata.get("matched_keywords", [])
    transcribed_text = metadata.get("transcribed_text", "")
    detected_links = metadata.get("detected_links", [])
    recompression_detected = metadata.get("recompression_detected", False)
    
    intent_frame = metadata.get("intent_frame", "netral_ambigu")
    intent_label = metadata.get("intent_label", "")
    intent_summary = metadata.get("intent_summary", "")

    is_content_threat = content_scam_score >= 0.40 or intent_frame == "serangan_langsung"
    is_acoustic_threat = acoustic_fake_score >= 0.50
    is_link_threat = link_risk_score >= 0.40 or len(detected_links) > 0
    is_educational = intent_frame == "edukasi_informasi"

    # Determine risk level category
    if content_type in ["audio", "suara"]:
        # Audio / Voice Verification is focused strictly on Voice Biometrics & Deepfake AI Detection
        if score_clamped >= 0.65 or (is_acoustic_threat and score_clamped >= 0.50):
            risk_level = "sangat_waspada"
            int_score = max(70, int_score)
        elif score_clamped >= 0.40 or is_acoustic_threat:
            risk_level = "perlu_diperiksa"
            int_score = min(64, max(42, int_score))
        else:
            risk_level = "tenang"
            int_score = min(35, int_score)
    elif is_educational and not is_link_threat and content_type in ["pesan", "text"]:
        risk_level = "tenang"
        int_score = min(22, max(8, int_score))
    elif score_clamped < 0.40:
        risk_level = "tenang"
    elif score_clamped <= 0.70:
        risk_level = "perlu_diperiksa"
    else:
        risk_level = "sangat_waspada"

    is_ambiguous_zone = 0.40 <= score_clamped <= 0.60

    # Contextual explanations (Plain Indonesian language + Empathetic Guidance)
    if content_type in ["audio", "suara"]:
        if risk_level == "sangat_waspada":
            if is_acoustic_threat:
                explanation = (
                    "Indikasi suara tiruan sintesis AI (deepfake audio / voice cloning / TTS) pada rekaman ini terdeteksi kuat. "
                    "Karakteristik spektral, jeda digital, dan dinamika formant vokal menunjukkan ciri khas suara buatan kecerdasan buatan. "
                    "Sangat disarankan untuk melakukan verifikasi silang langsung melalui panggilan video atau kontak resmi terpercaya sebelum mempercayai isi rekaman."
                )
            else:
                explanation = (
                    "Meskipun karakter gelombang suara berasal dari manusia asli, isi percakapan yang diucapkan "
                    "memuat pola penipuan rekayasa sosial berisiko sangat tinggi. "
                    "Jangan ikuti instruksi penelepon dan lakukan verifikasi mandiri ke pihak resmi."
                )
        elif risk_level == "perlu_diperiksa":
            if is_acoustic_threat or is_ambiguous_zone:
                explanation = (
                    "Kami menemukan ketidaksesuaian pada dinamika frekuensi dan jeda vokal yang memiliki kemiripan dengan karakter generator vokal AI. "
                    "Tingkat keyakinan berada pada zona menengah — sebaiknya hubungi langsung pihak yang bersangkutan melalui saluran komunikasi terpercaya."
                )
            else:
                explanation = (
                    "Percakapan ini memuat modulasi vokal atau kata kunci yang perlu diwaspadai. "
                    "Sebaiknya tunda setiap keputusan penting dan lakukan konfirmasi mandiri."
                )
        else:  # tenang
            explanation = (
                "Pola vokal, modulasi nada, dan struktur gelombang suara pada rekaman ini terindikasi sebagai suara manusia alami (bukan kloning/sintesis AI). "
                "Tidak ditemukan indikasi manipulasi suara sintetis yang mencolok."
            )

    elif content_type in ["video"]:
        if is_educational:
            explanation = (
                "Video ini memuat narasi edukasi / informasi publik seputar kewaspadaan kejahatan digital. "
                "Tidak ditemukan unsur penipuan aktif atau instruksi berbahaya yang menargetkan Anda."
            )
        elif risk_level == "sangat_waspada":
            explanation = (
                "Terdeteksi pola artefak manipulasi visual digital (deepfake) yang kentara pada beberapa frame video. "
                "Sangat disarankan untuk melakukan verifikasi manual dan tidak mempercayai isi video tanpa konfirmasi independen."
            )
        elif risk_level == "perlu_diperiksa":
            if recompression_detected:
                explanation = (
                    "Video ini mengalami penurunan kualitas akibat kompresi berulang (khas media yang diteruskan di WhatsApp/medsos). "
                    "Meskipun ada sedikit anomali ekspresi, kualitas kompresi menyulitkan kepastian analisis. "
                    "Lakukan verifikasi manual langsung ke sumber resmi."
                )
            else:
                explanation = (
                    "Terdapat sedikit anomali pada detail tepi wajah atau artikulasi yang menyerupai efek generasi visual AI. "
                    "Disarankan untuk melakukan verifikasi manual secara langsung."
                )
        else:  # tenang
            explanation = (
                "Analisis visual pada frame video menunjukkan dinamika wajah dan pencahayaan yang konsisten secara alami. "
                "Tidak terdeteksi manipulasi deepfake visual yang mencolok."
            )

    elif content_type in ["pesan", "text"]:
        if is_educational:
            explanation = (
                "Teks ini merupakan narasi informasi / edukasi tentang modus penipuan dan tips pencegahan. "
                "Kata kunci yang muncul berfungsi sebagai bahan penjelasan, bukan instruksi penipuan aktif."
            )
        elif risk_level == "sangat_waspada":
            if is_link_threat:
                explanation = (
                    "PERINGATAN PHISHING: Pesan ini memuat tautan palsu / domain typosquatting berbahaya "
                    "yang dirancang untuk mencuri akun perbankan atau data pribadi Anda. "
                    "JANGAN KLIK tautan apa pun di dalam pesan ini!"
                )
            else:
                explanation = (
                    "Pesan ini mengandung kombinasi kuat pola rekayasa sosial: desakan waktu ekstrem, permintaan data rahasia/OTP, "
                    "atau instruksi transfer darurat. Disarankan verifikasi manual dan jangan berikan akses apa pun."
                )
        elif risk_level == "perlu_diperiksa":
            if is_link_threat:
                explanation = (
                    "Pesan ini menyertakan tautan shortlink atau alamat web yang tidak lazim. "
                    "Waspadai jebakan pencurian akun dan jangan memasukkan informasi rahasia pada halaman tersebut."
                )
            else:
                explanation = (
                    "Pesan ini memuat pola kalimat desakan atau permintaan yang sering digunakan dalam modus penipuan digital. "
                    "Sebaiknya lakukan verifikasi manual dan jangan terburu-buru merespons."
                )
        else:  # tenang
            explanation = (
                "Pesan ini menggunakan gaya bahasa biasa dan tidak memuat kata kunci penipuan bertekanan tinggi maupun tautan berbahaya. "
                "Situasi terindikasi wajar. Tetap jaga kerahasiaan data pribadi Anda."
            )

    elif content_type in ["telepon", "phone_number"]:
        if risk_level == "tenang":
            explanation = (
                "Nomor ini tidak memiliki riwayat laporan aktivitas mencurigakan dalam database pemantauan kami. "
                "Tetap lakukan verifikasi manual bila penelepon meminta tindakan mendadak."
            )
        elif risk_level == "perlu_diperiksa":
            explanation = (
                "Nomor ini memiliki pola panggilan yang tidak biasa atau menggunakan format yang sering disalahgunakan. "
                "Sebaiknya lakukan verifikasi manual ke nomor resmi yang Anda simpan sendiri."
            )
        else:  # sangat_waspada
            explanation = (
                "Nomor telepon ini tercatat dalam basis data memiliki riwayat laporan penipuan atau pencatutan nama. "
                "Sangat disarankan untuk melakukan verifikasi manual, memblokir nomor ini, dan tidak menanggapi panggilan masuk."
            )

    else:
        explanation = (
            "Hasil analisis selesai diproses. Penilaian ini berbasis pola komputasi kecerdasan buatan, "
            "sehingga disarankan untuk selalu melakukan verifikasi silang secara mandiri."
        )

    # Format technical details for transparency accordion
    model_name = metadata.get("model_name", "Waskita Pretrained AI & Intent-Gated Security Engine")
    raw_pct = f"{int_score}%"
    notes = metadata.get("notes", [])
    
    tech_lines = [
        f"• Probabilitas Risiko Ancaman: {raw_pct} (Kategori: {risk_level.upper()})",
        f"• Pipeline Analisis: {model_name}",
    ]
    
    if "architecture" in metadata:
        tech_lines.append(f"• Arsitektur AI: {metadata['architecture']}")
    
    if intent_label:
        tech_lines.append(f"• Klasifikasi Niat (Intent): {intent_label}")
    if intent_summary:
        tech_lines.append(f"• Konteks Niat: {intent_summary}")

    if "fake_probability" in metadata:
        tech_lines.append(f"• Skor Probabilitas Deepfake (Akustik): {metadata['fake_probability']:.1%}")
    if "content_scam_score" in metadata and metadata["content_scam_score"] is not None:
        tech_lines.append(f"• Skor Risiko Modus Penipuan (Konten): {metadata['content_scam_score']:.1%}")
    if detected_links:
        tech_lines.append(f"• Tautan URL Terdeteksi: {', '.join(detected_links)}")
    if matched_keywords:
        tech_lines.append(f"• Indikator Frasa Terdeteksi: {', '.join(matched_keywords)}")
    if "cluster_labels" in metadata and metadata["cluster_labels"]:
        tech_lines.append(f"• Kategori Modus Teridentifikasi: {', '.join(metadata['cluster_labels'])}")
    if "spectral_rolloff_hz" in metadata and metadata["spectral_rolloff_hz"]:
        tech_lines.append(f"• Forensic Spectral Rolloff: {metadata['spectral_rolloff_hz']} Hz")
    if "pitch_jitter_pct" in metadata:
        tech_lines.append(f"• Vocal Micro-Jitter: {metadata['pitch_jitter_pct']}% (Perturbasi Pitch Vokal)")
    if "frames_analyzed" in metadata:
        tech_lines.append(f"• Frame Sampel Dianalisis: {metadata['frames_analyzed']} frame video (OpenCV Uniform Sampling)")
    if "report_count" in metadata:
        tech_lines.append(f"• Riwayat Laporan Komunitas: {metadata['report_count']} laporan terverifikasi")
    if is_ambiguous_zone:
        tech_lines.append("• Status Zona Analisis: Zona Waspada Menengah (40-60%) — Rekomendasi verifikasi silang mandiri.")
    
    for note in notes:
        if note and note not in tech_lines:
            tech_lines.append(f"• {note}")

    technical_detail = "\n".join(tech_lines)

    return {
        "risk_level": risk_level,
        "score": int_score,
        "raw_score": score_clamped,
        "explanation": explanation,
        "technical_detail": technical_detail,
        "is_ambiguous": is_ambiguous_zone,
        "metadata": metadata,
    }
