import type { CSSProperties } from "react";

type StatItem = {
  label: string;
  value: string;
};

type StatGridProps = {
  items: StatItem[];
  columns?: number;
};

export function StatGrid({ items, columns }: StatGridProps) {
  const style = columns ? ({ "--stat-columns": String(columns) } as CSSProperties) : undefined;

  return (
    <section className="details" style={style}>
      {items.map((item) => (
        <div key={item.label} className="stat-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
