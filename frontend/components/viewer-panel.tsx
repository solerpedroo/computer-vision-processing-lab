/* eslint-disable @next/next/no-img-element */

type ViewerPanelProps = {
  label: string;
  source: string;
  zoom: number;
};

export function ViewerPanel({ label, source, zoom }: ViewerPanelProps) {
  return (
    <article className="viewer">
      <header className="viewer-header">
        <h2>{label}</h2>
        <span className="viewer-badge">{zoom}%</span>
      </header>
      <div className="image-frame">
        <img src={source} alt={label} style={{ transform: `scale(${zoom / 100})` }} />
      </div>
    </article>
  );
}
