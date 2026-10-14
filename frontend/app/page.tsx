"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

import { Histogram } from "../components/histogram";
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

  function renderParams(
    operation: Operation | undefined,
    values: Record<string, number | string>,
    onChange: (next: Record<string, number | string>) => void,
  ) {
    if (!operation) return null;
    return operation.params.map((parameter) =>
      parameter.type === "enum" ? (
        <label key={parameter.name}>
          {parameter.name}
          <select
            value={String(values[parameter.name])}
            onChange={(event) => onChange({ ...values, [parameter.name]: event.target.value })}
          >
            {parameter.enum?.map((choice) => (
              <option key={choice}>{choice}</option>
            ))}
          </select>
        </label>
      ) : (
        <label key={parameter.name}>
          {parameter.name}: {values[parameter.name]}
          <input
            type="range"
            min={parameter.min}
            max={parameter.max}
            step={parameter.step}
            value={Number(values[parameter.name])}
            onChange={(event) => onChange({ ...values, [parameter.name]: Number(event.target.value) })}
          />
        </label>
      ),
    );
  }

  return (
    <main className="lab-shell">
      <header className="lab-header">
        <div>
          <p className="eyebrow">Computer Vision Processing Lab</p>
          <h1>{mode === "process" ? "Image processing" : "Algorithm comparison"}</h1>
        </div>
        <div className="mode-switch">
          <button type="button" className={mode === "process" ? "active" : ""} onClick={() => setMode("process")}>
            Process
          </button>
          <button type="button" className={mode === "compare" ? "active" : ""} onClick={() => setMode("compare")}>
            Compare
          </button>
          {original ? (
            <button type="button" onClick={reset}>
              Reset image
            </button>
          ) : null}
        </div>
      </header>

      <section className="upload-section">
        <div
          className="dropzone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setBusy(true);
            void selectFile(event.dataTransfer.files[0]);
          }}
        >
          <p>Drop a PNG or JPEG here</p>
          <span>Maximum 10 MiB · 4096 × 4096 pixels</span>
          <label className="button-like" htmlFor="image-file">
            Browse image
          </label>
          <input
            ref={inputRef}
            id="image-file"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setBusy(true);
              void selectFile(event.target.files?.[0]);
            }}
          />
        </div>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        {busy ? <p className="status">Processing image…</p> : null}
        {importNotice ? <p className="status">{importNotice}</p> : null}
      </section>

      <section className="export-panel" aria-label="Experiment export and import">
        <h2>Experiment export</h2>
        <p>Download JSON parameters, CSV metrics/timing, and PNG snapshots from the current session.</p>
        <div className="export-actions">
          <button type="button" className="button-like" onClick={() => importRef.current?.click()}>
            Import experiment JSON
          </button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => void importExperimentFile(event.target.files?.[0])}
          />
        </div>
      </section>

      {file && mode === "process" && selectedOperation ? (
        <section className="operation-panel">
          <div>
            <label htmlFor="operation">Operation</label>
            <select id="operation" value={operationId} onChange={(event) => selectOperation(event.target.value)}>
              {operations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <p>{selectedOperation.description}</p>
          </div>
          <div className="parameter-controls">{renderParams(selectedOperation, params, setParams)}</div>
          <button type="button" disabled={busy} onClick={() => void apply(file)}>
            Apply operation
          </button>
        </section>
      ) : null}

      {file && mode === "compare" && selectedOperation && selectedOperationB ? (
        <section className="operation-panel compare-panel">
          <div className="compare-config">
            <div>
              <label htmlFor="operation-a">Operation A</label>
              <select id="operation-a" value={operationId} onChange={(event) => selectOperation(event.target.value)}>
                {operations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <div className="parameter-controls">{renderParams(selectedOperation, params, setParams)}</div>
            </div>
            <div>
              <label htmlFor="operation-b">Operation B</label>
              <select id="operation-b" value={operationIdB} onChange={(event) => selectOperationB(event.target.value)}>
                {operations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <div className="parameter-controls">
                {renderParams(selectedOperationB, paramsB, setParamsB)}
              </div>
            </div>
          </div>
          <button type="button" disabled={busy} onClick={() => void runCompare(file)}>
            Run comparison
          </button>
          <p className="compare-note">Metrics use the uploaded image as reference (PSNR, SSIM, MSE).</p>
        </section>
      ) : null}

      {original && processed && metadata && mode === "process" ? (
        <>
          <section className="controls">
            <label htmlFor="zoom">
              Zoom: {zoom}%
            </label>
            <input
              id="zoom"
              type="range"
              min="50"
              max="200"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <a className="button-like" href={processed} download="processed.png">
              Download PNG
            </a>
            <button type="button" className="button-like" onClick={exportProcessExperiment}>
              Export experiment bundle
            </button>
          </section>
          <section className="viewers">
            <Viewer label="Original · RGB" source={original} zoom={zoom} />
            <Viewer label={`Processed · ${outputSpace ?? "RGB"}`} source={processed} zoom={zoom} />
          </section>
          <section className="details">
            <div>
              <span>Dimensions</span>
              <strong>
                {metadata.width} × {metadata.height}
              </strong>
            </div>
            <div>
              <span>Channels</span>
              <strong>{metadata.channels} RGB</strong>
            </div>
            <div>
              <span>Source</span>
              <strong>{metadata.mediaType}</strong>
            </div>
            <div>
              <span>File size</span>
              <strong>{formatBytes(metadata.fileSizeBytes)}</strong>
            </div>
            <div>
              <span>Processing</span>
              <strong>{timing?.processing.toFixed(2)} ms</strong>
            </div>
            <div>
              <span>Total request</span>
              <strong>{timing?.request.toFixed(2)} ms</strong>
            </div>
          </section>
          {histogram ? (
            <section className="histogram-panel">
              <Histogram chart={histogram} />
            </section>
          ) : null}
        </>
      ) : null}

      {original && compareA && compareB && metadata && mode === "compare" ? (
        <>
          <section className="controls">
            <label htmlFor="zoom-compare">Zoom: {zoom}%</label>
            <input
              id="zoom-compare"
              type="range"
              min="50"
              max="200"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <button type="button" className="button-like" onClick={exportCompareExperiment}>
              Export experiment bundle
            </button>
          </section>
          <section className="viewers viewers-triple">
            <Viewer label="Original · reference" source={original} zoom={zoom} />
            <Viewer label={`Result A · ${operationId}`} source={compareA} zoom={zoom} />
            <Viewer label={`Result B · ${operationIdB}`} source={compareB} zoom={zoom} />
          </section>
          <section className="details">
            <div>
              <span>Processing A</span>
              <strong>{compareTiming?.a.toFixed(2)} ms</strong>
            </div>
            <div>
              <span>Processing B</span>
              <strong>{compareTiming?.b.toFixed(2)} ms</strong>
            </div>
            <div>
              <span>Total request</span>
              <strong>{compareTiming?.request.toFixed(2)} ms</strong>
            </div>
          </section>
          {metricsA && metricsB ? (
            <section className="metrics-panel" aria-label="Quantitative metrics vs original">
              <h2>Metrics vs original</h2>
              <table>
                <thead>
                  <tr>
                    <th>Arm</th>
                    <th>MSE</th>
                    <th>PSNR (dB)</th>
                    <th>SSIM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A</td>
                    <td>{metricsA.mse.toFixed(6)}</td>
                    <td>{formatPsnr(metricsA.psnr)}</td>
                    <td>{metricsA.ssim.toFixed(4)}</td>
                  </tr>
                  <tr>
                    <td>B</td>
                    <td>{metricsB.mse.toFixed(6)}</td>
                    <td>{formatPsnr(metricsB.psnr)}</td>
                    <td>{metricsB.ssim.toFixed(4)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}

function Viewer({ label, source, zoom }: { label: string; source: string; zoom: number }) {
  return (
    <article className="viewer">
      <h2>{label}</h2>
      <div className="image-frame">
        <img src={source} alt={label} style={{ transform: `scale(${zoom / 100})` }} />
      </div>
    </article>
  );
}
