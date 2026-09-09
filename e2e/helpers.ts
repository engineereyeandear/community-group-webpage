import { Page, expect } from "@playwright/test";

export function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;
}

export async function signUp(page: Page, email: string, displayName?: string) {
  await page.goto("/");
  await page.fill('input[name="email"]', email);
  if (displayName) {
    await page.fill('input[name="displayName"]', displayName);
  }
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/signup\/sent/);
  await page.click("text=Click here to finish signing in");
  await expect(page).toHaveURL(/\/profile/);
}
