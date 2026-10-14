import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  size?: "sm" | "md";
};

export function BrandMark({ className, size = "md" }: BrandMarkProps) {
  const box = size === "sm" ? "size-8" : "size-9";
  const icon = size === "sm" ? 16 : 18;

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-brand/25 bg-brand/10 text-brand shadow-[inset_0_1px_0_oklch(1_0_0/0.08)]",
        box,
        className,
      )}
      aria-hidden
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
