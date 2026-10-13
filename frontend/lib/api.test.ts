import { afterEach, describe, expect, it, vi } from "vitest";

import { getHealth, processImage } from "./api";

describe("API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests and returns the health payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", api_version: "0.1.0" }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getHealth()).resolves.toEqual({ status: "ok", api_version: "0.1.0" });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/api/health");
  });

  it("sends an image as multipart data to the processing endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          operation_id: "color_noop",
          output_image: "cG5n",
          processing_ms: 0.01,
          request_ms: 1,
          metadata: {
            width: 1,
            height: 1,
            channels: 3,
            source_format: "PNG",
            source_file_size_bytes: 3,
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["png"], "fixture.png", { type: "image/png" });

    await expect(processImage(file)).resolves.toMatchObject({ operation_id: "color_noop" });
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:8000/api/process");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
  });
});
