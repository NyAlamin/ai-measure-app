import numpy as np
from typing import List, Dict, Tuple, Optional
import logging
import math

logger = logging.getLogger(__name__)


def _dist(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    """Euclidean distance between two points."""
    return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)


def _midpoint(
    p1: Tuple[float, float], p2: Tuple[float, float]
) -> Tuple[float, float]:
    return ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)


class MeasurementCalculator:
    """
    Converts pixel-based landmark distances into real-world measurements
    using the known height as a scaling reference.
    """

    # Anthropometric multipliers — calibrated against standard body proportions.
    # These account for the fact that we're measuring a 2D projection of a 3D body.
    MULTIPLIERS = {
        "shoulder": 1.05,
        "bust": 2.55,
        "waist": 2.40,
        "hip": 2.60,
        "neck": 1.25,
        "sleeve": 1.02,
        "arm_length": 1.02,
        "bicep": 1.50,
        "wrist": 1.30,
    }

    def calculate(
        self,
        all_landmarks: List[Dict[str, Tuple[float, float]]],
        height_cm: float,
        body_height_pixels: float,
    ) -> Optional[Dict]:
        """
        Calculate body measurements from multiple frames of landmarks.

        Args:
            all_landmarks: List of landmark dicts from different frames
            height_cm: User's actual height in cm
            body_height_pixels: Detected body height in pixels

        Returns:
            Dict with all measurements in inches, or None if insufficient data
        """
        if not all_landmarks or body_height_pixels <= 0:
            return None

        cm_per_pixel = height_cm / body_height_pixels
        inches_per_cm = 1 / 2.54

        # Collect raw pixel measurements from all frames, then average
        raw = {
            "shoulder": [],
            "bust_half": [],
            "waist_half": [],
            "hip_half": [],
            "neck": [],
            "sleeve": [],
            "arm_length": [],
            "bicep": [],
            "wrist": [],
            "torso_length": [],
        }

        for lm in all_landmarks:
            # Shoulder width
            if "left_shoulder" in lm and "right_shoulder" in lm:
                raw["shoulder"].append(
                    _dist(lm["left_shoulder"], lm["right_shoulder"])
                )

            # Bust/chest — approximate as shoulder-to-hip midpoint width
            if all(
                k in lm
                for k in [
                    "left_shoulder", "right_shoulder",
                    "left_hip", "right_hip",
                ]
            ):
                ls, rs = lm["left_shoulder"], lm["right_shoulder"]
                lh, rh = lm["left_hip"], lm["right_hip"]
                # Bust line at 1/3 from shoulder to hip
                bust_y_ratio = 1 / 3
                bust_left = (
                    ls[0] + (lh[0] - ls[0]) * bust_y_ratio,
                    ls[1] + (lh[1] - ls[1]) * bust_y_ratio,
                )
                bust_right = (
                    rs[0] + (rh[0] - rs[0]) * bust_y_ratio,
                    rs[1] + (rh[1] - rs[1]) * bust_y_ratio,
                )
                raw["bust_half"].append(_dist(bust_left, bust_right))

                # Waist — at midpoint between shoulders and hips
                waist_left = _midpoint(ls, lh)
                waist_right = _midpoint(rs, rh)
                raw["waist_half"].append(_dist(waist_left, waist_right))

            # Hip width
            if "left_hip" in lm and "right_hip" in lm:
                raw["hip_half"].append(_dist(lm["left_hip"], lm["right_hip"]))

            # Neck — distance between ears, or fraction of shoulder
            if "left_ear" in lm and "right_ear" in lm:
                raw["neck"].append(_dist(lm["left_ear"], lm["right_ear"]))
            elif "left_shoulder" in lm and "right_shoulder" in lm:
                shoulder_w = _dist(lm["left_shoulder"], lm["right_shoulder"])
                raw["neck"].append(shoulder_w * 0.38)

            # Sleeve length: shoulder → elbow → wrist
            for side in ["left", "right"]:
                s = f"{side}_shoulder"
                e = f"{side}_elbow"
                w = f"{side}_wrist"
                if all(k in lm for k in [s, e, w]):
                    sleeve = _dist(lm[s], lm[e]) + _dist(lm[e], lm[w])
                    raw["sleeve"].append(sleeve)
                    raw["arm_length"].append(sleeve)

            # Bicep — upper arm thickness approximation
            for side in ["left", "right"]:
                s = f"{side}_shoulder"
                e = f"{side}_elbow"
                if s in lm and e in lm:
                    upper_arm = _dist(lm[s], lm[e])
                    raw["bicep"].append(upper_arm * 0.35)

            # Wrist approximation
            for side in ["left", "right"]:
                e = f"{side}_elbow"
                w = f"{side}_wrist"
                if e in lm and w in lm:
                    forearm = _dist(lm[e], lm[w])
                    raw["wrist"].append(forearm * 0.22)

            # Torso length (shoulder to hip for kameez length)
            if "left_shoulder" in lm and "left_hip" in lm:
                mid_shoulder = _midpoint(
                    lm.get("left_shoulder", (0, 0)),
                    lm.get("right_shoulder", lm["left_shoulder"]),
                )
                mid_hip = _midpoint(
                    lm.get("left_hip", (0, 0)),
                    lm.get("right_hip", lm["left_hip"]),
                )
                raw["torso_length"].append(_dist(mid_shoulder, mid_hip))

        # Calculate averages and convert
        def avg(values: list) -> float:
            return sum(values) / len(values) if values else 0

        def to_inches(pixel_value: float, multiplier: float = 1.0) -> float:
            return round(pixel_value * cm_per_pixel * inches_per_cm * multiplier, 1)

        shoulder_px = avg(raw["shoulder"])
        bust_half_px = avg(raw["bust_half"])
        waist_half_px = avg(raw["waist_half"])
        hip_half_px = avg(raw["hip_half"])
        neck_px = avg(raw["neck"])
        sleeve_px = avg(raw["sleeve"])
        arm_length_px = avg(raw["arm_length"])
        bicep_px = avg(raw["bicep"])
        wrist_px = avg(raw["wrist"])
        torso_px = avg(raw["torso_length"])

        if shoulder_px == 0:
            return None

        # Calculate confidence based on how many frames had data
        total_possible = len(all_landmarks) * 8  # 8 measurement types
        total_detected = sum(len(v) for v in raw.values())
        confidence = min(round(total_detected / max(total_possible, 1), 2), 0.98)
        confidence = max(confidence, 0.55)

        m = self.MULTIPLIERS

        # Kameez length = torso + some extension below hip (roughly 1.6x torso)
        kameez_px = torso_px * 1.6 if torso_px > 0 else shoulder_px * 3.0

        measurements = {
            "shoulder": to_inches(shoulder_px, m["shoulder"]),
            "bust": to_inches(bust_half_px, m["bust"]),
            "waist": to_inches(waist_half_px, m["waist"]),
            "hip": to_inches(hip_half_px, m["hip"]),
            "neck": to_inches(neck_px, m["neck"]),
            "sleeve": to_inches(sleeve_px, m["sleeve"]),
            "armLength": to_inches(arm_length_px, m["arm_length"]),
            "bicep": to_inches(bicep_px, m["bicep"]),
            "wrist": to_inches(wrist_px, m["wrist"]),
            "kameezLength": to_inches(kameez_px, 1.0),
            "confidence": confidence,
            "bodyHeight": height_cm,
        }

        logger.info(f"Measurements calculated with confidence: {confidence}")
        return measurements