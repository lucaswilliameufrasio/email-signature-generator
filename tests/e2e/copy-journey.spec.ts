import path from "node:path";
import { readFile } from "node:fs/promises";
import { captureClipboard, copiedContent, reveal } from "./helpers";
import { expect, test, type Page } from "@playwright/test";

const logoFixture = path.join(import.meta.dirname, "fixtures", "logo.png");
const hostedLogoUrl = "https://assets.example.test/logo.png";

async function readClipboardHtml(page: Page): Promise<string> {
  return (await copiedContent(page)).html;
}

test.beforeEach(async function ({ page }) {
  await captureClipboard(page);
  const logoBytes = await readFile(logoFixture);
  await page.route(hostedLogoUrl, async function (route) {
    await route.fulfill({ status: 200, contentType: "image/png", body: logoBytes });
  });
  await page.route("https://assets.example.test/missing.png", async function (route) {
    await route.fulfill({ status: 404, body: "" });
  });
  await page.goto("/");
});

test("recommends image export when the logo has no public URL", async function ({ page }) {
  await (await reveal(page, "#copyHtmlBtn")).click();
  const dialog = page.locator("#copyDialog");
  await expect(dialog).toBeVisible();

  await dialog.getByLabel("Outlook na web").check();
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await dialog.getByRole("button", { name: "Não" }).click();

  await expect(dialog.getByText("Recomendamos exportar como imagem")).toBeVisible();
  await expect(dialog.locator("#journeyImageInsert")).toContainText("Outlook na web");

  const downloadPromise = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Baixar imagem PNG" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("assinatura.png");
});

test("copies rich HTML using the hosted logo URL", async function ({ page }) {
  await page.locator("#logoFileInput").setInputFiles(logoFixture);
  await (await reveal(page, "#nameInput")).fill("Maria Silva");
  await (await reveal(page, "#copyHtmlBtn")).click();
  const dialog = page.locator("#copyDialog");

  await dialog.getByRole("button", { name: "Continuar" }).click();
  await dialog.getByRole("button", { name: "Sim, tenho a URL" }).click();
  await expect(dialog.locator("#sideLogoUrlField")).toBeHidden();
  await dialog.getByLabel("URL da logo principal").fill(hostedLogoUrl);
  await dialog.getByRole("button", { name: "Testar e copiar" }).click();

  await expect(dialog.getByText("Assinatura copiada")).toBeVisible();
  await expect(dialog.locator("#journeyPasteInstructions")).toContainText("No Gmail");
  await expect(dialog.getByText("envie um e-mail de teste")).toBeVisible();

  const clipboardHtml = await readClipboardHtml(page);
  expect(clipboardHtml).toContain(`src="${hostedLogoUrl}"`);
  expect(clipboardHtml).toContain("Maria Silva");
  expect(clipboardHtml).not.toContain("data:image");
  expect(clipboardHtml).not.toContain("display: none");
});

test("rejects addresses that are not https or do not load", async function ({ page }) {
  await (await reveal(page, "#copyHtmlBtn")).click();
  const dialog = page.locator("#copyDialog");
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await dialog.getByRole("button", { name: "Sim, tenho a URL" }).click();

  const urlInput = dialog.getByLabel("URL da logo principal");
  await urlInput.fill("http://assets.example.test/logo.png");
  await dialog.getByRole("button", { name: "Testar e copiar" }).click();
  await expect(dialog.locator("#mainLogoUrlError")).toHaveText("Use um endereço completo que comece com https://");
  await expect(urlInput).toHaveAttribute("aria-invalid", "true");

  await urlInput.fill("https://assets.example.test/missing.png");
  await dialog.getByRole("button", { name: "Testar e copiar" }).click();
  await expect(dialog.locator("#mainLogoUrlError")).toHaveText("Não foi possível carregar uma imagem neste endereço.");
  await expect(dialog.getByText("Assinatura copiada")).toBeHidden();
});

test("copies directly when no logo is shown", async function ({ page }) {
  await (await reveal(page, "#showMainLogo")).uncheck();
  await (await reveal(page, "#copyHtmlBtn")).click();
  const dialog = page.locator("#copyDialog");
  await dialog.getByLabel("Apple Mail").check();
  await dialog.getByRole("button", { name: "Continuar" }).click();

  await expect(dialog.getByText("Assinatura copiada")).toBeVisible();
  await expect(dialog.locator("#journeyPasteInstructions")).toContainText("Apple Mail");
  expect(await readClipboardHtml(page)).not.toContain("<img");
});

test("goes back and closes the dialog", async function ({ page }) {
  await (await reveal(page, "#copyHtmlBtn")).click();
  const dialog = page.locator("#copyDialog");
  await dialog.getByRole("button", { name: "Continuar" }).click();
  await dialog.getByRole("button", { name: "Voltar" }).click();
  await expect(dialog.getByText("Onde você vai usar a assinatura?")).toBeVisible();

  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await expect(dialog).toBeHidden();
});
