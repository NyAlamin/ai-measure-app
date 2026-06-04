import type {
  BasicInfo,
  GarmentId,
  Measurements,
  MeasurementProfile,
} from "./types";
import { MAX_UPLOAD_MB } from "./constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();
export const IS_MOCK = !API_URL;

// Log which mode we're in on startup
if (typeof window !== "undefined") {
  console.log(
    IS_MOCK
      ? "⚠️ Running in MOCK mode (no NEXT_PUBLIC_API_URL set)"
      : `✅ Connected to backend: ${API_URL}`
  );
}

export interface ScanInput {
  video: Blob;
  garment: GarmentId;
  info: BasicInfo;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function validateVideo(video: Blob) {
  const sizeMB = video.size / (1024 * 1024);
  if (sizeMB > MAX_UPLOAD_MB) {
    throw new ApiError(
      "upload_failed",
      `Video is too large (${sizeMB.toFixed(1)} MB). Max is ${MAX_UPLOAD_MB} MB.`,
    );
  }
  if (video.size < 50_000) {
    throw new ApiError(
      "video_too_short",
      "The recording looks too short. Please record a full 10–15s turn.",
    );
  }
}

export async function scanMeasurements({
  video,
  garment,
  info,
}: ScanInput): Promise<Measurements> {
  validateVideo(video);

  if (IS_MOCK) {
    await delay(2400);
    return mockMeasurements(info);
  }

  const form = new FormData();
  form.append("video", video, "scan.webm");
  form.append("garment", garment);
  form.append("height", String(info.height));
  if (info.gender) form.append("gender", info.gender);
  if (info.weight != null) form.append("weight", String(info.weight));

  const res = await fetch(`${API_URL}/measurements/scan`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await safeJson(res);
    console.error("Scan API error:", res.status, body);
    throw new ApiError(
      body?.code ?? "unknown",
      body?.message ?? `Scan failed (${res.status}).`,
    );
  }
  return (await res.json()) as Measurements;
}

export async function saveMeasurements(payload: {
  garment: GarmentId;
  info: BasicInfo;
  measurements: Measurements;
}): Promise<MeasurementProfile> {
  if (IS_MOCK) {
    await delay(700);
    return {
      id: crypto.randomUUID(),
      name: payload.info.name,
      garment: payload.garment,
      height: payload.info.height,
      gender: payload.info.gender,
      weight: payload.info.weight,
      createdAt: new Date().toISOString(),
      ...payload.measurements,
    };
  }

  console.log("Saving to:", `${API_URL}/measurements`);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(`${API_URL}/measurements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseBody = await res.text();
    console.log("Response status:", res.status);
    console.log("Response body:", responseBody);

    if (!res.ok) {
      let parsed;
      try {
        parsed = JSON.parse(responseBody);
      } catch {
        parsed = null;
      }
      throw new ApiError(
        parsed?.code ?? "unknown",
        parsed?.message ?? `Save failed (${res.status}): ${responseBody}`,
      );
    }

    return JSON.parse(responseBody) as MeasurementProfile;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("Network error saving measurements:", err);
    throw new ApiError(
      "unknown",
      err instanceof TypeError
        ? "Cannot reach the server. Is the backend running?"
        : `Save failed: ${err}`,
    );
  }
}

export type ConfidenceTier = "low" | "fair" | "good" | "high";

export function confidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= 0.9) return "high";
  if (confidence >= 0.8) return "good";
  if (confidence >= 0.65) return "fair";
  return "low";
}

export function confidenceLabel(tier: ConfidenceTier): string {
  return { low: "Low", fair: "Fair", good: "Good", high: "Excellent" }[tier];
}

// ---- helpers ----

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function safeJson(
  res: Response,
): Promise<{ code?: string; message?: string } | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function mockMeasurements(info: BasicInfo): Measurements {
  const h = info.height;
  const scale = h / 165;
  const jitter = (base: number, spread: number) =>
    Math.round((base * scale + (Math.random() - 0.5) * spread) * 10) / 10;

  return {
    neck: jitter(13, 0.6),
    shoulder: jitter(14.5, 0.6),
    bust: jitter(38, 1.2),
    bicep: jitter(12, 0.6),
    sleeve: jitter(22, 0.8),
    armLength: jitter(24, 0.8),
    wrist: jitter(6, 0.3),
    waist: jitter(34, 1.2),
    hip: jitter(40, 1.2),
    kameezLength: jitter(42, 1.0),
    confidence: Math.round((0.82 + Math.random() * 0.1) * 100) / 100,
    bodyHeight: h,
  };
}