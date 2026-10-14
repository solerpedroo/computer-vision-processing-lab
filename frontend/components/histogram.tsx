"use client";

import dynamic from "next/dynamic";
import type { Data, Layout } from "plotly.js";

import type { HistogramChart } from "../lib/api";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export function Histogram({ chart }: { chart: HistogramChart }) {
  const data: Data[] = chart.series.map((series) => ({ type: "scattergl", mode: "lines", name: series.name, x: [...series.x], y: [...series.counts] }));
  const layout: Partial<Layout> = {
    title: { text: chart.title, font: { color: "#e8eef8", size: 15 } },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "#070e1a",
    font: { color: "#94a8c4", family: "Inter, system-ui, sans-serif" },
    xaxis: {
      title: { text: "Component value", font: { size: 12 } },
      gridcolor: "#1e2d45",
      zerolinecolor: "#2d4568",
    },
    yaxis: {
      title: { text: "Pixel count", font: { size: 12 } },
      gridcolor: "#1e2d45",
      zerolinecolor: "#2d4568",
    },
    margin: { l: 56, r: 20, t: 40, b: 52 },
    legend: { orientation: "h", y: -0.25, font: { size: 11 } },
  };
  return <Plot data={data} layout={layout} config={{ responsive: true, displayModeBar: false }} style={{ width: "100%", height: "320px" }} />;
}
