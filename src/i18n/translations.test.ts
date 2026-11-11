import { describe, expect, it } from "vitest";
import { languages, translations } from "./translations";

describe("translations", function () {
  it("defines the same keys for every language", function () {
    const referenceKeys = Object.keys(translations["pt-BR"]).sort();
    for (const language of languages) {
      expect(Object.keys(translations[language]).sort()).toEqual(referenceKeys);
    }
  });

  it("has no empty texts", function () {
    for (const language of languages) {
      for (const [key, text] of Object.entries(translations[language])) {
        expect(text.trim(), `${language}.${key}`).not.toBe("");
      }
    }
  });
});
