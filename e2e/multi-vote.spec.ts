import { test, expect } from "@playwright/test";
import { signUp } from "./helpers";

const LEADER_EMAIL = "leader@example.com";
const LED_GROUP = "Grace Community Church";

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

test("a member can vote for more than one topic, and remove a vote", async ({ page }) => {
  await signUp(page, LEADER_EMAIL);
  await page.goto("/groups");
  await page.getByRole("link", { name: LED_GROUP }).click();

  const closesAt = toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000));
  await page.fill('input[name="votingClosesAt"]', closesAt);
  await page.getByRole("button", { name: /Open voting|Update deadline/ }).click();

  const stamp = Date.now();
  const topicA = `Multi-Vote Topic A ${stamp}`;
  const topicB = `Multi-Vote Topic B ${stamp}`;

  for (const title of [topicA, topicB]) {
    await page.fill('input[name="title"]', title);
    await page.getByRole("button", { name: "Suggest topic" }).click();
    await expect(page.locator("li", { hasText: title })).toBeVisible();
  }

  await page.locator("li", { hasText: topicA }).getByRole("button", { name: "Vote" }).click();
  await expect(page.locator("li", { hasText: topicA })).toContainText("Your vote");

  await page.locator("li", { hasText: topicB }).getByRole("button", { name: "Vote" }).click();
  await expect(page.locator("li", { hasText: topicB })).toContainText("Your vote");

  // Both votes stick around at the same time — voting isn't limited to one topic.
  await expect(page.locator("li", { hasText: topicA })).toContainText("Your vote");
  await expect(page.locator("li", { hasText: topicB })).toContainText("Your vote");

  // Clicking "Your vote" again removes that specific vote, without touching the other.
  await page.locator("li", { hasText: topicA }).getByRole("button", { name: "Your vote" }).click();
  await expect(page.locator("li", { hasText: topicA })).not.toContainText("Your vote");
  await expect(page.locator("li", { hasText: topicB })).toContainText("Your vote");
});
