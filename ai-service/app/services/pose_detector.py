import mediapipe as mp
import numpy as np
import cv2
from typing import List, Optional, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

# MediaPipe Pose landmark indices we care about
LANDMARKS = {
    "nose": 0,
    "left_shoulder": 11,
    "right_shoulder": 12,
    "left_elbow": 13,
    "right_elbow": 14,
    "left_wrist": 15,
    "right_wrist": 16,
    "left_hip": 23,
    "right_hip": 24,
    "left_knee": 25,
    "right_knee": 26,
    "left_ankle": 27,
    "right_ankle": 28,
    "left_ear": 7,
    "right_ear": 8,
}


class PoseDetector:
    """Detects body pose landmarks in frames using MediaPipe."""

    def __init__(self, min_detection_confidence: float = 0.5):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=0.5,
        )

    def detect_landmarks(
        self, frame: np.ndarray
    ) -> Optional[Dict[str, Tuple[float, float]]]:
        """
        Detect pose landmarks in a single frame.
        Returns dict of landmark_name -> (x_pixel, y_pixel) or None if no pose found.
        """
        h, w = frame.shape[:2]
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb)

        if not results.pose_landmarks:
            return None

        landmarks = {}
        for name, idx in LANDMARKS.items():
            lm = results.pose_landmarks.landmark[idx]
            if lm.visibility < 0.3:
                continue
            landmarks[name] = (lm.x * w, lm.y * h)

        # Need at least shoulders, hips, and ankles for measurements
        required = [
            "left_shoulder", "right_shoulder",
            "left_hip", "right_hip",
        ]
        if not all(r in landmarks for r in required):
            return None

        return landmarks

    def detect_all_frames(
        self, frames: List[np.ndarray]
    ) -> List[Dict[str, Tuple[float, float]]]:
        """
        Run pose detection on all frames.
        Returns only frames where landmarks were successfully detected.
        """
        all_landmarks = []
        for i, frame in enumerate(frames):
            lm = self.detect_landmarks(frame)
            if lm:
                all_landmarks.append(lm)
            else:
                logger.debug(f"No pose detected in frame {i}")

        logger.info(
            f"Detected pose in {len(all_landmarks)}/{len(frames)} frames"
        )
        return all_landmarks

    def get_body_height_pixels(
        self, landmarks: Dict[str, Tuple[float, float]]
    ) -> Optional[float]:
        """
        Estimate full body height in pixels from top of head to ankles.
        """
        # Use nose (or ear) as top reference
        top = None
        for key in ["nose", "left_ear", "right_ear"]:
            if key in landmarks:
                top = landmarks[key]
                break

        # Use ankle as bottom reference
        bottom = None
        for key in ["left_ankle", "right_ankle"]:
            if key in landmarks:
                if bottom is None or landmarks[key][1] > bottom[1]:
                    bottom = landmarks[key]

        if top is None or bottom is None:
            return None

        # Add ~10% above nose for top of head
        head_extra = (bottom[1] - top[1]) * 0.10
        return (bottom[1] - top[1]) + head_extra

    def close(self):
        self.pose.close()