import { test, expect } from "@playwright/test";
import { signUp, uniqueEmail } from "./helpers";

test("a new visitor can sign up with email and reach their profile", async ({ page }) => {
  const email = uniqueEmail("signup");
  await signUp(page, email, "Test Member");
  await expect(page.locator("h1")).toContainText("Welcome, Test Member");
  await expect(page.locator("text=" + email)).toBeVisible();
});
