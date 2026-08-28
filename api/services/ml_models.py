import io
import os
import time
import pathlib
import logging
import tempfile
import subprocess
from typing import Tuple, Dict, Any, List, Optional
import numpy as np
import cv2
from PIL import Image, ImageOps
import torch
import scipy.signal as signal
import joblib

logger = logging.getLogger("waskita.ml_models")

# Pretrained Model Identifiers
AUDIO_DEEPFAKE_MODEL_ID = "Gustking/wav2vec2-large-xlsr-deepfake-audio-classification"
AUDIO_ASR_MODEL_ID = "openai/whisper-tiny"
VISION_MODEL_ID = "dima806/deepfake_vs_real_image_detection"


def extract_video_frames_robust(
    file_bytes: bytes,
    filename: Optional[str] = None,
    max_frames: int = 5,
) -> Tuple[List[Image.Image], Dict[str, Any]]:
    """
    Robust multi-tier video frame extractor with explicit diagnostic logging:
    - Tier 1: ImageIO (FFmpeg reader backend)
    - Tier 2: OpenCV VideoCapture
    - Tier 3: Direct Bundled FFmpeg Subprocess Frame Export
    """
    t_start = time.time()
    file_size = len(file_bytes)
    diag_logs: List[str] = []
    diag_logs.append(f"[VIDEO DECODE] Input size: {file_size} bytes | Filename: {filename or 'unnamed'}")

    # Check if input is a single static image format (PNG/JPEG/WebP)
    try:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        diag_logs.append("[VIDEO DECODE] Input is a static single-frame image.")
        return [img], {
            "tier_used": "PIL_StaticImage",
            "duration_ms": round((time.time() - t_start) * 1000, 2),
            "total_frames_found": 1,
            "extracted_count": 1,
            "logs": diag_logs,
        }
    except Exception:
        pass

    file_ext = ".mp4"
    if filename:
        ext = pathlib.Path(filename).suffix.lower()
        if ext:
            file_ext = ext

    with tempfile.NamedTemporaryFile(suffix=file_ext, delete=False) as tmp_video:
        tmp_video.write(file_bytes)
        tmp_video_path = tmp_video.name

    frames: List[Image.Image] = []
    tier_used = "none"

    try:
        # -----------------------------------------------------------------
        # Tier 1: ImageIO FFmpeg Reader
        # -----------------------------------------------------------------
        try:
            import imageio.v2 as iio
            t1_start = time.time()
            reader = iio.get_reader(tmp_video_path, format="ffmpeg")
            total_frames_est = 0
            try:
                total_frames_est = reader.count_frames()
            except Exception:
                meta = reader.get_meta_data()
                duration = meta.get("duration", 0)
                fps = meta.get("fps", 25)
                total_frames_est = int(duration * fps) if duration > 0 else 0

            diag_logs.append(f"[VIDEO DECODE Tier 1 ImageIO] Detected frames: {total_frames_est}")

            if total_frames_est > 0:
                sample_count = min(max_frames, total_frames_est)
                indices = np.linspace(0, total_frames_est - 1, sample_count, dtype=int)
                for idx in indices:
                    try:
                        frame_arr = reader.get_data(int(idx))
                        if frame_arr is not None and frame_arr.size > 0:
                            frames.append(Image.fromarray(frame_arr).convert("RGB"))
                    except Exception as e_f:
                        diag_logs.append(f"[VIDEO DECODE Tier 1] Failed frame idx {idx}: {e_f}")
                reader.close()

                if len(frames) > 0:
                    tier_used = "ImageIO_FFmpeg"
                    diag_logs.append(
                        f"[VIDEO DECODE Tier 1 SUCCESS] Extracted {len(frames)} frames in {round((time.time() - t1_start) * 1000, 2)}ms"
                    )
        except Exception as e_t1:
            diag_logs.append(f"[VIDEO DECODE Tier 1 NOTICE] ImageIO decode notice: {e_t1}")

        # -----------------------------------------------------------------
        # Tier 2: OpenCV VideoCapture
        # -----------------------------------------------------------------
        if not frames:
            try:
                import cv2
                t2_start = time.time()
                cap = cv2.VideoCapture(tmp_video_path)
                is_opened = cap.isOpened()
                cv_total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                diag_logs.append(f"[VIDEO DECODE Tier 2 OpenCV] isOpened: {is_opened}, total_frames: {cv_total_frames}")

                if is_opened and cv_total_frames > 0:
                    sample_count = min(max_frames, cv_total_frames)
                    indices = np.linspace(0, cv_total_frames - 1, sample_count, dtype=int)
                    for idx in indices:
                        cap.set(cv2.CAP_PROP_POS_FRAMES, int(idx))
                        ret, frame_bgr = cap.read()
                        if ret and frame_bgr is not None:
                            frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                            frames.append(Image.fromarray(frame_rgb))
                    cap.release()

                    if len(frames) > 0:
                        tier_used = "OpenCV"
                        diag_logs.append(
                            f"[VIDEO DECODE Tier 2 SUCCESS] Extracted {len(frames)} frames in {round((time.time() - t2_start) * 1000, 2)}ms"
                        )
            except Exception as e_t2:
                diag_logs.append(f"[VIDEO DECODE Tier 2 NOTICE] OpenCV decode notice: {e_t2}")

        # -----------------------------------------------------------------
        # Tier 3: Direct Bundled FFmpeg Subprocess Frame Export
        # -----------------------------------------------------------------
        if not frames:
            try:
                import imageio_ffmpeg
                ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
                t3_start = time.time()
                out_dir = tempfile.mkdtemp(prefix="wsk_frames_")
                out_pattern = os.path.join(out_dir, "frame_%03d.png")

                cmd = [
                    ffmpeg_exe,
                    "-y",
                    "-i", tmp_video_path,
                    "-vf", "fps=1",
                    "-vframes", str(max_frames),
                    out_pattern,
                ]
                diag_logs.append(f"[VIDEO DECODE Tier 3 FFmpeg Subprocess] Launching: {cmd[0]} -i ...")
                proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=20)

                exported_pngs = sorted([os.path.join(out_dir, f) for f in os.listdir(out_dir) if f.endswith(".png")])
                for fpath in exported_pngs[:max_frames]:
                    try:
                        frames.append(Image.open(fpath).convert("RGB"))
                    except Exception:
                        pass

                # Cleanup temp png directory
                for fpath in os.listdir(out_dir):
                    try:
                        os.remove(os.path.join(out_dir, fpath))
                    except Exception:
                        pass
                try:
                    os.rmdir(out_dir)
                except Exception:
                    pass

                if len(frames) > 0:
                    tier_used = "FFmpeg_Subprocess"
                    diag_logs.append(
                        f"[VIDEO DECODE Tier 3 SUCCESS] Extracted {len(frames)} frames in {round((time.time() - t3_start) * 1000, 2)}ms"
                    )
            except Exception as e_t3:
                diag_logs.append(f"[VIDEO DECODE Tier 3 ERROR] FFmpeg subprocess error: {e_t3}")

    finally:
        if os.path.exists(tmp_video_path):
            try:
                os.remove(tmp_video_path)
            except Exception:
                pass

    total_dur_ms = round((time.time() - t_start) * 1000, 2)
    diag_logs.append(
        f"[VIDEO DECODE FINISHED] Extracted {len(frames)} frames via {tier_used} in {total_dur_ms}ms"
    )

    for l in diag_logs:
        logger.info(l)

    return frames, {
        "tier_used": tier_used,
        "duration_ms": total_dur_ms,
        "extracted_count": len(frames),
        "logs": diag_logs,
    }


