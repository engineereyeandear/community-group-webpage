import { test, expect } from "@playwright/test";
import { signUp, uniqueEmail } from "./helpers";

const LEADER_EMAIL = "leader@example.com";
const LED_GROUP = "Grace Community Church";

test("the leader can approve a pending join request", async ({ browser }) => {
  const memberEmail = uniqueEmail("approve-me");
  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  await signUp(memberPage, memberEmail, "Approve Me");
  await memberPage.goto("/groups");
  await memberPage
    .locator("li", { hasText: LED_GROUP })
    .getByRole("button", { name: "Request to join" })
    .click();

  const leaderContext = await browser.newContext();
  const leaderPage = await leaderContext.newPage();
  await signUp(leaderPage, LEADER_EMAIL);
  await leaderPage.goto("/groups");
  await leaderPage.getByRole("link", { name: LED_GROUP }).click();

  const pendingRow = leaderPage.locator("li", { hasText: "Approve Me" });
  await expect(pendingRow).toBeVisible();
  await pendingRow.getByRole("button", { name: "Approve" }).click();

  await expect(
    leaderPage.locator("li", { hasText: "Approve Me" })
  ).toHaveCount(0);

  await memberContext.close();
  await leaderContext.close();
});
