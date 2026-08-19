"""
================================================================================
Flask Web Application for Video Steganography (LSB & 2D-DWT)
Backend API and Web Server
================================================================================
"""

import os
import io
import base64
import json
import numpy as np
import cv2
from flask import Flask, render_template, request, jsonify

from src.frame_selector import AdaptiveFrameSelector
from src.lsb_core import LSBStegoEngine
from src.quality_metrics import QualityEvaluator
from src.video_handler import VideoHandler

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 64 * 1024 * 1024  # 64 MB max upload

# In-memory session store for video frames to provide instant response
SESSION_STORAGE = {
    "orig_frames": [],
    "stego_frames": [],
    "selected_indices": [],
    "fps": 24.0,
    "last_secret": "",
}


def frame_to_base64(frame: np.ndarray, format_ext: str = ".jpg", quality: int = 90) -> str:
    """Encodes a numpy image frame into a base64 Data URL string."""
    if format_ext == ".png":
        success, buffer = cv2.imencode(".png", frame)
    else:
        success, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
    if not success:
        return ""
    b64_str = base64.b64encode(buffer).decode("utf-8")
    mime = "image/png" if format_ext == ".png" else "image/jpeg"
    return f"data:{mime};base64,{b64_str}"


def generate_bit_plane(frame: np.ndarray, bit_index: int = 0) -> np.ndarray:
    """Extracts a single bit plane (0 = LSB, 7 = MSB) as a high-contrast visualizer."""
    if len(frame.shape) == 3:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    else:
        gray = frame
    bit_plane = ((gray >> bit_index) & 1) * 255
    return bit_plane.astype(np.uint8)


def generate_diff_heatmap(orig: np.ndarray, stego: np.ndarray, amplification: int = 50) -> np.ndarray:
    """Generates an amplified difference heatmap between original and stego frame."""
    diff = cv2.absdiff(orig, stego)
    amplified = cv2.multiply(diff, np.array([amplification, amplification, amplification], dtype=np.uint8))
    # Convert to heatmap color map
    gray_diff = cv2.cvtColor(amplified, cv2.COLOR_BGR2GRAY)
    heatmap = cv2.applyColorMap(gray_diff, cv2.COLORMAP_JET)
    return heatmap


@app.route("/")
def index():
    """Serves the main single page web application."""
    return render_template("index.html")


