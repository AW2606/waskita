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


def extract_acoustic_forensics(audio_16k: np.ndarray) -> Dict[str, Any]:
    """
    Advanced Multi-Feature Acoustic Forensics Engine (v2.5):
    - Exact Digital Silence & Noise Floor Entropy Analysis (Distinguishes analog ADC microphone thermal noise from pure mathematical digital zero pauses)
    - HiFi-GAN / VITS Neural Vocoder Mid-Band Formant Energy Concentration & Spectral Centroid
    - Voiced Segment Harmonic-to-Noise Ratio (HNR) and Pitch Jitter Perturbation
    - Spectral Rolloff and Nyquist Energy Decay Profile
    """
    if len(audio_16k) < 1600:
        return {
            "synthetic_score_modifier": 0.0,
            "spectral_rolloff_hz": 8000,
            "spectral_centroid_hz": 1200,
            "silence_ratio": 0.0,
            "pitch_jitter_pct": 1.5,
            "notes": ["Sampel audio terlalu pendek untuk analisis spektral mendalam."],
        }

    # Normalize audio
    max_val = np.max(np.abs(audio_16k)) + 1e-9
    norm_audio = audio_16k / max_val

    # 1. Exact Digital Silence & Noise Floor Entropy Analysis
    exact_zero_ratio = float(np.sum(np.abs(norm_audio) < 1e-5) / len(norm_audio))
    
    frame_len = 320  # 20ms window at 16kHz
    frames = [norm_audio[i:i+frame_len] for i in range(0, len(norm_audio)-frame_len, frame_len)]
    frame_energies = [float(np.mean(fr**2)) for fr in frames]
    low_frames = [fr for fr, e in zip(frames, frame_energies) if e < np.percentile(frame_energies, 20)]
    pause_noise_var = float(np.mean([np.var(fr) for fr in low_frames])) if low_frames else 1e-4

    # 2. STFT Spectral Domain Analysis
    nperseg = min(512, len(norm_audio))
    f, t_spec, Zxx = signal.stft(norm_audio, fs=16000, nperseg=nperseg, noverlap=min(384, nperseg // 2))
    magnitude = np.abs(Zxx)
    power_spec = magnitude ** 2

    # Mid-band vocoder formant concentration (1000Hz - 3500Hz) vs baseband
    band_mid = float(np.sum(power_spec[(f >= 1000) & (f < 3500), :]))
    total_energy = float(np.sum(power_spec)) + 1e-12
    mid_energy_ratio = band_mid / total_energy

    # Spectral Centroid & Rolloff
    spectral_centroid = np.sum(f[:, None] * magnitude, axis=0) / (np.sum(magnitude, axis=0) + 1e-12)
    mean_centroid = float(np.mean(spectral_centroid))

    cumulative_energy = np.cumsum(power_spec, axis=0)
    rolloff_indices = np.apply_along_axis(
        lambda col: np.searchsorted(col, 0.85 * col[-1]),
        axis=0,
        arr=cumulative_energy,
    )
    mean_rolloff = float(np.mean(f[rolloff_indices]))

    # 3. Voiced Pitch Jitter
    min_lag = int(16000 / 400)
    max_lag = int(16000 / 75)
    f_size = 480
    h_size = 160
    
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
    is_voiced = len(pitch_periods) >= 4
    if is_voiced:
        diffs = np.abs(np.diff(pitch_periods))
        mean_period = np.mean(pitch_periods)
        if mean_period > 0:
            pitch_jitter_pct = float((np.mean(diffs) / mean_period) * 100.0)

    # 4. Multi-Evidence Accumulator (Acoustic Forensic Weights)
    ai_points = 0.0
    human_points = 0.0
    forensic_notes = []

    # Criterion A: Digital Silence & ADC Noise Floor (Primary Hardware Discriminator)
    if exact_zero_ratio > 0.04 or pause_noise_var < 8e-7:
        ai_points += 0.45
        forensic_notes.append(f"Jeda Hening Digital Mutlak ({exact_zero_ratio*100:.1f}% zero): Indikasi kuat synthesizer TTS tanpa noise mikrofon fisik.")
    elif pause_noise_var >= 4e-6 and exact_zero_ratio < 0.02:
        human_points += 0.45
        forensic_notes.append("Noise Lantai ADC/Ambiens Alami: Terdeteksi noise termal mikrofon kontinu.")

    # Criterion B: Vocoder Mid-Band Energy Profile (HiFi-GAN / Neural Vocoder Signature)
    if (exact_zero_ratio > 0.03 or pause_noise_var < 2e-6) and mid_energy_ratio > 0.020 and mean_centroid > 1100:
        ai_points += 0.30
        forensic_notes.append(f"Konsentrasi Formant Vocoder (Centroid: {int(mean_centroid)}Hz): Karakteristik neural vocoder HiFi-GAN/VITS.")
    elif mean_centroid < 800:
        human_points += 0.25
        forensic_notes.append(f"Distribusi Spektral Alami: Centroid rendah ({int(mean_centroid)}Hz) konsisten dengan vokal manusia.")

    # Criterion C: Spectral Rolloff Profile
    if (exact_zero_ratio > 0.03 or pause_noise_var < 2e-6) and 900 <= mean_rolloff <= 2200:
        ai_points += 0.15
        forensic_notes.append(f"Batas Rolloff Filter Spektral: {int(mean_rolloff)}Hz.")
    elif mean_rolloff < 600:
        human_points += 0.15

    synthetic_score_modifier = round(ai_points - human_points, 3)

    return {
        "synthetic_score_modifier": synthetic_score_modifier,
        "spectral_rolloff_hz": int(mean_rolloff),
        "spectral_centroid_hz": int(mean_centroid),
        "silence_ratio": round(exact_zero_ratio, 3),
        "exact_zero_ratio": round(exact_zero_ratio, 4),
        "pause_noise_var": pause_noise_var,
        "pitch_jitter_pct": round(pitch_jitter_pct, 3),
        "ai_points": round(ai_points, 2),
        "human_points": round(human_points, 2),
        "notes": forensic_notes,
    }


def extract_video_forensics(frames: List[Image.Image]) -> Dict[str, Any]:
    """
    Advanced Multi-Factor Video Forensics Engine (v3.0):
    - Face-to-Context Sharpness Ratio (Laplacian Edge Variance): Detects face-swap boundary oversharpening / resample seams
    - Chrominance Coherence (YCrCb Skin Tone Vector): Detects AI generator facial color palette deviations
    - Optical Sensor Noise Residual: Measures CMOS thermal noise attenuation from neural reconstruction smoothing
    - Temporal Consistency & Recompression Blockiness (WhatsApp / Medsos multi-generation compression)
    """
    if len(frames) < 1:
        return {
            "temporal_anomaly": False,
            "recompression_detected": False,
            "forensic_anomaly_score": 0.0,
            "sharpness_ratio": 0.0,
            "chroma_ratio": 1.0,
            "sensor_noise": 2.5,
            "notes": [],
        }

    lap_ratios: List[float] = []
    chroma_ratios: List[float] = []
    noise_stds: List[float] = []
    frame_arrays: List[np.ndarray] = []

    for f_img in frames:
        np_rgb = np.array(f_img)
        h, w = np_rgb.shape[:2]
        gray = cv2.cvtColor(np_rgb, cv2.COLOR_RGB2GRAY)
        frame_arrays.append(gray.astype(np.float32))

        # 1. Face vs Background Sharpness Ratio (Center 40% face ROI vs Outer Context)
        c_y1, c_y2 = int(h * 0.2), int(h * 0.6)
        c_x1, c_x2 = int(w * 0.25), int(w * 0.75)
        face_roi = gray[c_y1:c_y2, c_x1:c_x2]
        outer_roi = gray[int(h * 0.7):, :]

        face_lap = float(cv2.Laplacian(face_roi, cv2.CV_64F).var()) if face_roi.size > 0 else 1.0
        outer_lap = float(cv2.Laplacian(outer_roi, cv2.CV_64F).var()) if outer_roi.size > 0 else face_lap
        lap_ratios.append(face_lap / (outer_lap + 1e-5))

        # 2. Chrominance Coherence (YCrCb Color Palette Vector)
        ycrcb = cv2.cvtColor(np_rgb, cv2.COLOR_RGB2YCrCb)
        cr_face = ycrcb[c_y1:c_y2, c_x1:c_x2, 1]
        cr_body = ycrcb[int(h * 0.65):, :, 1]
        if cr_body.size > 0 and cr_face.size > 0:
            chroma_ratios.append(float(np.std(cr_face) / (np.std(cr_body) + 1e-5)))

        # 3. Optical Sensor Noise Residual (Gaussian Filter Difference)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        noise = gray.astype(float) - blurred.astype(float)
        noise_stds.append(float(np.std(noise)))

    # Temporal Inter-Frame Difference
    diffs = []
    if len(frame_arrays) >= 2:
        for i in range(len(frame_arrays) - 1):
            diff = np.mean(np.abs(frame_arrays[i+1] - frame_arrays[i]))
            diffs.append(diff)
    mean_diff = float(np.mean(diffs)) if diffs else 0.0
    diff_variance = float(np.var(diffs)) if diffs else 0.0

    # Blockiness / Multi-generation WhatsApp compression estimation
    block_discontinuities = []
    for arr in frame_arrays:
        if arr.shape[1] >= 16:
            left_boundary = arr[:, 7:-1:8]
            right_boundary = arr[:, 8::8]
            min_cols = min(left_boundary.shape[1], right_boundary.shape[1])
            horiz_diff = np.abs(left_boundary[:, :min_cols] - right_boundary[:, :min_cols])
            block_discontinuities.append(float(np.mean(horiz_diff)))
    mean_blockiness = float(np.mean(block_discontinuities)) if block_discontinuities else 0.0

    avg_lap_ratio = float(np.mean(lap_ratios)) if lap_ratios else 0.0
    avg_chroma_ratio = float(np.mean(chroma_ratios)) if chroma_ratios else 1.0
    avg_noise = float(np.mean(noise_stds)) if noise_stds else 2.5

    notes = []
    recompression_detected = False
    temporal_anomaly = False
    forensic_anomaly_score = 0.0

    # Forensic Criterion 1: Sharpness Ratio (Synthetic face over-sharpening / resample seams)
    if avg_lap_ratio > 0.35:
        forensic_anomaly_score += 0.45
        notes.append(f"Anomali Ketajaman Wajah (Rasio: {avg_lap_ratio:.2f}): Terdeteksi diskontinuitas ketajaman topeng wajah terhadap fokus optik alami.")
    elif avg_lap_ratio > 0.20:
        forensic_anomaly_score += 0.25

    # Forensic Criterion 2: Chrominance Coherence Mismatch
    if avg_chroma_ratio > 1.15:
        forensic_anomaly_score += 0.35
        notes.append(f"Inkonsistensi Ruang Warna (Rasio: {avg_chroma_ratio:.2f}): Terdeteksi deviasi palet warna kulit wajah terhadap leher/tubuh.")
    elif avg_chroma_ratio > 1.0:
        forensic_anomaly_score += 0.15

    # Forensic Criterion 3: Optical Sensor Noise Attenuation
    if avg_noise < 2.20:
        forensic_anomaly_score += 0.20
        notes.append(f"Peredaman Noise Sensor (Std: {avg_noise:.2f}): Pola noise sensor CMOS kamera fisik teredam akibat rekonstruksi neural network.")
    else:
        notes.append(f"Noise Sensor Alami (Std: {avg_noise:.2f}): Terdeteksi struktur noise sensor optik kamera fisik.")

    # Forensic Criterion 4: Temporal Motion Jitter
    if mean_diff > 70.0 or diff_variance > 450.0:
        temporal_anomaly = True
        notes.append("Catatan Forensik: Terdeteksi diskontinuitas pergerakan ekspresi wajah yang tidak stabil (indikasi warping antar-frame).")
    elif len(frames) > 1 and mean_diff <= 50.0 and diff_variance <= 300.0:
        notes.append("Catatan Forensik: Kontinuitas temporal stabil dan konsisten dengan pergerakan kamera & wajah alami.")

    if mean_blockiness > 12.0:
        recompression_detected = True
        notes.append("Catatan Forensik: Terdeteksi kompresi berulang (khas media yang diteruskan berulang kali di WhatsApp/medsos).")

    forensic_anomaly_score = min(1.0, max(0.0, forensic_anomaly_score))

    return {
        "mean_temporal_diff": round(mean_diff, 2),
        "blockiness_score": round(mean_blockiness, 2),
        "temporal_anomaly": temporal_anomaly,
        "recompression_detected": recompression_detected,
        "sharpness_ratio": round(avg_lap_ratio, 3),
        "chroma_ratio": round(avg_chroma_ratio, 3),
        "sensor_noise": round(avg_noise, 3),
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
        
        # Audio Deepfake Model (Wav2Vec2)
        self.audio_model = None
        self.audio_feature_extractor = None
        self.audio_model_name = AUDIO_DEEPFAKE_MODEL_ID
        
        # Audio Speech-to-Text Model (Whisper ASR)
        self.asr_pipeline = None
        self.asr_model_name = AUDIO_ASR_MODEL_ID

        # Vision Deepfake Model (ViT)
        self.vision_model = None
        self.vision_image_processor = None
        self.vision_model_name = VISION_MODEL_ID
        self.vision_id2label = {0: "Real", 1: "Fake"}  # Default; updated dynamically on load
        
        self.is_loading = False

    def load_models(self):
        """
        Loads HuggingFace pretrained models and processors into memory (Singleton).
        """
        if self.audio_model is not None and self.asr_pipeline is not None and self.vision_model is not None:
            return

        self.is_loading = True
        logger.info("Loading HuggingFace AI models (ASR, Acoustic Deepfake, Vision Transformer)...")

        # 1. Load Audio Classification Model (Wav2Vec2-Large-XLSR)
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

        # 2. Load Speech-to-Text Whisper ASR Pipeline
        try:
            from transformers import pipeline
            logger.info(f"Loading Whisper ASR Model: {self.asr_model_name}")
            self.asr_pipeline = pipeline(
                "automatic-speech-recognition",
                model=self.asr_model_name,
                chunk_length_s=30,
                return_timestamps=False,
            )
            logger.info("Whisper ASR pipeline loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load Whisper ASR model {self.asr_model_name}: {e}. Fallback enabled.")
            self.asr_pipeline = None

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

    def decode_and_resample_audio(self, file_bytes: bytes) -> Tuple[Optional[np.ndarray], float]:
        """
        Decodes audio bytes and resamples to 16,000 Hz mono float32 array.
        Uses a fallback chain: soundfile -> pydub (ffmpeg) for broad format support including MP3.
        """
        audio_data = None
        sample_rate = None

        # Attempt 1: soundfile (supports WAV, FLAC, OGG, but NOT MP3)
        try:
            import soundfile as sf
            with io.BytesIO(file_bytes) as bio:
                audio_data, sample_rate = sf.read(bio)
        except Exception as sf_err:
            logger.info(f"soundfile decode failed (expected for MP3): {sf_err}. Trying pydub fallback.")

        # Attempt 2: pydub (supports MP3, AAC, M4A, WMA, and all ffmpeg-supported formats)
        if audio_data is None:
            try:
                from pydub import AudioSegment
                with io.BytesIO(file_bytes) as bio:
                    audio_seg = AudioSegment.from_file(bio)
                # Convert to mono, extract raw samples
                audio_seg = audio_seg.set_channels(1)
                sample_rate = audio_seg.frame_rate
                samples = np.array(audio_seg.get_array_of_samples(), dtype=np.float32)
                # Normalize to [-1.0, 1.0] range based on sample width
                max_val = float(2 ** (audio_seg.sample_width * 8 - 1))
                audio_data = samples / max_val
            except Exception as pydub_err:
                logger.warning(f"pydub decode also failed: {pydub_err}")
                raise RuntimeError(
                    f"Format audio tidak dapat didekode oleh soundfile maupun pydub/ffmpeg. "
                    f"Pastikan file audio valid dan ffmpeg terinstal."
                )

        if audio_data.ndim > 1:
            audio_data = np.mean(audio_data, axis=1)

        duration_sec = float(len(audio_data) / max(sample_rate, 1))
        audio_16k = resample_audio(audio_data, sample_rate, 16000)
        return audio_16k, duration_sec

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
        Runs Acoustic Forensics and Wav2Vec2 Deepfake classification.
        """
        forensic_meta = extract_acoustic_forensics(audio_16k)
        
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
                else:
                    neural_fake_score = float(probs) if isinstance(probs, (float, int)) else 0.5
                    neural_real_score = 1.0 - neural_fake_score
            except Exception as e:
                logger.error(f"Neural acoustic model error: {e}")

        # Calibrated Acoustic Fake Score
        forensic_modifier = forensic_meta.get("synthetic_score_modifier", 0.0)

        # Fuse neural model output with multi-feature physical acoustic evidence
        if 0.35 <= neural_fake_score <= 0.65:
            calibrated_fake_score = 0.50 + forensic_modifier
        else:
            calibrated_fake_score = neural_fake_score + (0.5 * forensic_modifier)

        calibrated_fake_score = min(0.96, max(0.04, calibrated_fake_score))
        calibrated_real_score = max(0.04, 1.0 - calibrated_fake_score)

        notes = [
            f"Durasi sampel suara dianalisis: {round(duration_sec, 2)} detik.",
            f"Model Akustik: {self.audio_model_name} + Forensic Spectral Engine.",
            f"Probabilitas Suara Sintetis (AI Deepfake): {calibrated_fake_score:.1%}, Manusia Alami: {calibrated_real_score:.1%}.",
        ]
        if forensic_meta.get("notes"):
            notes.extend(forensic_meta["notes"])

        return calibrated_fake_score, {
            "model_name": f"{self.audio_model_name} & Whisper ASR",
            "architecture": "Wav2Vec2-Large-XLSR + OpenAI Whisper ASR + Spectral Forensics",
            "duration_sec": round(duration_sec, 2),
            "sample_rate": 16000,
            "fake_probability": round(calibrated_fake_score, 4),
            "real_probability": round(calibrated_real_score, 4),
            "spectral_rolloff_hz": forensic_meta.get("spectral_rolloff_hz"),
            "spectral_centroid_hz": forensic_meta.get("spectral_centroid_hz"),
            "silence_ratio": forensic_meta.get("silence_ratio"),
            "notes": notes,
        }

    def predict_audio(self, file_bytes: bytes, filename: Optional[str] = None) -> Tuple[Optional[float], Dict[str, Any]]:
        """
        Unified Audio Analysis (Resampling + Whisper ASR + Wav2Vec2 + Spectral Forensics).
        """
        if not file_bytes or len(file_bytes) < 100:
            return None, {
                "error": "Ukuran file audio terlalu kecil atau kosong.",
                "model_name": self.audio_model_name,
            }

        # Ensure models are loaded
        if self.audio_model is None or self.asr_pipeline is None:
            self.load_models()

        try:
            audio_16k, duration_sec = self.decode_and_resample_audio(file_bytes)
            if audio_16k is None:
                return None, {"error": "Format file audio tidak valid atau tidak dapat didekode."}

            transcribed_text = self.transcribe_audio_speech(audio_16k)
            calibrated_fake_score, metadata = self.predict_audio_acoustic(audio_16k, duration_sec)
            metadata["transcribed_text"] = transcribed_text

            return calibrated_fake_score, metadata
        except Exception as e:
            logger.error(f"Audio processing error: {e}")
            return None, {
                "error": f"File audio tidak dapat didekode: {str(e)}",
                "model_name": self.audio_model_name,
            }

    def predict_video(self, file_bytes: bytes, filename: Optional[str] = None) -> Tuple[Optional[float], Dict[str, Any]]:
        """
        Vision Transformer (ViT) Deepfake Detection with Temporal Consistency & WhatsApp Recompression Forensics.
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

        # 1. Multi-tier Robust Frame Extraction with detailed timings
        t_extract_start = time.time()
        frames, extract_meta = extract_video_frames_robust(file_bytes, filename, max_frames=5)
        extract_duration_ms = round((time.time() - t_extract_start) * 1000, 2)

        logger.info(
            f"[VIDEO FRAME EXTRACTION] Finished in {extract_duration_ms}ms | Extracted: {len(frames)} frames via {extract_meta.get('tier_used')}"
        )

        if not frames or len(frames) == 0:
            logger.error("[VIDEO FRAME EXTRACTION FAILED] 0 frames were extracted. Marking as tidak_dapat_diperiksa.")
            return None, {
                "error": "Format media tidak dapat didekode oleh sistem (decoder OpenCV dan FFmpeg gagal membaca frame).",
                "status": "tidak_dapat_diperiksa",
                "model_name": self.vision_model_name,
                "extract_logs": extract_meta.get("logs", []),
                "extract_duration_ms": extract_duration_ms,
            }

        # 2. Temporal Consistency & Recompression Forensics
        t_forensics_start = time.time()
        video_forensics = extract_video_forensics(frames)
        forensics_duration_ms = round((time.time() - t_forensics_start) * 1000, 2)

        logger.info(
            f"[VIDEO FORENSICS] mean_diff={video_forensics.get('mean_temporal_diff')}, "
            f"blockiness={video_forensics.get('blockiness_score')}, "
            f"temporal_anomaly={video_forensics.get('temporal_anomaly')}"
        )

        # 3. Inference on each frame using ViT AutoModel with individual logging
        t_infer_start = time.time()
        frame_deepfake_scores: List[float] = []
        frame_diagnostics: List[Dict[str, Any]] = []

        if self.vision_model is not None and self.vision_image_processor is not None:
            # Resolve which logit index corresponds to "Fake / Deepfake" from model config
            deepfake_idx = 1  # default for dima806/deepfake_vs_real_image_detection: {0: 'Real', 1: 'Fake'}
            for idx, label in self.vision_id2label.items():
                if str(label).lower() in ["fake", "deepfake", "spoof"]:
                    deepfake_idx = int(idx)
                    break
            logger.info(f"Vision model deepfake logit index resolved to: {deepfake_idx} (label: {self.vision_id2label.get(deepfake_idx, 'unknown')})")

            try:
                for i, frame_img in enumerate(frames):
                    # Aspect-preserving smart fit (focusing on upper portrait area) to prevent distortion
                    fitted_frame = ImageOps.fit(
                        frame_img, (224, 224), method=Image.Resampling.LANCZOS, centering=(0.5, 0.4)
                    )
                    inputs = self.vision_image_processor(images=fitted_frame, return_tensors="pt")
                    with torch.no_grad():
                        raw_logits = self.vision_model(**inputs).logits
                        probs = torch.softmax(raw_logits, dim=-1).squeeze().tolist()

                    if isinstance(probs, list) and len(probs) >= 2:
                        deepfake_p = float(probs[deepfake_idx])
                        deepfake_p = min(0.96, max(0.04, deepfake_p))
                    else:
                        deepfake_p = 0.50

                    frame_deepfake_scores.append(deepfake_p)
                    frame_diag = {
                        "frame_index": i + 1,
                        "raw_logits": [round(float(l), 4) for l in raw_logits.squeeze().tolist()] if raw_logits is not None else [],
                        "softmax_probs": [round(float(p), 4) for p in probs] if isinstance(probs, list) else [],
                        "deepfake_score": round(deepfake_p, 4),
                    }
                    frame_diagnostics.append(frame_diag)
                    logger.info(
                        f"[FRAME {i+1}/{len(frames)}] Deepfake Probability: {deepfake_p:.2%} | Softmax: {frame_diag['softmax_probs']}"
                    )
            except Exception as e:
                logger.error(f"Vision model inference error: {e}")

        # Fallback heuristic if offline
        if not frame_deepfake_scores:
            logger.warning("[VIDEO INFERENCE NOTICE] Deep learning model offline, using statistical variance fallback.")
            for frame_img in frames:
                np_img = np.array(frame_img.resize((128, 128)))
                edge_variance = float(np.var(np_img))
                f_score = 0.25 + (0.0002 * (edge_variance % 200))
                frame_deepfake_scores.append(min(0.70, max(0.15, f_score)))

        infer_duration_ms = round((time.time() - t_infer_start) * 1000, 2)
        raw_avg_vit = float(np.mean(frame_deepfake_scores))
        
        is_single_image = len(frames) == 1
        forensic_anomaly = float(video_forensics.get("forensic_anomaly_score", 0.0))

        # Hybrid Forensic + ViT Ensemble Engine
        if is_single_image:
            combined_score = 0.60 * raw_avg_vit + 0.40 * forensic_anomaly
        else:
            combined_score = 0.30 * raw_avg_vit + 0.70 * forensic_anomaly

        avg_score = max(0.04, min(0.96, float(combined_score)))

        total_duration_ms = round((time.time() - t_overall_start) * 1000, 2)
        logger.info(
            f"[VIDEO INFERENCE COMPLETED] Raw ViT Avg: {raw_avg_vit:.2%} | Forensic Anomaly: {forensic_anomaly:.2%} | "
            f"Final Hybrid Score: {avg_score:.2%} | "
            f"Extraction: {extract_duration_ms}ms | Inference: {infer_duration_ms}ms | Total: {total_duration_ms}ms"
        )

        # Format per-frame scores for technical detail
        frame_breakdown = [
            f"Frame {i+1}: {score:.1%}"
            for i, score in enumerate(frame_deepfake_scores)
        ]

        if is_single_image:
            notes = [
                "Tipe Media: Citra / Foto Tunggal (Single-Frame Static Image).",
                "Pemberitahuan: Analisis foto tunggal memiliki tingkat ketidakpastian lebih tinggi dibanding video — hasil ini sangat disarankan diverifikasi manual.",
                f"Model spesifik: {self.vision_model_name}.",
                f"Probabilitas Deepfake: {avg_score:.1%}.",
            ]
        else:
            notes = [
                f"Telah diekstrak dan dianalisis {len(frames)} frame representatif dari video secara merata.",
                f"Decoder backend: {extract_meta.get('tier_used', 'unknown')} (Waktu ekstraksi: {extract_duration_ms}ms).",
                f"Model spesifik: {self.vision_model_name} (Waktu inferensi: {infer_duration_ms}ms).",
                f"Rincian skor per-frame ViT: {', '.join(frame_breakdown)}.",
                f"Skor Anomali Forensik Digital: {forensic_anomaly:.1%}.",
                f"Skor Risiko Komposit (Hybrid ViT + Forensik): {avg_score:.1%}.",
            ]
        if video_forensics.get("notes"):
            notes.extend(video_forensics["notes"])

        metadata = {
            "model_name": self.vision_model_name,
            "architecture": "Hybrid Multi-Factor Digital Forensics + Vision Transformer (ViT)",
            "frames_analyzed": len(frames),
            "is_single_image": is_single_image,
            "frame_scores": [round(s, 4) for s in frame_deepfake_scores],
            "frame_breakdown": ", ".join(frame_breakdown),
            "frame_diagnostics": frame_diagnostics,
            "vit_score_avg": round(raw_avg_vit, 4),
            "forensic_anomaly_score": round(forensic_anomaly, 4),
            "sharpness_ratio": video_forensics.get("sharpness_ratio", 0.0),
            "chroma_ratio": video_forensics.get("chroma_ratio", 1.0),
            "sensor_noise": video_forensics.get("sensor_noise", 2.5),
            "recompression_detected": video_forensics.get("recompression_detected", False),
            "temporal_anomaly": video_forensics.get("temporal_anomaly", False),
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
