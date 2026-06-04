import cv2
import numpy as np
from typing import List
import logging

logger = logging.getLogger(__name__)


class VideoProcessor:
    """Extracts frames from a video at regular intervals."""

    def __init__(self, frame_interval: float = 0.5):
        """
        Args:
            frame_interval: Extract one frame every N seconds
        """
        self.frame_interval = frame_interval

    def extract_frames(self, video_path: str) -> List[np.ndarray]:
        """
        Open the video and extract frames at the specified interval.
        Returns a list of BGR frames (numpy arrays).
        """
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise ValueError(f"Cannot open video: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0

        logger.info(
            f"Video: {total_frames} frames, {fps:.1f} FPS, {duration:.1f}s duration"
        )

        if duration < 3:
            cap.release()
            raise ValueError("Video is too short. Please record at least 10 seconds.")

        # Calculate which frame numbers to extract
        frame_step = int(fps * self.frame_interval)
        if frame_step < 1:
            frame_step = 1

        frames = []
        frame_number = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_number % frame_step == 0:
                frames.append(frame)

            frame_number += 1

        cap.release()

        if len(frames) < 3:
            raise ValueError("Could not extract enough frames from the video.")

        logger.info(f"Extracted {len(frames)} frames")
        return frames

    def get_best_frames(self, frames: List[np.ndarray], count: int = 8) -> List[np.ndarray]:
        """
        Select evenly spaced frames from the extracted set.
        Gives us front, sides, back views from the 360° rotation.
        """
        if len(frames) <= count:
            return frames

        step = len(frames) / count
        indices = [int(i * step) for i in range(count)]
        return [frames[i] for i in indices]