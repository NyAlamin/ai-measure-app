"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_RECORD_SECONDS, MIN_RECORD_SECONDS } from "@/lib/constants";

type RecorderStatus =
  | "idle"
  | "requesting"
  | "previewing"
  | "countdown"
  | "recording"
  | "stopped"
  | "denied"
  | "unsupported";

type FacingMode = "user" | "environment";

interface UseCameraRecorder {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: RecorderStatus;
  elapsed: number;
  countdown: number;
  recordedBlob: Blob | null;
  error: string | null;
  canStop: boolean;
  facingMode: FacingMode;
  openCamera: () => Promise<void>;
  startRecording: () => void;
  stop: () => void;
  reset: () => void;
  switchCamera: () => Promise<void>;
}

export function useCameraRecorder(): UseCameraRecorder {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const pickMimeType = () => {
    const candidates = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ];
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
  };

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    clearTimer();
  }, [clearTimer]);

  // open camera with a given facing mode
  const openCameraWith = useCallback(
    async (mode: FacingMode) => {
      setError(null);
      setRecordedBlob(null);
      setElapsed(0);
      setCountdown(0);

      if (
        typeof window === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        setStatus("unsupported");
        setError("Camera recording isn't supported in this browser.");
        return;
      }
      if (typeof MediaRecorder === "undefined") {
        setStatus("unsupported");
        setError("MediaRecorder isn't supported in this browser.");
        return;
      }

      // stop any existing stream first
      stopStream();

      try {
        setStatus("requesting");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setStatus("previewing");
      } catch (err) {
        stopStream();
        const name = (err as DOMException)?.name;
        if (name === "NotAllowedError" || name === "SecurityError") {
          setStatus("denied");
          setError("Camera access was denied. Please allow it and try again.");
        } else if (name === "NotFoundError") {
          setStatus("denied");
          setError("No camera was found on this device.");
        } else {
          setStatus("unsupported");
          setError("Could not start the camera. Please try again.");
        }
      }
    },
    [stopStream],
  );

  const openCamera = useCallback(async () => {
    await openCameraWith(facingMode);
  }, [openCameraWith, facingMode]);

  // switch between front and back camera
  const switchCamera = useCallback(async () => {
    // only allow switching while previewing (not during recording)
    if (status === "recording" || status === "countdown") return;
    const newMode: FacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    await openCameraWith(newMode);
  }, [facingMode, status, openCameraWith]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    setCountdown(3);
    setStatus("countdown");

    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count <= 0) {
        clearCountdown();

        const mimeType = pickMimeType();
        const recorder = new MediaRecorder(
          streamRef.current!,
          mimeType ? { mimeType } : undefined,
        );
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, {
            type: mimeType || "video/webm",
          });
          setRecordedBlob(blob);
          setStatus("stopped");
          stopStream();
        };
        recorderRef.current = recorder;
        recorder.start();
        setStatus("recording");
        setElapsed(0);

        timerRef.current = setInterval(() => {
          setElapsed((prev) => {
            const next = prev + 1;
            if (next >= MAX_RECORD_SECONDS) {
              if (
                recorderRef.current &&
                recorderRef.current.state !== "inactive"
              ) {
                recorderRef.current.stop();
              }
              clearTimer();
            }
            return next;
          });
        }, 1000);
      }
    }, 1000);
  }, [clearCountdown, clearTimer, stopStream]);

  const reset = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    clearTimer();
    clearCountdown();
    stopStream();
    chunksRef.current = [];
    setRecordedBlob(null);
    setElapsed(0);
    setCountdown(0);
    setError(null);
    setStatus("idle");
  }, [clearTimer, clearCountdown, stopStream]);

  useEffect(() => {
    return () => {
      clearTimer();
      clearCountdown();
      stopStream();
    };
  }, [clearTimer, clearCountdown, stopStream]);

  return {
    videoRef,
    status,
    elapsed,
    countdown,
    recordedBlob,
    error,
    canStop: elapsed >= MIN_RECORD_SECONDS,
    facingMode,
    openCamera,
    startRecording,
    stop,
    reset,
    switchCamera,
  };
}