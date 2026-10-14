"use client";

import { cn } from "@/lib/utils";

import type { LabMode } from "./app-sidebar";

type LabModeTabsProps = {
  mode: LabMode;
  onModeChange: (mode: LabMode) => void;
  className?: string;
};

/** Mobile / narrow: primary mode control when the sidebar is hidden. */
export function LabModeTabs({ mode, onModeChange, className }: LabModeTabsProps) {
  return (
    <div
      className={cn(
        "flex rounded-lg border border-border bg-muted/40 p-0.5 lg:hidden",
        className,
      )}
      role="tablist"
      aria-label="Lab mode"
    >
      {(
        [
          ["process", "Process"],
          ["compare", "Compare"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={mode === value}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            mode === value
              ? "bg-card text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onModeChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
