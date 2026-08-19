"""
================================================================================
DIGITAL VIDEO STEGANOGRAPHY USING LSB + ADAPTIVE FRAME SELECTION (AFS)
Interactive Project Demonstration Script
================================================================================
"""

import sys
import os
import argparse
from src.frame_selector import AdaptiveFrameSelector
from src.lsb_core import LSBStegoEngine
from src.quality_metrics import QualityEvaluator
from src.video_handler import VideoHandler


def print_banner():
    banner = """
================================================================================
  DIGITAL VIDEO STEGANOGRAPHY: LSB + ADAPTIVE FRAME SELECTION (AFS)
  Project Prototype & Demonstration
================================================================================
"""
    print(banner)


def print_section(title: str):
    print(f"\n{'=' * 80}")
    print(f" >>> {title.upper()}")
    print(f"{'=' * 80}")


def run_steganography_pipeline(
    video_path: str = None,
    secret_text: str = None,
    selection_ratio: float = 0.35,
    strategy: str = "hybrid",
    bits_per_channel: int = 1
):
    print_banner()

    # -------------------------------------------------------------------------
    # STEP 1: Video Input & Frame Acquisition
    # -------------------------------------------------------------------------
    print_section("Step 1: Video Input & Frame Ingestion")
    if video_path and os.path.exists(video_path):
        print(f"[*] Loading video from file: {video_path}")
        frames, fps = VideoHandler.load_video_frames(video_path, max_frames=60)
    else:
        print("[*] Generating synthetic video sequence for demonstration (24 frames)...")
        frames = VideoHandler.generate_synthetic_video(num_frames=24, width=320, height=240)
        fps = 24.0

    total_frames = len(frames)
    height, width, channels = frames[0].shape
    print(f"[+] Total Video Frames Ingested : {total_frames}")
    print(f"[+] Frame Resolution           : {width} x {height} ({channels} channels)")
    print(f"[+] Video Frame Rate (FPS)      : {fps}")

    # -------------------------------------------------------------------------
    # STEP 2: Adaptive Frame Selection (AFS) Analysis
    # -------------------------------------------------------------------------
    print_section("Step 2: Adaptive Frame Selection (AFS) Evaluation")
    print(f"[*] Strategy Configured        : {strategy}")
    print(f"[*] Target Selection Ratio     : {selection_ratio * 100:.1f}%")

    selector = AdaptiveFrameSelector(default_strategy=strategy)
    selected_indices, analysis = selector.select_frames(
        frames,
        selection_ratio=selection_ratio,
        strategy=strategy,
        min_frames=2
    )

    print("\nFrame-by-Frame AFS Metrics (Sample View):")
    print(f"{'Frame':^7} | {'Texture Var':^13} | {'Entropy':^9} | {'Motion':^9} | {'Suitability':^13} | {'Selected?':^10}")
    print("-" * 75)
    for row in analysis[:12]:  # Show first 12 frames
        is_sel = "[ SELECTED ]" if row["frame_index"] in selected_indices else "     -     "
        print(
            f"  #{row['frame_index']:02d}   | "
            f"{row['texture_variance']:^13.2f} | "
            f"{row['entropy']:^9.3f} | "
            f"{row['motion_score']:^9.2f} | "
            f"{row['suitability_score']:^13.2f} | "
            f"{is_sel:^10}"
        )
    if len(analysis) > 12:
        print(f"  ... and {len(analysis) - 12} more frames evaluated.")

    print(f"\n[+] Total Frames Selected for Embedding: {len(selected_indices)} out of {total_frames} frames")
    print(f"[+] Selected Frame Indices: {selected_indices}")

    # -------------------------------------------------------------------------
    # STEP 3: Secret Data Preparation & Capacity Analysis
    # -------------------------------------------------------------------------
    print_section("Step 3: Secret Message & Payload Capacity Check")
    if not secret_text:
        secret_text = (
            "SECRET TRANSMISSION: Video Steganography using LSB + AFS is verified. "
            "Adaptive Frame Selection successfully isolates high-entropy carrier frames!"
        )

    engine = LSBStegoEngine(bits_per_channel=bits_per_channel)
    capacity = engine.calculate_capacity(frames, selected_indices)

    print(f"[+] Secret Message to Embed    : \"{secret_text}\"")
    print(f"[+] Secret Payload Size        : {len(secret_text.encode('utf-8'))} bytes")
    print(f"[+] Max Embedding Capacity     : {capacity['max_payload_bytes']} bytes ({capacity['max_payload_kb']} KB)")
    print(f"[+] Bits per Pixel Channel     : {bits_per_channel} bit(s)")

    # -------------------------------------------------------------------------
    # STEP 4: LSB Embedding in Selected Frames
    # -------------------------------------------------------------------------
    print_section("Step 4: LSB Steganographic Embedding")
    print("[*] Embedding payload exclusively into AFS-selected carrier frames...")

    stego_frames, embed_summary = engine.embed(frames, selected_indices, secret_text)
    print(f"[+] Status                     : EMBEDDING COMPLETE")
    print(f"[+] Total Bits Embedded        : {embed_summary['total_bits_embedded']} bits (including Header & CRC32)")
    print(f"[+] Frames Modified (Altered)  : {embed_summary['frames_utilized']} frame(s)")
    print(f"[+] Frames Untouched (Clean)   : {total_frames - embed_summary['frames_utilized']} frame(s)")

    # -------------------------------------------------------------------------
    # STEP 5: Quality Assessment (PSNR, MSE, SSIM) & Comparative Analysis
    # -------------------------------------------------------------------------
    print_section("Step 5: Visual Quality & Steganographic Metrics")
    metrics = QualityEvaluator.evaluate_video_sequence(frames, stego_frames, selected_indices)

    print(f"[+] Overall Video SSIM         : {metrics['overall_video_ssim']} (1.0 = Perfect Identical)")
    print(f"[+] Average PSNR (Altered)     : {metrics['avg_psnr_altered_frames_db']} dB (> 40 dB is Imperceptible)")
    print(f"[+] Average MSE  (Altered)     : {metrics['avg_mse_altered_frames']}")
    print(f"[+] Video Frame Alteration Rate: {metrics['frame_alteration_rate_pct']}% of video altered")
    print(f"[+] Video Unaltered Clean Rate : {metrics['unaltered_frames_pct']}% of video intact")

    print("\n--- Comparative Analysis: Traditional LSB vs Proposed AFS-LSB ---")
    print(f"{'Metric':<30} | {'Traditional Naive LSB':<22} | {'Proposed AFS + LSB':<22}")
    print("-" * 80)
    alt_rate_str = f"{metrics['frame_alteration_rate_pct']}% (Selective)"
    print(f"{'Target Frames Embedded':<30} | {'100% (Every Frame)':<22} | {alt_rate_str:<22}")
    print(f"{'Steganalysis Exposure Risk':<30} | {'High (All frames altered)':<22} | {'Low (Only complex frames)':<22}")
    print(f"{'Visual Artifact Masking':<30} | {'Uniform / Flat artifacts':<22} | {'HVS Masked in texture':<22}")
    print(f"{'Payload Security':<30} | {'Predictable distribution':<22} | {'Adaptive dynamic dispersal':<22}")

    # -------------------------------------------------------------------------
    # STEP 6: Secret Data Extraction & Integrity Verification
    # -------------------------------------------------------------------------
    print_section("Step 6: Receiver Extraction & Integrity Verification")
    print("[*] Receiver applies the identical AFS selection rule to isolate candidate frames...")
    extracted_bytes, ext_meta = engine.extract(stego_frames, selected_indices)

    if extracted_bytes:
        recovered_str = extracted_bytes.decode("utf-8", errors="replace")
        print(f"[+] Extraction Status          : {ext_meta['status'].upper()}")
        print(f"[+] Integrity Verification     : {ext_meta['message']}")
        print(f"[+] Recovered Secret Message   :\n    \"{recovered_str}\"")
        match = (recovered_str == secret_text)
        print(f"[+] Exact Match with Original? : {'YES (100% Lossless Recovery)' if match else 'NO'}")
    else:
        print(f"[-] Extraction Failed          : {ext_meta['message']}")

    print("\n" + "=" * 80)
    print("  PROJECT DEMONSTRATION COMPLETE - READY FOR TEACHER REVIEW")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Video Steganography using LSB + Adaptive Frame Selection (AFS)"
    )
    parser.add_argument("--video", type=str, default=None, help="Path to input video file (.mp4, .avi)")
    parser.add_argument("--secret", type=str, default=None, help="Secret message string to embed")
    parser.add_argument("--ratio", type=float, default=0.35, help="Proportion of frames to select (e.g. 0.35 for 35%)")
    parser.add_argument(
        "--strategy",
        type=str,
        default="hybrid",
        choices=["texture_variance", "motion_energy", "hybrid"],
        help="AFS selection strategy"
    )
    parser.add_argument("--bpc", type=int, default=1, choices=[1, 2], help="Bits per channel (1 or 2)")

    args = parser.parse_args()

    run_steganography_pipeline(
        video_path=args.video,
        secret_text=args.secret,
        selection_ratio=args.ratio,
        strategy=args.strategy,
        bits_per_channel=args.bpc
    )
