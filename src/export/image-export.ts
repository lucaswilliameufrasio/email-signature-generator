import { toCanvas, toSvg } from "html-to-image";
import { describeFormat, type ImageFormat } from "./image-format";

export type ImageExportRequest = {
  node: HTMLElement;
  format: ImageFormat;
  scale: number;
  quality: number;
  backgroundColor: string;
};

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number | undefined): Promise<Blob> {
  return new Promise(function (resolve, reject) {
    canvas.toBlob(function (imageBlob) {
      if (imageBlob && imageBlob.type === mimeType) {
        resolve(imageBlob);
        return;
      }
      reject(new Error(`The browser could not encode ${mimeType}`));
    }, mimeType, quality);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function exportImage(request: ImageExportRequest): Promise<Blob> {
  const details = describeFormat(request.format);

  if (request.format === "svg") {
    const svgDataUrl = await toSvg(request.node, { backgroundColor: request.backgroundColor });
    const svgBlob = await dataUrlToBlob(svgDataUrl);
    return new Blob([svgBlob], { type: details.mimeType });
  }

  const canvas = await toCanvas(request.node, {
    pixelRatio: request.scale,
    backgroundColor: request.backgroundColor
  });
  const quality = details.usesQuality ? request.quality : undefined;
  return canvasToBlob(canvas, details.mimeType, quality);
}
