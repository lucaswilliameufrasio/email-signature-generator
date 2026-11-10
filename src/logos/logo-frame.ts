export const fitModes = ["contain", "cover"] as const;

export type FitMode = (typeof fitModes)[number];

export const alignments = [
  "top-left", "top", "top-right",
  "left", "center", "right",
  "bottom-left", "bottom", "bottom-right"
] as const;

export type Alignment = (typeof alignments)[number];

export type Size = {
  width: number;
  height: number;
};

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LogoFrame = {
  areaWidth: number;
  areaHeight: number;
  fit: FitMode;
  align: Alignment;
  zoom: number;
  offsetX: number;
  offsetY: number;
  crop?: CropRect;
};

export type DrawPlan = {
  source: CropRect;
  target: CropRect;
};

export const frameLimits = {
  areaWidth: { main: { min: 40, max: 520 }, side: { min: 40, max: 300 } },
  areaHeight: { min: 20, max: 240 },
  zoom: { min: 10, max: 400 },
  offset: { min: -300, max: 300 }
} as const;

export function isFitMode(value: unknown): value is FitMode {
  return fitModes.some(function (mode) {
    return mode === value;
  });
}

export function isAlignment(value: unknown): value is Alignment {
  return alignments.some(function (alignment) {
    return alignment === value;
  });
}

function alignmentFactors(align: Alignment): { horizontal: number; vertical: number } {
  const horizontal = align.endsWith("left") ? 0 : align.endsWith("right") ? 1 : 0.5;
  const vertical = align.startsWith("top") ? 0 : align.startsWith("bottom") ? 1 : 0.5;
  return { horizontal, vertical };
}

export function clampCrop(crop: CropRect, natural: Size): CropRect | undefined {
  const left = Math.max(0, Math.min(natural.width, Math.round(crop.x)));
  const top = Math.max(0, Math.min(natural.height, Math.round(crop.y)));
  const right = Math.max(left, Math.min(natural.width, Math.round(crop.x + crop.width)));
  const bottom = Math.max(top, Math.min(natural.height, Math.round(crop.y + crop.height)));
  if (right - left < 1 || bottom - top < 1) {
    return undefined;
  }
  if (left === 0 && top === 0 && right === natural.width && bottom === natural.height) {
    return undefined;
  }
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function sourceRect(frame: LogoFrame, natural: Size): CropRect {
  const crop = frame.crop === undefined ? undefined : clampCrop(frame.crop, natural);
  return crop ?? { x: 0, y: 0, width: natural.width, height: natural.height };
}

export function planLogoDraw(frame: LogoFrame, natural: Size): DrawPlan {
  const source = sourceRect(frame, natural);
  const widthRatio = frame.areaWidth / source.width;
  const heightRatio = frame.areaHeight / source.height;
  const baseScale = frame.fit === "cover" ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio);
  const scale = baseScale * (frame.zoom / 100);
  const width = source.width * scale;
  const height = source.height * scale;
  const factors = alignmentFactors(frame.align);
  return {
    source,
    target: {
      x: (frame.areaWidth - width) * factors.horizontal + frame.offsetX,
      y: (frame.areaHeight - height) * factors.vertical + frame.offsetY,
      width,
      height
    }
  };
}

export function areaHeightForImage(frame: LogoFrame, natural: Size): number {
  const source = sourceRect(frame, natural);
  const height = Math.round(frame.areaWidth * (source.height / source.width));
  return Math.min(frameLimits.areaHeight.max, Math.max(frameLimits.areaHeight.min, height));
}

export function resetFraming(frame: LogoFrame): LogoFrame {
  const { crop: _crop, ...rest } = frame;
  return { ...rest, fit: "contain", align: "center", zoom: 100, offsetX: 0, offsetY: 0 };
}
