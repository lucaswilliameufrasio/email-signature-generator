import { expect, test, type Page } from "@playwright/test";

async function boxOf(page: Page, selector: string): Promise<{ x: number; y: number; width: number; height: number }> {
  const box = await page.locator(selector).boundingBox();
  if (!box) {
    throw new Error(`No bounding box for ${selector}`);
  }
  return box;
}

test.beforeEach(async function ({ page }) {
  await page.goto("/");
});

test.describe("contact fields", function () {
  test("adds optional contact lines with links in the accent color", async function ({ page }) {
    await expect(page.locator("#emailEl")).toHaveCount(0);

    await page.locator("#emailInput").fill("maria@empresa.com");
    await page.locator("#websiteInput").fill("www.empresa.com");
    await page.locator("#linkedinInput").fill("maria-silva");
    await page.locator("#instagramInput").fill("@empresa");

    await expect(page.locator("#emailEl")).toHaveText("E-mail: maria@empresa.com");
    await expect(page.locator("#emailEl a")).toHaveAttribute("href", "mailto:maria@empresa.com");
    await expect(page.locator("#emailEl a")).toHaveCSS("color", "rgb(55, 179, 126)");
    await expect(page.locator("#emailEl span")).toHaveCSS("color", "rgb(31, 59, 115)");
    await expect(page.locator("#websiteEl a")).toHaveAttribute("href", "https://www.empresa.com/");
    await expect(page.locator("#linkedinEl a")).toHaveAttribute("href", "https://www.linkedin.com/in/maria-silva");
    await expect(page.locator("#instagramEl a")).toHaveAttribute("href", "https://www.instagram.com/empresa");
    await expect(page.locator("#phoneEl a")).toHaveAttribute("href", "tel:+550000000000");
  });

  test("hides labels when disabled", async function ({ page }) {
    await page.locator("#emailInput").fill("maria@empresa.com");
    await page.locator("#showLabels").uncheck();

    await expect(page.locator("#emailEl")).toHaveText("maria@empresa.com");
    await expect(page.locator("#phoneEl")).toHaveText("+55 (00) 0000-0000");
  });

  test("copies contact links in the HTML", async function ({ page, context }) {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator("#showMainLogo").uncheck();
    await page.locator("#emailInput").fill("maria@empresa.com");
    await page.locator("#copyHtmlBtn").click();
    await page.locator("#copyDialog").getByRole("button", { name: "Continuar" }).click();

    const clipboard = await page.evaluate(async function () {
      const items = await navigator.clipboard.read();
      const htmlBlob = await items[0]?.getType("text/html");
      const textBlob = await items[0]?.getType("text/plain");
      return { html: (await htmlBlob?.text()) ?? "", text: (await textBlob?.text()) ?? "" };
    });
    expect(clipboard.html).toContain('href="mailto:maria@empresa.com"');
    expect(clipboard.text).toContain("E-mail: maria@empresa.com");
  });
});

test.describe("text style", function () {
  test("styles the selected line only", async function ({ page }) {
    await page.locator("#lineSelect").selectOption("role");
    await expect(page.locator("#lineColorHint")).toHaveText("Sem cor própria, esta linha usa a cor de destaque da paleta.");

    await page.locator("#fontSizeInput").fill("30");
    await page.locator("#fontWeightInput").selectOption("700");
    await page.locator("#italicInput").check();
    await page.locator("#uppercaseInput").check();
    await page.locator("#spacingTopInput").fill("20");
    await page.locator("#indentInput").fill("12");

    const role = page.locator("#roleEl");
    await expect(role).toHaveCSS("font-size", "30px");
    await expect(role).toHaveCSS("font-weight", "700");
    await expect(role).toHaveCSS("font-style", "italic");
    await expect(role).toHaveCSS("text-transform", "uppercase");
    await expect(role).toHaveCSS("padding-top", "20px");
    await expect(role).toHaveCSS("padding-left", "12px");
    await expect(page.locator("#fontSizeValue")).toHaveText("30px");
    await expect(page.locator("#nameEl")).toHaveCSS("font-size", "46px");
  });

  test("overrides and restores the line color", async function ({ page }) {
    await page.locator("#lineSelect").selectOption("name");
    await expect(page.locator("#lineColorInput")).toBeDisabled();
    await page.locator("#customColorInput").check();
    await page.locator("#lineColorInput").fill("#aa0000");

    await expect(page.locator("#nameEl")).toHaveCSS("color", "rgb(170, 0, 0)");
    await expect(page.locator("#lineColorHint")).toHaveText("");

    await page.locator("#paletteGrid .palette").nth(2).click();
    await expect(page.locator("#nameEl")).toHaveCSS("color", "rgb(170, 0, 0)");

    await page.getByRole("button", { name: "Restaurar estilo da linha" }).click();
    await expect(page.locator("#nameEl")).toHaveCSS("color", "rgb(15, 45, 117)");
    await expect(page.locator("#customColorInput")).not.toBeChecked();
  });
});

