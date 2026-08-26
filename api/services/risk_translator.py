from typing import Dict, Any, Optional


def translate_risk(
    raw_score: float,
    content_type: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Translates a raw probability score (0.0 - 1.0) into standardized risk levels,
    empathetic plain-language explanations, and structured technical details.

    Thresholds:
    - score < 0.40   -> 'tenang'
    - 0.40 <= score <= 0.70 -> 'perlu_diperiksa'
    - score > 0.70   -> 'sangat_waspada'
    """
    metadata = metadata or {}
    score_clamped = max(0.0, min(1.0, float(raw_score)))
    int_score = int(round(score_clamped * 100))

    # Determine risk level category
    if score_clamped < 0.40:
        risk_level = "tenang"
    elif score_clamped <= 0.70:
        risk_level = "perlu_diperiksa"
    else:
        risk_level = "sangat_waspada"

    # Contextual explanations (Plain Indonesian language + Mandatory disclaimer)
    if content_type in ["audio", "suara"]:
        if risk_level == "tenang":
            explanation = (
                "Pola suara pada rekaman ini terdengar wajar dan memiliki ciri khas ucapan manusia alami. "
                "Tidak ditemukan indikasi sintesis vokal AI yang signifikan. "
                "Perlu diingat bahwa ini adalah penilaian berbasis pola komputasi dan bukan bukti mutlak, "
                "namun situasi saat ini terindikasi aman."
            )
        elif risk_level == "perlu_diperiksa":
            explanation = (
                "Kami menemukan ketidaksesuaian kecil pada dinamika suara yang menyerupai karakter kloning audio AI. "
                "Hasil ini bukan bukti pasti adanya penipuan, namun kami menyarankan Anda untuk memverifikasi "
                "kebenaran informasi secara langsung ke pihak resmi atau keluarga sebelum mengambil tindakan."
            )
        else:  # sangat_waspada
            explanation = (
                "Indikasi suara tiruan sintesis AI (deepfake audio) pada rekaman ini terdeteksi sangat kuat. "
                "Meskipun analisis mesin bukan jaminan mutlak 100%, kami sangat menyarankan Anda untuk TIDAK "
                "mengikuti instruksi transfer dana atau permintaan rahasia dari rekaman ini."
            )

    elif content_type in ["video"]:
        if risk_level == "tenang":
            explanation = (
                "Analisis visual pada frame video menunjukkan dinamika wajah dan pencahayaan yang konsisten secara alami. "
                "Tidak terdeteksi manipulasi deepfake visual yang mencolok. "
                "Perlu diingat ini bukan jaminan mutlak, namun rekaman ini berada dalam batas wajar."
            )
        elif risk_level == "perlu_diperiksa":
            explanation = (
                "Terdapat sedikit anomali pada detail tepi wajah atau ekspresi yang menyerupai efek generasi visual AI. "
                "Temuan ini bukan bukti pasti rekayasa jahat, namun sebaiknya Anda berhati-hati dan memeriksa sumber video."
            )
        else:  # sangat_waspada
            explanation = (
                "Terdeteksi pola artefak manipulasi wajah digital (deepfake) yang sangat kentara pada beberapa frame video. "
                "Meskipun bukan keputusan mutlak sepihak, disarankan untuk tidak mempercayai isi video tanpa konfirmasi independen."
            )

    elif content_type in ["pesan", "text"]:
        if risk_level == "tenang":
            explanation = (
                "Pesan ini menggunakan gaya bahasa biasa dan tidak memuat kata kunci penipuan bertekanan tinggi. "
                "Situasi terindikasi wajar, namun tetap jaga kerahasiaan data pribadi Anda."
            )
        elif risk_level == "perlu_diperiksa":
            explanation = (
                "Pesan ini memuat pola kalimat desakan atau permintaan yang sering digunakan dalam modus penipuan digital. "
                "Ini bukan bukti pasti bahwa pengirim berniat jahat, tetapi sebaiknya Anda tidak terburu-buru merespons."
            )
        else:  # sangat_waspada
            explanation = (
                "Pesan ini mengandung kombinasi kuat pola rekayasa sosial: desakan waktu ekstrem, permintaan data rahasia/OTP, "
                "atau instruksi transfer darurat. Jangan berikan akses atau informasi apa pun."
            )

    elif content_type in ["telepon", "phone_number"]:
        if risk_level == "tenang":
            explanation = (
                "Nomor ini tidak memiliki riwayat laporan aktivitas mencurigakan dalam database pemantauan kami. "
                "Ini bukan jaminan mutlak, namun nomor ini saat ini berada dalam status aman."
            )
        elif risk_level == "perlu_diperiksa":
            explanation = (
                "Nomor ini memiliki pola panggilan yang tidak biasa atau menggunakan format yang sering disalahgunakan. "
                "Sebaiknya jangan langsung mempercayai klaim penelepon sebelum mengecek nomor resminya."
            )
        else:  # sangat_waspada
            explanation = (
                "Nomor telepon ini tercatat dalam basis data memiliki riwayat laporan penipuan atau pencatutan nama. "
                "Sangat disarankan untuk memblokir nomor ini dan tidak menanggapi panggilan masuk."
            )

    else:
        explanation = (
            "Hasil analisis selesai diproses. Perlu dipahami bahwa penilaian ini berbasis pola komputasi "
            "dan bukan bukti hukum pasti."
        )

    # Format technical details for transparency accordion
    model_name = metadata.get("model_name", "Waskita Neural Heuristic Engine v1.0")
    raw_pct = f"{score_clamped * 100:.1f}%"
    notes = metadata.get("notes", [])
    
    tech_lines = [
        f"• Probabilitas Risiko (AI Score): {raw_pct} (Kategori: {risk_level.upper()})",
        f"• Arsitektur Model / Pipeline: {model_name}",
    ]
    
    if "frames_analyzed" in metadata:
        tech_lines.append(f"• Frame Sampel Dianalisis: {metadata['frames_analyzed']} frame video")
    if "matched_keywords" in metadata and metadata["matched_keywords"]:
        tech_lines.append(f"• Kata Kunci Terdeteksi: {', '.join(metadata['matched_keywords'])}")
    if "report_count" in metadata:
        tech_lines.append(f"• Riwayat Laporan Komunitas: {metadata['report_count']} laporan")
    
    for note in notes:
        tech_lines.append(f"• {note}")

    technical_detail = "\n".join(tech_lines)

    return {
        "risk_level": risk_level,
        "score": int_score,
        "raw_score": score_clamped,
        "explanation": explanation,
        "technical_detail": technical_detail,
        "metadata": metadata,
    }
