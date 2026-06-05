export type GarmentId =
  | "kameez"
  | "shirt"
  | "panjabi"
  | "salwar"
  | "pant"
  | "blazer";

export interface Garment {
  id: GarmentId;
  name: string;
  subtitle: string;
}

export type Gender = "female" | "male" | "other";

  export interface BasicInfo {
  name: string;
  height: number;
  gender?: Gender;
  weight?: number;
  waist?: number;
}

/** All body values in INCHES. Returned by the AI service. */
export interface Measurements {
  shoulder: number;
  bust: number;
  waist: number;
  hip: number;
  neck: number;
  sleeve: number;
  armLength: number;
  bicep: number;
  wrist: number;
  kameezLength: number;
  confidence: number;   // 0–1
  bodyHeight?: number;  // echoes height in cm
}

export interface MeasurementProfile extends Measurements {
  id: string;
  name: string;
  garment: GarmentId;
  height: number;
  gender?: Gender;
  weight?: number;
  createdAt: string;
}

export type MeasurementKey = keyof Pick<
  Measurements,
  | "shoulder" | "bust" | "waist" | "hip" | "neck"
  | "sleeve" | "armLength" | "bicep" | "wrist" | "kameezLength"
>;

export type FlowStep =
  | "garment"
  | "info"
  | "instructions"
  | "record"
  | "uploading"
  | "processing"
  | "results"
  | "review"
  | "saved";

export interface ScanError {
  code:
    | "height_missing"
    | "camera_denied"
    | "video_too_short"
    | "no_landmarks"
    | "body_not_visible"
    | "multiple_people"
    | "poor_lighting"
    | "upload_failed"
    | "unknown";
  message: string;
}