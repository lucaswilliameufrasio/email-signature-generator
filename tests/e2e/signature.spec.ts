import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const logoFixture = path.join(import.meta.dirname, "fixtures", "logo.png");
const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

async function readDownload(page: Page, trigger: () => Promise<void>): Promise<{ filename: string; content: Buffer }> {
  const downloadPromise = page.waitForEvent("download");
  await trigger();
  const download = await downloadPromise;
  const filePath = await download.path();
  return { filename: download.suggestedFilename(), content: await readFile(filePath) };
}

test.beforeEach(async function ({ page }) {
  await page.goto("/");
});

test("renders the default signature in Portuguese", async function ({ page }) {
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(page.locator("#langSelect")).toHaveValue("pt-BR");
  await expect(page.locator("#nameEl")).toHaveText("Nome Sobrenome");
  await expect(page.locator("#roleEl")).toHaveText("Cargo ou área");
  await expect(page.locator("#phoneEl")).toHaveText("Telefone: +55 (00) 0000-0000");
  await expect(page.locator("#mainLogo")).toBeVisible();
  await expect(page.locator("#sideLogo")).toBeHidden();
  await expect(page.locator("#paletteGrid .palette")).toHaveCount(4);
});

test("updates the preview while typing", async function ({ page }) {
  await page.locator("#nameInput").fill("Maria Silva");
  await page.locator("#roleInput").fill("Engenharia");
  await page.locator("#phoneInput").fill("+55 (11) 91234-5678");

  await expect(page.locator("#nameEl")).toHaveText("Maria Silva");
  await expect(page.locator("#roleEl")).toHaveText("Engenharia");
  await expect(page.locator("#phoneEl")).toHaveText("Telefone: +55 (11) 91234-5678");
});

test("hides the country code when unchecked", async function ({ page }) {
  await page.locator("#phoneInput").fill("+55 (11) 91234-5678");
  await page.locator("#showCountryCode").uncheck();
  await expect(page.locator("#phoneEl")).toHaveText("Telefone: (11) 91234-5678");
});

test("switches language keeping edited fields", async function ({ page }) {
  await page.locator("#nameInput").fill("Maria Silva");
  await page.locator("#langSelect").selectOption("en");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toHaveText("Signature Generator");
  await expect(page.locator("#nameInput")).toHaveValue("Maria Silva");
  await expect(page.locator("#roleInput")).toHaveValue("Role or Department");
  await expect(page.locator("#phoneEl")).toHaveText("Phone: +1 (555) 000-0000");
});

test("applies a palette to the signature", async function ({ page }) {
  await page.locator("#paletteGrid .palette").nth(2).click();

  await expect(page.locator("#textColorInput")).toHaveValue("#0f2d75");
  await expect(page.locator("#nameEl")).toHaveCSS("color", "rgb(15, 45, 117)");
  await expect(page.locator("#sigTable")).toHaveCSS("background-color", "rgb(245, 248, 255)");
});

test("changes the logo layout and visibility", async function ({ page }) {
  await page.locator("#showSideLogo").check();
  await expect(page.locator("#sideLogo")).toBeVisible();

  await page.locator("#logoLayoutInput").selectOption("vertical");
  await expect(page.locator("#logosVertical")).toBeVisible();
  await expect(page.locator("#logosHorizontal")).toBeHidden();
  await expect(page.locator("#sideLogoClone")).toBeVisible();

  await page.locator("#showMainLogo").uncheck();
  await page.locator("#showSideLogo").uncheck();
  await expect(page.locator("#logosCell")).toBeHidden();
  await expect(page.locator("#dividerCell")).toBeHidden();
});

test("resizes the main logo", async function ({ page }) {
  await page.locator("#mainLogoWidthInput").fill("300");
  await expect(page.locator("#mainLogo")).toHaveCSS("width", "300px");
});

test("uploads a custom logo", async function ({ page }) {
  await page.locator("#mainLogoInput").setInputFiles(logoFixture);

  await expect(page.locator("#mainLogo")).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect(page.locator("#mainLogoClone")).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect(page.locator("#exportStatus")).toHaveText("Logo carregada com sucesso.");
});

test("resets every field to its default", async function ({ page }) {
  await page.locator("#nameInput").fill("Maria Silva");
  await page.locator("#paletteGrid .palette").nth(2).click();
  await page.locator("#showSideLogo").check();
  await page.locator("#resetBtn").click();

  await expect(page.locator("#nameEl")).toHaveText("Nome Sobrenome");
  await expect(page.locator("#textColorInput")).toHaveValue("#1f3b73");
  await expect(page.locator("#sideLogo")).toBeHidden();
});

test("downloads the signature as a PNG image", async function ({ page }) {
  const download = await readDownload(page, async function () {
    await page.locator("#downloadImageBtn").click();
  });

  expect(download.filename).toBe("assinatura.png");
  expect([...download.content.subarray(0, 8)]).toEqual(pngSignature);
});

test("downloads the signature as a standalone HTML file", async function ({ page }) {
  await page.locator("#nameInput").fill("Maria Silva");
  const download = await readDownload(page, async function () {
    await page.locator("#downloadHtmlBtn").click();
  });
  const htmlContent = download.content.toString("utf-8");

  expect(download.filename).toBe("assinatura.html");
  expect(htmlContent).toContain('<html lang="pt-BR">');
  expect(htmlContent).toContain("Maria Silva");
  await expect(page.locator("#exportStatus")).toHaveText("HTML baixado.");
});

test("copies the signature HTML to the clipboard", async function ({ page, context }) {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.locator("#nameInput").fill("Maria Silva");
  await page.locator("#copyHtmlBtn").click();

  await expect(page.locator("#exportStatus")).toHaveText("HTML copiado para a área de transferência.");
  const clipboardText = await page.evaluate(async function () {
    return navigator.clipboard.readText();
  });
  expect(clipboardText).toContain('id="sigTable"');
  expect(clipboardText).toContain("Maria Silva");
});

test.describe("with an English browser", function () {
  test.use({ locale: "en-US" });

  test("detects English on load", async function ({ page }) {
    await expect(page.locator("#langSelect")).toHaveValue("en");
    await expect(page.locator("#nameEl")).toHaveText("John Doe");
  });
});
