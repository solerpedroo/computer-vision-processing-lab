import { describe, expect, it } from "vitest";

import {
  buildCompareRecord,
  buildProcessRecord,
  metricsCsv,
  parseExperimentJson,
} from "./experiment";

const metadata = {
  fileName: "sample.png",
  fileSizeBytes: 100,
  mediaType: "image/png",
  width: 32,
  height: 32,
  channels: 3 as const,
};

describe("experiment export", () => {
  it("round-trips a process record through JSON import", () => {
    const record = buildProcessRecord({
      metadata,
      operationId: "color_gamma",
      params: { gamma: 1.2 },
      timing: { processing: 1, request: 2 },
      outputColorSpace: "RGB",
    });
    const imported = parseExperimentJson(JSON.stringify(record));
    expect(imported.mode).toBe("process");
    expect(imported.operationId).toBe("color_gamma");
    expect(imported.params).toEqual({ gamma: 1.2 });
    expect(imported.imageHint.fileName).toBe("sample.png");
  });

  it("builds compare metrics csv with two arms", () => {
    const record = buildCompareRecord({
      metadata,
      operationId: "spatial_median_filter",
      params: { kernel_size: 3 },
      operationIdB: "spatial_gaussian_blur",
      paramsB: { kernel_size: 5, sigma: 1 },
      timing: { a: 1, b: 2, request: 3 },
      metricsA: { mse: 0.01, psnr: 20, ssim: 0.9, request_ms: 1 },
      metricsB: { mse: 0.02, psnr: null, ssim: 0.8, request_ms: 1 },
    });
    const csv = metricsCsv(record);
    expect(csv).toContain("arm,mse,psnr_db,ssim");
    expect(csv.split("\n")).toHaveLength(3);
  });
});
