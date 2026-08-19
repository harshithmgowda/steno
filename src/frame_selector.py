"""
Adaptive Frame Selection (AFS) Module
Identifies optimal video frames for data embedding based on texture complexity,
spatial variance, and motion dynamics.
"""

from typing import List, Tuple, Dict
import numpy as np
import cv2


class AdaptiveFrameSelector:
    """
    Adaptive Frame Selector (AFS) evaluates individual video frames to select
    the most suitable candidates for Least Significant Bit (LSB) steganography.
    
    Frames with higher texture variance, edge density, and dynamic motion provide
    better Human Visual System (HVS) masking, making steganographic artifacts
    virtually imperceptible and resistant to statistical steganalysis.
    """

    def __init__(self, default_strategy: str = "hybrid"):
        """
        Initialize the selector.
        :param default_strategy: 'texture_variance', 'motion_energy', or 'hybrid'
        """
        self.default_strategy = default_strategy

    @staticmethod
    def calculate_texture_variance(frame: np.ndarray) -> float:
        """
        Calculates the spatial texture complexity using Laplacian variance and standard deviation.
        Higher variance indicates rich textures, edges, and details where LSB noise is masked.
        """
        if len(frame.shape) == 3:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        else:
            gray = frame

        # Laplacian edge variance measures detail sharpness and texture density
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        lap_var = float(laplacian.var())
        
        # Standard deviation of intensity
        std_dev = float(np.std(gray))
        
        # Combined texture score
        texture_score = lap_var * 0.7 + std_dev * 0.3
        return round(texture_score, 4)

    @staticmethod
    def calculate_entropy(frame: np.ndarray) -> float:
        """
        Computes Shannon entropy of the frame to estimate information density.
        """
        if len(frame.shape) == 3:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        else:
            gray = frame

        hist, _ = np.histogram(gray.flatten(), bins=256, range=(0, 256), density=True)
        hist = hist[hist > 0]
        entropy = -np.sum(hist * np.log2(hist))
        return round(float(entropy), 4)

    @staticmethod
    def calculate_motion_difference(frame_curr: np.ndarray, frame_prev: np.ndarray) -> float:
        """
        Measures inter-frame temporal variation / motion energy between consecutive frames.
        """
        if frame_prev is None:
            return 0.0

        if len(frame_curr.shape) == 3:
            g_curr = cv2.cvtColor(frame_curr, cv2.COLOR_BGR2GRAY)
            g_prev = cv2.cvtColor(frame_prev, cv2.COLOR_BGR2GRAY)
        else:
            g_curr, g_prev = frame_curr, frame_prev

        diff = cv2.absdiff(g_curr, g_prev)
        motion_score = float(np.mean(diff))
        return round(motion_score, 4)

    def analyze_video_frames(self, frames: List[np.ndarray]) -> List[Dict[str, float]]:
        """
        Computes analytical metrics for all frames in the video sequence.
        """
        analysis = []
        prev_frame = None

        for idx, frame in enumerate(frames):
            texture = self.calculate_texture_variance(frame)
            entropy = self.calculate_entropy(frame)
            motion = self.calculate_motion_difference(frame, prev_frame)
            
            # Composite suitability score
            suitability = (texture * 0.5) + (entropy * 20.0) + (motion * 1.5)

            analysis.append({
                "frame_index": idx,
                "texture_variance": texture,
                "entropy": entropy,
                "motion_score": motion,
                "suitability_score": round(suitability, 4),
            })
            prev_frame = frame

        return analysis

    def select_frames(
        self,
        frames: List[np.ndarray],
        selection_ratio: float = 0.4,
        strategy: str = None,
        min_frames: int = 1
    ) -> Tuple[List[int], List[Dict[str, float]]]:
        """
        Selects top candidate frame indices based on the designated AFS strategy.

        :param frames: List of video frames (numpy ndarrays)
        :param selection_ratio: Proportion of total frames to select (e.g., 0.4 = top 40%)
        :param strategy: 'texture_variance', 'motion_energy', or 'hybrid'
        :param min_frames: Minimum number of frames required
        :return: (selected_indices, full_analysis_records)
        """
        if not frames:
            return [], []

        strat = strategy or self.default_strategy
        analysis = self.analyze_video_frames(frames)
        total_frames = len(frames)
        target_count = max(min_frames, int(np.ceil(total_frames * selection_ratio)))
        target_count = min(target_count, total_frames)

        # Sort based on strategy metric
        if strat == "texture_variance":
            sorted_by_score = sorted(analysis, key=lambda x: x["texture_variance"], reverse=True)
        elif strat == "motion_energy":
            sorted_by_score = sorted(analysis, key=lambda x: x["motion_score"], reverse=True)
        else:  # hybrid
            sorted_by_score = sorted(analysis, key=lambda x: x["suitability_score"], reverse=True)

        selected_candidates = sorted_by_score[:target_count]
        # Keep selected indices in chronological order for sequential streaming
        selected_indices = sorted([item["frame_index"] for item in selected_candidates])

        return selected_indices, analysis
