import { isLanguage } from "../i18n/language";
import { translations, type Language } from "../i18n/translations";
import { isImageFormat, type ImageFormat } from "../export/image-format";
import { fontOptions, isKnownFont } from "../signature/fonts";
import {
  contactKeys,
  defaultDivider,
  defaultLayout,
  defaultTextStyle,
  defaultTextStyles,
  dividerLimits,
  isArrangement,
  isDividerStyle,
  isFontWeight,
  isTextAlignment,
  layoutLimits,
  lineKeys,
  textStyleLimits,
  type ContactKey,
  type DividerSettings,
  type LayoutSettings,
  type LineKey,
  type TextStyle
} from "../signature/style-model";
import { frameLimits, isAlignment, isFitMode, type CropRect, type LogoFrame } from "../logos/logo-frame";

export const textFields = ["name", "role", "phone"] as const;

export type TextField = (typeof textFields)[number];

export type LogoLayout = "horizontal" | "vertical";

export type LogoTarget = "main" | "side";

export type LogoSlot = {
  source?: string;
  frame: LogoFrame;
};

export type SignatureState = {
  language: Language;
  name: string;
  role: string;
  phone: string;
  contacts: Record<ContactKey, string>;
  editedFields: TextField[];
  showCountryCode: boolean;
  showLabels: boolean;
  fontFamily: string;
  textStyles: Record<LineKey, TextStyle>;
  layout: LayoutSettings;
  divider: DividerSettings;
  logos: {
    showMain: boolean;
    showSide: boolean;
    layout: LogoLayout;
    main: LogoSlot;
    side: LogoSlot;
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

export function defaultFrame(target: LogoTarget): LogoFrame {
  return {
    areaWidth: target === "main" ? 160 : 90,
    areaHeight: target === "main" ? 49 : 76,
    fit: "contain",
    align: "center",
    zoom: 100,
    offsetX: 0,
    offsetY: 0
  };
}

export function updateLogo(state: SignatureState, target: LogoTarget, slot: LogoSlot): SignatureState {
  return { ...state, logos: { ...state.logos, [target]: slot } };
}

export function createDefaultState(language: Language): SignatureState {
  return {
    language,
    name: translatedDefaultText(language, "name"),
    role: translatedDefaultText(language, "role"),
    phone: translatedDefaultText(language, "phone"),
    contacts: { email: "", website: "", linkedin: "", instagram: "" },
    editedFields: [],
    showCountryCode: true,
    showLabels: true,
    fontFamily: defaultFontFamily,
    textStyles: defaultTextStyles(),
    layout: defaultLayout(),
    divider: defaultDivider(),
    logos: {
      showMain: true,
      showSide: false,
      layout: "horizontal",
      main: { frame: defaultFrame("main") },
      side: { frame: defaultFrame("side") }
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

function readDecimal(source: Record<string, unknown>, key: string, fallback: number, minimum: number, maximum: number): number {
  const value = source[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(maximum, Math.max(minimum, Math.round(value * 100) / 100));
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

function readCrop(source: Record<string, unknown>): CropRect | undefined {
  const value = source["crop"];
  if (!isRecord(value)) {
    return undefined;
  }
  const crop = {
    x: value["x"],
    y: value["y"],
    width: value["width"],
    height: value["height"]
  };
  const numbers = [crop.x, crop.y, crop.width, crop.height];
  const allValid = numbers.every(function (number) {
    return typeof number === "number" && Number.isFinite(number) && number >= 0;
  });
  if (!allValid || typeof crop.x !== "number" || typeof crop.y !== "number" || typeof crop.width !== "number" || typeof crop.height !== "number") {
    return undefined;
  }
  if (crop.width < 1 || crop.height < 1) {
    return undefined;
  }
  return { x: crop.x, y: crop.y, width: crop.width, height: crop.height };
}

function readFrame(source: Record<string, unknown>, target: LogoTarget, legacyWidth: unknown): LogoFrame {
  const defaults = defaultFrame(target);
  const widthLimits = frameLimits.areaWidth[target];
  const widthFallback = typeof legacyWidth === "number" && Number.isFinite(legacyWidth)
    ? Math.min(widthLimits.max, Math.max(widthLimits.min, Math.round(legacyWidth)))
    : defaults.areaWidth;
  const rawFit = source["fit"];
  const rawAlign = source["align"];
  const frame: LogoFrame = {
    areaWidth: readInteger(source, "areaWidth", widthFallback, widthLimits.min, widthLimits.max),
    areaHeight: readInteger(source, "areaHeight", defaults.areaHeight, frameLimits.areaHeight.min, frameLimits.areaHeight.max),
    fit: isFitMode(rawFit) ? rawFit : defaults.fit,
    align: isAlignment(rawAlign) ? rawAlign : defaults.align,
    zoom: readInteger(source, "zoom", defaults.zoom, frameLimits.zoom.min, frameLimits.zoom.max),
    offsetX: readInteger(source, "offsetX", defaults.offsetX, frameLimits.offset.min, frameLimits.offset.max),
    offsetY: readInteger(source, "offsetY", defaults.offsetY, frameLimits.offset.min, frameLimits.offset.max)
  };
  const crop = readCrop(source);
  if (crop !== undefined) {
    frame.crop = crop;
  }
  return frame;
}

function readTextStyle(source: Record<string, unknown>, key: LineKey): TextStyle {
  const defaults = defaultTextStyle(key);
  const rawWeight = source["fontWeight"];
  const style: TextStyle = {
    fontSize: readInteger(source, "fontSize", defaults.fontSize, textStyleLimits.fontSize.min, textStyleLimits.fontSize.max),
    fontWeight: isFontWeight(rawWeight) ? rawWeight : defaults.fontWeight,
    lineHeight: readDecimal(source, "lineHeight", defaults.lineHeight, textStyleLimits.lineHeight.min, textStyleLimits.lineHeight.max),
    letterSpacing: readDecimal(source, "letterSpacing", defaults.letterSpacing, textStyleLimits.letterSpacing.min, textStyleLimits.letterSpacing.max),
    spacingTop: readInteger(source, "spacingTop", defaults.spacingTop, textStyleLimits.spacingTop.min, textStyleLimits.spacingTop.max),
    indent: readInteger(source, "indent", defaults.indent, textStyleLimits.indent.min, textStyleLimits.indent.max),
    italic: readBoolean(source, "italic", defaults.italic),
    uppercase: readBoolean(source, "uppercase", defaults.uppercase)
  };
  const rawColor = source["color"];
  if (typeof rawColor === "string" && /^#[0-9a-f]{6}$/i.test(rawColor)) {
    style.color = rawColor.toLowerCase();
  }
  return style;
}

function readTextStyles(source: Record<string, unknown>): Record<LineKey, TextStyle> {
  const styles = defaultTextStyles();
  for (const key of lineKeys) {
    styles[key] = readTextStyle(readRecord(source, key), key);
  }
  return styles;
}

function readLayout(source: Record<string, unknown>): LayoutSettings {
  const defaults = defaultLayout();
  const rawArrangement = source["arrangement"];
  const rawAlign = source["textAlign"];
  return {
    arrangement: isArrangement(rawArrangement) ? rawArrangement : defaults.arrangement,
    textAlign: isTextAlignment(rawAlign) ? rawAlign : defaults.textAlign,
    paddingX: readInteger(source, "paddingX", defaults.paddingX, layoutLimits.padding.min, layoutLimits.padding.max),
    paddingY: readInteger(source, "paddingY", defaults.paddingY, layoutLimits.padding.min, layoutLimits.padding.max)
  };
}

function readDivider(source: Record<string, unknown>): DividerSettings {
  const defaults = defaultDivider();
  const rawStyle = source["style"];
  return {
    show: readBoolean(source, "show", defaults.show),
    thickness: readInteger(source, "thickness", defaults.thickness, dividerLimits.thickness.min, dividerLimits.thickness.max),
    style: isDividerStyle(rawStyle) ? rawStyle : defaults.style,
    heightMode: source["heightMode"] === "fixed" ? "fixed" : "auto",
    length: readInteger(source, "length", defaults.length, dividerLimits.length.min, dividerLimits.length.max),
    gapBefore: readInteger(source, "gapBefore", defaults.gapBefore, dividerLimits.gap.min, dividerLimits.gap.max),
    gapAfter: readInteger(source, "gapAfter", defaults.gapAfter, dividerLimits.gap.min, dividerLimits.gap.max)
  };
}

function readContacts(source: Record<string, unknown>): Record<ContactKey, string> {
  const contacts: Record<ContactKey, string> = { email: "", website: "", linkedin: "", instagram: "" };
  for (const key of contactKeys) {
    contacts[key] = readString(source, key, "");
  }
  return contacts;
}

function readSlot(logos: Record<string, unknown>, target: LogoTarget): LogoSlot {
  const slot = readRecord(logos, target);
  const legacySourceKey = target === "main" ? "mainSource" : "sideSource";
  const legacyWidthKey = target === "main" ? "mainWidth" : "sideWidth";
  const result: LogoSlot = { frame: readFrame(readRecord(slot, "frame"), target, logos[legacyWidthKey]) };
  const source = readImageSource(slot, "source") ?? readImageSource(logos, legacySourceKey);
  if (source !== undefined) {
    result.source = source;
  }
  return result;
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
    contacts: readContacts(readRecord(input, "contacts")),
    editedFields: [...new Set(editedFields)],
    showCountryCode: readBoolean(input, "showCountryCode", defaults.showCountryCode),
    showLabels: readBoolean(input, "showLabels", defaults.showLabels),
    fontFamily: isKnownFont(rawFont) ? rawFont : defaults.fontFamily,
    textStyles: readTextStyles(readRecord(input, "textStyles")),
    layout: readLayout(readRecord(input, "layout")),
    divider: readDivider(readRecord(input, "divider")),
    logos: {
      showMain: readBoolean(logos, "showMain", defaults.logos.showMain),
      showSide: readBoolean(logos, "showSide", defaults.logos.showSide),
      layout: rawLayout === "vertical" ? "vertical" : "horizontal",
      main: readSlot(logos, "main"),
      side: readSlot(logos, "side")
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

  return state;
}
