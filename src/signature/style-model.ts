export const lineKeys = ["name", "role", "phone", "email", "website", "linkedin", "instagram"] as const;

export type LineKey = (typeof lineKeys)[number];

export const contactKeys = ["email", "website", "linkedin", "instagram"] as const;

export type ContactKey = (typeof contactKeys)[number];

export const fontWeights = [400, 500, 600, 700, 800] as const;

export type FontWeight = (typeof fontWeights)[number];

export type TextStyle = {
  fontSize: number;
  fontWeight: FontWeight;
  lineHeight: number;
  letterSpacing: number;
  spacingTop: number;
  indent: number;
  italic: boolean;
  uppercase: boolean;
  color?: string;
};

export const textStyleLimits = {
  fontSize: { min: 8, max: 72 },
  lineHeight: { min: 0.8, max: 2 },
  letterSpacing: { min: -3, max: 10 },
  spacingTop: { min: 0, max: 60 },
  indent: { min: 0, max: 120 }
} as const;

export const textAlignments = ["left", "center", "right"] as const;

export type TextAlignment = (typeof textAlignments)[number];

export const arrangements = ["logos-left", "logos-right", "logos-top"] as const;

export type Arrangement = (typeof arrangements)[number];

export const dividerStyles = ["solid", "dashed", "dotted"] as const;

export type DividerStyle = (typeof dividerStyles)[number];

export type DividerSettings = {
  show: boolean;
  thickness: number;
  style: DividerStyle;
  heightMode: "auto" | "fixed";
  length: number;
  gapBefore: number;
  gapAfter: number;
};

export type LayoutSettings = {
  arrangement: Arrangement;
  textAlign: TextAlignment;
  paddingX: number;
  paddingY: number;
};

export const dividerLimits = {
  thickness: { min: 1, max: 12 },
  length: { min: 10, max: 600 },
  gap: { min: 0, max: 80 }
} as const;

export const layoutLimits = {
  padding: { min: 0, max: 80 }
} as const;

export function defaultTextStyle(key: LineKey): TextStyle {
  if (key === "name") {
    return { fontSize: 22, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0, spacingTop: 0, indent: 0, italic: false, uppercase: false };
  }
  if (key === "role") {
    return { fontSize: 14, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0, spacingTop: 4, indent: 0, italic: false, uppercase: false };
  }
  return { fontSize: 13, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, spacingTop: 2, indent: 0, italic: false, uppercase: false };
}

export function defaultTextStyles(): Record<LineKey, TextStyle> {
  return {
    name: defaultTextStyle("name"),
    role: defaultTextStyle("role"),
    phone: defaultTextStyle("phone"),
    email: defaultTextStyle("email"),
    website: defaultTextStyle("website"),
    linkedin: defaultTextStyle("linkedin"),
    instagram: defaultTextStyle("instagram")
  };
}

export function defaultDivider(): DividerSettings {
  return { show: true, thickness: 2, style: "solid", heightMode: "auto", length: 100, gapBefore: 20, gapAfter: 16 };
}

export function defaultLayout(): LayoutSettings {
  return { arrangement: "logos-left", textAlign: "left", paddingX: 16, paddingY: 14 };
}

function isOneOf<Value extends string | number>(options: readonly Value[], value: unknown): value is Value {
  return options.some(function (option) {
    return option === value;
  });
}

export function isLineKey(value: unknown): value is LineKey {
  return isOneOf(lineKeys, value);
}

export function isFontWeight(value: unknown): value is FontWeight {
  return isOneOf(fontWeights, value);
}

export function isTextAlignment(value: unknown): value is TextAlignment {
  return isOneOf(textAlignments, value);
}

export function isArrangement(value: unknown): value is Arrangement {
  return isOneOf(arrangements, value);
}

export function isDividerStyle(value: unknown): value is DividerStyle {
  return isOneOf(dividerStyles, value);
}

export function isContactKey(value: unknown): value is ContactKey {
  return isOneOf(contactKeys, value);
}
