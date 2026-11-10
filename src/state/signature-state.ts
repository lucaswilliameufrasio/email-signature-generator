import { isLanguage } from "../i18n/language";
import { translations, type Language } from "../i18n/translations";
import { isImageFormat, type ImageFormat } from "../export/image-format";
import { fontOptions, isKnownFont } from "../signature/fonts";

export const textFields = ["name", "role", "phone"] as const;

export type TextField = (typeof textFields)[number];

export type LogoLayout = "horizontal" | "vertical";

export type SignatureState = {
  language: Language;
  name: string;
  role: string;
  phone: string;
  editedFields: TextField[];
  showCountryCode: boolean;
  fontFamily: string;
  logos: {
    showMain: boolean;
    showSide: boolean;
    layout: LogoLayout;
    mainWidth: number;
    sideWidth: number;
    mainSource?: string;
    sideSource?: string;
  };
  colors: {
    text: string;
    divider: string;
    accent: string;
    background: string;
  };
  exportSettings: {
    format: ImageFormat;
    scale: number;
    quality: number;
  };
};

export const logoWidthLimits = {
  main: { min: 60, max: 520 },
  side: { min: 40, max: 300 }
} as const;

export const exportScales = [1, 2, 3] as const;

export const qualityLimits = { min: 50, max: 100 } as const;

const defaultFontFamily = fontOptions[0]?.value ?? "Arial,Helvetica,sans-serif";

export function translatedDefaultText(language: Language, field: TextField): string {
  const texts = translations[language];
  if (field === "name") {
    return texts.nameValue;
  }
  if (field === "role") {
    return texts.roleValue;
  }
  return texts.phoneValue;
}

export function createDefaultState(language: Language): SignatureState {
  return {
    language,
    name: translatedDefaultText(language, "name"),
    role: translatedDefaultText(language, "role"),
    phone: translatedDefaultText(language, "phone"),
    editedFields: [],
    showCountryCode: true,
    fontFamily: defaultFontFamily,
    logos: {
      showMain: true,
      showSide: false,
      layout: "horizontal",
      mainWidth: 260,
      sideWidth: 120
    },
    colors: {
      text: "#1f3b73",
      divider: "#1f3b73",
      accent: "#37b37e",
      background: "#f3f4f6"
    },
    exportSettings: {
      format: "png",
      scale: 2,
      quality: 90
    }
  };
}

export function changeLanguage(state: SignatureState, language: Language): SignatureState {
  const nextState: SignatureState = { ...state, language };
  for (const field of textFields) {
    if (!state.editedFields.includes(field)) {
      nextState[field] = translatedDefaultText(language, field);
    }
  }
  return nextState;
}

export function editText(state: SignatureState, field: TextField, value: string): SignatureState {
  const editedFields = state.editedFields.includes(field) ? state.editedFields : [...state.editedFields, field];
  return { ...state, [field]: value, editedFields };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(source: Record<string, unknown>, key: string, fallback: string): string {
  const value = source[key];
  return typeof value === "string" ? value : fallback;
}

function readBoolean(source: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const value = source[key];
  return typeof value === "boolean" ? value : fallback;
}

function readInteger(source: Record<string, unknown>, key: string, fallback: number, minimum: number, maximum: number): number {
  const value = source[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

function readColor(source: Record<string, unknown>, key: string, fallback: string): string {
  const value = source[key];
  if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) {
    return value.toLowerCase();
  }
  return fallback;
}

function readImageSource(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  if (typeof value === "string" && value.startsWith("data:image/")) {
    return value;
  }
  return undefined;
}

function readRecord(source: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = source[key];
  return isRecord(value) ? value : {};
}

function isTextField(value: unknown): value is TextField {
  return textFields.some(function (field) {
    return field === value;
  });
}

export function parseState(input: unknown, fallbackLanguage: Language): SignatureState {
  if (!isRecord(input)) {
    return createDefaultState(fallbackLanguage);
  }
  const rawLanguage = input["language"];
  const language = typeof rawLanguage === "string" && isLanguage(rawLanguage) ? rawLanguage : fallbackLanguage;
  const defaults = createDefaultState(language);

  const rawEdited = input["editedFields"];
  const editedFields = Array.isArray(rawEdited) ? rawEdited.filter(isTextField) : [];

  const rawFont = readString(input, "fontFamily", defaults.fontFamily);
  const logos = readRecord(input, "logos");
  const colors = readRecord(input, "colors");
  const exportSettings = readRecord(input, "exportSettings");

  const rawLayout = logos["layout"];
  const rawFormat = exportSettings["format"];
  const rawScale = exportSettings["scale"];

  const state: SignatureState = {
    language,
    name: readString(input, "name", defaults.name),
    role: readString(input, "role", defaults.role),
    phone: readString(input, "phone", defaults.phone),
    editedFields: [...new Set(editedFields)],
    showCountryCode: readBoolean(input, "showCountryCode", defaults.showCountryCode),
    fontFamily: isKnownFont(rawFont) ? rawFont : defaults.fontFamily,
    logos: {
      showMain: readBoolean(logos, "showMain", defaults.logos.showMain),
      showSide: readBoolean(logos, "showSide", defaults.logos.showSide),
      layout: rawLayout === "vertical" ? "vertical" : "horizontal",
      mainWidth: readInteger(logos, "mainWidth", defaults.logos.mainWidth, logoWidthLimits.main.min, logoWidthLimits.main.max),
      sideWidth: readInteger(logos, "sideWidth", defaults.logos.sideWidth, logoWidthLimits.side.min, logoWidthLimits.side.max)
    },
    colors: {
      text: readColor(colors, "text", defaults.colors.text),
      divider: readColor(colors, "divider", defaults.colors.divider),
      accent: readColor(colors, "accent", defaults.colors.accent),
      background: readColor(colors, "background", defaults.colors.background)
    },
    exportSettings: {
      format: typeof rawFormat === "string" && isImageFormat(rawFormat) ? rawFormat : defaults.exportSettings.format,
      scale: exportScales.some(function (scale) {
        return scale === rawScale;
      }) && typeof rawScale === "number" ? rawScale : defaults.exportSettings.scale,
      quality: readInteger(exportSettings, "quality", defaults.exportSettings.quality, qualityLimits.min, qualityLimits.max)
    }
  };

  const mainSource = readImageSource(logos, "mainSource");
  const sideSource = readImageSource(logos, "sideSource");
  if (mainSource !== undefined) {
    state.logos.mainSource = mainSource;
  }
  if (sideSource !== undefined) {
    state.logos.sideSource = sideSource;
  }
  return state;
}