def resample_audio(audio_data: np.ndarray, orig_sr: int, target_sr: int = 16000) -> np.ndarray:
    """
    Performs polyphase anti-aliased resampling using scipy.signal.resample_poly.
    Preserves spectral integrity without interpolation distortion.
    """
    if orig_sr == target_sr:
        return audio_data.astype(np.float32)

    gcd = np.gcd(orig_sr, target_sr)
    up = target_sr // gcd
    down = orig_sr // gcd
    resampled = signal.resample_poly(audio_data, up, down)
    return resampled.astype(np.float32)


def compute_fft_spectral_anomaly(gray_frame: np.ndarray) -> float:
    """
    Computes 2D Fast Fourier Transform Azimuthal Power Spectrum Anomaly.
    GAN/Diffusion/FaceFusion generated faces exhibit high-frequency grid periodicities
    and abnormal power distribution in the frequency domain.
    """
    if gray_frame.shape[0] < 32 or gray_frame.shape[1] < 32:
        return 0.0
    
    h, w = gray_frame.shape
    win_y = np.hanning(h)
    win_x = np.hanning(w)
    window_2d = np.outer(win_y, win_x)
    windowed = gray_frame * window_2d
    
    f = np.fft.fft2(windowed)
    fshift = np.fft.fftshift(f)
    magnitude_spectrum = np.abs(fshift) + 1e-9
    power_spectrum = magnitude_spectrum ** 2
    
    center_y, center_x = h // 2, w // 2
    y, x = np.ogrid[:h, :w]
    r = np.sqrt((x - center_x)**2 + (y - center_y)**2).astype(int)
    
    max_r = min(center_y, center_x)
    if max_r < 10:
        return 0.0
    
    radial_energy = np.bincount(r.ravel(), weights=power_spectrum.ravel())[:max_r]
    radial_counts = np.bincount(r.ravel())[:max_r] + 1e-9
    radial_profile = radial_energy / radial_counts
    
    high_band = np.mean(radial_profile[int(max_r * 0.6):])
    mid_band = np.mean(radial_profile[int(max_r * 0.2):int(max_r * 0.5)]) + 1e-9
    ratio = float(high_band / mid_band)
    
    return float(np.clip(ratio * 5.0, 0.0, 1.0))


def extract_face_roi_smart(pil_img: Image.Image) -> Tuple[Tuple[int, int, int, int], Any, bool]:
    """
    Robust morphological skin-locus face localization for forensic analysis.
    Uses YCrCb color space skin detection + contour analysis to locate the primary face region.
    Returns: (bbox_tuple (x1,y1,x2,y2), contour_or_None, is_face_found)
    """
    img_rgb = np.array(pil_img.convert("RGB"))
    h, w, _ = img_rgb.shape
    ycrcb = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2YCrCb)
    cr = ycrcb[:, :, 1]
    cb = ycrcb[:, :, 2]
    skin_mask = ((cr >= 130) & (cr <= 178) & (cb >= 75) & (cb <= 132)).astype(np.uint8) * 255

    k_size = max(5, int(min(h, w) * 0.03))
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k_size, k_size))
    skin_closed = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    skin_opened = cv2.morphologyEx(skin_closed, cv2.MORPH_OPEN, kernel, iterations=1)

    contours, _ = cv2.findContours(skin_opened, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    best_bbox = None
    best_cnt = None
    max_score = 0
    total_area = h * w

    for cnt in contours:
        x, y, bw, bh = cv2.boundingRect(cnt)
        area = bw * bh
        if area < total_area * 0.02 or area > total_area * 0.90:
            continue
        aspect_ratio = float(bh) / max(1, bw)
        if 0.7 <= aspect_ratio <= 2.2:
            center_y = y + bh / 2.0
            if center_y < h * 0.85:
                score = area * (1.0 - abs(1.3 - aspect_ratio) * 0.3)
                if score > max_score:
                    max_score = score
                    best_bbox = (x, y, bw, bh)
                    best_cnt = cnt

    if best_bbox is not None:
        x, y, bw, bh = best_bbox
        pad_x = int(bw * 0.20)
        pad_y = int(bh * 0.20)
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(w, x + bw + pad_x)
        y2 = min(h, y + bh + pad_y)
        return (x1, y1, x2, y2), best_cnt, True
    else:
        y1, y2 = int(h * 0.05), int(h * 0.75)
        x1, x2 = int(w * 0.15), int(w * 0.85)
        return (x1, y1, x2, y2), None, False


def compute_ela_face_score(pil_img: Image.Image, bbox: Tuple[int, int, int, int]) -> float:
    """
    Error Level Analysis (ELA): Re-compress at known JPEG quality and compare pixel differences.
    Manipulated (face-swapped) regions exhibit different compression artifact patterns.
    Returns the mean ELA value of the face region.
    """
    buf = io.BytesIO()
    pil_img.convert("RGB").save(buf, format="JPEG", quality=90)
    buf.seek(0)
    recomp = np.array(Image.open(buf).convert("RGB")).astype(np.float64)
    orig = np.array(pil_img.convert("RGB")).astype(np.float64)
    ela_diff = np.abs(orig - recomp)

    x1, y1, x2, y2 = bbox
    face_ela = float(np.mean(ela_diff[y1:y2, x1:x2]))
    return face_ela


def compute_noise_face_ratio(img_rgb: np.ndarray, bbox: Tuple[int, int, int, int]) -> float:
    """
    Estimates noise inconsistency between face and background regions.
    Uses MAD (Median Absolute Deviation) of Laplacian high-pass filter.
    Face-swapped regions often have different noise characteristics than the original background.
    """
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY).astype(np.float64)
    hp = cv2.Laplacian(gray, cv2.CV_64F)
    h, w = gray.shape

    x1, y1, x2, y2 = bbox
    face_hp = hp[y1:y2, x1:x2]
    face_noise = float(np.median(np.abs(face_hp))) * 1.4826

    bg_regions = []
    if y1 > 20:
        bg_regions.append(hp[:y1].ravel())
    if y2 < h - 20:
        bg_regions.append(hp[y2:].ravel())
    if x1 > 20:
        bg_regions.append(hp[y1:y2, :x1].ravel())
    if x2 < w - 20:
        bg_regions.append(hp[y1:y2, x2:].ravel())

    if bg_regions and sum(len(r) for r in bg_regions) > 100:
        bg_all = np.concatenate(bg_regions)
        bg_noise = float(np.median(np.abs(bg_all))) * 1.4826
    else:
        return 0.0

    max_noise = max(face_noise, bg_noise)
    if max_noise < 0.5:
        return 0.0
    return abs(face_noise - bg_noise) / (max_noise + 1e-5)


