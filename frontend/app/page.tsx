"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { FormPanel } from "@/components/layout/form-panel";
import { LabModeTabs } from "@/components/layout/lab-mode-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { ImageEmptyState } from "@/components/lab/image-empty-state";
import { ImageSessionBar } from "@/components/lab/image-session-bar";
import { ParameterControls } from "@/components/lab/parameter-controls";
import { Histogram } from "@/components/histogram";
import { OperationPicker } from "@/components/operation-picker";
import { StatGrid } from "@/components/stat-grid";
import { ViewerPanel } from "@/components/viewer-panel";
import { Button, buttonClassName } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  compareOperations,
  computeMetrics,
  getOperations,
  processImage,
  type HistogramChart,
  type MetricsResponse,
  type Operation,
} from "../lib/api";
import {
  buildCompareRecord,
  buildProcessRecord,
  downloadDataUrl,
  downloadTextFile,
  metricsCsv,
  parseExperimentJson,
  timingCsvProcess,
} from "../lib/experiment";
import { formatBytes, imageMetadata, pngBase64ToFile, type ImageMetadata } from "../lib/image";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type LabMode = "process" | "compare";

function accepted(file: File): boolean {
  return ["image/png", "image/jpeg"].includes(file.type) || /\.(png|jpe?g)$/i.test(file.name);
}

function dimensions(source: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("The selected file cannot be displayed as an image."));
    image.src = source;
  });
}

function operationDefaults(operation?: Operation): Record<string, number | string> {
  return Object.fromEntries(operation?.params.map((item) => [item.name, item.default]) ?? []);
}

