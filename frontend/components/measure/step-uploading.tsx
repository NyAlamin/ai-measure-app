"use client";

import { useEffect, useState } from "react";
import { CloudUpload } from "lucide-react";
import { StepLayout } from "./flow-shell";

export function StepUploading() {
  const [pct, setPct] = useState(8);

  useEffect(() => {
    const id = setInterval(() => {
      setPct((p) => Math.min(96, p + Math.round(Math.random() * 14) + 4));
    }, 220);
    return () => clearInterval(id);
  }, []);

  return (
    <StepLayout title="Uploading">
      <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
        <div className="pulse-ring relative grid size-32 place-items-center rounded-full bg-accent">
          <CloudUpload className="size-12 text-primary" />
        </div>

        <div>
          <p className="text-lg font-bold">Uploading your video…</p>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>

        <div className="w-full max-w-xs">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs font-semibold text-muted-foreground">
            {pct}%
          </p>
        </div>

        <div className="rounded-xl bg-secondary px-4 py-3 text-xs text-muted-foreground">
          Please do not close the app while uploading
        </div>
      </div>
    </StepLayout>
  );
}