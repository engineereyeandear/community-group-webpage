import { test, expect } from "@playwright/test";
import { uniqueEmail, signUp, signUpWithPassword, signOut, logIn } from "./helpers";

test.describe("password login", () => {
  test("a member can set a password at signup and log in with it directly", async ({ page }) => {
    const email = uniqueEmail("pwuser");
    const password = "SuperSecret123";

    await signUpWithPassword(page, email, "Password User", password);
    await signOut(page);

    await page.click("text=Log in");
    await expect(page).toHaveURL(/\/login/);
    await logIn(page, email, password);

    await expect(page).toHaveURL(/\/profile/);
    await expect(page.locator("h1")).toContainText("Welcome, Password User");
  });

  test("logging in with the wrong password shows an error", async ({ page }) => {
    const email = uniqueEmail("wrongpw");
    const password = "CorrectHorse1";

    await signUpWithPassword(page, email, "Wrong Password User", password);
    await signOut(page);

    await logIn(page, email, "totally-wrong-password");

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("text=Incorrect email or password")).toBeVisible();
  });

  test("a member who signed up without a password cannot log in with one", async ({ page }) => {
    const email = uniqueEmail("nopw");

    await signUp(page, email, "No Password User");
    await signOut(page);

    await logIn(page, email, "whatever-password");

    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("text=Incorrect email or password")).toBeVisible();
  });

  test("a member who signed in via email link can add a password from their profile and then log in with it", async ({
    page,
  }) => {
    const email = uniqueEmail("addpw");
    const password = "AddedPassword789";

    await signUp(page, email, "Add Password User");

    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.click('button:has-text("Save password")');
    await expect(page.locator("text=Password saved.")).toBeVisible();

    await signOut(page);
    await logIn(page, email, password);

    await expect(page).toHaveURL(/\/profile/);
    await expect(page.locator("h1")).toContainText("Welcome, Add Password User");
  });
});

test.describe("forgot password", () => {
  test("a member can reset a forgotten password and log in with the new one", async ({ page }) => {
    const email = uniqueEmail("forgot");
    const oldPassword = "OldPassword123";
    const newPassword = "BrandNewPassword456";

    await signUpWithPassword(page, email, "Forgetful User", oldPassword);
    await signOut(page);

    await page.goto("/login");
    await page.click("text=Forgot password?");
    await expect(page).toHaveURL(/\/forgot-password$/);
    await page.fill('input[name="email"]', email);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/forgot-password\/sent/);

    await page.click("text=Click here to reset your password");
    await expect(page).toHaveURL(/\/reset-password\//);
    await page.fill('input[name="password"]', newPassword);
    await page.fill('input[name="confirmPassword"]', newPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/);

    await logIn(page, email, oldPassword);
    await expect(page.locator("text=Incorrect email or password")).toBeVisible();

    await logIn(page, email, newPassword);
    await expect(page).toHaveURL(/\/profile/);
  });

  test("requesting a reset for an unknown email does not reveal whether the account exists", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page.fill('input[name="email"]', uniqueEmail("doesnotexist"));
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/forgot-password\/sent/);
    await expect(page.locator("text=Click here to reset your password")).toHaveCount(0);
  });
});
