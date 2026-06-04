import os
import logging
from fastapi import FastAPI, HTTPException
from app.models import AnalyzeRequest, MeasurementResponse, ErrorResponse
from app.services.video_processor import VideoProcessor
from app.services.pose_detector import PoseDetector
from app.services.measurement_calculator import MeasurementCalculator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Measurement Service",
    description="Analyzes body measurement videos using MediaPipe",
    version="1.0.0",
)

# Initialize services
video_processor = VideoProcessor(frame_interval=0.5)
pose_detector = PoseDetector(min_detection_confidence=0.5)
measurement_calculator = MeasurementCalculator()


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-measure-service"}


@app.post(
    "/analyze-video",
    response_model=MeasurementResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
)
def analyze_video(request: AnalyzeRequest):
    """
    Analyze a body measurement video.

    Pipeline:
    1. Extract frames from video (every 0.5s)
    2. Select best frames (evenly spaced for 360° coverage)
    3. Detect pose landmarks in each frame
    4. Calculate body height in pixels
    5. Convert pixel measurements to real measurements using known height
    6. Return measurements in inches
    """
    video_path = request.videoPath
    height_cm = request.height

    # Validate file exists
    if not os.path.exists(video_path):
        raise HTTPException(
            status_code=400,
            detail={"code": "upload_failed", "message": "Video file not found."},
        )

    try:
        # Step 1: Extract frames
        logger.info(f"Processing video: {video_path}")
        all_frames = video_processor.extract_frames(video_path)

        # Step 2: Select best frames for analysis
        best_frames = video_processor.get_best_frames(all_frames, count=10)
        logger.info(f"Selected {len(best_frames)} frames for analysis")

        # Step 3: Detect pose landmarks
        all_landmarks = pose_detector.detect_all_frames(best_frames)

        if len(all_landmarks) < 2:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "no_landmarks",
                    "message": "Could not detect your body clearly. Please ensure full body is visible with good lighting.",
                },
            )

        # Step 4: Calculate body height in pixels (use the first good detection)
        body_height_px = None
        for lm in all_landmarks:
            bh = pose_detector.get_body_height_pixels(lm)
            if bh and bh > 0:
                body_height_px = bh
                break

        if not body_height_px:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "body_not_visible",
                    "message": "Could not detect full body height. Please make sure you are fully visible from head to toe.",
                },
            )

        logger.info(f"Body height: {body_height_px:.1f}px, Real: {height_cm}cm")

        # Step 5: Calculate measurements
        measurements = measurement_calculator.calculate(
            all_landmarks=all_landmarks,
            height_cm=height_cm,
            body_height_pixels=body_height_px,
        )

        if not measurements:
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "no_landmarks",
                    "message": "Could not calculate measurements. Please try again with better lighting and positioning.",
                },
            )

        logger.info(f"Measurements generated successfully")
        return MeasurementResponse(**measurements)

    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(
            status_code=400,
            detail={"code": "video_too_short", "message": str(e)},
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "code": "unknown",
                "message": "An error occurred while analyzing the video.",
            },
        )


@app.on_event("shutdown")
def shutdown():
    pose_detector.close()
    logger.info("AI service shut down")