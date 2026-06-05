"use client";

import { useEffect } from "react";
import { X, RotateCcw, Camera, AlertCircle, Circle, SwitchCamera } from "lucide-react";import { StepLayout, StatusBar } from "./flow-shell";
import { SilhouetteOverlay } from "./silhouette-overlay";
import { Button } from "@/components/ui/button";
import { useCameraRecorder } from "@/hooks/use-camera-recorder";
import { formatSeconds, cn } from "@/lib/utils";
import { MIN_RECORD_SECONDS } from "@/lib/constants";
import type { MeasurementFlow } from "@/hooks/use-measurement-flow";

export function StepRecord({ flow }: { flow: MeasurementFlow }) {
  const cam = useCameraRecorder();

  // open camera preview when entering this screen (no recording yet)
  useEffect(() => {
    cam.openCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when a clip is captured, push it into the flow
  useEffect(() => {
    if (cam.status === "stopped" && cam.recordedBlob) {
      flow.submitVideo(cam.recordedBlob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cam.status, cam.recordedBlob]);

  const denied = cam.status === "denied" || cam.status === "unsupported";

  // camera denied / not found fallback
  if (denied) {
    return (
      <StepLayout title="Recording" onBack={() => flow.goTo("instructions")}>
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <div className="grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive">
            <Camera className="size-7" />
          </div>
          <div>
            <p className="font-bold">Camera unavailable</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
              {cam.error}
            </p>
          </div>
          <Button onClick={() => cam.openCamera()}>Try again</Button>
        </div>
      </StepLayout>
    );
  }

  return (
    <StepLayout bare>
      <div className="relative flex h-full flex-col bg-neutral-900 text-white">
        <StatusBar dark />

        {/* header */}
    <header className="flex items-center justify-between px-5 py-3">
          <button
    onClick={() => {
      cam.reset();
      flow.goTo("instructions");
    }}
    aria-label="Close"
    className="grid size-9 place-items-center rounded-full bg-white/10"
  >
    <X className="size-5" />
  </button>
  <span className="text-sm font-semibold">
    {cam.status === "recording" ? "Recording" : "Camera Preview"}
  </span>
  {cam.status === "previewing" ? (
    <button
      onClick={cam.switchCamera}
      aria-label="Switch camera"
      className="grid size-9 place-items-center rounded-full bg-white/10"
    >
      <SwitchCamera className="size-5" />
    </button>
  ) : (
    <span className="size-9" />
  )}
</header>

        {/* live camera preview */}
        <div className="relative flex-1 overflow-hidden">
          <video
              ref={cam.videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{
                transform: cam.facingMode === "user" ? "scaleX(-1)" : "none",
             }}
            />
          <SilhouetteOverlay />

          {/* instruction pill */}
          <div className="absolute left-1/2 top-5 w-[80%] -translate-x-1/2 rounded-2xl bg-black/55 px-4 py-3 text-center backdrop-blur">
            <p className="text-sm font-semibold">
              {cam.status === "recording"
                ? "Rotate slowly in a full circle"
                : "Position yourself in the guide"}
            </p>
            <p className="text-xs text-white/70">
              {cam.status === "recording"
                ? "Capture your full body"
                : "Make sure your full body is visible"}
            </p>
          </div>

          {/* countdown overlay */}
          {cam.status === "countdown" && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
              <span className="animate-pop-in text-8xl font-extrabold text-white drop-shadow-lg">
                {cam.countdown}
              </span>
            </div>
          )}

          {/* error banner */}
          {flow.error && (
            <div className="absolute bottom-28 left-1/2 flex w-[85%] -translate-x-1/2 items-center gap-2 rounded-xl bg-destructive/90 px-3 py-2 text-xs font-medium">
              <AlertCircle className="size-4 shrink-0" />
              {flow.error}
            </div>
          )}
        </div>

        {/* controls */}
        <div className="flex flex-col items-center gap-3 px-5 pb-8 pt-4">
          {/* timer — only show during recording */}
          {cam.status === "recording" && (
            <span className="font-mono text-lg font-bold tabular-nums text-red-400">
              {formatSeconds(cam.elapsed)}
            </span>
          )}

          {/* previewing — show Start Record button */}
          {(cam.status === "previewing" || cam.status === "requesting") && (
            <>
              <button
                onClick={cam.startRecording}
                disabled={cam.status === "requesting"}
                aria-label="Start recording"
                className={cn(
                  "relative grid size-[68px] place-items-center rounded-full border-4 border-white transition-opacity",
                  cam.status === "requesting" && "opacity-50"
                )}
              >
                <Circle className="size-12 fill-red-500 text-red-500" />
              </button>
              <p className="text-xs text-white/60">
                {cam.status === "requesting"
                  ? "Starting camera…"
                  : "Tap to start recording"}
              </p>
            </>
          )}

          {/* countdown — show pulsing indicator */}
          {cam.status === "countdown" && (
            <>
              <div className="grid size-[68px] place-items-center rounded-full border-4 border-white/40">
                <span className="text-2xl font-bold">{cam.countdown}</span>
              </div>
              <p className="text-xs text-white/60">Get ready…</p>
            </>
          )}

          {/* recording — show Stop button */}
          {cam.status === "recording" && (
            <>
              <button
                onClick={cam.stop}
                disabled={!cam.canStop}
                aria-label="Stop recording"
                className={cn(
                  "relative grid size-[68px] place-items-center rounded-full border-4 border-white transition-opacity",
                  !cam.canStop && "opacity-50"
                )}
              >
                <span className="size-7 rounded-md bg-red-500" />
              </button>
              <p className="text-xs text-white/60">
                {cam.canStop
                  ? "Tap to stop"
                  : `Keep rotating… (min ${MIN_RECORD_SECONDS}s)`}
              </p>
            </>
          )}

          {/* stopped — spinner while transitioning */}
          {cam.status === "stopped" && (
            <>
              <div className="grid size-[68px] place-items-center rounded-full border-4 border-white/40">
                <RotateCcw className="size-6 animate-spin-slow text-white/70" />
              </div>
              <p className="text-xs text-white/60">Processing…</p>
            </>
          )}
        </div>
      </div>
    </StepLayout>
  );
}