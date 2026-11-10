import { describe, expect, it } from "vitest";
import { buildHtmlDocument, buildScaledSvgDocument, buildSvgDocument } from "./svg-document";

describe("buildSvgDocument", function () {
  it("wraps the signature html in a sized foreignObject", function () {
    const svgContent = buildSvgDocument("<table></table>", { width: 300, height: 120 });
    expect(svgContent).toContain('width="300" height="120"');
    expect(svgContent).toContain('<div xmlns="http://www.w3.org/1999/xhtml"><table></table></div>');
  });
});

describe("buildScaledSvgDocument", function () {
  it("multiplies the canvas size and scales the content", function () {
    const svgContent = buildScaledSvgDocument("<table></table>", { width: 300, height: 120 }, 3);
    expect(svgContent).toContain('width="900" height="360"');
    expect(svgContent).toContain('transform="scale(3)"');
  });
});

describe("buildHtmlDocument", function () {
  it("produces a standalone document in the selected language", function () {
    const htmlContent = buildHtmlDocument("<table></table>", "en");
    expect(htmlContent.startsWith("<!doctype html>")).toBe(true);
    expect(htmlContent).toContain('<html lang="en">');
    expect(htmlContent).toContain("<table></table>");
  });
});
