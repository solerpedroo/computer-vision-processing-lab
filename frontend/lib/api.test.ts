import { afterEach, describe, expect, it, vi } from "vitest";

import { getHealth } from "./api";

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
});
