import { describe, expect, it } from "vitest";
import { areaHeightForImage, clampCrop, planLogoDraw, resetFraming, type LogoFrame } from "./logo-frame";

const baseFrame: LogoFrame = {
  areaWidth: 200,
  areaHeight: 100,
  fit: "contain",
  align: "center",
  zoom: 100,
  offsetX: 0,
  offsetY: 0
};

describe("planLogoDraw", function () {
  it("fits the whole image inside the area and centers it", function () {
    const plan = planLogoDraw(baseFrame, { width: 100, height: 100 });
    expect(plan.source).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    expect(plan.target).toEqual({ x: 50, y: 0, width: 100, height: 100 });
  });

  it("covers the area cropping the overflow", function () {
    const plan = planLogoDraw({ ...baseFrame, fit: "cover" }, { width: 100, height: 100 });
    expect(plan.target).toEqual({ x: 0, y: -50, width: 200, height: 200 });
  });

  it("aligns to corners and edges", function () {
    const natural = { width: 100, height: 100 };
    expect(planLogoDraw({ ...baseFrame, align: "left" }, natural).target.x).toBe(0);
    expect(planLogoDraw({ ...baseFrame, align: "top-right" }, natural).target.x).toBe(100);
    expect(planLogoDraw({ ...baseFrame, align: "bottom", zoom: 50 }, natural).target.y).toBe(50);
  });

  it("applies zoom and fine offsets", function () {
    const plan = planLogoDraw({ ...baseFrame, zoom: 50, offsetX: 10, offsetY: -5 }, { width: 100, height: 100 });
    expect(plan.target).toEqual({ x: 85, y: 20, width: 50, height: 50 });
  });

  it("draws only the cropped region", function () {
    const plan = planLogoDraw({ ...baseFrame, crop: { x: 50, y: 0, width: 50, height: 25 } }, { width: 100, height: 100 });
    expect(plan.source).toEqual({ x: 50, y: 0, width: 50, height: 25 });
    expect(plan.target).toEqual({ x: 0, y: 0, width: 200, height: 100 });
  });
});

describe("clampCrop", function () {
  it("keeps the crop inside the image and rounds it", function () {
    expect(clampCrop({ x: -10, y: 5.4, width: 60, height: 500 }, { width: 100, height: 50 })).toEqual({ x: 0, y: 5, width: 50, height: 45 });
  });

  it("drops empty or full-image crops", function () {
    expect(clampCrop({ x: 10, y: 10, width: 0, height: 10 }, { width: 100, height: 50 })).toBeUndefined();
    expect(clampCrop({ x: 0, y: 0, width: 100, height: 50 }, { width: 100, height: 50 })).toBeUndefined();
  });
});

describe("areaHeightForImage", function () {
  it("matches the area to the image or crop aspect ratio within limits", function () {
    expect(areaHeightForImage(baseFrame, { width: 400, height: 100 })).toBe(50);
    expect(areaHeightForImage({ ...baseFrame, crop: { x: 0, y: 0, width: 100, height: 100 } }, { width: 400, height: 100 })).toBe(200);
    expect(areaHeightForImage(baseFrame, { width: 10, height: 1000 })).toBe(240);
  });
});

describe("resetFraming", function () {
  it("restores the default framing, removes the crop and keeps the area", function () {
    const reset = resetFraming({ ...baseFrame, fit: "cover", align: "left", zoom: 150, offsetX: 4, offsetY: 3, crop: { x: 1, y: 1, width: 5, height: 5 } });
    expect(reset).toEqual(baseFrame);
  });
});
