export const imageFormats = ["png", "jpeg", "webp", "svg"] as const;

export type ImageFormat = (typeof imageFormats)[number];

type FormatDetails = {
  mimeType: string;
  extension: string;
  label: string;
  usesQuality: boolean;
  usesScale: boolean;
};

const formatDetails: Record<ImageFormat, FormatDetails> = {
  png: { mimeType: "image/png", extension: "png", label: "PNG", usesQuality: false, usesScale: true },
  jpeg: { mimeType: "image/jpeg", extension: "jpg", label: "JPG", usesQuality: true, usesScale: true },
  webp: { mimeType: "image/webp", extension: "webp", label: "WebP", usesQuality: true, usesScale: true },
  svg: { mimeType: "image/svg+xml", extension: "svg", label: "SVG", usesQuality: false, usesScale: false }
};

export function isImageFormat(value: string): value is ImageFormat {
  return imageFormats.some(function (format) {
    return format === value;
  });
}

export function describeFormat(format: ImageFormat): FormatDetails {
  return formatDetails[format];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(kilobytes < 10 ? 1 : 0)} KB`;
  }
  return `${(kilobytes / 1024).toFixed(1)} MB`;
}
