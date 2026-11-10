import { describe, expect, it } from "vitest";
import { isThemePreference, loadThemePreference, resolveTheme, saveThemePreference, themeStorageKey } from "./theme";

function createStorage(): { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void; entries: Map<string, string> } {
  const entries = new Map<string, string>();
  return {
    entries,
    getItem: function (key) {
      return entries.get(key) ?? null;
    },
    setItem: function (key, value) {
      entries.set(key, value);
    },
    removeItem: function (key) {
      entries.delete(key);
    }
  };
}

describe("theme", function () {
  it("follows the system only when the preference is system", function () {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("validates preferences", function () {
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("sepia")).toBe(false);
  });

  it("persists the preference and ignores invalid stored values", function () {
    const storage = createStorage();
    expect(loadThemePreference(storage)).toBe("system");

    saveThemePreference(storage, "dark");
    expect(loadThemePreference(storage)).toBe("dark");

    storage.entries.set(themeStorageKey, "sepia");
    expect(loadThemePreference(storage)).toBe("system");
  });
});
