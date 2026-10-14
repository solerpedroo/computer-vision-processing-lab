import type { Operation } from "@/lib/api";

export const LAB_MODULES = ["color", "spatial", "edges", "morphology", "frequency"] as const;

export const DEFAULT_OPERATION_A = "color_noop";
export const DEFAULT_OPERATION_B = "spatial_gaussian_blur";

export function operationDefaults(operation?: Operation): Record<string, number | string> {
  return Object.fromEntries(operation?.params.map((item) => [item.name, item.default]) ?? []);
}

export function filterLabOperations(operations: readonly Operation[]): Operation[] {
  return operations.filter((item) => LAB_MODULES.includes(item.module as (typeof LAB_MODULES)[number]));
}

export function stubOperation(id: string): Operation {
  return {
    id,
    module: "unknown",
    name: id,
    description: "Registry metadata is unavailable. The server still validates parameters for this operation ID.",
    output_kind: "image",
    requires_grayscale: false,
    params: [],
  };
}

export function formatChannelLabel(channels: number, outputColorSpace: string | null): string {
  if (outputColorSpace) return outputColorSpace;
  return channels === 3 ? "3 · RGB" : `${channels} ch`;
}

export function mergeParamValues(
  operation: Operation,
  values: Record<string, number | string>,
): Record<string, number | string> {
  return { ...operationDefaults(operation), ...values };
}
