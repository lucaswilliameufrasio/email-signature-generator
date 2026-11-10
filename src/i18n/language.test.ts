import { describe, expect, it } from "vitest";
import { detectLanguage, isLanguage } from "./language";

describe("detectLanguage", function () {
  it("selects English for English browser locales", function () {
    expect(detectLanguage("en-US")).toBe("en");
    expect(detectLanguage("en")).toBe("en");
  });

  it("falls back to Brazilian Portuguese for other or missing locales", function () {
    expect(detectLanguage("pt-BR")).toBe("pt-BR");
    expect(detectLanguage("es-ES")).toBe("pt-BR");
    expect(detectLanguage(undefined)).toBe("pt-BR");
  });
});

describe("isLanguage", function () {
  it("accepts only supported languages", function () {
    expect(isLanguage("en")).toBe(true);
    expect(isLanguage("pt-BR")).toBe(true);
    expect(isLanguage("fr")).toBe(false);
  });
});
