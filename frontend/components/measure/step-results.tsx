"use client";

import { CheckCircle2, Gauge } from "lucide-react";
import { StepLayout } from "./flow-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BodyDiagram } from "./body-diagram";
import { confidenceLabel, confidenceTier } from "@/lib/measurement-api";
import type { MeasurementFlow } from "@/hooks/use-measurement-flow";

export function StepResults({ flow }: { flow: MeasurementFlow }) {
  const m = flow.measurements;
  if (!m) return null;

  const tier = confidenceTier(m.confidence);
  const pct = Math.round(m.confidence * 100);

  return (
    <StepLayout
      title="Your Measurements"
      onBack={() => flow.goTo("record")}
      footer={
        <Button className="w-full" onClick={() => flow.goTo("review")}>
          Review &amp; Edit
        </Button>
      }
    >
      <div className="animate-fade-up flex flex-col items-center gap-1 pt-2 text-center">
        <CheckCircle2 className="size-7 text-success" />
        <p className="text-lg font-bold text-success">Measurement Complete!</p>
        <p className="text-sm text-muted-foreground">
          Review your measurements below
        </p>
      </div>

      <div className="my-3">
        <BodyDiagram m={m} />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="size-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">Accuracy Confidence</p>
              <p className="text-xs text-muted-foreground">{pct}%</p>
            </div>
          </div>
          <Badge variant={tier === "low" ? "muted" : "success"}>
            {confidenceLabel(tier)}
          </Badge>
        </CardContent>
      </Card>
    </StepLayout>
  );
}