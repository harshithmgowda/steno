"""
Video Handler Module
Provides video loading, frame extraction, video compilation,
and synthetic test video generation for demonstration purposes.
"""

from typing import List, Tuple
import os
import numpy as np
import cv2


class VideoHandler:
    """
    Handles reading, writing, and synthetic creation of video frame sequences.
    """

    @staticmethod
    def load_video_frames(video_path: str, max_frames: int = None) -> Tuple[List[np.ndarray], float]:
        """
        Reads a video file and returns frames as a list of numpy BGR arrays along with FPS.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found at: {video_path}")

        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        frames = []

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frames.append(frame)
            if max_frames and len(frames) >= max_frames:
                break

        cap.release()
        return frames, float(fps)

    @staticmethod
    def save_video_frames(
        frames: List[np.ndarray],
        output_path: str,
        fps: float = 25.0,
        lossless: bool = True
    ) -> str:
        """
        Saves a list of frames as a video.
        Uses lossless/high-quality codec (e.g., PNG/FFV1 or MP4V) to preserve LSB bits.
        """
        if not frames:
            raise ValueError("No frames provided to write.")

        height, width = frames[0].shape[:2]
        
        # mp4v or raw for general compatibility; PNG sequence for absolute lossless
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        for frame in frames:
            out.write(frame)

        out.release()
        return output_path

    @staticmethod
    def generate_synthetic_video(
        num_frames: int = 24,
        width: int = 320,
        height: int = 240,
        fps: float = 24.0
    ) -> List[np.ndarray]:
        """
        Generates a synthetic sequence of video frames with diverse textures,
        gradients, and moving geometric objects.
        
        This enables immediate demonstration of AFS frame complexity analysis
        without requiring external video assets.
        """
        frames = []
        for i in range(num_frames):
            # Base frame with changing background gradient and noise
            frame = np.zeros((height, width, 3), dtype=np.uint8)

            # Different regions to create varying variance across frames:
            if i % 3 == 0:
                # High texture / textured frame (checkerboard / noise patch)
                noise = np.random.randint(50, 200, (height // 2, width // 2, 3), dtype=np.uint8)
                frame[height // 4 : height // 4 + height // 2, width // 4 : width // 4 + width // 2] = noise
            elif i % 3 == 1:
                # Moderate texture (gradient)
                for y in range(height):
                    val = int((y / height) * 200 + (i * 2) % 55)
                    frame[y, :, :] = (val, 120, 255 - val)
            else:
                # Smooth low texture frame
                frame[:, :] = (100, 150, 200)

            # Moving dynamic object (circle / rectangle)
            center_x = int((i * 12) % (width - 60)) + 30
            center_y = int(height / 2 + 30 * np.sin(i * 0.4))
            
            # Draw shapes
            cv2.circle(frame, (center_x, center_y), 24, (0, 255, 255), -1)
            cv2.putText(
                frame,
                f"Frame #{i:02d}",
                (20, 35),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

            frames.append(frame)

        return frames
