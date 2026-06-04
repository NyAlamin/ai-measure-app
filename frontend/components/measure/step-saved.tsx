"use client";

import { Check, ChevronRight } from "lucide-react";
import { StepLayout } from "./flow-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GARMENTS } from "@/lib/constants";
import type { MeasurementFlow } from "@/hooks/use-measurement-flow";

export function StepSaved({ flow }: { flow: MeasurementFlow }) {
  const saved = flow.saved;
  const garmentName =
    GARMENTS.find((g) => g.id === saved?.garment)?.name ?? "Profile";
  const date = saved
    ? new Date(saved.createdAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <StepLayout title="">
      <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
        <div className="animate-pop-in grid size-24 place-items-center rounded-full bg-success/15">
          <div className="grid size-16 place-items-center rounded-full bg-success text-success-foreground">
            <Check className="size-8" strokeWidth={3} />
          </div>
        </div>

        <div>
          <p className="text-xl font-bold">Measurements Saved!</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your measurements have been saved successfully.
          </p>
        </div>

        <Card className="w-full">
          <CardContent className="flex items-center justify-between">
            <div className="text-left">
  <p className="text-xs text-muted-foreground">
    Measurement Profile
  </p>
  <p className="font-bold">
    {saved?.name ? `${saved.name} — ${garmentName}` : garmentName}
  </p>
  <p className="text-xs text-muted-foreground">{date}</p>
</div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <div className="w-full space-y-3 pt-2">
          <Button className="w-full" onClick={flow.restart}>
            Use for Order
          </Button>
          <Button variant="outline" className="w-full" onClick={flow.restart}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </StepLayout>
  );
}