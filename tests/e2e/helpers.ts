import type { Page } from "@playwright/test";

export async function logosAreStacked(page: Page): Promise<boolean> {
  const mainBox = await page.locator("#mainLogo").boundingBox();
  const sideBox = await page.locator("#sideLogo").boundingBox();
  if (!mainBox || !sideBox) {
    return false;
  }
  return sideBox.y >= mainBox.y + mainBox.height - 1;
}
