export type ApiHealth = {
  status: "ok";
  api_version: string;
};

export type OperationParameter = {
  name: string;
  type: "integer" | "number" | "enum";
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  enum?: readonly string[];
};

export type Operation = {
  id: string;
  module: string;
  name: string;
  description: string;
  output_kind: string;
  requires_grayscale: boolean;
  params: readonly OperationParameter[];
};

export type OperationsResponse = {
  operations: readonly Operation[];
};

export type ProcessResponse = {
  operation_id: string;
  output_image: string;
  processing_ms: number;
  request_ms: number;
  metadata: {
    width: number;
    height: number;
    channels: 3;
    source_format: string;
    source_file_size_bytes: number;
    output_color_space: string | null;
    connected_components: number | null;
  };
  histogram: HistogramChart | null;
};

export type HistogramChart = {
  title: string;
  series: readonly { name: string; x: readonly number[]; counts: readonly number[] }[];
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

async function requestForm<T>(path: string, body: FormData): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { method: "POST", body });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail ?? `API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function getHealth(): Promise<ApiHealth> {
  return request<ApiHealth>("/api/health");
}

export function getOperations(): Promise<OperationsResponse> {
  return request<OperationsResponse>("/api/operations");
}

export type OperationConfig = {
  operation_id: string;
  params?: Record<string, number | string>;
};

export type CompareResponse = {
  result_a: { operation_id: string; output_image: string; processing_ms: number };
  result_b: { operation_id: string; output_image: string; processing_ms: number };
  request_ms: number;
  metadata: ProcessResponse["metadata"];
};

export type MetricsResponse = {
  mse: number;
  psnr: number | null;
  ssim: number;
  request_ms: number;
};

export function processImage(
  file: File,
  operationId = "color_noop",
  params: Record<string, number | string> = {},
): Promise<ProcessResponse> {
  const payload = new FormData();
  payload.append("image", file);
  payload.append("operation_id", operationId);
  payload.append("params", JSON.stringify(params));
  return requestForm<ProcessResponse>("/api/process", payload);
}

export function compareOperations(
  file: File,
  operationA: OperationConfig,
  operationB: OperationConfig,
): Promise<CompareResponse> {
  const payload = new FormData();
  payload.append("image", file);
  payload.append("operation_a", JSON.stringify(operationA));
  payload.append("operation_b", JSON.stringify(operationB));
  return requestForm<CompareResponse>("/api/compare", payload);
}

export function computeMetrics(reference: File, candidate: File): Promise<MetricsResponse> {
  const payload = new FormData();
  payload.append("reference_image", reference);
  payload.append("candidate_image", candidate);
  return requestForm<MetricsResponse>("/api/metrics", payload);
}
