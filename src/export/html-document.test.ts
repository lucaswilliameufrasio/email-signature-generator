import { describe, expect, it } from "vitest";
import { buildHtmlDocument, escapeHtml } from "./html-document";

describe("buildHtmlDocument", function () {
  it("produces a standalone document in the selected language with a title", function () {
    const htmlContent = buildHtmlDocument("<table></table>", "en", "Signature");
    expect(htmlContent.startsWith("<!doctype html>")).toBe(true);
    expect(htmlContent).toContain('<html lang="en">');
    expect(htmlContent).toContain("<title>Signature</title>");
    expect(htmlContent).toContain("<table></table>");
  });

  it("escapes the title", function () {
    expect(buildHtmlDocument("", "en", "<b>")).toContain("<title>&lt;b&gt;</title>");
  });
});

describe("escapeHtml", function () {
  it("escapes markup characters", function () {
    expect(escapeHtml('a & <b> "c"')).toBe("a &amp; &lt;b&gt; &quot;c&quot;");
  });
});