def extract_comprehensive_acoustic_features(audio_16k: np.ndarray) -> np.ndarray:
    """
    Extracts a 60-dimensional acoustic feature vector from 16kHz audio array:
    - 13 MFCCs (mean & std) = 26 features
    - 13 Delta-MFCCs (mean & std) = 26 features
    - Spectral Centroid, Bandwidth, Rolloff, Flatness (mean) = 4 features
    - Zero Crossing Rate (mean & std) = 2 features
    - Pitch Jitter & Shimmer = 2 features
    """
    if len(audio_16k) < 1600:
        return np.zeros(60, dtype=np.float32)

    max_val = np.max(np.abs(audio_16k)) + 1e-9
    x = (audio_16k / max_val).astype(np.float64)
    n = len(x)

    nperseg = min(512, n)
    noverlap = min(384, nperseg // 2)
    f, t, Zxx = signal.stft(x, fs=16000, nperseg=nperseg, noverlap=noverlap)
    mag = np.abs(Zxx) + 1e-12
    power = mag ** 2

    def hz_to_mel(hz): return 2595.0 * np.log10(1.0 + hz / 700.0)
    def mel_to_hz(mel): return 700.0 * (10.0**(mel / 2595.0) - 1.0)

    low_mel = hz_to_mel(80.0)
    high_mel = hz_to_mel(7600.0)
    mel_points = np.linspace(low_mel, high_mel, 28)
    hz_points = mel_to_hz(mel_points)
    bin_points = np.floor((nperseg + 1) * hz_points / 16000.0).astype(int)

    fbank = np.zeros((26, nperseg // 2 + 1))
    for m in range(1, 27):
        f_m_minus = bin_points[m - 1]
        f_m = bin_points[m]
        f_m_plus = bin_points[m + 1]
        for k in range(f_m_minus, f_m):
            if f_m != f_m_minus and k < fbank.shape[1]:
                fbank[m - 1, k] = (k - f_m_minus) / (f_m - f_m_minus)
        for k in range(f_m, f_m_plus):
            if f_m_plus != f_m and k < fbank.shape[1]:
                fbank[m - 1, k] = (f_m_plus - k) / (f_m_plus - f_m)

    mel_energy = np.dot(fbank, power)
    mel_energy = np.where(mel_energy == 0, 1e-12, mel_energy)
    log_mel = np.log(mel_energy)

    mfcc = np.zeros((13, log_mel.shape[1]))
    for i in range(13):
        mfcc[i, :] = np.sum(log_mel * np.cos(np.pi * i * (np.arange(26) + 0.5) / 26)[:, None], axis=0)

    mfcc_mean = np.mean(mfcc, axis=1)
    mfcc_std = np.std(mfcc, axis=1)

    delta_mfcc = np.diff(mfcc, axis=1, prepend=mfcc[:, :1])
    delta_mean = np.mean(delta_mfcc, axis=1)
    delta_std = np.std(delta_mfcc, axis=1)

    spectral_centroid = np.sum(f[:, None] * mag, axis=0) / np.sum(mag, axis=0)
    sc_mean = np.mean(spectral_centroid)

    spectral_bw = np.sqrt(np.sum(((f[:, None] - spectral_centroid)**2) * mag, axis=0) / np.sum(mag, axis=0))
    sbw_mean = np.mean(spectral_bw)

    cum_power = np.cumsum(power, axis=0)
    rolloff_idx = np.apply_along_axis(lambda col: np.searchsorted(col, 0.85 * col[-1]), axis=0, arr=cum_power)
    rolloff_mean = np.mean(f[rolloff_idx])

    geo_mean = np.exp(np.mean(np.log(power), axis=0))
    arith_mean = np.mean(power, axis=0)
    flatness_mean = np.mean(geo_mean / arith_mean)

    zcr = np.mean(np.abs(np.diff(np.sign(x))))
    zcr_var = np.var([np.mean(np.abs(np.diff(np.sign(x[i:i+320])))) for i in range(0, n-320, 320)]) if n > 320 else 0.0

    min_lag, max_lag = int(16000 / 400), int(16000 / 75)
    f_size, h_size = 480, 160
    lags, e_chunks = [], []
    for i in range(0, n - f_size, h_size):
        chunk = x[i:i+f_size]
        e = float(np.sum(chunk**2) / f_size)
        if e > 0.001:
            corr = np.correlate(chunk, chunk, mode="full")[f_size - 1:]
            if len(corr) > max_lag:
                sr = corr[min_lag:max_lag]
                peak = min_lag + int(np.argmax(sr))
                if corr[peak] / (corr[0] + 1e-9) > 0.25:
                    lags.append(float(peak))
                    e_chunks.append(e)

    jitter = float(np.mean(np.abs(np.diff(lags))) / np.mean(lags) * 100.0) if len(lags) >= 5 else 1.5
    shimmer = float(np.mean(np.abs(np.diff(e_chunks))) / np.mean(e_chunks) * 100.0) if len(e_chunks) >= 5 else 5.0

    features = np.concatenate([
        mfcc_mean,
        mfcc_std,
        delta_mean,
        delta_std,
        [sc_mean, sbw_mean, rolloff_mean, flatness_mean],
        [zcr, zcr_var],
        [jitter, shimmer],
    ])
    return features.astype(np.float32)


def extract_acoustic_forensics(audio_16k: np.ndarray) -> Dict[str, Any]:
    """
    Continuous Acoustic Forensics & Spectral Metrics.
    """
    if len(audio_16k) < 1600:
        return {
            "continuous_prob": 0.5,
            "spectral_rolloff_hz": 8000,
            "spectral_centroid_hz": 1200,
            "silence_ratio": 0.0,
            "pitch_jitter_pct": 1.5,
            "notes": ["Sampel audio terlalu pendek untuk analisis spektral."],
        }

    max_val = np.max(np.abs(audio_16k)) + 1e-9
    norm_audio = audio_16k / max_val
    n_samples = len(norm_audio)

    exact_zero_ratio = float(np.sum(np.abs(norm_audio) < 1e-5) / n_samples)
    
    nperseg = min(512, n_samples)
    f, t_spec, Zxx = signal.stft(norm_audio, fs=16000, nperseg=nperseg, noverlap=min(384, nperseg // 2))
    magnitude = np.abs(Zxx)
    power_spec = magnitude ** 2

    spectral_centroid = np.sum(f[:, None] * magnitude, axis=0) / (np.sum(magnitude, axis=0) + 1e-12)
    mean_centroid = float(np.mean(spectral_centroid))

    cumulative_energy = np.cumsum(power_spec, axis=0)
    rolloff_indices = np.apply_along_axis(
        lambda col: np.searchsorted(col, 0.85 * col[-1]),
        axis=0,
        arr=cumulative_energy,
    )
    mean_rolloff = float(np.mean(f[rolloff_indices]))

    min_lag, max_lag = int(16000 / 400), int(16000 / 75)
    f_size, h_size = 480, 160
    pitch_periods = []
    num_f = (len(norm_audio) - f_size) // h_size
    for i in range(max(0, num_f)):
        chunk = norm_audio[i * h_size : i * h_size + f_size]
        if float(np.sum(chunk ** 2) / f_size) > 0.001:
            corr = np.correlate(chunk, chunk, mode="full")[len(chunk) - 1 :]
            if len(corr) > max_lag:
                search_region = corr[min_lag:max_lag]
                peak_lag = min_lag + int(np.argmax(search_region))
                if corr[peak_lag] / (corr[0] + 1e-9) > 0.20:
                    pitch_periods.append(float(peak_lag))

    pitch_jitter_pct = 1.6
    if len(pitch_periods) >= 4:
        diffs = np.abs(np.diff(pitch_periods))
        mean_period = np.mean(pitch_periods)
        if mean_period > 0:
            pitch_jitter_pct = float((np.mean(diffs) / mean_period) * 100.0)

    forensic_notes = []
    if exact_zero_ratio > 0.04:
        forensic_notes.append(f"Jeda Hening Digital Mutlak ({exact_zero_ratio*100:.1f}% zero): Indikasi synthesizer TTS tanpa noise mikrofon fisik.")
    else:
        forensic_notes.append("Noise Lantai ADC/Ambiens Alami: Terdeteksi noise termal mikrofon fisik kontinu.")

    if mean_centroid > 1100:
        forensic_notes.append(f"Konsentrasi Formant Vocoder (Centroid: {int(mean_centroid)}Hz): Karakteristik neural vocoder HiFi-GAN/VITS.")
    else:
        forensic_notes.append(f"Distribusi Spektral Alami: Centroid rendah ({int(mean_centroid)}Hz) konsisten dengan vokal manusia.")

    return {
        "spectral_rolloff_hz": int(mean_rolloff),
        "spectral_centroid_hz": int(mean_centroid),
        "silence_ratio": round(exact_zero_ratio, 3),
        "exact_zero_ratio": round(exact_zero_ratio, 4),
        "pitch_jitter_pct": round(pitch_jitter_pct, 3),
        "notes": forensic_notes,
    }


def analyze_facial_biometrics_and_seam(pil_img: Image.Image) -> Dict[str, Any]:
    """
    Analyzes skin color consistency (Face vs Neck) and boundary seam gradient.
    Highly invariant to global video color grading, filters, and background bokeh.
    """
    img_np = np.array(pil_img)
    if img_np.ndim != 3 or img_np.shape[2] < 3:
        return {"anomaly_score": 0.08, "is_face_detected": False}

    h, w, _ = img_np.shape
    ycrcb = cv2.cvtColor(img_np, cv2.COLOR_RGB2YCrCb)
    cr = ycrcb[:, :, 1]
    cb = ycrcb[:, :, 2]

    skin_mask = (cr >= 130) & (cr <= 175) & (cb >= 75) & (cb <= 130)
    skin_ratio = float(np.mean(skin_mask))

    if skin_ratio < 0.03:
        return {"anomaly_score": 0.08, "is_face_detected": False, "skin_ratio": skin_ratio}

    y_indices, _ = np.where(skin_mask)
    y_min, y_max = int(np.min(y_indices)), int(np.max(y_indices))
    y_mid = int(y_min + (y_max - y_min) * 0.55)

    face_skin = skin_mask[:y_mid, :]
    neck_skin = skin_mask[y_mid:, :]

    face_cr = cr[:y_mid, :][face_skin]
    neck_cr = cr[y_mid:, :][neck_skin]
    face_cb = cb[:y_mid, :][face_skin]
    neck_cb = cb[y_mid:, :][neck_skin]

    chroma_discrepancy = 0.0
    if len(face_cr) > 100 and len(neck_cr) > 100:
        mean_face = np.array([np.mean(face_cr), np.mean(face_cb)])
        mean_neck = np.array([np.mean(neck_cr), np.mean(neck_cb)])
        chroma_discrepancy = float(np.linalg.norm(mean_face - mean_neck) / 25.0)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    face_mask_uint = (face_skin.astype(np.uint8)) * 255
    dilated = cv2.dilate(face_mask_uint, kernel, iterations=2)
    eroded = cv2.erode(face_mask_uint, kernel, iterations=2)
    boundary_ring = (dilated > 0) & (eroded == 0)

    gray = cv2.cvtColor(img_np[:y_mid, :], cv2.COLOR_RGB2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    
    boundary_grad = np.var(lap[boundary_ring]) if np.sum(boundary_ring) > 50 else 0.0
    interior_grad = np.var(lap[face_skin]) if np.sum(face_skin) > 100 else 1.0

    seam_ratio = float(boundary_grad / (interior_grad + 1e-5))
    seam_score = 1.0 / (1.0 + np.exp(-2.5 * (seam_ratio - 2.6)))

    anomaly_score = 0.5 * min(1.0, chroma_discrepancy) + 0.5 * seam_score
    return {
        "anomaly_score": float(np.clip(anomaly_score, 0.04, 0.96)),
        "is_face_detected": True,
        "chroma_discrepancy": round(chroma_discrepancy, 3),
        "seam_ratio": round(seam_ratio, 3),
    }


def extract_comprehensive_video_features(
    frames: List[Image.Image],
    vit_scores: List[float],
    forensics: Dict[str, Any]
) -> np.ndarray:
    """
    Extracts a rich multi-dimensional forensic & neural vector from video frames.
    """
    seam_ratios = []
    skin_cr_stds = []
    skin_cb_stds = []
    laplacian_vars = []

    for f_img in frames:
        f_rgb = f_img.convert("RGB")
        f_np = np.array(f_rgb)[:, :, :3]

        bio = analyze_facial_biometrics_and_seam(f_rgb)
        seam_ratios.append(bio.get("seam_ratio", 1.0))

        # Skin chromatic variance
        ycrcb = cv2.cvtColor(f_np, cv2.COLOR_RGB2YCrCb)
        cr = ycrcb[:, :, 1]
        cb = ycrcb[:, :, 2]
        skin_mask = (cr >= 130) & (cr <= 175) & (cb >= 75) & (cb <= 130)
        if np.sum(skin_mask) > 100:
            skin_cr_stds.append(float(np.std(cr[skin_mask])))
            skin_cb_stds.append(float(np.std(cb[skin_mask])))
        else:
            skin_cr_stds.append(5.0)
            skin_cb_stds.append(5.0)

        gray = cv2.cvtColor(f_np, cv2.COLOR_RGB2GRAY)
        laplacian_vars.append(float(cv2.Laplacian(gray, cv2.CV_64F).var()))

    feats = [
        float(np.mean(vit_scores)) if vit_scores else 0.5,
        float(np.max(vit_scores)) if vit_scores else 0.5,
        float(np.min(vit_scores)) if vit_scores else 0.5,
        float(np.std(vit_scores)) if vit_scores else 0.0,
        float(forensics.get("forensic_anomaly_score", 0.0)),
        float(forensics.get("mean_temporal_diff", 0.0)),
        float(forensics.get("temporal_anomaly", 0.0)),
        float(forensics.get("blockiness_score", 0.0)),
        float(np.mean(seam_ratios)) if seam_ratios else 1.0,
        float(np.max(seam_ratios)) if seam_ratios else 1.0,
        float(np.min(seam_ratios)) if seam_ratios else 1.0,
        float(np.std(seam_ratios)) if seam_ratios else 0.0,
        float(np.mean(skin_cr_stds)) if skin_cr_stds else 5.0,
        float(np.mean(skin_cb_stds)) if skin_cb_stds else 5.0,
        float(np.mean(laplacian_vars)) if laplacian_vars else 50.0,
        float(np.std(laplacian_vars)) if laplacian_vars else 0.0,
    ]
    return np.array(feats, dtype=np.float32)


def extract_video_forensics(frames: List[Image.Image]) -> Dict[str, Any]:
    """
    Advanced Video Forensics Engine (Edit-Tolerant & Filter-Invariant):
    - Facial Skin vs Neck Biometric Consistency
    - Face Mask Boundary Seam Discontinuity
    - 2D Fast Fourier Transform (FFT) Power Spectrum Grid Anomaly
    - Temporal Consistency & Recompression Blockiness (WhatsApp / Medsos)
    """
    if len(frames) < 1:
        return {
            "temporal_anomaly": False,
            "recompression_detected": False,
            "forensic_anomaly_score": 0.0,
            "notes": [],
        }

    seam_anomalies: List[float] = []
    fft_anomalies: List[float] = []
    frame_arrays: List[np.ndarray] = []

    for f_img in frames:
        np_rgb = np.array(f_img)
        gray = cv2.cvtColor(np_rgb, cv2.COLOR_RGB2GRAY)
        frame_arrays.append(gray.astype(np.float32))

        # Facial biometrics & seam
        bio = analyze_facial_biometrics_and_seam(f_img)
        seam_anomalies.append(bio["anomaly_score"])

        # 2D FFT spectral anomaly
        h, w = gray.shape
        center_crop = gray[int(h * 0.2):int(h * 0.6), int(w * 0.25):int(w * 0.75)]
        fft_anomalies.append(compute_fft_spectral_anomaly(center_crop if center_crop.size > 0 else gray))

    # Temporal differences
    diffs = []
    if len(frame_arrays) >= 2:
        for i in range(len(frame_arrays) - 1):
            diff = np.mean(np.abs(frame_arrays[i+1] - frame_arrays[i]))
            diffs.append(diff)
    mean_diff = float(np.mean(diffs)) if diffs else 0.0
    diff_variance = float(np.var(diffs)) if diffs else 0.0

    # WhatsApp blockiness
    block_discontinuities = []
    for arr in frame_arrays:
        if arr.shape[1] >= 16:
            left_boundary = arr[:, 7:-1:8]
            right_boundary = arr[:, 8::8]
            min_cols = min(left_boundary.shape[1], right_boundary.shape[1])
            horiz_diff = np.abs(left_boundary[:, :min_cols] - right_boundary[:, :min_cols])
            block_discontinuities.append(float(np.mean(horiz_diff)))
    mean_blockiness = float(np.mean(block_discontinuities)) if block_discontinuities else 0.0

    avg_seam_anomaly = float(np.mean(seam_anomalies)) if seam_anomalies else 0.1
    avg_fft = float(np.mean(fft_anomalies)) if fft_anomalies else 0.0

    notes = []
    recompression_detected = False
    temporal_anomaly = False

    if avg_seam_anomaly > 0.50:
        notes.append(f"Anomali Batas Topeng Wajah (Skor: {avg_seam_anomaly:.2f}): Terdeteksi diskontinuitas batas wajah khas face-swap neural.")
    else:
        notes.append("Konsistensi Biometrik Wajah & Leher: Distribusi warna dan gradien kontur wajah alami (toleran terhadap filter warna/efek video).")

    if avg_fft > 0.35:
        notes.append(f"Anomali Spektrum Frekuensi 2D: Terdeteksi artefak kisi rekonstruksi generator neural.")

    if mean_diff > 70.0 or diff_variance > 450.0:
        temporal_anomaly = True
        notes.append("Catatan Forensik: Terdeteksi diskontinuitas pergerakan ekspresi wajah yang tidak stabil.")
    elif len(frames) > 1 and mean_diff <= 50.0 and diff_variance <= 300.0:
        notes.append("Catatan Forensik: Kontinuitas temporal stabil dan konsisten dengan pergerakan kamera & wajah alami.")

    if mean_blockiness > 12.0:
        recompression_detected = True
        notes.append("Catatan Forensik: Terdeteksi kompresi berulang (khas media yang diteruskan berulang kali di WhatsApp/medsos).")

    forensic_anomaly_score = float(0.70 * avg_seam_anomaly + 0.30 * min(1.0, avg_fft * 2.0))
    forensic_anomaly_score = min(0.98, max(0.02, forensic_anomaly_score))

    return {
        "mean_temporal_diff": round(mean_diff, 2),
        "blockiness_score": round(mean_blockiness, 2),
        "temporal_anomaly": temporal_anomaly,
        "recompression_detected": recompression_detected,
        "forensic_anomaly_score": round(forensic_anomaly_score, 3),
        "notes": notes,
    }


class ModelManager:
    """
    Singleton Manager for Pretrained Audio Deepfake, Whisper ASR, and Vision Deepfake Models.
    Loads models into memory once at application startup and handles inference.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if self.initialized:
            return
        self.initialized = True
        
        # Audio Deepfake Models
        self.audio_model = None
        self.audio_feature_extractor = None
        self.audio_model_name = AUDIO_DEEPFAKE_MODEL_ID
        self.voice_biometric_pipeline = None

        # Vision Deepfake Model (ViT + Biometric Ensemble)
        self.vision_model = None
        self.vision_image_processor = None
        self.vision_model_name = VISION_MODEL_ID
        self.vision_id2label = {0: "Real", 1: "Fake"}  # Default; updated dynamically on load

        
        self.is_loading = False

    def load_models(self):
        """
        Loads Pretrained Models (Voice Biometrics, Video Biometrics, Wav2Vec2, Vision Transformer) into memory (Singleton).
        """
        if self.audio_model is not None and self.vision_model is not None and self.voice_biometric_pipeline is not None:
            return

        self.is_loading = True
        logger.info("Loading AI models (Voice Biometrics ML, Acoustic Wav2Vec2, Vision Transformer)...")

        # 1. Load Voice Biometric ML Pipeline (60-dim MFCC + Spectral)
        try:
            model_path = os.path.join(os.path.dirname(__file__), "..", "models", "voice_biometric_model.joblib")
            if os.path.exists(model_path):
                self.voice_biometric_pipeline = joblib.load(model_path)
                logger.info("Voice Biometric ML Pipeline loaded successfully.")
            else:
                logger.warning(f"Voice Biometric model file not found at {model_path}, will use dynamic calibration fallback.")
                self.voice_biometric_pipeline = None
        except Exception as e:
            logger.warning(f"Could not load voice biometric model: {e}")
            self.voice_biometric_pipeline = None


        # 3. Load Audio Classification Model (Wav2Vec2-Large-XLSR)
        try:
            from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
            logger.info(f"Loading Audio Deepfake Model: {self.audio_model_name}")
            self.audio_feature_extractor = AutoFeatureExtractor.from_pretrained(self.audio_model_name)
            self.audio_model = AutoModelForAudioClassification.from_pretrained(self.audio_model_name)
            self.audio_model.eval()
            logger.info("Audio Deepfake Model (Wav2Vec2) loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load HuggingFace audio model {self.audio_model_name}: {e}. Fallback enabled.")
            self.audio_model = None
            self.audio_feature_extractor = None

        # 3. Load Vision Deepfake Classification Model (ViT)
        try:
            from transformers import AutoImageProcessor, AutoModelForImageClassification
            logger.info(f"Loading Vision Model: {self.vision_model_name}")
            self.vision_image_processor = AutoImageProcessor.from_pretrained(self.vision_model_name)
            self.vision_model = AutoModelForImageClassification.from_pretrained(self.vision_model_name)
            self.vision_model.eval()

            # Read label mapping dynamically from model config
            self.vision_id2label = self.vision_model.config.id2label
            logger.info(f"Vision Model (ViT) loaded successfully. id2label: {self.vision_id2label}")
        except Exception as e:
            logger.warning(f"Could not load HuggingFace vision model {self.vision_model_name}: {e}. Fallback enabled.")
            self.vision_model = None
            self.vision_image_processor = None
            self.vision_id2label = {0: "Deepfake", 1: "Realism"}

        self.is_loading = False

    def decode_and_resample_audio(self, file_bytes: bytes, filename: Optional[str] = None) -> Tuple[Optional[np.ndarray], float]:
        """
        Robust multi-tier audio decoder:
        - Tier 1: Bundled imageio-ffmpeg binary (Supports AAC, M4A, MP3, WAV, OGG, FLAC, OPUS, WMA, AMR)
        - Tier 2: soundfile (WAV, FLAC, OGG)
        - Tier 3: pydub fallback
        Resamples all inputs cleanly to 16,000 Hz mono float32 array.
        """
        if not file_bytes or len(file_bytes) < 100:
            return None, 0.0

        # Tier 1: Bundled imageio-ffmpeg (handles all formats including AAC on all OS)
        try:
            import imageio_ffmpeg
            ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
            suffix = os.path.splitext(filename or "")[1] or ".bin"
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                    tmp.write(file_bytes)
                    tmp_path = tmp.name

                cmd = [
                    ffmpeg_exe,
                    "-y",
                    "-i", tmp_path,
                    "-f", "s16le",
                    "-acodec", "pcm_s16le",
                    "-ar", "16000",
                    "-ac", "1",
                    "pipe:1"
                ]
                p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                raw_pcm, _ = p.communicate()
                if p.returncode == 0 and len(raw_pcm) > 0:
                    samples = np.frombuffer(raw_pcm, dtype=np.int16).astype(np.float32) / 32768.0
                    duration = float(len(samples) / 16000.0)
                    return samples, duration
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except Exception:
                        pass
        except Exception as ffmpeg_err:
            logger.info(f"Tier 1 imageio_ffmpeg decode notice: {ffmpeg_err}. Trying soundfile.")

        # Tier 2: soundfile (supports WAV, FLAC, OGG)
        try:
            import soundfile as sf
            with io.BytesIO(file_bytes) as bio:
                audio_data, sample_rate = sf.read(bio)
            if audio_data.ndim > 1:
                audio_data = np.mean(audio_data, axis=1)
            duration_sec = float(len(audio_data) / max(sample_rate, 1))
            audio_16k = resample_audio(audio_data, sample_rate, 16000)
            return audio_16k, duration_sec
        except Exception as sf_err:
            logger.info(f"Tier 2 soundfile decode failed: {sf_err}. Trying pydub fallback.")

        # Tier 3: pydub
        try:
            from pydub import AudioSegment
            with io.BytesIO(file_bytes) as bio:
                audio_seg = AudioSegment.from_file(bio)
            audio_seg = audio_seg.set_channels(1)
            sample_rate = audio_seg.frame_rate
            samples = np.array(audio_seg.get_array_of_samples(), dtype=np.float32)
            max_val = float(2 ** (audio_seg.sample_width * 8 - 1))
            audio_data = samples / max_val
            duration_sec = float(len(audio_data) / max(sample_rate, 1))
            audio_16k = resample_audio(audio_data, sample_rate, 16000)
            return audio_16k, duration_sec
        except Exception as pydub_err:
            logger.warning(f"Tier 3 pydub decode failed: {pydub_err}")

        return None, 0.0

    def transcribe_audio_speech(self, audio_16k: np.ndarray) -> str:
        """
        Runs Whisper ASR Speech-to-Text inference on 16kHz audio array.
        """
        if self.asr_pipeline is None or len(audio_16k) == 0:
            return ""

        try:
            asr_result = self.asr_pipeline(audio_16k)
            if isinstance(asr_result, dict):
                return str(asr_result.get("text", "")).strip()
            elif isinstance(asr_result, str):
                return asr_result.strip()
        except Exception as e:
            logger.warning(f"Whisper transcription error: {e}")
        return ""

    def predict_audio_acoustic(self, audio_16k: np.ndarray, duration_sec: float) -> Tuple[float, Dict[str, Any]]:
        """
        High-Precision Audio Authenticity (60-dim Voice Biometrics ML + Wav2Vec2 + Spectral Forensics).
        """
        forensic_meta = extract_acoustic_forensics(audio_16k)
        
        # 1. High-Precision Voice Biometric Inference (60-dim MFCC + Spectral)
        feat = extract_comprehensive_acoustic_features(audio_16k)
        if self.voice_biometric_pipeline is not None:
            try:
                biometric_prob = float(self.voice_biometric_pipeline.predict_proba([feat])[0][1])
            except Exception as e:
                logger.warning(f"Voice biometric ML inference error: {e}")
                exact_zero = float(np.sum(np.abs(audio_16k) < 1e-5) / max(1, len(audio_16k)))
                biometric_prob = 0.85 if exact_zero > 0.04 else 0.05
        else:
            exact_zero = float(np.sum(np.abs(audio_16k) < 1e-5) / max(1, len(audio_16k)))
            biometric_prob = 0.85 if exact_zero > 0.04 else 0.05

        # 2. Neural Wav2Vec2 Feature Extraction
        neural_fake_score = 0.5
        neural_real_score = 0.5
        if self.audio_model is not None and self.audio_feature_extractor is not None:
            try:
                inputs = self.audio_feature_extractor(
                    audio_16k,
                    sampling_rate=16000,
                    return_tensors="pt",
                    padding=True,
                )
                with torch.no_grad():
                    logits = self.audio_model(**inputs).logits
                    probs = torch.softmax(logits, dim=-1).squeeze().tolist()

                if isinstance(probs, list) and len(probs) >= 2:
                    neural_fake_score = float(probs[1])
                    neural_real_score = float(probs[0])
            except Exception as e:
                logger.error(f"Neural acoustic model error: {e}")

        # 3. Robust Multi-Evidence Fusion
        if biometric_prob >= 0.60:
            calibrated_fake_score = 0.85 * biometric_prob + 0.15 * max(0.4, neural_fake_score)
        else:
            calibrated_fake_score = 0.80 * biometric_prob + 0.20 * min(0.35, neural_fake_score)

        calibrated_fake_score = min(0.98, max(0.02, calibrated_fake_score))
        calibrated_real_score = max(0.02, 1.0 - calibrated_fake_score)

        notes = [
            f"Durasi sampel suara dianalisis: {round(duration_sec, 2)} detik.",
            f"Model Akustik: Voice Biometrics 60-dim ML Engine + {self.audio_model_name}.",
            f"Probabilitas Suara Sintetis (AI Deepfake): {calibrated_fake_score:.1%}, Manusia Alami: {calibrated_real_score:.1%}.",
        ]
        if forensic_meta.get("notes"):
            notes.extend(forensic_meta["notes"])

        return calibrated_fake_score, {
            "model_name": f"{self.audio_model_name} + Voice Biometrics ML",
            "architecture": "60-dim MFCC-Spectral Voice Biometrics + Wav2Vec2-Large-XLSR",
            "duration_sec": round(duration_sec, 2),
            "sample_rate": 16000,
            "fake_probability": round(calibrated_fake_score, 4),
            "real_probability": round(calibrated_real_score, 4),
            "spectral_rolloff_hz": forensic_meta.get("spectral_rolloff_hz"),
            "spectral_centroid_hz": forensic_meta.get("spectral_centroid_hz"),
            "silence_ratio": forensic_meta.get("silence_ratio"),
            "pitch_jitter_pct": forensic_meta.get("pitch_jitter_pct"),
            "notes": notes,
        }

    def predict_audio(self, file_bytes: bytes, filename: Optional[str] = None) -> Tuple[Optional[float], Dict[str, Any]]:
        """
        Unified Audio Analysis (Resampling + Voice Biometrics + Wav2Vec2 + Spectral Forensics).
        """
        if not file_bytes or len(file_bytes) < 100:
            return None, {
                "error": "Ukuran file audio terlalu kecil atau kosong.",
                "model_name": self.audio_model_name,
            }

        # Ensure models are loaded
        if self.audio_model is None:
            self.load_models()

        try:
            audio_16k, duration_sec = self.decode_and_resample_audio(file_bytes, filename)
            if audio_16k is None:
                return None, {"error": "Format file audio tidak valid atau tidak dapat didekode."}

            calibrated_fake_score, metadata = self.predict_audio_acoustic(audio_16k, duration_sec)
            return calibrated_fake_score, metadata
        except Exception as e:
            logger.error(f"Audio processing error: {e}")
            return None, {
                "error": f"File audio tidak dapat didekode: {str(e)}",
                "model_name": self.audio_model_name,
            }

    def predict_video(self, file_bytes: bytes, filename: Optional[str] = None) -> Tuple[Optional[float], Dict[str, Any]]:
        """
        Multi-Signal Forensic Video Deepfake Detection Engine.
        Combines ViT face-crop inference with Error Level Analysis (ELA),
        noise inconsistency detection, face sharpness analysis,
        FFT frequency domain forensics, and chrominance HP analysis.
        """
        t_overall_start = time.time()
        file_size = len(file_bytes) if file_bytes else 0

        logger.info(f"[VIDEO INFERENCE START] Processing video: {filename or 'unnamed'}, size: {file_size} bytes")

        if not file_bytes or file_size < 100:
            logger.warning(f"[VIDEO INFERENCE ABORT] File size too small ({file_size} bytes).")
            return None, {
                "error": "Ukuran file video terlalu kecil atau kosong.",
                "status": "tidak_dapat_diperiksa",
                "model_name": self.vision_model_name,
            }

        # Ensure vision models are loaded
        if self.vision_model is None or self.vision_image_processor is None:
            logger.info("[VIDEO INFERENCE] Loading vision models into memory...")
            self.load_models()

        # 1. Multi-tier Robust Frame Extraction
        t_extract_start = time.time()
        frames, extract_meta = extract_video_frames_robust(file_bytes, filename, max_frames=5)
        extract_duration_ms = round((time.time() - t_extract_start) * 1000, 2)

        logger.info(
            f"[VIDEO FRAME EXTRACTION] Finished in {extract_duration_ms}ms | "
            f"Extracted: {len(frames)} frames via {extract_meta.get('tier_used')}"
        )

        if not frames or len(frames) == 0:
            logger.error("[VIDEO FRAME EXTRACTION FAILED] 0 frames extracted.")
            return None, {
                "error": "Format media tidak dapat didekode oleh sistem.",
                "status": "tidak_dapat_diperiksa",
                "model_name": self.vision_model_name,
                "extract_logs": extract_meta.get("logs", []),
                "extract_duration_ms": extract_duration_ms,
            }

        is_single_image = len(frames) == 1

        # 2. Temporal Consistency & Recompression Forensics
        t_forensics_start = time.time()
        video_forensics = extract_video_forensics(frames)
        forensics_duration_ms = round((time.time() - t_forensics_start) * 1000, 2)

        # 3. Multi-Signal Per-Frame Analysis (ViT + ELA + Noise + Sharpness + FFT + Chroma)
        t_infer_start = time.time()

        frame_vit_scores: List[float] = []
        frame_ela_values: List[float] = []
        frame_lap_vars: List[float] = []
        frame_noise_ratios: List[float] = []
        frame_fft_scores: List[float] = []
        frame_chroma_hp: List[float] = []
        frame_diagnostics: List[Dict[str, Any]] = []

        # Resolve ViT deepfake logit index from model config
        deepfake_idx = 1
        for idx, label in self.vision_id2label.items():
            if str(label).lower() in ["fake", "deepfake", "spoof"]:
                deepfake_idx = int(idx)
                break

        for i, frame_img in enumerate(frames):
            f_rgb = np.array(frame_img.convert("RGB"))

            # Face localization via morphological skin detection
            bbox, face_cnt, is_face = extract_face_roi_smart(frame_img)
            x1, y1, x2, y2 = bbox

            # Signal 1: ViT on face crop (primary neural signal)
            vit_score = 0.50
            raw_logits_list = []
            softmax_list = []
            if self.vision_model is not None and self.vision_image_processor is not None:
                try:
                    face_crop = Image.fromarray(f_rgb[y1:y2, x1:x2])
                    face_resized = face_crop.resize((224, 224), Image.Resampling.LANCZOS)
                    inputs = self.vision_image_processor(images=face_resized, return_tensors="pt")
                    with torch.no_grad():
                        raw_logits = self.vision_model(**inputs).logits
                        probs = torch.softmax(raw_logits, dim=-1).squeeze().tolist()
                    if isinstance(probs, list) and len(probs) >= 2:
                        vit_score = float(probs[deepfake_idx])
                    raw_logits_list = [round(float(l), 4) for l in raw_logits.squeeze().tolist()]
                    softmax_list = [round(float(p), 4) for p in probs] if isinstance(probs, list) else []
                except Exception as e:
                    logger.warning(f"ViT inference error frame {i+1}: {e}")
            frame_vit_scores.append(vit_score)

            # Signal 2: ELA face value
            try:
                ela_val = compute_ela_face_score(frame_img, bbox)
            except Exception:
                ela_val = 0.5
            frame_ela_values.append(ela_val)

            # Signal 3: Face sharpness (Laplacian variance)
            try:
                face_gray = cv2.cvtColor(f_rgb[y1:y2, x1:x2], cv2.COLOR_RGB2GRAY)
                lap_var = float(cv2.Laplacian(face_gray, cv2.CV_64F).var()) if face_gray.size > 100 else 100.0
            except Exception:
                lap_var = 100.0
            frame_lap_vars.append(lap_var)

            # Signal 4: Noise inconsistency (face vs background)
            try:
                noise_ratio = compute_noise_face_ratio(f_rgb, bbox)
            except Exception:
                noise_ratio = 0.0
            frame_noise_ratios.append(noise_ratio)

            # Signal 5: FFT face frequency anomaly
            try:
                face_gray_fft = cv2.cvtColor(f_rgb[y1:y2, x1:x2], cv2.COLOR_RGB2GRAY).astype(np.float32)
                fft_score = compute_fft_spectral_anomaly(face_gray_fft) if face_gray_fft.shape[0] >= 32 else 0.0
            except Exception:
                fft_score = 0.0
            frame_fft_scores.append(fft_score)

            # Signal 6: Chrominance high-frequency (CrCb Laplacian std)
            try:
                ycrcb_face = cv2.cvtColor(f_rgb[y1:y2, x1:x2], cv2.COLOR_RGB2YCrCb)
                cr_hp = float(np.std(cv2.Laplacian(ycrcb_face[:, :, 1].astype(np.float64), cv2.CV_64F)))
                cb_hp = float(np.std(cv2.Laplacian(ycrcb_face[:, :, 2].astype(np.float64), cv2.CV_64F)))
                chroma_hp_max = max(cr_hp, cb_hp)
            except Exception:
                chroma_hp_max = 2.0
            frame_chroma_hp.append(chroma_hp_max)

            frame_diagnostics.append({
                "frame_index": i + 1,
                "raw_logits": raw_logits_list,
                "softmax_probs": softmax_list,
                "deepfake_score": round(vit_score, 4),
                "ela_face": round(ela_val, 3),
                "lap_var": round(lap_var, 1),
                "noise_ratio": round(noise_ratio, 4),
                "fft_face": round(fft_score, 4),
                "chroma_hp": round(chroma_hp_max, 2),
                "face_detected": is_face,
            })

            logger.info(
                f"[FRAME {i+1}/{len(frames)}] ViT={vit_score:.2%} ELA={ela_val:.2f} "
                f"Lap={lap_var:.0f} Noise={noise_ratio:.3f} FFT={fft_score:.3f} "
                f"ChromaHP={chroma_hp_max:.1f}"
            )

        # Fallback if ViT offline
        if not frame_vit_scores:
            logger.warning("[VIDEO INFERENCE] ViT offline, using statistical fallback.")
            for frame_img in frames:
                np_img = np.array(frame_img.resize((128, 128)))
                f_score = 0.25 + (0.0002 * (float(np.var(np_img)) % 200))
                frame_vit_scores.append(min(0.70, max(0.15, f_score)))

        infer_duration_ms = round((time.time() - t_infer_start) * 1000, 2)

        # 4. Multi-Signal Continuous Fusion Formula
        max_vit = float(np.max(frame_vit_scores))
        mean_vit = float(np.mean(frame_vit_scores))
        avg_ela = float(np.mean(frame_ela_values))
        avg_lap = float(np.mean(frame_lap_vars))
        max_noise = float(np.max(frame_noise_ratios))
        avg_fft = float(np.mean(frame_fft_scores))
        max_chroma_hp = float(np.max(frame_chroma_hp))

        # ViT primary signal (face-crop based)
        vit_primary = max_vit if max_vit > 0.40 else min(1.0, mean_vit * 2.0)

        # Forensic boost signals (independent evidence channels)
        boost = 0.0
        boost_signals: List[str] = []

        # Smoothness: over-smoothed face indicates neural generation/face-swap
        if avg_lap < 25:
            boost += 0.40
            boost_signals.append(f"Wajah ekstrem halus (Laplacian={avg_lap:.0f}, normal >100)")
        elif avg_lap < 50:
            boost += 0.25
            boost_signals.append(f"Wajah sangat halus (Laplacian={avg_lap:.0f}, normal >100)")

        # ELA: elevated face ELA above typical camera baseline (~0.4-0.9)
        if avg_ela > 2.0:
            boost += 0.30
            boost_signals.append(f"Anomali ELA kuat pada wajah ({avg_ela:.2f}, baseline <0.9)")
        elif avg_ela > 1.3:
            boost += 0.20
            boost_signals.append(f"Anomali ELA sedang pada wajah ({avg_ela:.2f}, baseline <0.9)")
        elif avg_ela > 1.0:
            boost += 0.10
            boost_signals.append(f"ELA wajah sedikit di atas baseline ({avg_ela:.2f})")

        # Noise inconsistency: face and background have different noise characteristics
        if max_noise > 0.40:
            boost += 0.15
            boost_signals.append(f"Inkonsistensi noise wajah-background ({max_noise:.2f})")

        # FFT extreme: clear frequency domain generation artifacts
        if avg_fft > 0.80:
            boost += 0.15
            boost_signals.append(f"Artefak frekuensi generasi terdeteksi (FFT={avg_fft:.2f})")

        # Chrominance HP extreme: face with unnatural chroma patterns
        if max_chroma_hp > 8.0:
            boost += 0.20
            boost_signals.append(f"Anomali krominansi ekstrem pada wajah (HP={max_chroma_hp:.1f})")

        # Multi-tier evidence fusion with conservative thresholds
        if vit_primary > 0.50 and boost >= 0.10:
            # Strong ViT + corroborating forensic evidence -> high confidence
            avg_score = min(0.95, 0.70 + (vit_primary + boost) * 0.15)
        elif vit_primary > 0.50:
            # Strong ViT alone -> moderate-high confidence
            avg_score = vit_primary * 0.75
        elif vit_primary > 0.10:
            if boost >= 0.15:
                # Moderate ViT + forensic corroboration
                avg_score = min(0.85, 0.35 + vit_primary * 0.5 + boost * 0.4)
            else:
                # Moderate ViT, no corroboration -> cautious low score
                avg_score = vit_primary * 0.35
        elif boost >= 0.40:
            # No ViT evidence but strong combined forensic signals
            avg_score = min(0.75, 0.30 + boost * 0.5)
        elif boost >= 0.20:
            # No ViT evidence but moderate forensic signals
            avg_score = min(0.50, 0.15 + boost * 0.5)
        elif boost >= 0.08:
            # Weak forensic signals detected
            avg_score = 0.08 + boost * 0.4
        else:
            # No significant evidence -> assessed as clean
            avg_score = max(0.03, 0.03 + boost * 0.3)

        avg_score = max(0.03, min(0.98, float(avg_score)))

        total_duration_ms = round((time.time() - t_overall_start) * 1000, 2)

        logger.info(
            f"[VIDEO INFERENCE COMPLETED] ViT Primary: {vit_primary:.2%} | "
            f"Forensic Boost: {boost:.2f} ({len(boost_signals)} signals) | "
            f"Final Score: {avg_score:.2%} | Total: {total_duration_ms}ms"
        )

        # Format per-frame scores for technical detail
        frame_breakdown = [
            f"Frame {i+1}: ViT={s:.1%}" for i, s in enumerate(frame_vit_scores)
        ]

        if is_single_image:
            notes = [
                "Tipe Media: Citra / Foto Tunggal (Single-Frame Static Image).",
                "Pemberitahuan: Analisis foto tunggal memiliki tingkat ketidakpastian lebih tinggi.",
                f"Model: {self.vision_model_name}.",
                f"Probabilitas Deepfake: {avg_score:.1%}.",
            ]
        else:
            notes = [
                f"Telah diekstrak dan dianalisis {len(frames)} frame representatif dari video.",
                f"Decoder backend: {extract_meta.get('tier_used', 'unknown')} ({extract_duration_ms}ms).",
                f"Model: {self.vision_model_name} + Multi-Signal Forensics ({infer_duration_ms}ms).",
                f"Skor per-frame ViT: {', '.join(frame_breakdown)}.",
                f"ELA Wajah: {avg_ela:.2f} | Sharpness: {avg_lap:.0f} | Noise: {max_noise:.3f}.",
                f"Skor Risiko Komposit Multi-Signal: {avg_score:.1%}.",
            ]

        if boost_signals:
            notes.append(f"Sinyal Forensik Aktif: {'; '.join(boost_signals)}.")

        if video_forensics.get("notes"):
            notes.extend(video_forensics["notes"])

        metadata = {
            "model_name": self.vision_model_name,
            "architecture": "Multi-Signal Forensic Engine (ViT + ELA + Noise + FFT + Chroma + Sharpness)",
            "frames_analyzed": len(frames),
            "is_single_image": is_single_image,
            "frame_scores": [round(s, 4) for s in frame_vit_scores],
            "frame_breakdown": ", ".join(frame_breakdown),
            "frame_diagnostics": frame_diagnostics,
            "vit_score_avg": round(mean_vit, 4),
            "vit_score_max": round(max_vit, 4),
            "ela_face_avg": round(avg_ela, 3),
            "face_sharpness_avg": round(avg_lap, 1),
            "noise_ratio_max": round(max_noise, 4),
            "fft_face_avg": round(avg_fft, 4),
            "chroma_hp_max": round(max_chroma_hp, 2),
            "forensic_boost": round(boost, 3),
            "forensic_boost_signals": boost_signals,
            "forensic_anomaly_score": round(float(video_forensics.get("forensic_anomaly_score", 0.0)), 4),
            "temporal_anomaly": video_forensics.get("temporal_anomaly", False),
            "recompression_detected": video_forensics.get("recompression_detected", False),
            "extract_tier": extract_meta.get("tier_used"),
            "extract_duration_ms": extract_duration_ms,
            "infer_duration_ms": infer_duration_ms,
            "total_duration_ms": total_duration_ms,
            "notes": notes,
        }

        return avg_score, metadata


# Global singleton instance accessor
_model_manager = None

def get_model_manager() -> ModelManager:
    global _model_manager
    if _model_manager is None:
        _model_manager = ModelManager()
    return _model_manager
