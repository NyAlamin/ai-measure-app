"use client";

import {
  Shirt,
  PackageOpen,
  MoveHorizontal,
  PersonStanding,
  Lightbulb,
  RotateCw,
  type LucideIcon,
} from "lucide-react";
import { StepLayout } from "./flow-shell";
import { Button } from "@/components/ui/button";
import { INSTRUCTIONS } from "@/lib/constants";
import type { MeasurementFlow } from "@/hooks/use-measurement-flow";

const ICONS: LucideIcon[] = [
  Shirt,
  PackageOpen,
  MoveHorizontal,
  PersonStanding,
  Lightbulb,
  RotateCw,
];

export function StepInstructions({ flow }: { flow: MeasurementFlow }) {
  return (
    <StepLayout
      title="How to Record"
      progress={flow.progress}
      onBack={() => flow.goTo("info")}
      footer={
        <Button className="w-full" onClick={() => flow.goTo("record")}>
          Start Recording
        </Button>
      }
    >
      <div className="space-y-3 pt-2">
        {INSTRUCTIONS.map((item, i) => {
          const Icon = ICONS[i];
          return (
            <div
              key={item.title}
              className="animate-fade-up flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="font-semibold leading-tight">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </StepLayout>
  );
}