"use client";

import type { ChangeEvent, DragEvent } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { FormPanel } from "@/components/layout/form-panel";
import { LabModeTabs } from "@/components/layout/lab-mode-tabs";
import { PageHeader } from "@/components/layout/page-header";
import { Histogram } from "@/components/histogram";
import { OperationPicker } from "@/components/operation-picker";
import { StatGrid } from "@/components/stat-grid";
import { ViewerPanel } from "@/components/viewer-panel";
import { Button, buttonClassName } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLabSession } from "@/hooks/use-lab-session";
import { formatChannelLabel } from "@/lib/lab-operations";
import { formatBytes } from "@/lib/image";

import { ParameterControls } from "./parameter-controls";
import { ImageEmptyState } from "./image-empty-state";
import { ImageSessionBar } from "./image-session-bar";

function formatPsnr(value: number | null): string {
  return value === null ? "∞" : value.toFixed(2);
}

export function LabWorkspace() {
  const {
    inputRef,
    importRef,
    importNotice,
    mode,
    setMode,
    file,
    original,
    processed,
    compareA,
    compareB,
    metadata,
    operations,
    registryError,
    registryLoading,
    operationId,
    params,
    setParams,
    operationIdB,
    paramsB,
    setParamsB,
    histogram,
    outputSpace,
    zoom,
    setZoom,
    timing,
    compareTiming,
    metricsA,
    metricsB,
    error,
    busy,
    dragOver,
    setDragOver,
    setBusy,
    selectedOperation,
    selectedOperationB,
    loadRegistry,
    apply,
    runCompare,
    selectFile,
    selectOperation,
    selectOperationB,
    exportProcessExperiment,
    exportCompareExperiment,
    importExperimentFile,
    reset,
    openImagePicker,
    openImportPicker,
  } = useLabSession();

  return (
    <AppShell mode={mode} onModeChange={setMode} onImportExperiment={openImportPicker}>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between">
        <LabModeTabs mode={mode} onModeChange={setMode} className="sm:flex-1" />
        <Button variant="secondary" size="sm" className="lg:hidden" onClick={openImportPicker}>
          Import JSON
        </Button>
      </div>

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
        {registryError ? (
          <div
            className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <p className="text-sm text-destructive-foreground">{registryError}</p>
            <Button variant="secondary" size="sm" disabled={registryLoading} onClick={() => void loadRegistry()}>
              {registryLoading ? "Retrying…" : "Retry registry"}
            </Button>
          </div>
        ) : null}
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

      {file && mode === "process" ? (
        <FormPanel title="Operation" subtitle={selectedOperation.description}>
          <div className="space-y-5">
            {operations.length > 0 ? (
              <OperationPicker
                id="operation"
                label="Operation"
                operations={operations}
                value={operationId}
                onChange={selectOperation}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Active operation ID: <span className="font-mono text-foreground">{operationId}</span>
              </p>
            )}
            <ParameterControls operation={selectedOperation} values={params} onChange={setParams} />
            <Button disabled={busy} onClick={() => file && void apply(file)}>
              {busy ? "Applying…" : "Apply operation"}
            </Button>
          </div>
        </FormPanel>
      ) : null}

      {file && mode === "compare" ? (
        <FormPanel
          title="Compare operations"
          subtitle="Metrics use the uploaded image as reference (PSNR, SSIM, MSE)."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {operations.length > 0 ? (
                <OperationPicker
                  id="operation-a"
                  label="Operation A"
                  operations={operations}
                  value={operationId}
                  onChange={selectOperation}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Operation A: <span className="font-mono">{operationId}</span>
                </p>
              )}
              <ParameterControls operation={selectedOperation} values={params} onChange={setParams} />
            </div>
            <div className="space-y-4">
              {operations.length > 0 ? (
                <OperationPicker
                  id="operation-b"
                  label="Operation B"
                  operations={operations}
                  value={operationIdB}
                  onChange={selectOperationB}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Operation B: <span className="font-mono">{operationIdB}</span>
                </p>
              )}
              <ParameterControls operation={selectedOperationB} values={paramsB} onChange={setParamsB} />
            </div>
          </div>
          <Button className="mt-5" disabled={busy} onClick={() => file && void runCompare(file)}>
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
            <ViewerPanel
              label={`Processed · ${formatChannelLabel(metadata.channels, outputSpace)}`}
              source={processed}
              zoom={zoom}
            />
          </section>
          <StatGrid
            items={[
              { label: "Dimensions", value: `${metadata.width} × ${metadata.height}` },
              {
                label: "Channels",
                value: formatChannelLabel(metadata.channels, outputSpace),
              },
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
