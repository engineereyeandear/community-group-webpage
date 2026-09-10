import { test, expect } from "@playwright/test";
import { signUp, uniqueEmail } from "./helpers";

const LEADER_EMAIL = "leader@example.com";
const LED_GROUP = "Grace Community Church";

test("the leader can delete a suggested topic", async ({ page }) => {
  await signUp(page, LEADER_EMAIL);
  await page.goto("/groups");
  await page.getByRole("link", { name: LED_GROUP }).click();

  const topicTitle = `Delete Me Topic ${Date.now()}`;
  await page.fill('input[name="title"]', topicTitle);
  await page.getByRole("button", { name: "Suggest topic" }).click();

  const topicRow = page.locator("li", { hasText: topicTitle });
  await expect(topicRow).toBeVisible();

  await topicRow.getByRole("button", { name: "Delete" }).click();
  await expect(page.locator("li", { hasText: topicTitle })).toHaveCount(0);
});

test("a regular member cannot see a delete option on a suggested topic", async ({ browser }) => {
  const memberEmail = uniqueEmail("member-no-delete");
  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  await signUp(memberPage, memberEmail, "No Delete Member");
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
  await leaderPage
    .locator("li", { hasText: "No Delete Member" })
    .getByRole("button", { name: "Approve" })
    .click();

  const topicTitle = `Member Topic ${Date.now()}`;
  await memberPage.goto(`/groups`);
  await memberPage.getByRole("link", { name: LED_GROUP }).click();
  await memberPage.fill('input[name="title"]', topicTitle);
  await memberPage.getByRole("button", { name: "Suggest topic" }).click();

  const memberTopicRow = memberPage.locator("li", { hasText: topicTitle });
  await expect(memberTopicRow).toBeVisible();
  await expect(memberTopicRow.getByRole("button", { name: "Delete" })).toHaveCount(0);

  await memberContext.close();
  await leaderContext.close();
});

test("the leader can delete a selected topic, which sends a cancellation notice to members", async ({ browser }) => {
  const memberEmail = uniqueEmail("member-cancel-notice");
  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  await signUp(memberPage, memberEmail, "Cancel Notice Member");
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
  await leaderPage
    .locator("li", { hasText: "Cancel Notice Member" })
    .getByRole("button", { name: "Approve" })
    .click();

  const topicTitle = `Movie Night Discussion ${Date.now()}`;
  await leaderPage.fill('input[name="title"]', topicTitle);
  await leaderPage.getByRole("button", { name: "Suggest topic" }).click();

  const topicRow = leaderPage.locator("li", { hasText: topicTitle });
  await topicRow.locator('input[type="datetime-local"]').fill("2027-01-01T18:00");
  await topicRow.getByRole("button", { name: "Select" }).click();

  await expect(leaderPage.locator("li", { hasText: topicTitle })).toContainText("Selected for");

  // Now cancel it — the leader should still see a Delete option on the
  // selected topic, and clicking it should remove the topic and notify
  // the member that the discussion was cancelled.
  const selectedTopicRow = leaderPage.locator("li", { hasText: topicTitle });
  await selectedTopicRow.getByRole("button", { name: "Delete" }).click();
  await expect(leaderPage.locator("li", { hasText: topicTitle })).toHaveCount(0);

  await memberPage.goto("/notifications");
  await expect(
    memberPage.locator("li", { hasText: "has cancelled the discussion" })
  ).toContainText(topicTitle);

  await memberContext.close();
  await leaderContext.close();
});
