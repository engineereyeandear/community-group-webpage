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

export async function signUpWithPassword(
  page: Page,
  email: string,
  displayName: string,
  password: string
) {
  await page.goto("/");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="displayName"]', displayName);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/signup\/sent/);
  await page.click("text=Click here to finish signing in");
  await expect(page).toHaveURL(/\/profile/);
}

export async function signOut(page: Page) {
  await page.click('button:has-text("Sign out")');
  await expect(page).toHaveURL("/");
}

export async function logIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}
