"use client";

import { Download, FlaskConical, GitCompare } from "lucide-react";

import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

import { BrandMark } from "./brand-mark";

export type LabMode = "process" | "compare";

type AppSidebarProps = {
  mode: LabMode;
  onModeChange: (mode: LabMode) => void;
  onImportExperiment: () => void;
};

const workspaceLinks: { mode: LabMode; label: string; icon: typeof FlaskConical }[] = [
  { mode: "process", label: "Process", icon: FlaskConical },
  { mode: "compare", label: "Compare", icon: GitCompare },
];

export function AppSidebar({ mode, onModeChange, onImportExperiment }: AppSidebarProps) {
  return (
    <aside className="sidebar-chrome fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-sidebar-border lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <BrandMark size="md" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold tracking-tight">{PRODUCT_NAME}</p>
          <p className="truncate text-[11px] text-muted-foreground">{PRODUCT_TAGLINE}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Lab workspace">
        <p className="sidebar-section-label px-3 pb-2">Workspace</p>
        {workspaceLinks.map(({ mode: linkMode, label, icon: Icon }) => {
          const active = mode === linkMode;
          return (
            <button
              key={linkMode}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onModeChange(linkMode)}
              className={cn(
                "relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors",
                active
                  ? "nav-active font-medium text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon className={cn("size-4", active && "text-brand")} />
              {label}
            </button>
          );
        })}

        <p className="sidebar-section-label px-3 pb-2 pt-4">Experiments</p>
        <button
          type="button"
          onClick={onImportExperiment}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
        >
          <Download className="size-4" />
          Import JSON
        </button>
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs leading-5 text-muted-foreground">
          Parameters and bounds come from the server registry. Upload and replace images from the main workspace.
        </p>
      </div>
    </aside>
  );
}
