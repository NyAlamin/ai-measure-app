import os
import logging
import tempfile
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from app.models import MeasurementResponse, ErrorResponse
from app.services.video_processor import VideoProcessor
from app.services.pose_detector import PoseDetector
from app.services.measurement_calculator import MeasurementCalculator

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
async def analyze_video(
    video: UploadFile = File(...),
    height: float = Form(...),
):
    """
    Analyze a body measurement video.
    Accepts the video as a file upload + height as form data.
    """
    temp_path = None

    try:
        # Save uploaded video to a temp file
        suffix = os.path.splitext(video.filename or "video.webm")[1] or ".webm"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await video.read()
            tmp.write(content)
            temp_path = tmp.name

        logger.info(f"Processing video: {temp_path}, height: {height}cm")

        # Step 1: Extract frames
        all_frames = video_processor.extract_frames(temp_path)

        # Step 2: Select best frames
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

        # Step 4: Calculate body height in pixels
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

        logger.info(f"Body height: {body_height_px:.1f}px, Real: {height}cm")

        # Step 5: Calculate measurements
        measurements = measurement_calculator.calculate(
            all_landmarks=all_landmarks,
            height_cm=height,
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

        logger.info("Measurements generated successfully")
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
    finally:
        # Always delete the temp file
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
            logger.info(f"Deleted temp file: {temp_path}")


@app.on_event("shutdown")
def shutdown():
    pose_detector.close()
    logger.info("AI service shut down")