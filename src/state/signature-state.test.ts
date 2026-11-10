import { describe, expect, it } from "vitest";
import { changeLanguage, createDefaultState, editText, parseState } from "./signature-state";

describe("createDefaultState", function () {
  it("uses translated default texts", function () {
    expect(createDefaultState("pt-BR").name).toBe("Nome Sobrenome");
    expect(createDefaultState("en").name).toBe("John Doe");
  });
});

describe("changeLanguage", function () {
  it("translates only the fields the user has not edited", function () {
    const edited = editText(createDefaultState("pt-BR"), "name", "Maria Silva");
    const english = changeLanguage(edited, "en");

    expect(english.language).toBe("en");
    expect(english.name).toBe("Maria Silva");
    expect(english.role).toBe("Role or Department");
    expect(english.phone).toBe("+1 (555) 000-0000");
  });
});

describe("editText", function () {
  it("records each edited field once", function () {
    const once = editText(createDefaultState("en"), "role", "Engineer");
    const twice = editText(once, "role", "Engineering");

    expect(twice.role).toBe("Engineering");
    expect(twice.editedFields).toEqual(["role"]);
  });
});

describe("parseState", function () {
  it("returns defaults for non-object input", function () {
    expect(parseState("broken", "en")).toEqual(createDefaultState("en"));
    expect(parseState(undefined, "pt-BR")).toEqual(createDefaultState("pt-BR"));
  });

  it("round trips a valid state", function () {
    const state = editText(createDefaultState("en"), "name", "Maria");
    state.logos.mainSource = "data:image/png;base64,AAAA";
    state.exportSettings = { format: "webp", scale: 3, quality: 70 };

    expect(parseState(JSON.parse(JSON.stringify(state)), "pt-BR")).toEqual(state);
  });

  it("replaces invalid values with defaults and clamps numbers", function () {
    const parsed = parseState({
      language: "fr",
      name: 42,
      fontFamily: "Comic Sans",
      editedFields: ["name", "unknown", "name"],
      logos: { layout: "diagonal", mainWidth: 5000, sideWidth: -3, mainSource: "javascript:alert(1)" },
      colors: { text: "red", accent: "#ABCDEF" },
      exportSettings: { format: "gif", scale: 7, quality: 10 }
    }, "en");
    const defaults = createDefaultState("en");

    expect(parsed.language).toBe("en");
    expect(parsed.name).toBe(defaults.name);
    expect(parsed.fontFamily).toBe(defaults.fontFamily);
    expect(parsed.editedFields).toEqual(["name"]);
    expect(parsed.logos.layout).toBe("horizontal");
    expect(parsed.logos.mainWidth).toBe(520);
    expect(parsed.logos.sideWidth).toBe(40);
    expect(parsed.logos.mainSource).toBeUndefined();
    expect(parsed.colors.text).toBe(defaults.colors.text);
    expect(parsed.colors.accent).toBe("#abcdef");
    expect(parsed.exportSettings).toEqual({ format: defaults.exportSettings.format, scale: defaults.exportSettings.scale, quality: 50 });
  });
});
