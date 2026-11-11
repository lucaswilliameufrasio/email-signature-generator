import type { KeyValueStorage } from "../state/storage";

export const themeStorageKey = "email-signature-generator:theme";

export const themePreferences = ["system", "light", "dark"] as const;

export type ThemePreference = (typeof themePreferences)[number];

export type ResolvedTheme = "light" | "dark";

export function isThemePreference(value: string): value is ThemePreference {
  return themePreferences.some(function (preference) {
    return preference === value;
  });
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }
  return preference;
}

export function loadThemePreference(storage: KeyValueStorage | undefined): ThemePreference {
  try {
    const stored = storage?.getItem(themeStorageKey) ?? undefined;
    if (stored !== undefined && isThemePreference(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn("Could not read the theme preference", error);
  }
  return "system";
}

export function saveThemePreference(storage: KeyValueStorage | undefined, preference: ThemePreference): void {
  try {
    storage?.setItem(themeStorageKey, preference);
  } catch (error) {
    console.warn("Could not save the theme preference", error);
  }
}
