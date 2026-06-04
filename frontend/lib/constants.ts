import type { Garment, FlowStep } from "./types";

export const HEIGHT_MIN_CM = 120;
export const HEIGHT_MAX_CM = 220;
export const MIN_RECORD_SECONDS = 10;
export const MAX_RECORD_SECONDS = 15;
export const MAX_UPLOAD_MB = 50;

export const GARMENTS: Garment[] = [
  { id: "kameez",  name: "Kameez",  subtitle: "Kameez, Kurti, Tunic" },
  { id: "shirt",   name: "Shirt",   subtitle: "Formal, Casual, Custom" },
  { id: "panjabi", name: "Panjabi", subtitle: "Traditional Panjabi" },
  { id: "salwar",  name: "Salwar",  subtitle: "Salwar, Churidar, Palazzo" },
  { id: "pant",    name: "Pant",    subtitle: "Formal, Casual, Custom" },
  { id: "blazer",  name: "Blazer",  subtitle: "Formal Blazer, Coat" },
];

export const INSTRUCTIONS = [
  { title: "Wear fitted clothing",     subtitle: "Avoid loose or baggy clothes" },
  { title: "Remove jackets",           subtitle: "For better accuracy" },
  { title: "Stand 1–1.5 meters away",  subtitle: "From the camera" },  { title: "Ensure full body visible",  subtitle: "From head to toe" },
  { title: "Good lighting",            subtitle: "Use a well-lit area" },
  { title: "Rotate slowly",            subtitle: "Once in a full circle" },
];

export const PROCESSING_STAGES = [
  "Extracting frames",
  "Detecting body landmarks",
  "Analyzing measurements",
  "Finalizing results",
];

export const STEP_ORDER: FlowStep[] = [
  "garment", "info", "instructions", "record",
  "uploading", "processing", "results", "review", "saved",
];

export const PROGRESS_STEPS: FlowStep[] = ["garment", "info", "instructions"];