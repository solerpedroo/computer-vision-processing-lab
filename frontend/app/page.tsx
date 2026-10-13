"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, DragEvent, useRef, useState } from "react";

import { processImage } from "../lib/api";
import { formatBytes, imageMetadata, type ImageMetadata } from "../lib/image";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg"]);

function isAcceptedImage(file: File): boolean {
  return ACCEPTED_TYPES.has(file.type) || /\.(png|jpe?g)$/i.test(file.name);
}

function readDimensions(source: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("The selected file cannot be displayed as an image."));
    image.src = source;
  });
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [zoom, setZoom] = useState(100);
  const [processingMs, setProcessingMs] = useState<number | null>(null);
  const [requestMs, setRequestMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function selectFile(file: File | undefined) {
    if (!file) {
      setIsProcessing(false);
      return;
    }
    setError(null);
    if (!isAcceptedImage(file)) {
      setError("Choose a PNG or JPEG image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Choose an image smaller than 10 MiB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    try {
      const dimensions = await readDimensions(previewUrl);
      if (dimensions.width > 4096 || dimensions.height > 4096) {
        throw new Error("Choose an image no larger than 4096 × 4096 pixels.");
      }
      const response = await processImage(file);
      setOriginalImage((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return previewUrl;
      });
      setProcessedImage(`data:image/png;base64,${response.output_image}`);
      setMetadata(imageMetadata(file, dimensions));
      setProcessingMs(response.processing_ms);
      setRequestMs(response.request_ms);
      setZoom(100);
    } catch (reason) {
      URL.revokeObjectURL(previewUrl);
      setError(reason instanceof Error ? reason.message : "Image processing failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setIsProcessing(true);
    void selectFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsProcessing(true);
    void selectFile(event.dataTransfer.files[0]);
  }

  function reset() {
    if (originalImage) URL.revokeObjectURL(originalImage);
    setOriginalImage(null);
    setProcessedImage(null);
    setMetadata(null);
    setProcessingMs(null);
    setRequestMs(null);
    setZoom(100);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <main className="lab-shell">
      <header className="lab-header">
        <div>
          <p className="eyebrow">Computer Vision Processing Lab</p>
          <h1>Image input</h1>
        </div>
        {originalImage ? <button onClick={reset}>Reset image</button> : null}
      </header>

      <section className="upload-section" aria-label="Image upload">
        <div
          className="dropzone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
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
            onChange={handleFileChange}
          />
        </div>
        {error ? <p className="error" role="alert">{error}</p> : null}
        {isProcessing ? <p className="status">Validating and processing image…</p> : null}
      </section>

      {originalImage && processedImage && metadata ? (
        <>
          <section className="controls" aria-label="Viewer controls">
            <label htmlFor="zoom">Zoom: {zoom}%</label>
            <input
              id="zoom"
              type="range"
              min="50"
              max="200"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <a className="button-like" href={processedImage} download="processed.png">
              Download PNG
            </a>
          </section>
          <section className="viewers" aria-label="Image comparison">
            <ImageViewer label="Original" source={originalImage} zoom={zoom} />
            <ImageViewer label="Processed · Identity" source={processedImage} zoom={zoom} />
          </section>
          <section className="details" aria-label="Image information">
            <div><span>Dimensions</span><strong>{metadata.width} × {metadata.height}</strong></div>
            <div><span>Channels</span><strong>{metadata.channels} RGB</strong></div>
            <div><span>Source</span><strong>{metadata.mediaType}</strong></div>
            <div><span>File size</span><strong>{formatBytes(metadata.fileSizeBytes)}</strong></div>
            <div><span>Processing</span><strong>{processingMs?.toFixed(2)} ms</strong></div>
            <div><span>Total request</span><strong>{requestMs?.toFixed(2)} ms</strong></div>
          </section>
        </>
      ) : null}
    </main>
  );
}

function ImageViewer({ label, source, zoom }: { label: string; source: string; zoom: number }) {
  return (
    <article className="viewer">
      <h2>{label}</h2>
      <div className="image-frame">
        <img src={source} alt={label} style={{ transform: `scale(${zoom / 100})` }} />
      </div>
    </article>
  );
}
