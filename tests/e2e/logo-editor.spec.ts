import path from "node:path";
import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const twoColors = path.join(import.meta.dirname, "fixtures", "two-colors.png");

type Rgba = [number, number, number, number];

async function pixelAt(page: Page, selector: string, relativeX: number, relativeY: number): Promise<Rgba> {
  return page.locator(selector).evaluate(async function (element, position) {
    if (!(element instanceof HTMLImageElement)) {
      throw new Error("Expected an image");
    }
    await element.decode();
    const canvas = document.createElement("canvas");
    canvas.width = element.naturalWidth;
    canvas.height = element.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No canvas context");
    }
    context.drawImage(element, 0, 0);
    const x = Math.min(canvas.width - 1, Math.floor(position.relativeX * canvas.width));
    const y = Math.min(canvas.height - 1, Math.floor(position.relativeY * canvas.height));
    const data = context.getImageData(x, y, 1, 1).data;
    return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0, data[3] ?? 0] as [number, number, number, number];
  }, { relativeX, relativeY });
}

function colorName(pixel: Rgba): string {
  const [red, green, blue, alpha] = pixel;
  if (alpha < 40) {
    return "transparent";
  }
  if (red > 150 && blue < 100) {
    return "red";
  }
  if (blue > 150 && red < 100) {
    return "blue";
  }
  return `other(${red},${green},${blue},${alpha})`;
}

async function expectColor(page: Page, relativeX: number, relativeY: number, expected: string): Promise<void> {
  await expect.poll(async function () {
    return colorName(await pixelAt(page, "#mainLogo", relativeX, relativeY));
  }).toBe(expected);
}

async function savedMainFrame(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(function () {
    const saved = JSON.parse(localStorage.getItem("email-signature-generator:state:v1") ?? "{}");
    return saved.logos.main.frame;
  });
}

test.beforeEach(async function ({ page }) {
  await page.goto("/");
  await page.locator("#logoFileInput").setInputFiles(twoColors);
  await expect(page.locator("#exportStatus")).toHaveText("Logo carregada com sucesso.");
});

test("fits the area to the uploaded logo", async function ({ page }) {
  await expect(page.locator("#areaHeightInput")).toHaveValue("130");
  await expect(page.locator("#mainLogo")).toHaveCSS("height", "130px");
  await expectColor(page, 0.25, 0.5, "red");
  await expectColor(page, 0.75, 0.5, "blue");
});

test("keeps the occupied area separate from the logo size", async function ({ page }) {
  await page.locator("#zoomInput").fill("50");

  await expect(page.locator("#mainLogo")).toHaveCSS("width", "260px");
  await expect(page.locator("#mainLogo")).toHaveCSS("height", "130px");
  await expect(page.locator("#zoomValue")).toHaveText("50%");
  await expectColor(page, 0.1, 0.5, "transparent");
  await expectColor(page, 0.4, 0.5, "red");
  await expectColor(page, 0.6, 0.5, "blue");
});

