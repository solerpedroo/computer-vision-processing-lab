import { describe, expect, it } from "vitest";

import type { Operation } from "./api";
import { groupOperationsByModule } from "./operations-ui";

const sample: Operation[] = [
  {
    id: "spatial_gaussian_blur",
    module: "spatial",
    name: "Gaussian Blur",
    description: "",
    output_kind: "image",
    requires_grayscale: false,
    params: [],
  },
  {
    id: "color_noop",
    module: "color",
    name: "No-op",
    description: "",
    output_kind: "image",
    requires_grayscale: false,
    params: [],
  },
];

describe("groupOperationsByModule", () => {
  it("orders known modules before unknown ones", () => {
    const groups = groupOperationsByModule(sample);
    expect(groups.map((group) => group.module)).toEqual(["color", "spatial"]);
    expect(groups[0]?.items[0]?.id).toBe("color_noop");
  });
});
