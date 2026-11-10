import { buildScaledSvgDocument, type Dimensions } from "./svg-document";

export type RasterType = "png" | "jpeg";

export type RasterRequest = {
  htmlContent: string;
  dimensions: Dimensions;
  scale: number;
  type: RasterType;
  backgroundColor: string;
};

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload = function () {
      resolve(image);
    };
    image.onerror = reject;
    image.src = source;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number | undefined): Promise<Blob | undefined> {
  return new Promise(function (resolve) {
    canvas.toBlob(function (imageBlob) {
      resolve(imageBlob ?? undefined);
    }, mimeType, quality);
  });
}

export async function renderRaster(request: RasterRequest): Promise<Blob | undefined> {
  const svgContent = buildScaledSvgDocument(request.htmlContent, request.dimensions, request.scale);
  const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const loadedImage = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = request.dimensions.width * request.scale;
    canvas.height = request.dimensions.height * request.scale;

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    if (request.type === "jpeg") {
      context.fillStyle = request.backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);

    const mimeType = request.type === "jpeg" ? "image/jpeg" : "image/png";
    const quality = request.type === "jpeg" ? 0.95 : undefined;
    return await canvasToBlob(canvas, mimeType, quality);
  } finally {
    setTimeout(function () {
      URL.revokeObjectURL(svgUrl);
    }, 500);
  }
}
