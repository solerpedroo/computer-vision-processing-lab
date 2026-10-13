import { describe, expect, it } from "vitest";

import { formatBytes, imageMetadata } from "./image";

describe("image metadata", () => {
  it("records browser file details and decoded dimensions", () => {
    const metadata = imageMetadata(
      { name: "sample.png", size: 1_572_864, type: "image/png" },
      { width: 640, height: 480 },
    );

    expect(metadata).toEqual({
      fileName: "sample.png",
      fileSizeBytes: 1_572_864,
      mediaType: "image/png",
      width: 640,
      height: 480,
      channels: 3,
    });
    expect(formatBytes(metadata.fileSizeBytes)).toBe("1.50 MiB");
  });
});
