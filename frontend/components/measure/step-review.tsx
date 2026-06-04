"use client";

import { useState } from "react";
import { StepLayout } from "./flow-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Measurements, MeasurementKey } from "@/lib/types";
import type { MeasurementFlow } from "@/hooks/use-measurement-flow";

const UPPER: { key: MeasurementKey; label: string }[] = [
  { key: "neck", label: "Neck" },
  { key: "shoulder", label: "Shoulder" },
  { key: "bust", label: "Chest / Bust" },
  { key: "bicep", label: "Bicep" },
  { key: "sleeve", label: "Sleeve Length" },
  { key: "armLength", label: "Arm Length" },
  { key: "wrist", label: "Wrist" },
];

const LOWER: { key: MeasurementKey; label: string }[] = [
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "kameezLength", label: "Kameez Length" },
];

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-0">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative w-28">
        <Input
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-10 pr-9 text-right"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          in
        </span>
      </div>
    </div>
  );
}

export function StepReview({ flow }: { flow: MeasurementFlow }) {
  const [m, setM] = useState<Measurements>(flow.measurements!);

  const set = (key: MeasurementKey) => (n: number) =>
    setM((prev) => ({ ...prev, [key]: n }));

  const reset = () => setM(flow.measurements!);

  const save = async () => {
    flow.updateMeasurements(m);
    await flow.persist();
  };

  return (
    <StepLayout
      title="Review & Edit"
      onBack={() => flow.goTo("results")}
      footer={
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={reset}>
            Reset
          </Button>
          <Button className="flex-1" onClick={save}>
            Save Measurements
          </Button>
        </div>
      }
    >
      <p className="mb-3 mt-1 text-center text-xs text-muted-foreground">
        You can edit any measurement if needed
      </p>

      <section className="mb-5">
        <h2 className="mb-1 text-sm font-bold text-muted-foreground">
          Upper Body
        </h2>
        {UPPER.map((r) => (
          <Row
            key={r.key}
            label={r.label}
            value={m[r.key]}
            onChange={set(r.key)}
          />
        ))}
      </section>

      <section>
        <h2 className="mb-1 text-sm font-bold text-muted-foreground">
          Lower Body
        </h2>
        {LOWER.map((r) => (
          <Row
            key={r.key}
            label={r.label}
            value={m[r.key]}
            onChange={set(r.key)}
          />
        ))}
      </section>

      {flow.error && (
        <p className="mt-3 text-center text-xs font-medium text-destructive">
          {flow.error}
        </p>
      )}
    </StepLayout>
  );
}