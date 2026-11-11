import { describe, expect, it } from "vitest";
import { describeFormat, formatFileSize, isImageFormat } from "./image-format";

describe("isImageFormat", function () {
  it("accepts the supported formats only", function () {
    for (const format of ["png", "jpeg", "webp", "svg"]) {
      expect(isImageFormat(format)).toBe(true);
    }
    expect(isImageFormat("gif")).toBe(false);
  });
});

describe("describeFormat", function () {
  it("uses quality only for lossy formats", function () {
    expect(describeFormat("jpeg").usesQuality).toBe(true);
    expect(describeFormat("webp").usesQuality).toBe(true);
    expect(describeFormat("png").usesQuality).toBe(false);
    expect(describeFormat("svg").usesQuality).toBe(false);
  });

  it("maps formats to file extensions and mime types", function () {
    expect(describeFormat("jpeg").extension).toBe("jpg");
    expect(describeFormat("webp").mimeType).toBe("image/webp");
    expect(describeFormat("svg").usesScale).toBe(false);
  });
});

describe("formatFileSize", function () {
  it("formats bytes, kilobytes and megabytes", function () {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(35 * 1024)).toBe("35 KB");
    expect(formatFileSize(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});
