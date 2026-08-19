"""
Quality Metrics and Evaluation Module
Calculates PSNR, MSE, SSIM, and comparative analytics between
Traditional Full-Frame LSB and the proposed AFS-LSB method.
"""

from typing import List, Dict
import numpy as np
from skimage.metrics import structural_similarity as ssim_fn


class QualityEvaluator:
    """
    Evaluates visual distortion, imperceptibility, and embedding performance
    using standard image/video processing metrics.
    """

    @staticmethod
    def calculate_mse(orig: np.ndarray, stego: np.ndarray) -> float:
        """
        Mean Squared Error between original and stego frame.
        Lower value = higher similarity.
        """
        err = np.mean((orig.astype(np.float64) - stego.astype(np.float64)) ** 2)
        return float(err)

    @staticmethod
    def calculate_psnr(orig: np.ndarray, stego: np.ndarray) -> float:
        """
        Peak Signal-to-Noise Ratio in Decibels (dB).
        Values > 40 dB generally indicate imperceptible changes to the human eye.
        """
        mse = QualityEvaluator.calculate_mse(orig, stego)
        if mse == 0:
            return float("inf")  # Exact match, no noise
        max_pixel = 255.0
        psnr = 10.0 * np.log10((max_pixel ** 2) / mse)
        return round(float(psnr), 2)

    @staticmethod
    def calculate_ssim(orig: np.ndarray, stego: np.ndarray) -> float:
        """
        Structural Similarity Index Measure (SSIM).
        Range: -1.0 to 1.0 (1.0 = identical structure, luminance, contrast).
        """
        if len(orig.shape) == 3 and orig.shape[2] == 3:
            score, _ = ssim_fn(orig, stego, channel_axis=2, full=True)
        else:
            score, _ = ssim_fn(orig, stego, full=True)
        return round(float(score), 6)

    @classmethod
    def evaluate_video_sequence(
        cls,
        orig_frames: List[np.ndarray],
        stego_frames: List[np.ndarray],
        selected_indices: List[int]
    ) -> Dict:
        """
        Computes comprehensive metrics across the entire video sequence and isolates
        the altered frames vs unaltered frames.
        """
        total_frames = len(orig_frames)
        altered_indices = [
            i for i in range(total_frames)
            if not np.array_equal(orig_frames[i], stego_frames[i])
        ]

        frame_metrics = []
        psnr_list = []
        mse_list = []
        ssim_list = []

        for i in range(total_frames):
            orig = orig_frames[i]
            stego = stego_frames[i]
            mse = cls.calculate_mse(orig, stego)
            psnr = cls.calculate_psnr(orig, stego)
            ssim_val = cls.calculate_ssim(orig, stego)

            is_altered = i in altered_indices
            is_selected = i in selected_indices

            frame_metrics.append({
                "frame": i,
                "selected": is_selected,
                "altered": is_altered,
                "mse": round(mse, 5),
                "psnr_db": psnr if psnr != float("inf") else "INF (Exact)",
                "ssim": ssim_val
            })

            # For average calculation of altered frames
            if is_altered:
                psnr_list.append(psnr)
                mse_list.append(mse)
            ssim_list.append(ssim_val)

        avg_psnr_altered = round(float(np.mean(psnr_list)), 2) if psnr_list else float("inf")
        avg_mse_altered = round(float(np.mean(mse_list)), 5) if mse_list else 0.0
        overall_ssim = round(float(np.mean(ssim_list)), 6)

        return {
            "total_frames": total_frames,
            "selected_frames_count": len(selected_indices),
            "altered_frames_count": len(altered_indices),
            "frame_alteration_rate_pct": round((len(altered_indices) / total_frames) * 100, 2),
            "unaltered_frames_pct": round(((total_frames - len(altered_indices)) / total_frames) * 100, 2),
            "avg_psnr_altered_frames_db": avg_psnr_altered,
            "avg_mse_altered_frames": avg_mse_altered,
            "overall_video_ssim": overall_ssim,
            "frame_details": frame_metrics,
        }