test("aligns and nudges the logo inside the area", async function ({ page }) {
  await page.locator("#zoomInput").fill("50");
  await page.getByRole("button", { name: "Esquerda", exact: true }).click();

  await expect(page.getByRole("button", { name: "Esquerda", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expectColor(page, 0.1, 0.5, "red");
  await expectColor(page, 0.75, 0.5, "transparent");

  await page.locator("#offsetXInput").fill("130");
  await expect(page.locator("#offsetXValue")).toHaveText("130px");
  await expectColor(page, 0.1, 0.5, "transparent");
  await expectColor(page, 0.9, 0.5, "blue");
});

test("fills the area when cover is selected", async function ({ page }) {
  await page.locator("#areaHeightInput").fill("40");
  await expectColor(page, 0.1, 0.5, "transparent");

  await page.locator("#fitModeInput").selectOption("cover");
  await expectColor(page, 0.1, 0.5, "red");
  await expectColor(page, 0.9, 0.5, "blue");
});

test("crops the logo interactively", async function ({ page }) {
  await page.getByRole("button", { name: "Cortar imagem" }).click();
  const dialog = page.locator("#cropDialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("cropper-selection")).toBeAttached();

  await dialog.getByRole("button", { name: "1:1" }).click();
  await expect(dialog.getByRole("button", { name: "1:1" })).toHaveAttribute("aria-pressed", "true");
  await dialog.getByRole("button", { name: "Aplicar corte" }).click();
  await expect(dialog).toBeHidden();

  await expect.poll(async function () {
    const frame = await savedMainFrame(page);
    return frame["crop"];
  }).toEqual({ x: 10, y: 0, width: 20, height: 20 });
  await expectColor(page, 0.1, 0.5, "transparent");
  await expectColor(page, 0.4, 0.5, "red");
  await expectColor(page, 0.6, 0.5, "blue");
  await expect(page.getByRole("button", { name: "Remover corte" })).toBeVisible();

  await page.getByRole("button", { name: "Remover corte" }).click();
  await expectColor(page, 0.1, 0.5, "red");
  await expect(page.getByRole("button", { name: "Remover corte" })).toBeHidden();
});

test("cancelling the crop keeps the logo unchanged", async function ({ page }) {
  await page.getByRole("button", { name: "Cortar imagem" }).click();
  const dialog = page.locator("#cropDialog");
  await dialog.getByRole("button", { name: "1:1" }).click();
  await dialog.getByRole("button", { name: "Cancelar" }).click();

  await expect(dialog).toBeHidden();
  expect((await savedMainFrame(page))["crop"]).toBeUndefined();
});

test("resets the framing but keeps the area", async function ({ page }) {
  await page.locator("#zoomInput").fill("50");
  await page.locator("#offsetYInput").fill("-20");
  await page.locator("#fitModeInput").selectOption("cover");
  await page.getByRole("button", { name: "Restaurar enquadramento" }).click();

  await expect(page.locator("#zoomInput")).toHaveValue("100");
  await expect(page.locator("#offsetYInput")).toHaveValue("0");
  await expect(page.locator("#fitModeInput")).toHaveValue("contain");
  await expect(page.locator("#areaHeightInput")).toHaveValue("130");
});

test("edits the secondary logo independently", async function ({ page }) {
  await page.locator(".segmented").getByText("Logo secundária").click();
  await page.locator("#areaWidthInput").fill("200");

  await expect(page.locator("#showSideLogo")).not.toBeChecked();
  await expect(page.locator("#sideLogo")).toHaveCSS("width", "200px");
  await expect(page.locator("#mainLogo")).toHaveCSS("width", "260px");

  await page.locator("#logoFileInput").setInputFiles(twoColors);
  await expect(page.locator("#showSideLogo")).toBeChecked();
  await expect(page.locator("#sideLogo")).toHaveCSS("height", "100px");

  await page.locator(".segmented").getByText("Logo principal").click();
  await expect(page.locator("#areaWidthInput")).toHaveValue("260");
});

test("exports images with explicit dimensions", async function ({ page }) {
  await page.locator("#areaWidthInput").fill("200");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#downloadHtmlBtn").click();
  const download = await downloadPromise;
  const htmlContent = (await readFile(await download.path())).toString("utf-8");

  expect(htmlContent).toMatch(/<img[^>]*width="200"[^>]*height="130"/);
});

test("offers the adjusted logo for hosting in the copy flow", async function ({ page }) {
  await page.locator("#copyHtmlBtn").click();
  const dialog = page.locator("#copyDialog");
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await dialog.getByRole("button", { name: "Sim, tenho a URL" }).click();
  await expect(dialog.getByRole("button", { name: "Baixar logo secundária ajustada" })).toBeHidden();

  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Baixar logo principal ajustada" }).click();
  const download = await downloadPromise;
  const content = await readFile(await download.path());

  expect(download.suggestedFilename()).toBe("logo-principal.png");
  expect(content.subarray(1, 4).toString("ascii")).toBe("PNG");
  expect(content.readUInt32BE(16)).toBe(780);
  expect(content.readUInt32BE(20)).toBe(390);
});