test.describe("divider and layout", function () {
  test("the divider follows the content height by default", async function ({ page }) {
    await page.locator("#areaHeightInput").fill("200");
    const divider = await boxOf(page, "#dividerCell");
    const logo = await boxOf(page, "#mainLogo");

    expect(divider.height).toBeGreaterThanOrEqual(logo.height);
    await expect(page.locator("#dividerCell")).toHaveCSS("border-left-width", "2px");
  });

  test("configures style, thickness and fixed length", async function ({ page }) {
    await page.locator("#dividerStyleInput").selectOption("dashed");
    await page.locator("#dividerThicknessInput").fill("5");
    await expect(page.locator("#dividerLengthInput")).toBeDisabled();
    await page.locator("#dividerHeightModeInput").selectOption("fixed");
    await page.locator("#dividerLengthInput").fill("200");

    const bar = page.locator("#dividerBar");
    await expect(bar).toHaveCSS("border-left-style", "dashed");
    await expect(bar).toHaveCSS("border-left-width", "5px");
    await expect(bar).toHaveCSS("height", "200px");
  });

  test("hides the divider", async function ({ page }) {
    await page.locator("#showDividerInput").uncheck();
    await expect(page.locator("#dividerCell")).toHaveCount(0);
    await expect(page.locator("#dividerStyleInput")).toBeDisabled();
  });

  test("places the logos to the right of the text", async function ({ page }) {
    await page.locator("#arrangementInput").selectOption("logos-right");
    const text = await boxOf(page, "#nameEl");
    const logo = await boxOf(page, "#mainLogo");
    const divider = await boxOf(page, "#dividerCell");

    expect(text.x + text.width).toBeLessThanOrEqual(divider.x + 1);
    expect(divider.x).toBeLessThan(logo.x);
  });

  test("places the logos above the text with a horizontal divider", async function ({ page }) {
    await page.locator("#arrangementInput").selectOption("logos-top");
    await page.locator("#textAlignInput").selectOption("center");
    const logo = await boxOf(page, "#mainLogo");
    const bar = await boxOf(page, "#dividerBar");
    const name = await boxOf(page, "#nameEl");
    const table = await boxOf(page, "#sigTable");

    expect(bar.y).toBeGreaterThanOrEqual(logo.y + logo.height);
    expect(name.y).toBeGreaterThanOrEqual(bar.y);
    await expect(page.locator("#dividerBar")).toHaveCSS("border-top-width", "2px");
    await expect(page.locator("#nameEl")).toHaveCSS("text-align", "center");
    expect(Math.abs(logo.x + logo.width / 2 - (table.x + table.width / 2))).toBeLessThan(3);
  });

  test("adjusts the outer margins", async function ({ page }) {
    await page.locator("#paddingXInput").fill("40");
    await page.locator("#paddingYInput").fill("5");
    const table = await boxOf(page, "#sigTable");
    const logo = await boxOf(page, "#mainLogo");

    expect(Math.round(logo.x - table.x)).toBe(40);
    await expect(page.locator("#paddingXValue")).toHaveText("40px");
  });

  test("keeps layout, divider, contacts and styles after reload", async function ({ page }) {
    await page.locator("#emailInput").fill("maria@empresa.com");
    await page.locator("#arrangementInput").selectOption("logos-top");
    await page.locator("#dividerStyleInput").selectOption("dotted");
    await page.locator("#lineSelect").selectOption("role");
    await page.locator("#fontSizeInput").fill("28");
    await page.reload();

    await expect(page.locator("#emailInput")).toHaveValue("maria@empresa.com");
    await expect(page.locator("#arrangementInput")).toHaveValue("logos-top");
    await expect(page.locator("#dividerBar")).toHaveCSS("border-top-style", "dotted");
    await expect(page.locator("#roleEl")).toHaveCSS("font-size", "28px");
  });
});
