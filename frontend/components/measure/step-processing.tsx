"use client";

import { useEffect, useState } from "react";
import { Check, ScanFace, Loader2 } from "lucide-react";
import { StepLayout } from "./flow-shell";
import { PROCESSING_STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StepProcessing() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => Math.min(PROCESSING_STAGES.length - 1, a + 1));
    }, 650);
    return () => clearInterval(id);
  }, []);

  return (
    <StepLayout title="Processing">
      <div className="flex h-full flex-col items-center justify-center gap-7 text-center">
        <div className="pulse-ring relative grid size-32 place-items-center rounded-full bg-accent">
          <ScanFace className="size-12 text-primary" />
        </div>

        <div>
          <p className="text-lg font-bold">Analyzing your video with AI</p>
          <p className="text-sm text-muted-foreground">
            This may take a few moments
          </p>
        </div>

        <ul className="w-full max-w-xs space-y-3 text-left">
          {PROCESSING_STAGES.map((stage, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <li key={stage} className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full transition-colors",
                    done && "bg-success text-success-foreground",
                    current && "bg-primary/15 text-primary",
                    !done && !current && "bg-secondary text-muted-foreground"
                  )}
                >
                  {done ? (
                    <Check className="size-4" />
                  ) : current ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <span className="size-2 rounded-full bg-current opacity-40" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    done || current
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {stage}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </StepLayout>
  );
}