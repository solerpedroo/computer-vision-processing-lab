"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AppSidebar, type LabMode } from "./app-sidebar";

type AppShellProps = {
  children: ReactNode;
  mode: LabMode;
  onModeChange: (mode: LabMode) => void;
  onImportExperiment: () => void;
};

export function AppShell({ children, mode, onModeChange, onImportExperiment }: AppShellProps) {
  return (
    <div className="relative min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-brand-foreground"
      >
        Skip to main content
      </a>

      <AppSidebar mode={mode} onModeChange={onModeChange} onImportExperiment={onImportExperiment} />

      <div className="flex min-h-screen flex-col lg:pl-[260px]">
        <main
          id="main-content"
          tabIndex={-1}
          className="relative flex-1 scroll-smooth px-3 py-6 sm:px-5 lg:px-8 lg:py-8"
        >
          <div className="canvas-grid pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden />
          <div className={cn("relative mx-auto w-full max-w-6xl space-y-6")}>{children}</div>
        </main>
      </div>
    </div>
  );
}
