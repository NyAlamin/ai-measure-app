"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { StepLayout } from "./flow-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { HEIGHT_MAX_CM, HEIGHT_MIN_CM } from "@/lib/constants";
import type { Gender } from "@/lib/types";
import type { MeasurementFlow } from "@/hooks/use-measurement-flow";
import { cn } from "@/lib/utils";

const GENDERS: { id: Gender; label: string }[] = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "other", label: "Other" },
];

export function StepInfo({ flow }: { flow: MeasurementFlow }) {
  const [name, setName] = useState(flow.info?.name ?? "");
  const [height, setHeight] = useState(flow.info?.height?.toString() ?? "165");
  const [gender, setGender] = useState<Gender | undefined>(flow.info?.gender);
  const [weight, setWeight] = useState(flow.info?.weight?.toString() ?? "");
  const [waist, setWaist] = useState(flow.info?.waist?.toString() ?? "");
  const [touched, setTouched] = useState(false);

  const h = Number(height);
  const w = Number(weight);
  const ws = Number(waist);

  const nameError = !name.trim() ? "Name is required." : null;
  const heightError =
    !height || Number.isNaN(h)
      ? "Height is required."
      : h < HEIGHT_MIN_CM || h > HEIGHT_MAX_CM
        ? `Height must be between ${HEIGHT_MIN_CM} and ${HEIGHT_MAX_CM} cm.`
        : null;
  const genderError = !gender ? "Gender is required." : null;
  const weightError =
    !weight || Number.isNaN(w) || w <= 0 ? "Weight is required." : null;
  const waistError =
    !waist || Number.isNaN(ws) || ws <= 0 ? "Waist is required." : null;

  const submit = () => {
    setTouched(true);
    if (nameError || heightError || genderError || weightError || waistError)
      return;
    flow.setInfo({
      name: name.trim(),
      height: h,
      gender,
      weight: w,
      waist: ws,
    });
    flow.goTo("instructions");
  };

  return (
    <StepLayout
      title="Your Information"
      progress={flow.progress}
      onBack={() => flow.goTo("garment")}
      footer={
        <Button className="w-full" onClick={submit}>
          Continue
        </Button>
      }
    >
      <p className="mb-6 mt-2 text-center text-sm text-muted-foreground">
        Please provide your basic information to get started
      </p>

      <div className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-primary">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(true)}
            className={cn(
              touched && nameError && "border-destructive ring-destructive"
            )}
          />
          {touched && nameError && (
            <p className="text-xs font-medium text-destructive">{nameError}</p>
          )}
        </div>

        {/* Height */}
        <div className="space-y-2">
          <Label htmlFor="height">
            Height <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <Input
              id="height"
              inputMode="numeric"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              onBlur={() => setTouched(true)}
              className={cn(
                touched && heightError && "border-destructive ring-destructive"
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              cm
            </span>
          </div>
          {touched && heightError && (
            <p className="text-xs font-medium text-destructive">
              {heightError}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>
            Gender <span className="text-primary">*</span>
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  setGender((cur) => (cur === g.id ? undefined : g.id));
                  setTouched(true);
                }}
                className={cn(
                  "h-11 rounded-xl border text-sm font-semibold transition-all",
                  gender === g.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
          {touched && genderError && (
            <p className="text-xs font-medium text-destructive">
              {genderError}
            </p>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label htmlFor="weight">
            Weight <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <Input
              id="weight"
              inputMode="numeric"
              value={weight}
              placeholder="60"
              onChange={(e) => setWeight(e.target.value)}
              onBlur={() => setTouched(true)}
              className={cn(
                touched && weightError && "border-destructive ring-destructive"
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              kg
            </span>
          </div>
          {touched && weightError && (
            <p className="text-xs font-medium text-destructive">
              {weightError}
            </p>
          )}
        </div>

        {/* Waist */}
        <div className="space-y-2">
          <Label htmlFor="waist">
            Waist <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <Input
              id="waist"
              inputMode="numeric"
              value={waist}
              placeholder="34"
              onChange={(e) => setWaist(e.target.value)}
              onBlur={() => setTouched(true)}
              className={cn(
                touched && waistError && "border-destructive ring-destructive"
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              in
            </span>
          </div>
          {touched && waistError && (
            <p className="text-xs font-medium text-destructive">
              {waistError}
            </p>
          )}
        </div>

        <Card className="bg-accent/40">
          <CardContent className="flex gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">Why we need this?</p>
              <p className="text-xs text-muted-foreground">
                Your height and waist help our AI calculate accurate
                measurements for your body.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StepLayout>
  );
}