function formatPsnr(value: number | null): string {
  return value === null ? "∞" : value.toFixed(2);
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<LabMode>("process");
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [operations, setOperations] = useState<readonly Operation[]>([]);
  const [operationId, setOperationId] = useState("color_noop");
  const [params, setParams] = useState<Record<string, number | string>>({});
  const [operationIdB, setOperationIdB] = useState("spatial_gaussian_blur");
  const [paramsB, setParamsB] = useState<Record<string, number | string>>({});
  const [histogram, setHistogram] = useState<HistogramChart | null>(null);
  const [outputSpace, setOutputSpace] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [timing, setTiming] = useState<{ processing: number; request: number } | null>(null);
  const [compareTiming, setCompareTiming] = useState<{
    a: number;
    b: number;
    request: number;
  } | null>(null);
  const [metricsA, setMetricsA] = useState<MetricsResponse | null>(null);
  const [metricsB, setMetricsB] = useState<MetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    void getOperations()
      .then((response) => {
        const items = response.operations.filter((item) =>
          ["color", "spatial", "edges", "morphology", "frequency"].includes(item.module),
        );
        setOperations(items);
        const blur = items.find((item) => item.id === "spatial_gaussian_blur");
        if (blur) setParamsB(operationDefaults(blur));
      })
      .catch(() => setError("The operation registry is unavailable."));
  }, []);

  const selectedOperation = operations.find((item) => item.id === operationId);
  const selectedOperationB = operations.find((item) => item.id === operationIdB);

  async function apply(selectedFile: File, nextOperation = operationId, nextParams = params) {
    setBusy(true);
    setError(null);
    setProcessed(null);
    try {
      const response = await processImage(selectedFile, nextOperation, nextParams);
      setProcessed(`data:image/png;base64,${response.output_image}`);
      setHistogram(response.histogram);
      setOutputSpace(response.metadata.output_color_space);
      setTiming({ processing: response.processing_ms, request: response.request_ms });
    } catch (reason) {
      setHistogram(null);
      setError(reason instanceof Error ? reason.message : "Image processing failed.");
    } finally {
      setBusy(false);
    }
  }

  async function runCompare(selectedFile: File) {
    if (!selectedOperation || !selectedOperationB) return;
    setBusy(true);
    setError(null);
    setCompareA(null);
    setCompareB(null);
    setMetricsA(null);
    setMetricsB(null);
    try {
      const response = await compareOperations(selectedFile, {
        operation_id: operationId,
        params,
      }, {
        operation_id: operationIdB,
        params: paramsB,
      });
      setCompareA(`data:image/png;base64,${response.result_a.output_image}`);
      setCompareB(`data:image/png;base64,${response.result_b.output_image}`);
      setCompareTiming({
        a: response.result_a.processing_ms,
        b: response.result_b.processing_ms,
        request: response.request_ms,
      });
      const reference = selectedFile;
      const candidateA = pngBase64ToFile(response.result_a.output_image, "compare-a.png");
      const candidateB = pngBase64ToFile(response.result_b.output_image, "compare-b.png");
      const [metricA, metricB] = await Promise.all([
        computeMetrics(reference, candidateA),
        computeMetrics(reference, candidateB),
      ]);
      setMetricsA(metricA);
      setMetricsB(metricB);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Comparison failed.");
    } finally {
      setBusy(false);
    }
  }

  async function selectFile(nextFile: File | undefined) {
    if (!nextFile) {
      setBusy(false);
      return;
    }
    if (!accepted(nextFile)) {
      setError("Choose a PNG or JPEG image.");
      setBusy(false);
      return;
    }
    if (nextFile.size > MAX_UPLOAD_BYTES) {
      setError("Choose an image smaller than 10 MiB.");
      setBusy(false);
      return;
    }
    const preview = URL.createObjectURL(nextFile);
    try {
      const size = await dimensions(preview);
      if (size.width > 4096 || size.height > 4096) {
        throw new Error("Choose an image no larger than 4096 × 4096 pixels.");
      }
      setOriginal((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return preview;
      });
      setFile(nextFile);
      setMetadata(imageMetadata(nextFile, size));
      setZoom(100);
      if (mode === "process") await apply(nextFile);
    } catch (reason) {
      URL.revokeObjectURL(preview);
      setError(reason instanceof Error ? reason.message : "Image processing failed.");
      setBusy(false);
    }
  }

  function selectOperation(nextId: string) {
    const nextOperation = operations.find((item) => item.id === nextId);
    setOperationId(nextId);
    setParams(operationDefaults(nextOperation));
  }

  function selectOperationB(nextId: string) {
    const nextOperation = operations.find((item) => item.id === nextId);
    setOperationIdB(nextId);
    setParamsB(operationDefaults(nextOperation));
  }

  function exportProcessExperiment() {
    if (!metadata || !timing) return;
    const record = buildProcessRecord({
      metadata,
      operationId,
      params,
      timing,
      outputColorSpace: outputSpace,
    });
    downloadTextFile(JSON.stringify(record, null, 2), "experiment-record.json", "application/json");
    downloadTextFile(timingCsvProcess(record), "experiment-timing.csv", "text/csv");
    if (original) downloadDataUrl(original, "original.png");
    if (processed) downloadDataUrl(processed, "processed.png");
  }

  function exportCompareExperiment() {
    if (!metadata || !compareTiming || !metricsA || !metricsB) return;
    const record = buildCompareRecord({
      metadata,
      operationId,
      params,
      operationIdB,
      paramsB,
      timing: compareTiming,
      metricsA,
      metricsB,
    });
    downloadTextFile(JSON.stringify(record, null, 2), "experiment-record.json", "application/json");
    downloadTextFile(metricsCsv(record), "experiment-metrics.csv", "text/csv");
    if (original) downloadDataUrl(original, "original.png");
    if (compareA) downloadDataUrl(compareA, "result-a.png");
    if (compareB) downloadDataUrl(compareB, "result-b.png");
  }

  async function importExperimentFile(nextFile: File | undefined) {
    if (!nextFile) return;
    setImportNotice(null);
    setError(null);
    try {
      const imported = parseExperimentJson(await nextFile.text());
      setMode(imported.mode);
      setOperationId(imported.operationId);
      setParams(imported.params);
      if (imported.mode === "compare" && imported.operationIdB && imported.paramsB) {
        setOperationIdB(imported.operationIdB);
        setParamsB(imported.paramsB);
      }
      setImportNotice(
        `Loaded ${imported.mode} configuration for "${imported.imageHint.fileName}". Re-upload the same image to reproduce results.`,
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not import experiment file.");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }

  function reset() {
    if (original) URL.revokeObjectURL(original);
    setImportNotice(null);
    setFile(null);
    setOriginal(null);
    setProcessed(null);
    setCompareA(null);
    setCompareB(null);
    setMetadata(null);
    setHistogram(null);
    setTiming(null);
    setCompareTiming(null);
    setMetricsA(null);
    setMetricsB(null);
    setError(null);
    setZoom(100);
    if (inputRef.current) inputRef.current.value = "";
  }

  function openImagePicker() {
    inputRef.current?.click();
  }

  return (
    <AppShell
      mode={mode}
      onModeChange={setMode}
      onImportExperiment={() => importRef.current?.click()}
    >
      <input
        ref={inputRef}
        id="image-file"
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setBusy(true);
          void selectFile(event.target.files?.[0]);
        }}
      />
      <input
        ref={importRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(event) => void importExperimentFile(event.target.files?.[0])}
      />

      <PageHeader
        label="Computer Vision Processing Lab"
        title={mode === "process" ? "Process" : "Compare"}
        description={
          mode === "process"
            ? "Apply one registry-backed operation and inspect outputs, timing, and histograms."
            : "Run two operations on the same image and compare metrics against the original."
        }
      />

      <LabModeTabs mode={mode} onModeChange={setMode} />

      {!file ? (
        <ImageEmptyState
          dragOver={dragOver}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
            setDragOver(false);
          }}
          onDrop={(event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setDragOver(false);
            setBusy(true);
            void selectFile(event.dataTransfer.files[0]);
          }}
        />
      ) : metadata ? (
        <ImageSessionBar metadata={metadata} onReplace={openImagePicker} onClear={reset} />
      ) : null}

      <div className="space-y-2">
        {error ? (
          <p
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {busy ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner size="sm" label="Processing image" />
            Processing image…
          </p>
        ) : null}
        {!busy && importNotice ? (
          <p className="rounded-lg border border-brand/25 bg-brand/5 px-4 py-3 text-sm text-muted-foreground">
            {importNotice}
          </p>
        ) : null}
      </div>

      {file && mode === "process" && selectedOperation ? (
        <FormPanel title="Operation" subtitle={selectedOperation.description}>
          <div className="space-y-5">
            <OperationPicker
              id="operation"
              label="Operation"
              operations={operations}
              value={operationId}
              onChange={selectOperation}
            />
            <ParameterControls operation={selectedOperation} values={params} onChange={setParams} />
            <Button disabled={busy} onClick={() => void apply(file)}>
              {busy ? "Applying…" : "Apply operation"}
            </Button>
          </div>
        </FormPanel>
      ) : null}

      {file && mode === "compare" && selectedOperation && selectedOperationB ? (
        <FormPanel
          title="Compare operations"
          subtitle="Metrics use the uploaded image as reference (PSNR, SSIM, MSE)."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <OperationPicker
                id="operation-a"
                label="Operation A"
                operations={operations}
                value={operationId}
                onChange={selectOperation}
              />
              <ParameterControls operation={selectedOperation} values={params} onChange={setParams} />
            </div>
            <div className="space-y-4">
              <OperationPicker
                id="operation-b"
                label="Operation B"
                operations={operations}
                value={operationIdB}
                onChange={selectOperationB}
              />
              <ParameterControls operation={selectedOperationB} values={paramsB} onChange={setParamsB} />
            </div>
          </div>
          <Button className="mt-5" disabled={busy} onClick={() => void runCompare(file)}>
            {busy ? "Running…" : "Run comparison"}
          </Button>
        </FormPanel>
      ) : null}

      {original && processed && metadata && mode === "process" ? (
        <>
          <section className="surface-raised flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="zoom" className="flex min-w-[200px] flex-1 flex-col gap-2 text-sm">
              <span className="flex justify-between font-medium">
                Zoom
                <span className="font-mono text-xs tabular-nums text-brand">{zoom}%</span>
              </span>
              <input
                id="zoom"
                type="range"
                className="accent-brand"
                min="50"
                max="200"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <a className={buttonClassName("default", "default")} href={processed} download="processed.png">
                Download PNG
              </a>
              <Button variant="secondary" onClick={exportProcessExperiment}>
                Export experiment bundle
              </Button>
            </div>
          </section>
          <section className="viewers grid gap-4 lg:grid-cols-2">
            <ViewerPanel label="Original · RGB" source={original} zoom={zoom} />
            <ViewerPanel label={`Processed · ${outputSpace ?? "RGB"}`} source={processed} zoom={zoom} />
          </section>
          <StatGrid
            items={[
              { label: "Dimensions", value: `${metadata.width} × ${metadata.height}` },
              { label: "Channels", value: `${metadata.channels} RGB` },
              { label: "Source", value: metadata.mediaType },
              { label: "File size", value: formatBytes(metadata.fileSizeBytes) },
              { label: "Processing", value: `${timing?.processing.toFixed(2)} ms` },
              { label: "Total request", value: `${timing?.request.toFixed(2)} ms` },
            ]}
          />
          {histogram ? (
            <FormPanel title="Intensity histogram">
              <Histogram chart={histogram} />
            </FormPanel>
          ) : null}
        </>
      ) : null}

      {original && compareA && compareB && metadata && mode === "compare" ? (
        <>
          <section className="surface-raised flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="zoom-compare" className="flex min-w-[200px] flex-1 flex-col gap-2 text-sm">
              <span className="flex justify-between font-medium">
                Zoom
                <span className="font-mono text-xs tabular-nums text-brand">{zoom}%</span>
              </span>
              <input
                id="zoom-compare"
                type="range"
                className="accent-brand"
                min="50"
                max="200"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </label>
            <Button variant="secondary" onClick={exportCompareExperiment}>
              Export experiment bundle
            </Button>
          </section>
          <section className="viewers grid gap-4 lg:grid-cols-3">
            <ViewerPanel label="Original · reference" source={original} zoom={zoom} />
            <ViewerPanel label={`Result A · ${operationId}`} source={compareA} zoom={zoom} />
            <ViewerPanel label={`Result B · ${operationIdB}`} source={compareB} zoom={zoom} />
          </section>
          <StatGrid
            columns={3}
            items={[
              { label: "Processing A", value: `${compareTiming?.a.toFixed(2)} ms` },
              { label: "Processing B", value: `${compareTiming?.b.toFixed(2)} ms` },
              { label: "Total request", value: `${compareTiming?.request.toFixed(2)} ms` },
            ]}
          />
          {metricsA && metricsB ? (
            <FormPanel title="Metrics vs original">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Arm</th>
                      <th className="px-4 py-3 font-medium">MSE</th>
                      <th className="px-4 py-3 font-medium">PSNR (dB)</th>
                      <th className="px-4 py-3 font-medium">SSIM</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/60">
                      <td className="px-4 py-3 font-medium">A</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{metricsA.mse.toFixed(6)}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{formatPsnr(metricsA.psnr)}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{metricsA.ssim.toFixed(4)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">B</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{metricsB.mse.toFixed(6)}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{formatPsnr(metricsB.psnr)}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{metricsB.ssim.toFixed(4)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </FormPanel>
          ) : null}
        </>
      ) : null}

      <footer className="border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
        Classical image-processing lab · registry-driven operations · deterministic server-side processing
      </footer>
    </AppShell>
  );
}
