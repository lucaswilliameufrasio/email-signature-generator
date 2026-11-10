import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

type DownloadedFile = {
  filename: string;
  content: Buffer;
};

async function downloadWith(page: Page, buttonSelector: string): Promise<DownloadedFile> {
  const downloadPromise = page.waitForEvent("download");
  await page.locator(buttonSelector).click();
  const download = await downloadPromise;
  return { filename: download.suggestedFilename(), content: await readFile(await download.path()) };
}

function pngWidth(content: Buffer): number {
  return content.readUInt32BE(16);
}

test.beforeEach(async function ({ page }) {
  await page.goto("/");
});

test("downloads PNG at the selected scale", async function ({ page }) {
  const tableWidth = await page.locator("#sigTable").evaluate(function (element) {
    return element.getBoundingClientRect().width;
  });

  await page.locator("#exportScaleInput").selectOption("1");
  const singleScale = await downloadWith(page, "#downloadImageBtn");
  await page.locator("#exportScaleInput").selectOption("3");
  const tripleScale = await downloadWith(page, "#downloadImageBtn");

  expect(singleScale.filename).toBe("assinatura.png");
  expect(singleScale.content.subarray(1, 4).toString("ascii")).toBe("PNG");
  expect(Math.abs(pngWidth(singleScale.content) - tableWidth)).toBeLessThanOrEqual(1);
  expect(Math.abs(pngWidth(tripleScale.content) - tableWidth * 3)).toBeLessThanOrEqual(3);
  await expect(page.locator("#exportStatus")).toContainText("PNG, 3x");
});

test("downloads JPG", async function ({ page }) {
  await page.locator("#exportFormatInput").selectOption("jpeg");
  const file = await downloadWith(page, "#downloadImageBtn");

  expect(file.filename).toBe("assinatura.jpg");
  expect([...file.content.subarray(0, 3)]).toEqual([0xff, 0xd8, 0xff]);
});

test("downloads WebP smaller than PNG", async function ({ page }) {
  const pngFile = await downloadWith(page, "#downloadImageBtn");
  await page.locator("#exportFormatInput").selectOption("webp");
  const webpFile = await downloadWith(page, "#downloadImageBtn");

  expect(webpFile.filename).toBe("assinatura.webp");
  expect(webpFile.content.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(webpFile.content.subarray(8, 12).toString("ascii")).toBe("WEBP");
  expect(webpFile.content.length).toBeLessThan(pngFile.content.length);
});

test("downloads SVG", async function ({ page }) {
  await page.locator("#exportFormatInput").selectOption("svg");
  await expect(page.locator("#exportScaleInput")).toBeDisabled();
  const file = await downloadWith(page, "#downloadImageBtn");

  expect(file.filename).toBe("assinatura.svg");
  expect(file.content.toString("utf-8")).toContain("<svg");
});

test("shows quality only for lossy formats and warns about WebP", async function ({ page }) {
  await expect(page.locator("#qualityField")).toBeHidden();
  await expect(page.locator("#webpWarning")).toBeHidden();

  await page.locator("#exportFormatInput").selectOption("jpeg");
  await expect(page.locator("#qualityField")).toBeVisible();
  await expect(page.locator("#webpWarning")).toBeHidden();

  await page.locator("#exportFormatInput").selectOption("webp");
  await expect(page.locator("#qualityField")).toBeVisible();
  await expect(page.locator("#webpWarning")).toContainText("Outlook");

  await page.locator("#exportQualityInput").fill("70");
  await expect(page.locator("#qualityValueLabel")).toHaveText("70%");
});

test("lower WebP quality produces a smaller file", async function ({ page }) {
  await page.locator("#exportFormatInput").selectOption("webp");
  await page.locator("#exportQualityInput").fill("100");
  const highQuality = await downloadWith(page, "#downloadImageBtn");
  await page.locator("#exportQualityInput").fill("50");
  const lowQuality = await downloadWith(page, "#downloadImageBtn");

  expect(lowQuality.content.length).toBeLessThan(highQuality.content.length);
});

test("exports HTML without hidden elements or editor ids", async function ({ page }) {
  await page.locator("#nameInput").fill("Maria Silva");
  const file = await downloadWith(page, "#downloadHtmlBtn");
  const htmlContent = file.content.toString("utf-8");

  expect(file.filename).toBe("assinatura.html");
  expect(htmlContent).toContain('<html lang="pt-BR">');
  expect(htmlContent).toContain("<title>Assinatura</title>");
  expect(htmlContent).toContain("Maria Silva");
  expect(htmlContent).not.toContain("display: none");
  expect(htmlContent).not.toContain('id="');
  expect(htmlContent.match(/<img /g)?.length).toBe(1);
  await expect(page.locator("#exportStatus")).toHaveText("HTML baixado.");
});

test.describe("with an English browser", function () {
  test.use({ locale: "en-US" });

  test("uses English file names", async function ({ page }) {
    const imageFile = await downloadWith(page, "#downloadImageBtn");
    const htmlFile = await downloadWith(page, "#downloadHtmlBtn");

    expect(imageFile.filename).toBe("signature.png");
    expect(htmlFile.filename).toBe("signature.html");
    expect(htmlFile.content.toString("utf-8")).toContain("<title>Signature</title>");
    await expect(page.locator("#exportStatus")).toHaveText("HTML downloaded.");
  });
});
