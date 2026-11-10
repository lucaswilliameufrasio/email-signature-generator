import { expect, test } from "@playwright/test";

test("follows the system color scheme by default", async function ({ page }) {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "Sistema" })).toBeChecked();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(15, 20, 28)");

  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("an explicit choice overrides the system and persists", async function ({ page }) {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.locator(".theme-switch").getByText("Escuro").click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("radio", { name: "Escuro" })).toBeChecked();

  await page.emulateMedia({ colorScheme: "dark" });
  await page.locator(".theme-switch").getByText("Claro").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("the dark theme does not change the exported signature colors", async function ({ page }) {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");

  await expect(page.locator("#sigTable")).toHaveCSS("background-color", "rgb(243, 244, 246)");
  await expect(page.locator("#nameEl")).toHaveCSS("color", "rgb(31, 59, 115)");
});
