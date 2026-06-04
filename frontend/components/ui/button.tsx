import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

const variantStyles = {
  default:
    "bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_var(--color-primary)] hover:brightness-110",
  outline:
    "border border-input bg-card text-foreground hover:bg-secondary",
  ghost: "hover:bg-secondary text-foreground",
};

const sizeStyles = {
  default: "h-12 px-5",
  sm: "h-9 px-3 text-xs",
  lg: "h-14 px-6 text-base",
  icon: "h-11 w-11",
};

export function Button({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}