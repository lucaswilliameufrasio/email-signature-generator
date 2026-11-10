export type Dimensions = {
  width: number;
  height: number;
};

export function buildSvgDocument(htmlContent: string, dimensions: Dimensions): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">${htmlContent}</div>
  </foreignObject>
</svg>`.trim();
}

export function buildScaledSvgDocument(htmlContent: string, dimensions: Dimensions, scale: number): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width * scale}" height="${dimensions.height * scale}">
  <foreignObject width="100%" height="100%" transform="scale(${scale})">
    <div xmlns="http://www.w3.org/1999/xhtml">${htmlContent}</div>
  </foreignObject>
</svg>`.trim();
}

export function buildHtmlDocument(htmlContent: string, language: string): string {
  return `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <title>Assinatura</title>
</head>
<body>
${htmlContent}
</body>
</html>`;
}
