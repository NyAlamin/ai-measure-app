import Link from "next/link";
import {
  ScanLine,
  Sparkles,
  Camera,
  ShieldCheck,
  ShieldQuestion,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  { icon: ScanLine, label: "360° video capture" },
  { icon: Sparkles, label: "AI-powered measurement" },
  { icon: Camera, label: "High accuracy" },
  { icon: ShieldCheck, label: "100% privacy focused" },
];

const TIPS = [
  "Stand straight",
  "Keep your arms slightly away from body",
  "Rotate slowly and smoothly",
  "Ensure good lighting",
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_50%_-10%,oklch(0.95_0.03_295),var(--color-background))]">
      <div className="mx-auto flex max-w-md flex-col gap-5 px-5 py-12">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            AI Body Measurement
          </h1>
          <p className="mt-2 text-muted-foreground">
            Get accurate body measurements in seconds using our AI technology.
          </p>
        </header>

        <Card>
          <CardContent className="space-y-1 p-5">
            <h2 className="mb-2 font-bold text-primary">Key Features</h2>
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3 py-1.5">
                <f.icon className="size-4 text-primary" />
                <span className="text-sm">{f.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-accent/40">
          <CardContent className="p-5">
            <div className="mb-1 flex items-center gap-2 font-bold text-primary">
              <ShieldQuestion className="size-4" /> Privacy First
            </div>
            <p className="text-sm text-muted-foreground">
              Your video is processed securely and deleted immediately after
              measurements are generated. Only measurements are stored.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-2 font-bold text-primary">Tips for Best Results</h2>
            {TIPS.map((t) => (
              <div key={t} className="flex items-center gap-3 py-1.5">
                <Check className="size-4 text-success" />
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Link href="/measure">
          <Button size="lg" className="w-full">
            Start AI Measurement <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </main>
  );
}