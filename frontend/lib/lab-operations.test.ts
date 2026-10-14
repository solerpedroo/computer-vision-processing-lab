import { describe, expect, it } from "vitest";

import type { Operation } from "./api";
import { formatChannelLabel, mergeParamValues, operationDefaults } from "./lab-operations";

const sample: Operation = {
  id: "test_op",
  module: "spatial",
  name: "Test",
  description: "",
  output_kind: "image",
  requires_grayscale: false,
  params: [
    { name: "ksize", type: "integer", default: 3, min: 3, max: 9, step: 2 },
    { name: "mode", type: "enum", default: "reflect", enum: ["reflect", "zero"] },
  ],
};

describe("lab-operations", () => {
  it("mergeParamValues fills registry defaults for missing keys", () => {
    expect(mergeParamValues(sample, {})).toEqual({ ksize: 3, mode: "reflect" });
    expect(mergeParamValues(sample, { ksize: 5 })).toEqual({ ksize: 5, mode: "reflect" });
  });

  it("formatChannelLabel prefers output color space", () => {
    expect(formatChannelLabel(3, "Grayscale")).toBe("Grayscale");
    expect(formatChannelLabel(3, null)).toBe("3 · RGB");
  });

  it("operationDefaults mirrors registry defaults", () => {
    expect(operationDefaults(sample)).toEqual({ ksize: 3, mode: "reflect" });
  });
});