@app.route("/api/generate-sample", methods=["POST"])
def generate_sample():
    """Generates a synthetic dynamic video sequence and returns initial AFS analysis."""
    try:
        data = request.get_json() or {}
        num_frames = int(data.get("num_frames", 20))
        strategy = data.get("strategy", "hybrid")
        ratio = float(data.get("ratio", 0.35))

        frames = VideoHandler.generate_synthetic_video(
            num_frames=num_frames, width=320, height=240, fps=24.0
        )
        SESSION_STORAGE["orig_frames"] = frames
        SESSION_STORAGE["stego_frames"] = []
        SESSION_STORAGE["selected_indices"] = []
        SESSION_STORAGE["fps"] = 24.0

        selector = AdaptiveFrameSelector(default_strategy=strategy)
        selected_indices, analysis = selector.select_frames(
            frames, selection_ratio=ratio, strategy=strategy, min_frames=2
        )
        SESSION_STORAGE["selected_indices"] = selected_indices

        # Prepare frame cards with thumbnails
        frame_cards = []
        for i, row in enumerate(analysis):
            frame = frames[i]
            thumb_b64 = frame_to_base64(frame, format_ext=".jpg", quality=85)
            frame_cards.append({
                "index": i,
                "selected": i in selected_indices,
                "texture_variance": row["texture_variance"],
                "entropy": row["entropy"],
                "motion_score": row["motion_score"],
                "suitability_score": row["suitability_score"],
                "thumbnail": thumb_b64,
            })

        engine = LSBStegoEngine(bits_per_channel=1)
        cap = engine.calculate_capacity(frames, selected_indices)

        return jsonify({
            "status": "success",
            "total_frames": len(frames),
            "resolution": f"{frames[0].shape[1]}x{frames[0].shape[0]}",
            "selected_count": len(selected_indices),
            "selected_indices": selected_indices,
            "capacity": cap,
            "frames": frame_cards,
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/embed", methods=["POST"])
def embed_payload():
    """Embeds secret payload into selected frames and computes full metrics."""
    try:
        data = request.get_json() or {}
        secret_text = data.get("secret_text", "").strip()
        strategy = data.get("strategy", "hybrid")
        ratio = float(data.get("ratio", 0.35))
        bits_per_channel = int(data.get("bits_per_channel", 1))

        if not secret_text:
            return jsonify({"status": "error", "message": "Secret message cannot be empty."}), 400

        frames = SESSION_STORAGE.get("orig_frames", [])
        if not frames:
            # Generate default synthetic frames if none loaded
            frames = VideoHandler.generate_synthetic_video(num_frames=20, width=320, height=240)
            SESSION_STORAGE["orig_frames"] = frames

        # Step 1: Run AFS Frame Selection
        selector = AdaptiveFrameSelector(default_strategy=strategy)
        selected_indices, analysis = selector.select_frames(
            frames, selection_ratio=ratio, strategy=strategy, min_frames=2
        )
        SESSION_STORAGE["selected_indices"] = selected_indices

        # Step 2: Embed via LSB Engine
        engine = LSBStegoEngine(bits_per_channel=bits_per_channel)
        stego_frames, embed_summary = engine.embed(frames, selected_indices, secret_text)
        SESSION_STORAGE["stego_frames"] = stego_frames
        SESSION_STORAGE["last_secret"] = secret_text

        # Step 3: Compute Quality Metrics
        metrics = QualityEvaluator.evaluate_video_sequence(frames, stego_frames, selected_indices)

        # Step 4: Prepare Detailed Frame Visuals (Thumbnails, Bit-planes, Diff Heatmaps)
        frame_visuals = []
        for idx in range(len(frames)):
            orig_f = frames[idx]
            stego_f = stego_frames[idx]
            is_sel = idx in selected_indices
            is_alt = not np.array_equal(orig_f, stego_f)

            orig_b64 = frame_to_base64(orig_f, format_ext=".png")
            stego_b64 = frame_to_base64(stego_f, format_ext=".png")
            
            # 8th bit plane (LSB plane)
            lsb_plane_b64 = frame_to_base64(generate_bit_plane(stego_f, 0), format_ext=".png")
            # Diff heatmap
            diff_b64 = frame_to_base64(generate_diff_heatmap(orig_f, stego_f, amplification=80), format_ext=".jpg")

            psnr_val = QualityEvaluator.calculate_psnr(orig_f, stego_f)
            mse_val = QualityEvaluator.calculate_mse(orig_f, stego_f)
            ssim_val = QualityEvaluator.calculate_ssim(orig_f, stego_f)

            frame_visuals.append({
                "index": idx,
                "selected": is_sel,
                "altered": is_alt,
                "psnr": "INF" if psnr_val == float("inf") else psnr_val,
                "mse": round(mse_val, 6),
                "ssim": round(ssim_val, 6),
                "orig_thumb": orig_b64,
                "stego_thumb": stego_b64,
                "lsb_plane": lsb_plane_b64,
                "diff_heatmap": diff_b64,
            })

        return jsonify({
            "status": "success",
            "embed_summary": embed_summary,
            "metrics": {
                "overall_ssim": metrics["overall_video_ssim"],
                "avg_psnr_db": metrics["avg_psnr_altered_frames_db"],
                "avg_mse": metrics["avg_mse_altered_frames"],
                "total_frames": metrics["total_frames"],
                "altered_frames_count": metrics["altered_frames_count"],
                "frame_alteration_rate_pct": metrics["frame_alteration_rate_pct"],
                "unaltered_frames_pct": metrics["unaltered_frames_pct"],
            },
            "selected_indices": selected_indices,
            "frames": frame_visuals,
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/extract", methods=["POST"])
def extract_payload():
    """Extracts secret payload from stego frames with CRC32 integrity check."""
    try:
        data = request.get_json() or {}
        strategy = data.get("strategy", "hybrid")
        ratio = float(data.get("ratio", 0.35))
        bits_per_channel = int(data.get("bits_per_channel", 1))

        stego_frames = SESSION_STORAGE.get("stego_frames", [])
        if not stego_frames:
            return jsonify({
                "status": "error",
                "message": "No stego video available in session. Please perform embedding first."
            }), 400

        # Receiver deterministically identifies target frames
        selector = AdaptiveFrameSelector(default_strategy=strategy)
        selected_indices, _ = selector.select_frames(
            stego_frames, selection_ratio=ratio, strategy=strategy, min_frames=2
        )

        engine = LSBStegoEngine(bits_per_channel=bits_per_channel)
        extracted_bytes, meta = engine.extract(stego_frames, selected_indices)

        if extracted_bytes is not None:
            recovered_text = extracted_bytes.decode("utf-8", errors="replace")
            orig_secret = SESSION_STORAGE.get("last_secret", "")
            is_exact_match = (recovered_text == orig_secret) if orig_secret else True

            return jsonify({
                "status": "success",
                "recovered_text": recovered_text,
                "payload_bytes": len(extracted_bytes),
                "crc_verified": meta.get("crc_verified", True),
                "integrity_message": meta.get("message", "CRC32 Validated"),
                "selected_indices": selected_indices,
                "is_exact_match": is_exact_match,
            })
        else:
            return jsonify({
                "status": "error",
                "message": meta.get("message", "Extraction failed: Header or CRC checksum mismatch.")
            }), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/project-info", methods=["GET"])
def project_info():
    """Returns academic project metadata, formulas, and Q&A."""
    try:
        synopsis_path = os.path.join(os.path.dirname(__file__), "SYNOPSIS.md")
        qa_path = os.path.join(os.path.dirname(__file__), "PRESENTATION_QA.md")

        synopsis_content = ""
        qa_content = ""

        if os.path.exists(synopsis_path):
            with open(synopsis_path, "r", encoding="utf-8") as f:
                synopsis_content = f.read()

        if os.path.exists(qa_path):
            with open(qa_path, "r", encoding="utf-8") as f:
                qa_content = f.read()

        return jsonify({
            "status": "success",
            "title": "Digital Video Steganography: LSB (Spatial Domain) & 2D-DWT (Transform Domain)",
            "synopsis_md": synopsis_content,
            "qa_md": qa_content,
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    print("================================================================================")
    print(" >>> VIDEO STEGANOGRAPHY (LSB & 2D-DWT) WEB SERVER STARTING")
    print(" >>> Open your browser at: http://127.0.0.1:5000")
    print("================================================================================")
    app.run(host="127.0.0.1", port=5000, debug=True)
