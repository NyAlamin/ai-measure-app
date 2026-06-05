"use client";

import { ChevronLeft, Signal, Wifi, BatteryFull } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// export function StatusBar({ dark = false }: { dark?: boolean }) {
//   return (
//     <div
//       className={cn(
//         "flex items-center justify-between px-5 pt-3 text-xs font-semibold",
//         dark ? "text-white" : "text-foreground"
//       )}
//     >
//       <span>9:41</span>
//       <div className="flex items-center gap-1.5">
//         <Signal className="size-3.5" />
//         <Wifi className="size-3.5" />
//         <BatteryFull className="size-4" />
//       </div>
//     </div>
//   );
// }
export function StatusBar({ dark = false }: { dark?: boolean }) {
  void dark;
  return null;
}

interface StepLayoutProps {
  title?: string;
  onBack?: () => void;
  progress?: number | null;
  children: React.ReactNode;
  footer?: React.ReactNode;
  bare?: boolean;
}

export function StepLayout({
  title,
  onBack,
  progress,
  children,
  footer,
  bare = false,
}: StepLayoutProps) {
  if (bare) return <div className="flex h-full flex-col">{children}</div>;

  return (
    <div className="flex h-full flex-col bg-card">
      <StatusBar />
      <header className="px-5 pb-3 pt-2">
        <div className="flex items-center gap-2">
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="-ml-1 grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary"
            >
              <ChevronLeft className="size-5" />
            </button>
          ) : (
            <span className="size-9" />
          )}
          <h1 className="flex-1 text-center text-base font-bold">{title}</h1>
          <span className="size-9" />
        </div>
        {progress != null && <Progress value={progress} className="mt-3" />}
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-4">
        {children}
      </div>

      {footer && (
        <footer className="border-t border-border bg-card px-5 py-4">
          {footer}
        </footer>
      )}
    </div>
  );
}