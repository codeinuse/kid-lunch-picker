import { beforeEach, describe, expect, it } from "vitest";
import { STARTER_FOODS } from "@/lib/starter-foods";
import {
  emptyTraySelection,
  streakCount,
  todayKey,
  useLunchStore,
} from "@/lib/store";
import { CATEGORIES, visibleCategories } from "@/lib/categories";
import { defaultOptions, optionsFor, summarizeOptions } from "@/lib/options";
import { foodFact } from "@/lib/food-facts";
import { addedLine, browsePrompt, greeting } from "@/lib/guide-lines";

function freshKid() {
  useLunchStore.setState({
    profiles: [],
    activeId: null,
    trays: {},
    packedDays: {},
    triedAt: {},
  });
  return useLunchStore.getState().createProfile("Sam", "🦊", "1234");
}

beforeEach(() => {
  localStorage.clear();
  freshKid();
});

describe("profiles", () => {
  it("creates a kid with their own empty tray and signs them in", () => {
    const s = useLunchStore.getState();
    expect(s.profiles).toHaveLength(1);
    expect(s.activeId).toBe(s.profiles[0].id);
    expect(s.profiles[0]).toMatchObject({ name: "Sam", avatar: "🦊", theme: "classic", age: null });
  });

  it("switches and logs out without losing trays", () => {
    const s = useLunchStore.getState();
    const sam = s.activeId!;
    const ana = s.createProfile("Ana", "🐼", "9999");
    expect(useLunchStore.getState().activeId).toBe(ana);
    useLunchStore.getState().selectProfile(sam);
    expect(useLunchStore.getState().activeId).toBe(sam);
    useLunchStore.getState().logout();
    expect(useLunchStore.getState().activeId).toBeNull();
    expect(Object.keys(useLunchStore.getState().trays)).toHaveLength(2);
  });
});

describe("tray picks (drill-down data)", () => {
  it("stores the picked item WITH its chosen options", () => {
    const pizza = STARTER_FOODS.find((f) => f.id === "pizza")!;
    const options = { ...defaultOptions(optionsFor(pizza.id, pizza.category)), topping: "pepperoni", size: "big" };
    useLunchStore.getState().setPick("main", { item: pizza, options });
    const pick = useLunchStore.getState().trays[useLunchStore.getState().activeId!].picks.main;
    expect(pick?.item.id).toBe("pizza");
    expect(pick?.options.topping).toBe("pepperoni");
    expect(pick?.options.size).toBe("big");
  });

  it("records first-tasted dates for explorer badges", () => {
    const pizza = STARTER_FOODS.find((f) => f.id === "pizza")!;
    useLunchStore.getState().setPick("main", { item: pizza, options: {} });
    const tried = useLunchStore.getState().triedAt[useLunchStore.getState().activeId!];
    expect(tried["pizza"]).toBe(todayKey());
  });

  it("clears the tray but keeps the kid signed in", () => {
    const pizza = STARTER_FOODS.find((f) => f.id === "pizza")!;
    const s = useLunchStore.getState();
    s.setPick("main", { item: pizza, options: {} });
    s.clearTray();
    const after = useLunchStore.getState();
    expect(after.trays[after.activeId!].picks.main).toBeNull();
    expect(after.activeId).not.toBeNull();
  });
});

describe("options model", () => {
  it("pizza offers topping + size with sane defaults", () => {
    const groups = optionsFor("pizza", "main");
    expect(groups.map((g) => g.id)).toEqual(["size", "topping"]);
    const defaults = defaultOptions(groups);
    expect(defaults).toEqual({ size: "little", topping: "cheese" });
  });

  it("summarizes only non-boring choices", () => {
    const groups = optionsFor("pizza", "main");
    expect(summarizeOptions(groups, { size: "regular", topping: "pepperoni" })).toContain("Pepperoni");
    // "cheese" topping IS informative (it names the topping); only the
    // generic no-op ids are hidden.
    expect(summarizeOptions(groups, { size: "regular", topping: "cheese" })).toContain("Cheese");
    expect(summarizeOptions(optionsFor("cookie", "snack"), { count: "one" })).toBe("");
  });
});

describe("streaks", () => {
  it("counts consecutive days ending today", () => {
    const t = new Date();
    const key = (d: Date) => todayKey(d);
    const days = [0, 1, 2].map((n) => {
      const d = new Date(t);
      d.setDate(t.getDate() - n);
      return key(d);
    });
    expect(streakCount(days, t)).toBe(3);
    expect(streakCount([], t)).toBe(0);
  });

  it("records a packed day once per profile per day", () => {
    const s = useLunchStore.getState();
    s.recordPackedDay();
    s.recordPackedDay();
    expect(useLunchStore.getState().packedDays[s.activeId!]).toHaveLength(1);
  });
});

describe("age-aware slots", () => {
  it("under-7s get 4 slots, older kids get all 6", () => {
    expect(visibleCategories(5).map((c) => c.id)).toEqual(["main", "side", "fruit", "drink"]);
    expect(visibleCategories(7)).toHaveLength(6);
    expect(visibleCategories(null)).toHaveLength(CATEGORIES.length);
  });

  it("empty tray covers every category", () => {
    expect(Object.keys(emptyTraySelection())).toHaveLength(CATEGORIES.length);
  });
});

describe("guide voice + facts", () => {
  it("greets the kid by name", () => {
    expect(greeting("Sam", "space")).toContain("Sam");
    expect(browsePrompt("Sam", "veggie")).toContain("veggie");
    expect(addedLine("Pizza", "pizza")).toContain("Pizza");
  });

  it("has a fact for every curated food", () => {
    for (const f of STARTER_FOODS) {
      expect(foodFact(f.id, f.category).length).toBeGreaterThan(10);
    }
  });
});
