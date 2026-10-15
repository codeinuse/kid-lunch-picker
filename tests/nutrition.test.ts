/**
 * Lunch Power: age/gender targets, tray scoring, unknown-food fallback.
 */
import { describe, expect, it } from "vitest";
import { STARTER_FOODS } from "@/lib/starter-foods";
import { emptyTraySelection, useLunchStore } from "@/lib/store";
import type { PickedFood, TraySelection } from "@/lib/types";
import {
  ageBand,
  coachLine,
  dailyNeed,
  lunchTarget,
  scoreTray,
  trayNutrition,
} from "@/lib/nutrition";

function pick(id: string): PickedFood {
  const item = STARTER_FOODS.find((f) => f.id === id)!;
  return { item, options: {} };
}

function tray(ids: string[]): TraySelection {
  const t = emptyTraySelection();
  for (const id of ids) {
    const p = pick(id);
    t[p.item.category] = p;
  }
  return t;
}

describe("daily needs by age + gender", () => {
  it("young kids share one band; older kids split fiber by gender", () => {
    expect(ageBand(5)).toBe("young");
    expect(ageBand(8)).toBe("young");
    expect(ageBand(9)).toBe("older");
    expect(ageBand(10)).toBe("older");
    expect(ageBand(null)).toBe("young");
    // Protein identical — gender only moves what actually differs.
    expect(dailyNeed("protein", 10, "boy")).toBe(dailyNeed("protein", 10, "girl"));
    expect(dailyNeed("fiber", 10, "boy")).toBeGreaterThan(dailyNeed("fiber", 10, "girl"));
    // Unknown gender averages the split.
    expect(dailyNeed("fiber", 10, null)).toBe((26 + 31) / 2);
    expect(dailyNeed("protein", 6, "boy")).toBe(19);
  });

  it("lunch is 30% of the day", () => {
    expect(lunchTarget("protein", 6, null)).toBeCloseTo(19 * 0.3);
    expect(lunchTarget("calcium", 10, "girl")).toBeCloseTo(1300 * 0.3);
  });
});

describe("tray scoring", () => {
  it("empty tray scores zero with the empty level", () => {
    const s = scoreTray(emptyTraySelection(), 6, null);
    expect(s.score).toBe(0);
    expect(s.level).toBe("Empty lunchbox");
    expect(s.weakest).toBeNull();
  });

  it("a full balanced tray reaches Super or Champion", () => {
    const s = scoreTray(tray(["pizza", "fries", "apple", "carrots", "milk", "cookie"]), 6, null);
    expect(s.filled).toBe(6);
    expect(s.score).toBeGreaterThanOrEqual(70);
    expect(["Super Lunch", "Champion Lunch"]).toContain(s.level);
  });

  it("milk-only tray flags a weak power with coaching", () => {
    const s = scoreTray(tray(["milk"]), 6, null);
    expect(s.score).toBeLessThan(70);
    expect(s.weakest).not.toBeNull();
    expect(s.weakest!.pct).toBe(0);
    expect(coachLine(s.weakest!)).toContain(s.weakest!.info.power);
  });

  it("unknown (live API) foods fall back to category averages", () => {
    const t = emptyTraySelection();
    t.main = {
      item: { id: "sp-999", name: "Mystery Burger", emoji: "🍱", category: "main", allergens: [], source: "spoonacular" },
      options: {},
    };
    const n = trayNutrition(t);
    expect(n.protein).toBeGreaterThan(5);
    expect(n.calcium).toBeGreaterThan(50);
  });

  it("older kids face bigger lunch targets than young kids", () => {
    const full = tray(["pizza", "fries", "apple", "carrots", "milk", "cookie"]);
    expect(scoreTray(full, 10, "boy").score).toBeLessThanOrEqual(
      scoreTray(full, 6, null).score,
    );
  });
});

describe("gender on profiles (store v8)", () => {
  it("new profiles default to unknown gender; setGender tunes targets", () => {
    localStorage.clear();
    useLunchStore.setState({
      profiles: [], activeId: null, trays: {}, packedDays: {},
      triedAt: {}, seenTour: {}, stickers: {},
    });
    const id = useLunchStore.getState().createProfile("Sam", "🦊", "1234", "classic", 10);
    expect(useLunchStore.getState().profiles.find((p) => p.id === id)?.gender).toBeNull();
    useLunchStore.getState().setGender("boy");
    expect(useLunchStore.getState().profiles.find((p) => p.id === id)?.gender).toBe("boy");
  });
});
