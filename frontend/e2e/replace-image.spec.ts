import { expect, test } from "@playwright/test";
import path from "node:path";

const fixture = path.join(__dirname, "fixtures", "tiny.png");

test("replacing an image clears stale compare results", async ({ page }) => {
  await page.goto("/");
  await page.locator("#image-file").setInputFiles(fixture);
  await page.getByRole("navigation", { name: "Lab workspace" }).getByRole("button", { name: "Compare" }).click();
  await page.getByRole("button", { name: "Run comparison" }).click();
  await expect(page.locator(".viewers").getByRole("heading", { name: /Result A/ })).toBeVisible();

  await page.getByRole("button", { name: "Replace image" }).click();
  await page.locator("#image-file").setInputFiles(fixture);

  await expect(page.locator(".viewers").getByRole("heading", { name: /Result A/ })).toHaveCount(0);
});
