"use client";

import { useMeasurementFlow } from "@/hooks/use-measurement-flow";
import { StepGarment } from "@/components/measure/step-garment";
import { StepInfo } from "@/components/measure/step-info";
import { StepInstructions } from "@/components/measure/step-instructions";
import { StepRecord } from "@/components/measure/step-record";
import { StepUploading } from "@/components/measure/step-uploading";
import { StepProcessing } from "@/components/measure/step-processing";
import { StepResults } from "@/components/measure/step-results";
import { StepReview } from "@/components/measure/step-review";
import { StepSaved } from "@/components/measure/step-saved";

export default function MeasurePage() {
  const flow = useMeasurementFlow();

  const render = () => {
    switch (flow.step) {
      case "garment":
        return <StepGarment flow={flow} />;
      case "info":
        return <StepInfo flow={flow} />;
      case "instructions":
        return <StepInstructions flow={flow} />;
      case "record":
        return <StepRecord flow={flow} />;
      case "uploading":
        return <StepUploading />;
      case "processing":
        return <StepProcessing />;
      case "results":
        return <StepResults flow={flow} />;
      case "review":
        return <StepReview flow={flow} />;
      case "saved":
        return <StepSaved flow={flow} />;
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_50%_0%,oklch(0.95_0.03_295),var(--color-background))] p-0 sm:p-6">
      <div className="relative h-dvh w-full overflow-hidden bg-card sm:h-[820px] sm:max-w-[400px] sm:rounded-[2.4rem] sm:border-8 sm:border-neutral-900 sm:shadow-2xl">
        <div key={flow.step} className="animate-fade-up h-full">
          {render()}
        </div>
      </div>
    </main>
  );
}