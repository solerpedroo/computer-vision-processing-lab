"use client";

import type { DragEvent } from "react";
import { ImageUp } from "lucide-react";

import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageEmptyStateProps = {
  dragOver: boolean;
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  inputId?: string;
};

export function ImageEmptyState({
  dragOver,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  inputId = "image-file",
}: ImageEmptyStateProps) {
  return (
    <div
      className={cn(
        "surface-raised flex min-h-[min(420px,70vh)] flex-col items-center justify-center gap-5 px-6 py-12 text-center transition-colors",
        dragOver && "ring-2 ring-brand/40 ring-offset-2 ring-offset-background",
      )}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-muted/50 text-brand">
        <ImageUp className="size-7" aria-hidden />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-display text-xl font-semibold">Start with an image</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Drop a PNG or JPEG here, then pick a registry-backed operation and inspect side-by-side results, timing, and
          histograms.
        </p>
        <p className="text-xs text-muted-foreground">Up to 10 MiB · max 4096 × 4096 px</p>
      </div>
      <label htmlFor={inputId} className={cn(buttonClassName("default", "lg"), "cursor-pointer")}>
        Choose image
      </label>
    </div>
  );
}
