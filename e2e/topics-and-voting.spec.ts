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

test("leader can open voting, suggest a topic, vote, select it, and get notified", async ({
  page,
}) => {
  await signUp(page, LEADER_EMAIL);
  await page.goto("/groups");
  await page.getByRole("link", { name: LED_GROUP }).click();

  // Open voting for the next hour
  const closesAt = toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000));
  await page.fill('input[name="votingClosesAt"]', closesAt);
  await page.getByRole("button", { name: /Open voting|Update deadline/ }).click();
  await expect(page.locator("text=Voting is open until")).toBeVisible();

  // Suggest a new topic
  const topicTitle = `Test Topic ${Date.now()}`;
  await page.fill('input[name="title"]', topicTitle);
  await page.getByRole("button", { name: "Suggest topic" }).click();

  const topicRow = page.locator("li", { hasText: topicTitle });
  await expect(topicRow).toBeVisible();

  // Vote for it
  await topicRow.getByRole("button", { name: "Vote" }).click();
  await expect(page.locator("li", { hasText: topicTitle })).toContainText("Your vote");

  // Select it with a session date/time
  const sessionAt = toDatetimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const rowWithSelect = page.locator("li", { hasText: topicTitle });
  await rowWithSelect.locator('input[name="sessionAt"]').fill(sessionAt);
  await rowWithSelect.getByRole("button", { name: "Select" }).click();

  await expect(page.locator("li", { hasText: topicTitle })).toContainText("Selected for");

  // Check the notification landed
  await page.goto("/notifications");
  await expect(page.locator("li", { hasText: topicTitle })).toBeVisible();
});
