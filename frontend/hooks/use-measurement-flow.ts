"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  BasicInfo,
  FlowStep,
  GarmentId,
  Measurements,
  MeasurementProfile,
} from "@/lib/types";
import { PROGRESS_STEPS } from "@/lib/constants";
import {
  saveMeasurements,
  scanMeasurements,
  ApiError,
} from "@/lib/measurement-api";

interface FlowState {
  step: FlowStep;
  garment: GarmentId | null;
  info: BasicInfo | null;
  video: Blob | null;
  measurements: Measurements | null;
  saved: MeasurementProfile | null;
  error: string | null;
}

const INITIAL: FlowState = {
  step: "garment",
  garment: null,
  info: null,
  video: null,
  measurements: null,
  saved: null,
  error: null,
};

export function useMeasurementFlow() {
  const [state, setState] = useState<FlowState>(INITIAL);

  const goTo = useCallback((step: FlowStep) => {
    setState((s) => ({ ...s, step, error: null }));
  }, []);

  const setGarment = useCallback((garment: GarmentId) => {
    setState((s) => ({ ...s, garment }));
  }, []);

  const setInfo = useCallback((info: BasicInfo) => {
    setState((s) => ({ ...s, info }));
  }, []);

  const submitVideo = useCallback(
    async (video: Blob) => {
      setState((s) => ({ ...s, video, step: "uploading", error: null }));
      await new Promise((r) => setTimeout(r, 1400));
      setState((s) => ({ ...s, step: "processing" }));
      try {
        const measurements = await scanMeasurements({
          video,
          garment: state.garment!,
          info: state.info!,
        });
        setState((s) => ({ ...s, measurements, step: "results" }));
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while analyzing your video.";
        setState((s) => ({ ...s, step: "record", error: message }));
      }
    },
    [state.garment, state.info],
  );

  const updateMeasurements = useCallback((next: Measurements) => {
    setState((s) => ({ ...s, measurements: next }));
  }, []);

  const persist = useCallback(async () => {
    if (!state.measurements || !state.garment || !state.info) return;
    try {
      const saved = await saveMeasurements({
        garment: state.garment,
        info: state.info,
        measurements: state.measurements,
      });
      setState((s) => ({ ...s, saved, step: "saved" }));
    } catch (err) {
  console.error("Save failed:", err);
  const message = err instanceof Error ? err.message : "Could not save measurements.";
  setState((s) => ({ ...s, error: message }));
}
  }, [state.measurements, state.garment, state.info]);

  const restart = useCallback(() => setState(INITIAL), []);

  const progress = useMemo(() => {
    const idx = PROGRESS_STEPS.indexOf(state.step);
    if (idx === -1) return null;
    return ((idx + 1) / PROGRESS_STEPS.length) * 100;
  }, [state.step]);

  return {
    ...state,
    progress,
    goTo,
    setGarment,
    setInfo,
    submitVideo,
    updateMeasurements,
    persist,
    restart,
    setError: (error: string | null) =>
      setState((s) => ({ ...s, error })),
  };
}

export type MeasurementFlow = ReturnType<typeof useMeasurementFlow>;