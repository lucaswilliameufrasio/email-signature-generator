import { describe, expect, it } from "vitest";
import { parseLogoUrl } from "./logo-url";

describe("parseLogoUrl", function () {
  it("accepts https addresses", function () {
    expect(parseLogoUrl(" https://example.com/logo.png ")).toEqual({ kind: "valid", url: "https://example.com/logo.png" });
  });

  it("rejects http, data and relative addresses", function () {
    expect(parseLogoUrl("http://example.com/logo.png")).toEqual({ kind: "invalid" });
    expect(parseLogoUrl("data:image/png;base64,AAAA")).toEqual({ kind: "invalid" });
    expect(parseLogoUrl("/logo.png")).toEqual({ kind: "invalid" });
    expect(parseLogoUrl("")).toEqual({ kind: "invalid" });
  });
});
