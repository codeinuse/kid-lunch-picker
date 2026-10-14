import { expect, test } from "@playwright/test";

/**
 * Real-browser kid flow: NO mocks — real sounds lib, real store,
 * real API route, real taps. This is the test that would have caught
 * the "taps do nothing on real devices" class of bug.
 */

const CATS = ["main", "side", "fruit", "veggie", "drink", "snack"] as const;

function seedScript(seenTour: boolean) {
  const picks = Object.fromEntries(CATS.map((c) => [c, null]));
  const state = {
    state: {
      profiles: [
        { id: "kid1", name: "Sam", avatar: "🦊", pin: "1234", theme: "classic", age: null },
      ],
      activeId: "kid1",
      trays: { kid1: { picks, avoids: [] } },
      // Voice off: headless speech is noise; taps are what we test.
      settings: { voiceOn: false, voiceRate: 0.9 },
      packedDays: {},
      triedAt: {},
      seenTour: seenTour ? { kid1: true } : {},
      stickers: {},
      totalSlots: 6,
    },
    version: 7,
  };
  return `localStorage.setItem("lunch-tray", '${JSON.stringify(state)}');`;
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript(seedScript(true));
});

test("signed-in kid: slot → browse → food → options → tray", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });

  // Home with a signed-in kid shows the tray, no tour (already seen).
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Main Dish.*Tap to pick/ })).toBeVisible({
    timeout: 15_000,
  });

  // Tap the Main slot → browse grid fills with real foods.
  await page.getByRole("link", { name: /Main Dish.*Tap to pick/ }).click();
  await expect(page.getByRole("button", { name: "Pick Pizza" })).toBeVisible({
    timeout: 30_000,
  });

  // Tap Pizza → options sheet MUST open (the reported dead-tap).
  await page.getByRole("button", { name: "Pick Pizza" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  await expect(dialog.getByText("Topping?")).toBeVisible();

  // Tweak + Add → back home, tray slot shows Pizza.
  await dialog.getByRole("button", { name: /Pepperoni/ }).click();
  await dialog.getByRole("button", { name: /Add to Tray/ }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
  await expect(
    page.getByRole("link", { name: /Main Dish: Pizza/ }),
  ).toBeVisible({ timeout: 10_000 });

  expect(errors).toEqual([]);
});

test("legacy v6 profile migrates and taps still work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  // Pre-v7 stored shape: no seenTour / stickers fields at all.
  const picks = Object.fromEntries(CATS.map((c) => [c, null]));
  const legacy = {
    state: {
      profiles: [
        { id: "kid1", name: "Sam", avatar: "🦊", pin: "1234", theme: "classic", age: null },
      ],
      activeId: "kid1",
      trays: { kid1: { picks, avoids: [] } },
      settings: { voiceOn: false, voiceRate: 0.9 },
      packedDays: {},
      triedAt: {},
      totalSlots: 6,
    },
    version: 6,
  };
  await page.addInitScript(
    `localStorage.setItem("lunch-tray", '${JSON.stringify(legacy)}');`,
  );
  await page.goto("/");
  // Tour appears (never seen), tray works underneath.
  const tour = page.getByRole("dialog", { name: /Welcome tour/ });
  await expect(tour).toBeVisible({ timeout: 15_000 });
  await tour.getByRole("button", { name: "Skip tour" }).click();
  await expect(tour).not.toBeVisible({ timeout: 10_000 });
  // Slot taps navigate after migration.
  await page.getByRole("link", { name: /Side Dish.*Tap to pick/ }).click();
  await expect(page).toHaveURL(/\/browse\/side$/, { timeout: 10_000 });
  expect(errors).toEqual([]);
});

test("new kid sees the welcome tour once", async ({ page }) => {
  await page.addInitScript(seedScript(false));
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: /Welcome tour/ });
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await dialog.getByRole("button", { name: "Skip tour" }).click();
  await expect(dialog).not.toBeVisible();
});
