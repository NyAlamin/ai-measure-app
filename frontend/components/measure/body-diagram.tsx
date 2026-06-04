"use client";

import type { Measurements } from "@/lib/types";

interface LabelProps {
  x: number;
  y: number;
  label: string;
  value: number;
  align?: "start" | "end";
}

function L({ x, y, label, value, align = "start" }: LabelProps) {
  return (
    <text x={x} y={y} textAnchor={align} className="fill-foreground">
      <tspan
        x={x}
        className="text-[8px] font-semibold"
        style={{ fill: "var(--color-muted-foreground)" }}
      >
        {label}
      </tspan>
      <tspan x={x} dy="11" className="text-[9px] font-bold">
        {value.toFixed(1)} in
      </tspan>
    </text>
  );
}

export function BodyDiagram({ m }: { m: Measurements }) {
  const stroke = "var(--color-primary)";
  return (
    <svg
      viewBox="0 0 320 360"
      className="w-full"
      aria-label="Body measurement diagram"
    >
      {/* figure */}
      <g
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      >
        <circle cx="160" cy="40" r="20" />
        <path d="M160 60 C146 66 138 78 138 96 L130 110" />
        <path d="M160 60 C174 66 182 78 182 96 L190 110" />
        <path d="M138 96 L122 170 L116 240 M182 96 L198 170 L204 240" />
        <path d="M138 96 C150 92 170 92 182 96 L186 210 C176 220 144 220 134 210 Z" />
        <path d="M148 218 L140 320 M172 218 L180 320" />
      </g>

      {/* measurement guide lines */}
      <g
        stroke={stroke}
        strokeWidth="1.2"
        strokeDasharray="3 3"
        opacity="0.8"
      >
        <line x1="120" y1="96" x2="200" y2="96" />
        <line x1="124" y1="130" x2="196" y2="130" />
        <line x1="128" y1="175" x2="192" y2="175" />
        <line x1="120" y1="210" x2="200" y2="210" />
      </g>

      {/* labels — left */}
      <L x={8} y={92} label="Neck" value={m.neck} />
      <L x={8} y={128} label="Chest/Bust" value={m.bust} />
      <L x={8} y={172} label="Waist" value={m.waist} />
      <L x={8} y={206} label="Hip" value={m.hip} />
      <L x={8} y={250} label="Kameez Length" value={m.kameezLength} />

      {/* labels — right */}
      <L x={312} y={92} label="Shoulder" value={m.shoulder} align="end" />
      <L x={312} y={128} label="Sleeve" value={m.sleeve} align="end" />
      <L x={312} y={172} label="Bicep" value={m.bicep} align="end" />
      <L x={312} y={206} label="Wrist" value={m.wrist} align="end" />
      <L
        x={312}
        y={250}
        label="Arm Length"
        value={m.armLength}
        align="end"
      />
    </svg>
  );
}