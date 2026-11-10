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
    state.logos.main = {
      source: "data:image/png;base64,AAAA",
      frame: { areaWidth: 300, areaHeight: 90, fit: "cover", align: "top-left", zoom: 150, offsetX: -4, offsetY: 7, crop: { x: 10, y: 5, width: 50, height: 40 } }
    };
    state.exportSettings = { format: "webp", scale: 3, quality: 70 };

    expect(parseState(JSON.parse(JSON.stringify(state)), "pt-BR")).toEqual(state);
  });

  it("replaces invalid values with defaults and clamps numbers", function () {
    const parsed = parseState({
      language: "fr",
      name: 42,
      fontFamily: "Comic Sans",
      editedFields: ["name", "unknown", "name"],
      logos: {
        layout: "diagonal",
        main: {
          source: "javascript:alert(1)",
          frame: { areaWidth: 5000, areaHeight: -3, fit: "stretch", align: "middle", zoom: 9999, offsetX: "x", crop: { x: 1, y: 1, width: 0, height: 5 } }
        }
      },
      colors: { text: "red", accent: "#ABCDEF" },
      exportSettings: { format: "gif", scale: 7, quality: 10 }
    }, "en");
    const defaults = createDefaultState("en");

    expect(parsed.language).toBe("en");
    expect(parsed.name).toBe(defaults.name);
    expect(parsed.fontFamily).toBe(defaults.fontFamily);
    expect(parsed.editedFields).toEqual(["name"]);
    expect(parsed.logos.layout).toBe("horizontal");
    expect(parsed.logos.main.frame).toEqual({ ...defaults.logos.main.frame, areaWidth: 520, areaHeight: 20, zoom: 400 });
    expect(parsed.logos.main.source).toBeUndefined();
    expect(parsed.logos.side).toEqual(defaults.logos.side);
    expect(parsed.colors.text).toBe(defaults.colors.text);
    expect(parsed.colors.accent).toBe("#abcdef");
    expect(parsed.exportSettings).toEqual({ format: defaults.exportSettings.format, scale: defaults.exportSettings.scale, quality: 50 });
  });

  it("migrates the previous logo width and source fields", function () {
    const parsed = parseState({
      logos: { mainWidth: 300, sideWidth: 150, mainSource: "data:image/png;base64,BBBB" }
    }, "en");

    expect(parsed.logos.main.frame.areaWidth).toBe(300);
    expect(parsed.logos.side.frame.areaWidth).toBe(150);
    expect(parsed.logos.main.source).toBe("data:image/png;base64,BBBB");
    expect(parsed.logos.side.source).toBeUndefined();
  });
});
