import { expect, test } from "@playwright/test";
import path from "node:path";

const fixture = path.join(__dirname, "fixtures", "tiny.png");

test("upload, process, show timing, and offer download", async ({ page }) => {
  await page.goto("/");
  await page.locator("#image-file").setInputFiles(fixture);
  await expect(page.locator(".viewers").getByRole("heading", { name: "Original · RGB" })).toBeVisible();
  await expect(page.locator(".viewers").getByRole("heading", { name: /Processed ·/ })).toBeVisible();
  const processingRow = page.locator(".details div").filter({ hasText: "Processing" });
  await expect(processingRow.locator("strong")).toContainText(/\d/);
  await expect(page.getByRole("link", { name: "Download PNG" })).toBeVisible();
});
