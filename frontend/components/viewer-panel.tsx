/* eslint-disable @next/next/no-img-element */

type ViewerPanelProps = {
  label: string;
  source: string;
  zoom: number;
};

export function ViewerPanel({ label, source, zoom }: ViewerPanelProps) {
  return (
    <article className="surface-raised flex min-h-0 flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
        <h2 className="truncate text-sm font-semibold">{label}</h2>
        <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
          {zoom}%
        </span>
      </header>
      <div className="surface-inset m-3 min-h-[220px] overflow-auto p-3 sm:min-h-[280px]">
        <div className="mx-auto w-fit min-w-min">
          <img
            src={source}
            alt={label}
            className="block h-auto max-w-none transition-[width] duration-200"
            style={{ width: `${zoom}%` }}
          />
        </div>
      </div>
    </article>
  );
}
