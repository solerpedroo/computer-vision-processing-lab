"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

import { Histogram } from "../components/histogram";
import { getOperations, processImage, type HistogramChart, type Operation } from "../lib/api";
import { formatBytes, imageMetadata, type ImageMetadata } from "../lib/image";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

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

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [operations, setOperations] = useState<readonly Operation[]>([]);
  const [operationId, setOperationId] = useState("color_noop");
  const [params, setParams] = useState<Record<string, number | string>>({});
  const [histogram, setHistogram] = useState<HistogramChart | null>(null);
  const [outputSpace, setOutputSpace] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [timing, setTiming] = useState<{ processing: number; request: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getOperations()
      .then((response) => setOperations(response.operations.filter((item) => ["color", "spatial", "edges", "morphology", "frequency"].includes(item.module))))
      .catch(() => setError("The operation registry is unavailable."));
  }, []);

  const selectedOperation = operations.find((item) => item.id === operationId);

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

  async function selectFile(nextFile: File | undefined) {
    if (!nextFile) { setBusy(false); return; }
    if (!accepted(nextFile)) { setError("Choose a PNG or JPEG image."); setBusy(false); return; }
    if (nextFile.size > MAX_UPLOAD_BYTES) { setError("Choose an image smaller than 10 MiB."); setBusy(false); return; }
    const preview = URL.createObjectURL(nextFile);
    try {
      const size = await dimensions(preview);
      if (size.width > 4096 || size.height > 4096) throw new Error("Choose an image no larger than 4096 × 4096 pixels.");
      setOriginal((previous) => { if (previous) URL.revokeObjectURL(previous); return preview; });
      setFile(nextFile);
      setMetadata(imageMetadata(nextFile, size));
      setZoom(100);
      await apply(nextFile);
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

  function reset() {
    if (original) URL.revokeObjectURL(original);
    setFile(null); setOriginal(null); setProcessed(null); setMetadata(null); setHistogram(null); setTiming(null); setError(null); setZoom(100);
    if (inputRef.current) inputRef.current.value = "";
  }

  return <main className="lab-shell">
    <header className="lab-header"><div><p className="eyebrow">Computer Vision Processing Lab</p><h1>Image processing</h1></div>{original ? <button onClick={reset}>Reset image</button> : null}</header>
    <section className="upload-section"><div className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setBusy(true); void selectFile(event.dataTransfer.files[0]); }}><p>Drop a PNG or JPEG here</p><span>Maximum 10 MiB · 4096 × 4096 pixels</span><label className="button-like" htmlFor="image-file">Browse image</label><input ref={inputRef} id="image-file" type="file" accept="image/png,image/jpeg" onChange={(event: ChangeEvent<HTMLInputElement>) => { setBusy(true); void selectFile(event.target.files?.[0]); }} /></div>{error ? <p className="error" role="alert">{error}</p> : null}{busy ? <p className="status">Processing image…</p> : null}</section>
    {file && selectedOperation ? <section className="operation-panel"><div><label htmlFor="operation">Operation</label><select id="operation" value={operationId} onChange={(event) => selectOperation(event.target.value)}>{operations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><p>{selectedOperation.description}</p></div><div className="parameter-controls">{selectedOperation.params.map((parameter) => parameter.type === "enum" ? <label key={parameter.name}>{parameter.name}<select value={String(params[parameter.name])} onChange={(event) => setParams({ ...params, [parameter.name]: event.target.value })}>{parameter.enum?.map((choice) => <option key={choice}>{choice}</option>)}</select></label> : <label key={parameter.name}>{parameter.name}: {params[parameter.name]}<input type="range" min={parameter.min} max={parameter.max} step={parameter.step} value={Number(params[parameter.name])} onChange={(event) => setParams({ ...params, [parameter.name]: Number(event.target.value) })} /></label>)}</div><button disabled={busy} onClick={() => void apply(file)}>Apply operation</button></section> : null}
    {original && processed && metadata ? <><section className="controls"><label htmlFor="zoom">Zoom: {zoom}%</label><input id="zoom" type="range" min="50" max="200" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><a className="button-like" href={processed} download="processed.png">Download PNG</a></section><section className="viewers"><Viewer label="Original · RGB" source={original} zoom={zoom} /><Viewer label={`Processed · ${outputSpace ?? "RGB"}`} source={processed} zoom={zoom} /></section><section className="details"><div><span>Dimensions</span><strong>{metadata.width} × {metadata.height}</strong></div><div><span>Channels</span><strong>{metadata.channels} RGB</strong></div><div><span>Source</span><strong>{metadata.mediaType}</strong></div><div><span>File size</span><strong>{formatBytes(metadata.fileSizeBytes)}</strong></div><div><span>Processing</span><strong>{timing?.processing.toFixed(2)} ms</strong></div><div><span>Total request</span><strong>{timing?.request.toFixed(2)} ms</strong></div></section>{histogram ? <section className="histogram-panel"><Histogram chart={histogram} /></section> : null}</> : null}
  </main>;
}

function Viewer({ label, source, zoom }: { label: string; source: string; zoom: number }) { return <article className="viewer"><h2>{label}</h2><div className="image-frame"><img src={source} alt={label} style={{ transform: `scale(${zoom / 100})` }} /></div></article>; }
