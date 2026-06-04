from pydantic import BaseModel, Field
from typing import Optional


class AnalyzeRequest(BaseModel):
    videoPath: str
    height: float = Field(ge=120, le=220, description="Height in cm")


class MeasurementResponse(BaseModel):
    shoulder: float
    bust: float
    waist: float
    hip: float
    neck: float
    sleeve: float
    armLength: float
    bicep: float
    wrist: float
    kameezLength: float
    confidence: float
    bodyHeight: Optional[float] = None


class ErrorResponse(BaseModel):
    code: str
    message: str