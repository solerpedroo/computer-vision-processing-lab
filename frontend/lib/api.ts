export type ApiHealth = {
  status: "ok";
  api_version: string;
};

export type Operation = Record<string, unknown>;

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
  };
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

export function processImage(file: File, operationId = "color_noop"): Promise<ProcessResponse> {
  const payload = new FormData();
  payload.append("image", file);
  payload.append("operation_id", operationId);
  return requestForm<ProcessResponse>("/api/process", payload);
}
