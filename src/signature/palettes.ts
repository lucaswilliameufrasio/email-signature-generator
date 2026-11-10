import type { TranslationKey } from "../i18n/translations";

export type Palette = {
  name: TranslationKey;
  text: string;
  divider: string;
  accent: string;
  bg: string;
};

export const palettes: readonly Palette[] = [
  { name: "paletteCorporate", text: "#1f3b73", divider: "#1f3b73", accent: "#37b37e", bg: "#f3f4f6" },
  { name: "paletteDark", text: "#1f2937", divider: "#111827", accent: "#10b981", bg: "#f3f4f6" },
  { name: "paletteBlue", text: "#0f2d75", divider: "#0f2d75", accent: "#2f7cff", bg: "#f5f8ff" },
  { name: "paletteMinimal", text: "#202124", divider: "#202124", accent: "#34a853", bg: "#ffffff" }
];
