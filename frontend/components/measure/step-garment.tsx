"use client";

import { Check, Shirt } from "lucide-react";
import { StepLayout } from "./flow-shell";
import { Button } from "@/components/ui/button";
import { GARMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { MeasurementFlow } from "@/hooks/use-measurement-flow";

export function StepGarment({ flow }: { flow: MeasurementFlow }) {
  return (
    <StepLayout
      title="Select Measurement Type"
      progress={flow.progress}
      footer={
        <Button
          className="w-full"
          disabled={!flow.garment}
          onClick={() => flow.goTo("info")}
        >
          Continue
        </Button>
      }
    >
      <div className="space-y-3 pt-1">
        {GARMENTS.map((g, i) => {
          const selected = flow.garment === g.id;
          return (
            <button
              key={g.id}
              onClick={() => flow.setGarment(g.id)}
              className={cn(
                "animate-fade-up flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                selected
                  ? "border-primary bg-accent/60 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40"
              )}
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <div
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-xl",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                )}
              >
                <Shirt className="size-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold leading-tight">{g.name}</p>
                <p className="text-xs text-muted-foreground">{g.subtitle}</p>
              </div>
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full border transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                )}
              >
                {selected && <Check className="size-4" />}
              </span>
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}