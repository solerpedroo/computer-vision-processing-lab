type StatItem = {
  label: string;
  value: string;
};

type StatGridProps = {
  items: StatItem[];
  columns?: number;
};

export function StatGrid({ items, columns }: StatGridProps) {
  const gridClass =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";

  return (
    <section className={`details grid gap-3 ${gridClass}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="surface-raised flex flex-col gap-1 px-4 py-3"
        >
          <span className="label-caps">{item.label}</span>
          <strong className="font-mono text-sm tabular-nums text-foreground">{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
