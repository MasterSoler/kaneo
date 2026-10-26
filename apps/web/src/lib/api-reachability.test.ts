import { describe, expect, it } from "vite-plus/test";
import { isVercelProxyUpstreamMissing } from "./api-reachability";

describe("isVercelProxyUpstreamMissing", () => {
  it("detects Fly DNS misses from Vercel", () => {
    expect(
      isVercelProxyUpstreamMissing(
        "An error occurred with this application.\n\nDNS_HOSTNAME_NOT_FOUND\n",
      ),
    ).toBe(true);
  });

  it("ignores generic API JSON errors", () => {
    expect(isVercelProxyUpstreamMissing('{"message":"not found"}')).toBe(false);
  });
});
