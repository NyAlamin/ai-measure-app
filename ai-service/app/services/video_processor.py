import cv2
import numpy as np
from typing import List
import logging

logger = logging.getLogger(__name__)


class VideoProcessor:
    """Extracts frames from a video at regular intervals."""

    def __init__(self, frame_interval: float = 0.5):
        self.frame_interval = frame_interval

    def extract_frames(self, video_path: str) -> List[np.ndarray]:
        """
        Open the video and extract frames. Robust against bad metadata
        (common with phone browser recordings) by reading all frames.
        """
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        if not fps or fps <= 0 or fps > 120:
            fps = 30  # fallback for bad metadata

        # Read ALL frames first (don't trust frame count metadata)
        all_raw_frames = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            all_raw_frames.append(frame)
        cap.release()

        total = len(all_raw_frames)
        logger.info(f"Read {total} raw frames at ~{fps:.1f} FPS")

        if total < 5:
            raise ValueError(
                "The recording is too short or empty. Please record a full 10-15s turn."
            )

        # Sample frames at the desired interval
        frame_step = max(1, int(fps * self.frame_interval))
        frames = all_raw_frames[::frame_step]

        if len(frames) < 3:
            # fallback: just take evenly spaced frames
            indices = np.linspace(0, total - 1, num=min(10, total), dtype=int)
            frames = [all_raw_frames[i] for i in indices]

        logger.info(f"Extracted {len(frames)} frames for analysis")
        return frames

    def get_best_frames(self, frames: List[np.ndarray], count: int = 10) -> List[np.ndarray]:
        """Select evenly spaced frames for 360° coverage."""
        if len(frames) <= count:
            return frames

        indices = np.linspace(0, len(frames) - 1, num=count, dtype=int)
        return [frames[i] for i in indices]