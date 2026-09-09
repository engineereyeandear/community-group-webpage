import { test, expect } from "@playwright/test";
import { signUp, uniqueEmail } from "./helpers";

const GROUP_NAME = "Riverside Fellowship";

test("a member can request to join a group and see it pending", async ({ page }) => {
  const email = uniqueEmail("joiner");
  await signUp(page, email, "Pending Tester");

  await page.goto("/groups");
  const groupRow = page.locator("li", { hasText: GROUP_NAME });
  await groupRow.getByRole("button", { name: "Request to join" }).click();

  await expect(page.locator("li", { hasText: GROUP_NAME })).toContainText(
    "Request pending"
  );
});
