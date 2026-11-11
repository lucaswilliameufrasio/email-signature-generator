import { describe, expect, it } from "vitest";
import { fillTemplate } from "./translations";

describe("fillTemplate", function () {
  it("replaces named placeholders", function () {
    expect(fillTemplate("Image ({format}, {scale}x)", { format: "PNG", scale: "2" })).toBe("Image (PNG, 2x)");
  });

  it("keeps unknown placeholders", function () {
    expect(fillTemplate("{missing}", {})).toBe("{missing}");
  });
});
