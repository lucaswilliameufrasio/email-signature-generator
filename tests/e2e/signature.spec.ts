import path from "node:path";
import { expect, test } from "@playwright/test";
import { logosAreStacked, reveal } from "./helpers";

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
  await (await reveal(page, "#nameInput")).fill("Maria Silva");
  await (await reveal(page, "#roleInput")).fill("Engenharia");
  await (await reveal(page, "#phoneInput")).fill("+55 (11) 91234-5678");

  await expect(page.locator("#nameEl")).toHaveText("Maria Silva");
  await expect(page.locator("#roleEl")).toHaveText("Engenharia");
  await expect(page.locator("#phoneEl")).toHaveText("Telefone: +55 (11) 91234-5678");
});

test("hides the country code when unchecked", async function ({ page }) {
  await (await reveal(page, "#phoneInput")).fill("+55 (11) 91234-5678");
  await (await reveal(page, "#showCountryCode")).uncheck();
  await expect(page.locator("#phoneEl")).toHaveText("Telefone: (11) 91234-5678");
});

test("keeps the area code when the number has no country code", async function ({ page }) {
  await (await reveal(page, "#phoneInput")).fill("11 91234-5678");
  await (await reveal(page, "#showCountryCode")).uncheck();
  await expect(page.locator("#phoneEl")).toHaveText("Telefone: 11 91234-5678");
});

test("hides empty lines instead of showing labels", async function ({ page }) {
  await (await reveal(page, "#phoneInput")).fill("");
  await (await reveal(page, "#roleInput")).fill("");

  await expect(page.locator("#phoneEl")).toBeHidden();
  await expect(page.locator("#roleEl")).toBeHidden();
  await expect(page.locator("#nameEl")).toBeVisible();
});

test("switches language keeping edited fields", async function ({ page }) {
  await (await reveal(page, "#nameInput")).fill("Maria Silva");
  await (await reveal(page, "#langSelect")).selectOption("en");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toHaveText("Signature Generator");
  await expect(page.locator("#nameInput")).toHaveValue("Maria Silva");
  await expect(page.locator("#roleInput")).toHaveValue("Role or Department");
  await expect(page.locator("#phoneEl")).toHaveText("Phone: +1 (555) 000-0000");
});

test("applies a palette to the signature", async function ({ page }) {
  await (await reveal(page, "#paletteGrid"), page.locator("#paletteGrid .palette").nth(2).click());

  await expect(page.locator("#textColorInput")).toHaveValue("#0f2d75");
  await expect(page.locator("#nameEl")).toHaveCSS("color", "rgb(15, 45, 117)");
  await expect(page.locator("#roleEl")).toHaveCSS("color", "rgb(47, 124, 255)");
  await expect(page.locator("#sigTable")).toHaveCSS("background-color", "rgb(245, 248, 255)");
});

test("paints the role with the accent color and explains where each color is used", async function ({ page }) {
  await (await reveal(page, "#accentColorInput")).fill("#ff0000");

  await expect(page.locator("#roleEl")).toHaveCSS("color", "rgb(255, 0, 0)");
  await expect(page.locator("#nameEl")).toHaveCSS("color", "rgb(31, 59, 115)");
  await expect(page.locator("#accentColorUsage")).toHaveText("Usada em: cargo e links (e-mail, site, redes)");
  await expect(page.locator("#textColorUsage")).toHaveText("Usada em: nome, telefone e rótulos");
});

test("changes the logo layout and visibility", async function ({ page }) {
  await (await reveal(page, "#showSideLogo")).check();
  await expect(page.locator("#sideLogo")).toBeVisible();

  await (await reveal(page, "#logoLayoutInput")).selectOption("vertical");
  await expect(page.locator("#sideLogo")).toBeVisible();
  expect(await logosAreStacked(page)).toBe(true);

  await (await reveal(page, "#showMainLogo")).uncheck();
  await (await reveal(page, "#showSideLogo")).uncheck();
  await expect(page.locator("#logosCell")).toBeHidden();
  await expect(page.locator("#dividerCell")).toBeHidden();
});

test("resizes the main logo area", async function ({ page }) {
  await (await reveal(page, "#areaWidthInput")).fill("300");
  await expect(page.locator("#mainLogo")).toHaveCSS("width", "300px");
  await expect(page.locator("#areaWidthValue")).toHaveText("300px");
});

test("keeps the logo area value after switching language", async function ({ page }) {
  await (await reveal(page, "#langSelect")).selectOption("en");
  await (await reveal(page, "#areaWidthInput")).fill("300");

  await expect(page.locator("label[for='areaWidthInput']")).toHaveText("Width 300px");
});

test("uploads a custom logo", async function ({ page }) {
  await page.locator("#logoFileInput").setInputFiles(logoFixture);

  await expect(page.locator("#mainLogo")).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect(page.locator("#mainLogo")).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect(page.locator("#exportStatus")).toHaveText("Logo carregada com sucesso.");
});

test("resets every field to its default", async function ({ page }) {
  await (await reveal(page, "#nameInput")).fill("Maria Silva");
  await (await reveal(page, "#paletteGrid"), page.locator("#paletteGrid .palette").nth(2).click());
  await (await reveal(page, "#showSideLogo")).check();
  page.once("dialog", async function (dialog) {
    expect(dialog.message()).toContain("Resetar apaga a assinatura salva");
    await dialog.accept();
  });
  await (await reveal(page, "#resetBtn")).click();

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
