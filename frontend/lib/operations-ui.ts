import type { Operation } from "./api";

export const OPERATION_MODULE_ORDER = [
  "color",
  "spatial",
  "edges",
  "morphology",
  "frequency",
] as const;

export const OPERATION_MODULE_LABELS: Record<string, string> = {
  color: "Color space",
  spatial: "Spatial filtering",
  edges: "Edge detection",
  morphology: "Morphology",
  frequency: "Frequency domain",
};

export function groupOperationsByModule(
  operations: readonly Operation[],
): { module: string; label: string; items: Operation[] }[] {
  const buckets = new Map<string, Operation[]>();
  for (const operation of operations) {
    const list = buckets.get(operation.module) ?? [];
    list.push(operation);
    buckets.set(operation.module, list);
  }

  const orderedModules = [
    ...OPERATION_MODULE_ORDER.filter((module) => buckets.has(module)),
    ...[...buckets.keys()].filter(
      (module) => !OPERATION_MODULE_ORDER.includes(module as (typeof OPERATION_MODULE_ORDER)[number]),
    ),
  ];

  return orderedModules.map((module) => ({
    module,
    label: OPERATION_MODULE_LABELS[module] ?? module,
    items: buckets.get(module) ?? [],
  }));
}
