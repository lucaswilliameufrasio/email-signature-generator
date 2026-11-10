import { planLogoDraw, type LogoFrame, type Size } from "./logo-frame";

const maxCachedImages = 8;
const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(source: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(source);
  if (cached !== undefined) {
    return cached;
  }
  const loading = new Promise<HTMLImageElement>(function (resolve, reject) {
    const image = new Image();
    image.decoding = "async";
    image.onload = function () {
      resolve(image);
    };
    image.onerror = function () {
      imageCache.delete(source);
      reject(new Error("Could not load the logo image"));
    };
    image.src = source;
  });
  imageCache.set(source, loading);
  if (imageCache.size > maxCachedImages) {
    const oldestKey = imageCache.keys().next().value;
    if (oldestKey !== undefined) {
      imageCache.delete(oldestKey);
    }
  }
  return loading;
}

export function naturalSizeOf(image: HTMLImageElement): Size {
  return { width: image.naturalWidth || image.width, height: image.naturalHeight || image.height };
}

export async function bakeLogo(source: string, frame: LogoFrame, density: number): Promise<string> {
  const image = await loadImage(source);
  const plan = planLogoDraw(frame, naturalSizeOf(image));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(frame.areaWidth * density));
  canvas.height = Math.max(1, Math.round(frame.areaHeight * density));
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is not available");
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.scale(density, density);
  context.drawImage(
    image,
    plan.source.x, plan.source.y, plan.source.width, plan.source.height,
    plan.target.x, plan.target.y, plan.target.width, plan.target.height
  );
  return canvas.toDataURL("image/png");
}
