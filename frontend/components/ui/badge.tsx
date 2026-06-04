import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "muted";
}

const variantStyles = {
  default: "bg-accent text-accent-foreground",
  success: "bg-success/15 text-success",
  muted: "bg-secondary text-muted-foreground",
};

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}