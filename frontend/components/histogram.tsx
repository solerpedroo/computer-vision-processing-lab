"use client";

import dynamic from "next/dynamic";
import type { Data, Layout } from "plotly.js";

import type { HistogramChart } from "../lib/api";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export function Histogram({ chart }: { chart: HistogramChart }) {
  const data: Data[] = chart.series.map((series) => ({ type: "scattergl", mode: "lines", name: series.name, x: [...series.x], y: [...series.counts] }));
  const layout: Partial<Layout> = { title: { text: chart.title, font: { color: "#e6edf7", size: 16 } }, paper_bgcolor: "#0a1626", plot_bgcolor: "#0a1626", font: { color: "#b8c5d9" }, xaxis: { title: { text: "Component value" }, gridcolor: "#23334a" }, yaxis: { title: { text: "Pixel count" }, gridcolor: "#23334a" }, margin: { l: 52, r: 18, t: 48, b: 48 }, legend: { orientation: "h", y: -0.22 } };
  return <Plot data={data} layout={layout} config={{ responsive: true, displayModeBar: false }} style={{ width: "100%", height: "320px" }} />;
}
