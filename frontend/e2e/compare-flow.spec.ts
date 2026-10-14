import { expect, test } from "@playwright/test";
import path from "node:path";

const fixture = path.join(__dirname, "fixtures", "tiny.png");

test("compare mode runs two arms and shows metrics table", async ({ page }) => {
  await page.goto("/");
  await page.locator("#image-file").setInputFiles(fixture);
  await page.getByRole("navigation", { name: "Lab workspace" }).getByRole("button", { name: "Compare" }).click();
  await page.getByRole("button", { name: "Run comparison" }).click();

  await expect(page.locator(".viewers").getByRole("heading", { name: "Original · reference" })).toBeVisible();
  await expect(page.locator(".viewers").getByRole("heading", { name: /Result A/ })).toBeVisible();
  await expect(page.locator(".viewers").getByRole("heading", { name: /Result B/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Metrics vs original" })).toBeVisible();
  await expect(page.locator("table").getByText("SSIM")).toBeVisible();
});
