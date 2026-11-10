import path from "node:path";
import { expect, test } from "@playwright/test";

const logoFixture = path.join(import.meta.dirname, "fixtures", "logo.png");

test.beforeEach(async function ({ page }) {
  await page.goto("/");
});

test("restores the signature after reloading", async function ({ page }) {
  await page.locator("#nameInput").fill("Maria Silva");
  await page.locator("#phoneInput").fill("");
  await page.locator("#showCountryCode").uncheck();
  await page.locator("#fontFamilyInput").selectOption({ label: "Georgia" });
  await page.locator("#paletteGrid .palette").nth(2).click();
  await page.locator("#showSideLogo").check();
  await page.locator("#logoLayoutInput").selectOption("vertical");
  await page.locator("#areaWidthInput").fill("300");
  await page.locator("#logoFileInput").setInputFiles(logoFixture);
  await page.locator("#zoomInput").fill("80");
  await page.locator("#exportFormatInput").selectOption("webp");
  await page.locator("#exportQualityInput").fill("70");
  await page.locator("#exportScaleInput").selectOption("3");

  await page.reload();

  await expect(page.locator("#nameInput")).toHaveValue("Maria Silva");
  await expect(page.locator("#nameEl")).toHaveText("Maria Silva");
  await expect(page.locator("#phoneEl")).toBeHidden();
  await expect(page.locator("#showCountryCode")).not.toBeChecked();
  await expect(page.locator("#fontFamilyInput")).toHaveValue("'Georgia',serif");
  await expect(page.locator("#textColorInput")).toHaveValue("#0f2d75");
  await expect(page.locator("#showSideLogo")).toBeChecked();
  await expect(page.locator("#logosVertical")).toBeVisible();
  await expect(page.locator("#areaWidthInput")).toHaveValue("300");
  await expect(page.locator("#zoomInput")).toHaveValue("80");
  await expect(page.locator("#mainLogoClone")).toHaveAttribute("src", /^data:image\/png;base64,/);
  await expect(page.locator("#exportFormatInput")).toHaveValue("webp");
  await expect(page.locator("#exportQualityInput")).toHaveValue("70");
  await expect(page.locator("#exportScaleInput")).toHaveValue("3");
});

test("restores the chosen language and keeps untouched fields translated", async function ({ page }) {
  await page.locator("#roleInput").fill("Engenharia");
  await page.locator("#langSelect").selectOption("en");
  await page.reload();

  await expect(page.locator("#langSelect")).toHaveValue("en");
  await expect(page.locator("h1")).toHaveText("Signature Generator");
  await expect(page.locator("#roleInput")).toHaveValue("Engenharia");
  await expect(page.locator("#nameInput")).toHaveValue("John Doe");
});

test("reset clears the saved signature", async function ({ page }) {
  await page.locator("#nameInput").fill("Maria Silva");
  page.once("dialog", async function (dialog) {
    await dialog.accept();
  });
  await page.locator("#resetBtn").click();
  await page.reload();

  await expect(page.locator("#nameInput")).toHaveValue("Nome Sobrenome");
});

test("cancelling reset keeps the signature", async function ({ page }) {
  await page.locator("#nameInput").fill("Maria Silva");
  page.once("dialog", async function (dialog) {
    await dialog.dismiss();
  });
  await page.locator("#resetBtn").click();

  await expect(page.locator("#nameEl")).toHaveText("Maria Silva");
});

test("ignores a corrupted saved signature", async function ({ page }) {
  await page.evaluate(function () {
    localStorage.setItem("email-signature-generator:state:v1", "{broken");
  });
  await page.reload();

  await expect(page.locator("#nameEl")).toHaveText("Nome Sobrenome");
});

test("keeps working when the logo is too large to save", async function ({ page }) {
  await page.evaluate(function () {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (value.includes("data:image/png")) {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      }
      originalSetItem.call(this, key, value);
    };
  });
  await page.locator("#nameInput").fill("Maria Silva");
  await page.locator("#logoFileInput").setInputFiles(logoFixture);

  await expect(page.locator("#exportStatus")).toContainText("grandes demais para salvar");
  await expect(page.locator("#mainLogo")).toHaveAttribute("src", /^data:image\/png;base64,/);

  await page.reload();
  await expect(page.locator("#nameEl")).toHaveText("Maria Silva");
  const savedSource = await page.evaluate(function () {
    const saved: unknown = JSON.parse(localStorage.getItem("email-signature-generator:state:v1") ?? "{}");
    return JSON.stringify(saved).includes("data:image/png");
  });
  expect(savedSource).toBe(false);
});
