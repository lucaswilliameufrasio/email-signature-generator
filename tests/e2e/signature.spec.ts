import path from "node:path";
import { expect, test } from "@playwright/test";

const logoFixture = path.join(import.meta.dirname, "fixtures", "logo.png");

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

test("keeps the area code when the number has no country code", async function ({ page }) {
  await page.locator("#phoneInput").fill("11 91234-5678");
  await page.locator("#showCountryCode").uncheck();
  await expect(page.locator("#phoneEl")).toHaveText("Telefone: 11 91234-5678");
});

test("hides empty lines instead of showing labels", async function ({ page }) {
  await page.locator("#phoneInput").fill("");
  await page.locator("#roleInput").fill("");

  await expect(page.locator("#phoneEl")).toBeHidden();
  await expect(page.locator("#roleEl")).toBeHidden();
  await expect(page.locator("#nameEl")).toBeVisible();
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
  await expect(page.locator("#roleEl")).toHaveCSS("color", "rgb(47, 124, 255)");
  await expect(page.locator("#sigTable")).toHaveCSS("background-color", "rgb(245, 248, 255)");
});

test("paints the role with the accent color and explains where each color is used", async function ({ page }) {
  await page.locator("#accentColorInput").fill("#ff0000");

  await expect(page.locator("#roleEl")).toHaveCSS("color", "rgb(255, 0, 0)");
  await expect(page.locator("#nameEl")).toHaveCSS("color", "rgb(31, 59, 115)");
  await expect(page.locator("#accentColorUsage")).toHaveText("Usada em: cargo");
  await expect(page.locator("#textColorUsage")).toHaveText("Usada em: nome e telefone");
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

test("resizes the main logo area", async function ({ page }) {
  await page.locator("#areaWidthInput").fill("300");
  await expect(page.locator("#mainLogo")).toHaveCSS("width", "300px");
  await expect(page.locator("#areaWidthValue")).toHaveText("300px");
});

test("keeps the logo area value after switching language", async function ({ page }) {
  await page.locator("#langSelect").selectOption("en");
  await page.locator("#areaWidthInput").fill("300");

  await expect(page.locator("label[for='areaWidthInput']")).toHaveText("Width: 300px");
});

test("uploads a custom logo", async function ({ page }) {
  await page.locator("#logoFileInput").setInputFiles(logoFixture);

  await expect(page.locator("#mainLogo")).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect(page.locator("#mainLogoClone")).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect(page.locator("#exportStatus")).toHaveText("Logo carregada com sucesso.");
});

test("resets every field to its default", async function ({ page }) {
  await page.locator("#nameInput").fill("Maria Silva");
  await page.locator("#paletteGrid .palette").nth(2).click();
  await page.locator("#showSideLogo").check();
  page.once("dialog", async function (dialog) {
    expect(dialog.message()).toContain("Resetar apaga a assinatura salva");
    await dialog.accept();
  });
  await page.locator("#resetBtn").click();

  await expect(page.locator("#nameEl")).toHaveText("Nome Sobrenome");
  await expect(page.locator("#textColorInput")).toHaveValue("#1f3b73");
  await expect(page.locator("#sideLogo")).toBeHidden();
});

test.describe("with an English browser", function () {
  test.use({ locale: "en-US" });

  test("detects English on load", async function ({ page }) {
    await expect(page.locator("#langSelect")).toHaveValue("en");
    await expect(page.locator("#nameEl")).toHaveText("John Doe");
  });
});
