import { expect, test } from "@playwright/test";

test("create and search a note", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "New note" }).fill("Synthetic note");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByText("Synthetic note")).toBeVisible();
  await page.getByRole("searchbox", { name: "Search notes" }).fill("Synthetic");
  await expect(page.getByText("Synthetic note")).toBeVisible();
});
