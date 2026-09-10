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

test("a selected topic disappears from the group once its gathering date has passed", async ({
  page,
}) => {
  await signUp(page, LEADER_EMAIL);
  await page.goto("/groups");
  await page.getByRole("link", { name: LED_GROUP }).click();

  // Make sure voting is open so a new topic can be suggested and selected.
  const closesAt = toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000));
  await page.fill('input[name="votingClosesAt"]', closesAt);
  await page.getByRole("button", { name: /Open voting|Update deadline/ }).click();

  const topicTitle = `Expiring Topic ${Date.now()}`;
  await page.fill('input[name="title"]', topicTitle);
  await page.getByRole("button", { name: "Suggest topic" }).click();

  const topicRow = page.locator("li", { hasText: topicTitle });
  await expect(topicRow).toBeVisible();

  // Select it with a gathering date/time already in the past.
  const pastSessionAt = toDatetimeLocal(new Date(Date.now() - 24 * 60 * 60 * 1000));
  await topicRow.locator('input[name="sessionAt"]').fill(pastSessionAt);
  await topicRow.getByRole("button", { name: "Select" }).click();

  // The group page archives any selected topic whose date has already
  // passed as soon as it re-renders, so it should no longer be listed here.
  await expect(page.locator("li", { hasText: topicTitle })).toHaveCount(0);

  // The notification that was sent when it was selected is still there,
  // though — archiving hides the topic from the group view, it doesn't
  // erase the historical record.
  await page.goto("/notifications");
  await expect(page.locator("li", { hasText: topicTitle })).toBeVisible();
});
