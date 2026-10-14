import type { MetricsResponse } from "./api";
import type { ImageMetadata } from "./image";

export const EXPERIMENT_SCHEMA_VERSION = 1 as const;

export type ExperimentImageRef = {
  fileName: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  mediaType: string;
};

export type ProcessExperimentRecord = {
  schema_version: typeof EXPERIMENT_SCHEMA_VERSION;
  exported_at: string;
  mode: "process";
  image: ExperimentImageRef;
  operation_id: string;
  params: Record<string, number | string>;
  timing: { processing_ms: number; request_ms: number };
  output_color_space: string | null;
};

export type CompareExperimentRecord = {
  schema_version: typeof EXPERIMENT_SCHEMA_VERSION;
  exported_at: string;
  mode: "compare";
  image: ExperimentImageRef;
  operation_a: { operation_id: string; params: Record<string, number | string> };
  operation_b: { operation_id: string; params: Record<string, number | string> };
  timing: { processing_a_ms: number; processing_b_ms: number; request_ms: number };
  metrics: {
    arm_a: MetricsResponse;
    arm_b: MetricsResponse;
  };
};

export type ExperimentRecord = ProcessExperimentRecord | CompareExperimentRecord;

export function imageRef(metadata: ImageMetadata): ExperimentImageRef {
  return {
    fileName: metadata.fileName,
    fileSizeBytes: metadata.fileSizeBytes,
    width: metadata.width,
    height: metadata.height,
    mediaType: metadata.mediaType,
  };
}

export function buildProcessRecord(input: {
  metadata: ImageMetadata;
  operationId: string;
  params: Record<string, number | string>;
  timing: { processing: number; request: number };
  outputColorSpace: string | null;
}): ProcessExperimentRecord {
  return {
    schema_version: EXPERIMENT_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    mode: "process",
    image: imageRef(input.metadata),
    operation_id: input.operationId,
    params: input.params,
    timing: { processing_ms: input.timing.processing, request_ms: input.timing.request },
    output_color_space: input.outputColorSpace,
  };
}

export function buildCompareRecord(input: {
  metadata: ImageMetadata;
  operationId: string;
  params: Record<string, number | string>;
  operationIdB: string;
  paramsB: Record<string, number | string>;
  timing: { a: number; b: number; request: number };
  metricsA: MetricsResponse;
  metricsB: MetricsResponse;
}): CompareExperimentRecord {
  return {
    schema_version: EXPERIMENT_SCHEMA_VERSION,
    exported_at: new Date().toISOString(),
    mode: "compare",
    image: imageRef(input.metadata),
    operation_a: { operation_id: input.operationId, params: input.params },
    operation_b: { operation_id: input.operationIdB, params: input.paramsB },
    timing: {
      processing_a_ms: input.timing.a,
      processing_b_ms: input.timing.b,
      request_ms: input.timing.request,
    },
    metrics: { arm_a: input.metricsA, arm_b: input.metricsB },
  };
}

export function metricsCsv(record: CompareExperimentRecord): string {
  const header = "arm,mse,psnr_db,ssim,metrics_request_ms";
  const row = (arm: string, metrics: MetricsResponse) =>
    [
      arm,
      metrics.mse.toFixed(8),
      metrics.psnr === null ? "" : metrics.psnr.toFixed(4),
      metrics.ssim.toFixed(6),
      metrics.request_ms.toFixed(4),
    ].join(",");
  return [header, row("A", record.metrics.arm_a), row("B", record.metrics.arm_b)].join("\n");
}

export function timingCsvProcess(record: ProcessExperimentRecord): string {
  return ["metric,value_ms", `processing,${record.timing.processing_ms}`, `request,${record.timing.request_ms}`].join(
    "\n",
  );
}

export function downloadTextFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, fileName);
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadDataUrl(dataUrl: string, fileName: string): void {
  downloadBlob(dataUrlToBlob(dataUrl), fileName);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "application/octet-stream";
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

export type ImportedExperiment = {
  mode: "process" | "compare";
  operationId: string;
  params: Record<string, number | string>;
  operationIdB?: string;
  paramsB?: Record<string, number | string>;
  imageHint: ExperimentImageRef;
};

export function parseExperimentJson(raw: string): ImportedExperiment {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("The experiment file is not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("The experiment file must be a JSON object.");
  }
  const record = parsed as ExperimentRecord;
  if (record.schema_version !== EXPERIMENT_SCHEMA_VERSION) {
    throw new Error(`Unsupported experiment schema version: ${String((parsed as { schema_version?: unknown }).schema_version)}`);
  }
  if (record.mode === "process") {
    return {
      mode: "process",
      operationId: record.operation_id,
      params: record.params,
      imageHint: record.image,
    };
  }
  if (record.mode === "compare") {
    return {
      mode: "compare",
      operationId: record.operation_a.operation_id,
      params: record.operation_a.params,
      operationIdB: record.operation_b.operation_id,
      paramsB: record.operation_b.params,
      imageHint: record.image,
    };
  }
  throw new Error("The experiment file has an unknown mode.");
}
