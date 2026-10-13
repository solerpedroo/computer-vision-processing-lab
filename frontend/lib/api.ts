export type ApiHealth = {
  status: "ok";
  api_version: string;
};

export type Operation = Record<string, unknown>;

export type OperationsResponse = {
  operations: readonly Operation[];
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function getHealth(): Promise<ApiHealth> {
  return request<ApiHealth>("/api/health");
}

export function getOperations(): Promise<OperationsResponse> {
  return request<OperationsResponse>("/api/operations");
}
