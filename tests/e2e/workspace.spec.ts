import { expect, test } from "@playwright/test";
import { reveal } from "./helpers";

test.beforeEach(async function ({ page }) {
  await page.goto("/");
});

test("switches editor tabs with mouse and keyboard", async function ({ page }) {
  await expect(page.locator("#panel-content")).toBeVisible();
  await expect(page.locator("#panel-logos")).toBeHidden();

  await page.getByRole("tab", { name: "Logos" }).click();
  await expect(page.locator("#panel-logos")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Logos" })).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Texto" })).toBeFocused();
  await expect(page.locator("#panel-text")).toBeVisible();

  await page.keyboard.press("End");
  await expect(page.locator("#panel-layout")).toBeVisible();
  await page.keyboard.press("Home");
  await expect(page.locator("#panel-content")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Conteúdo" })).toHaveAttribute("tabindex", "0");
  await expect(page.getByRole("tab", { name: "Logos" })).toHaveAttribute("tabindex", "-1");
});

test("keeps fine-tuning collapsed until asked", async function ({ page }) {
  await page.getByRole("tab", { name: "Logos" }).click();
  await expect(page.locator("#zoomInput")).toBeHidden();
  await page.locator("#panel-logos summary").getByText("Ajuste fino").click();
  await expect(page.locator("#zoomInput")).toBeVisible();
});

test("shows the signature size and warns above 600px", async function ({ page }) {
  await expect(page.locator("#signatureSize")).toContainText("dentro do limite de 600px");
  await expect(page.locator("#signatureSize")).toHaveAttribute("data-state", "ok");

  await (await reveal(page, "#areaWidthInput")).fill("520");
  await expect(page.locator("#signatureSize")).toContainText("mais largo que 600px");
  await expect(page.locator("#signatureSize")).toHaveAttribute("data-state", "warning");
});

test("previews the signature on a dark email background without recoloring it", async function ({ page }) {
  await page.locator(".stage-toolbar").getByText("Escuro").click();

  await expect(page.locator("#emailFrame")).toHaveAttribute("data-background", "dark");
  await expect(page.locator("#emailFrame")).toHaveCSS("background-color", "rgb(31, 31, 31)");
  await expect(page.locator("#sigTable")).toHaveCSS("background-color", "rgb(243, 244, 246)");
});

test("default signature follows email signature guidance", async function ({ page }) {
  const width = await page.locator("#sigTable").evaluate(function (element) {
    return element.getBoundingClientRect().width;
  });
  expect(width).toBeLessThanOrEqual(600);
  await expect(page.locator("#nameEl")).toHaveCSS("font-size", "22px");
  await expect(page.locator("#roleEl")).toHaveCSS("font-size", "14px");
  await expect(page.locator("#phoneEl")).toHaveCSS("font-size", "13px");
});

test("reports export errors with an error status", async function ({ page }) {
  await page.evaluate(function () {
    HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback) {
      callback(null);
    };
  });
  await page.locator("#downloadImageBtn").click();

  await expect(page.locator("#exportStatus")).toHaveText("Não foi possível gerar a imagem.");
  await expect(page.locator("#exportStatus")).toHaveAttribute("data-kind", "error");
});

test.describe("on a phone", function () {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("keeps the preview and export actions visible while editing", async function ({ page }) {
    await page.getByRole("tab", { name: "Conteúdo" }).click();
    const instagram = page.locator("#instagramInput");
    await instagram.scrollIntoViewIfNeeded();
    await instagram.fill("@empresa");

    await expect(page.locator("#instagramEl")).toBeInViewport();
    await expect(page.locator("#downloadImageBtn")).toBeInViewport();
    await expect(page.locator("#copyHtmlBtn")).toBeInViewport();
    await expect(instagram).toBeInViewport();
  });

  test("scales a wide signature to fit the screen", async function ({ page }) {
    await (await reveal(page, "#areaWidthInput")).fill("520");
    const frame = await page.locator("#emailFrame").boundingBox();
    const signature = await page.locator("#sigTable").boundingBox();

    expect(frame).not.toBeNull();
    expect(signature).not.toBeNull();
    if (frame && signature) {
      expect(signature.x + signature.width).toBeLessThanOrEqual(frame.x + frame.width);
    }
    await expect(page.locator("#signatureSize")).toContainText("mais largo que 600px");
  });

  test("exports at the real size even when the preview is scaled", async function ({ page }) {
    await (await reveal(page, "#areaWidthInput")).fill("520");
    const naturalWidth = await page.locator("#sigTable").evaluate(function (element) {
      return element instanceof HTMLElement ? element.offsetWidth : 0;
    });
    await (await reveal(page, "#exportScaleInput")).selectOption("1");
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#downloadImageBtn").click();
    const download = await downloadPromise;
    const { readFile } = await import("node:fs/promises");
    const content = await readFile(await download.path());

    expect(Math.abs(content.readUInt32BE(16) - naturalWidth)).toBeLessThanOrEqual(1);
  });
});
