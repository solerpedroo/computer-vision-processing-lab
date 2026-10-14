import { cn } from "@/lib/utils";

type SpinnerProps = {
  label?: string;
  size?: "sm" | "md";
};

export function Spinner({ label = "Loading", size = "md" }: SpinnerProps) {
  const dimension = size === "sm" ? "size-4" : "size-5";

  return (
    <span className="inline-flex items-center" role="status" aria-live="polite">
      <span
        className={cn(
          dimension,
          "animate-spin rounded-full border-2 border-muted-foreground/30 border-t-brand",
        )}
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
