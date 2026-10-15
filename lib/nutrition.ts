import type { FoodCategory, TraySelection } from "./types";

/**
 * Lunch Power: gamified nutrition estimates for kids.
 *
 * Daily needs follow simplified U.S. IOM Dietary Reference Intakes for
 * ages 4–8 and 9–13 (protein, fiber, calcium, iron, vitamin C, vitamin A).
 * A lunchbox counts as ~30% of the day. Per-food numbers are rough
 * USDA-style averages per kid serving — fun fuel gauges, NOT medical
 * advice (see the footnote in NutritionCard).
 */

export type Gender = "boy" | "girl";

export type NutrientId =
  | "protein"
  | "fiber"
  | "calcium"
  | "iron"
  | "vitaminC"
  | "vitaminA";

export interface NutrientInfo {
  id: NutrientId;
  /** Kid-facing power name. */
  power: string;
  emoji: string;
  unit: string;
  /** Full-day need: young (4–8) / older (9–13, girl) / older boy. */
  daily: { young: number; older: number; olderBoy?: number };
  /** Which tray category boosts this power fastest. */
  boostCategory: FoodCategory;
  boostLabel: string;
}

export const NUTRIENTS: NutrientInfo[] = [
  { id: "protein", power: "Muscle Power", emoji: "💪", unit: "g", daily: { young: 19, older: 34 }, boostCategory: "main", boostLabel: "a mighty main dish" },
  { id: "fiber", power: "Happy Tummy", emoji: "🌾", unit: "g", daily: { young: 25, older: 26, olderBoy: 31 }, boostCategory: "fruit", boostLabel: "a fruity friend" },
  { id: "calcium", power: "Strong Bones", emoji: "🦴", unit: "mg", daily: { young: 1000, older: 1300 }, boostCategory: "drink", boostLabel: "milky goodness" },
  { id: "iron", power: "Turbo Blood", emoji: "🩸", unit: "mg", daily: { young: 10, older: 8 }, boostCategory: "veggie", boostLabel: "green machine fuel" },
  { id: "vitaminC", power: "Body Shield", emoji: "🛡️", unit: "mg", daily: { young: 25, older: 45 }, boostCategory: "fruit", boostLabel: "a juicy fruit" },
  { id: "vitaminA", power: "Sharp Eyes", emoji: "👀", unit: "mcg", daily: { young: 400, older: 600 }, boostCategory: "veggie", boostLabel: "something orange" },
];

/** Share of the day one lunchbox should cover. */
export const LUNCH_SHARE = 0.3;

/** Age 10+ means "10 or older" in the login picker. */
export function ageBand(age: number | null): "young" | "older" {
  if (age === null) return "young";
  return age >= 9 ? "older" : "young";
}

/** Full-day need for one nutrient, honoring age + gender where it matters. */
export function dailyNeed(nutrient: NutrientId, age: number | null, gender: Gender | null): number {
  const info = NUTRIENTS.find((n) => n.id === nutrient)!;
  if (ageBand(age) === "young") return info.daily.young;
  if (gender === "boy" && info.daily.olderBoy !== undefined) return info.daily.olderBoy;
  if (gender === null && info.daily.olderBoy !== undefined) {
    return (info.daily.older + info.daily.olderBoy) / 2;
  }
  return info.daily.older;
}

/** What this lunchbox should deliver: 30% of the day. */
export function lunchTarget(nutrient: NutrientId, age: number | null, gender: Gender | null): number {
  return dailyNeed(nutrient, age, gender) * LUNCH_SHARE;
}

export type NutrientAmounts = Record<NutrientId, number>;

/**
 * Rough nutrients per kid serving, same order as NUTRIENTS:
 * [protein g, fiber g, calcium mg, iron mg, vitaminC mg, vitaminA mcg].
 * USDA-style averages, rounded for kid math.
 */
const FOOD_TABLE: Record<string, [number, number, number, number, number, number]> = {
  pizza: [12, 2, 200, 2, 2, 60],
  nuggets: [14, 1, 20, 1, 1, 20],
  sandwich: [10, 3, 100, 2, 3, 80],
  pasta: [8, 2, 80, 2, 1, 20],
  fries: [3, 3, 15, 1, 8, 5],
  rice: [4, 1, 15, 1, 0, 0],
  corn: [2, 2, 5, 0.5, 4, 15],
  mash: [2, 2, 30, 0.5, 8, 5],
  apple: [0.5, 4, 10, 0.2, 8, 5],
  banana: [1, 3, 6, 0.3, 10, 8],
  grapes: [0.5, 1, 12, 0.3, 3, 5],
  orange: [1, 3, 50, 0.2, 70, 30],
  carrots: [0.5, 2, 20, 0.3, 4, 450],
  broccoli: [2, 2, 30, 0.5, 40, 60],
  cucumber: [0.3, 0.5, 8, 0.2, 2, 5],
  salad: [1, 1, 20, 0.5, 10, 300],
  milk: [8, 0, 300, 0.1, 0, 150],
  water: [0, 0, 0, 0, 0, 0],
  juice: [1, 0.5, 20, 0.3, 60, 30],
  "choc-milk": [8, 0, 280, 0.5, 2, 120],
  cookie: [2, 1, 20, 1, 0, 10],
  yogurt: [6, 0, 250, 0.1, 1, 20],
  granola: [3, 2, 20, 1, 0, 5],
  pudding: [3, 0, 100, 0.3, 0, 40],
};

/** Category averages for live/unknown items (mean of the table above). */
const CATEGORY_FALLBACK: Record<FoodCategory, [number, number, number, number, number, number]> = {
  main: [11, 2, 100, 1.8, 1.8, 45],
  side: [2.8, 2, 16, 0.8, 5, 6],
  fruit: [0.8, 2.8, 20, 0.3, 23, 12],
  veggie: [0.9, 1.4, 20, 0.4, 14, 205],
  drink: [4.3, 0.1, 150, 0.2, 15, 75],
  snack: [3.5, 0.8, 98, 0.5, 0.3, 19],
};

const ZERO: NutrientAmounts = { protein: 0, fiber: 0, calcium: 0, iron: 0, vitaminC: 0, vitaminA: 0 };

function amountsFor(foodId: string, category: FoodCategory): NutrientAmounts {
  const row = FOOD_TABLE[foodId] ?? CATEGORY_FALLBACK[category];
  return {
    protein: row[0],
    fiber: row[1],
    calcium: row[2],
    iron: row[3],
    vitaminC: row[4],
    vitaminA: row[5],
  };
}

/** Total nutrients in the current tray. */
export function trayNutrition(picks: TraySelection): NutrientAmounts {
  const total: NutrientAmounts = { ...ZERO };
  for (const pick of Object.values(picks)) {
    if (!pick) continue;
    const a = amountsFor(pick.item.id, pick.item.category);
    (Object.keys(total) as NutrientId[]).forEach((k) => {
      total[k] += a[k];
    });
  }
  return total;
}

export interface PowerResult {
  info: NutrientInfo;
  got: number;
  target: number;
  /** 0–100+ (uncapped for display honesty, capped for scoring). */
  pct: number;
}

export interface LunchScore {
  powers: PowerResult[];
  /** 0–100 mean of capped percents. */
  score: number;
  filled: number;
  weakest: PowerResult | null;
  level: string;
  levelEmoji: string;
}

export function scoreTray(
  picks: TraySelection,
  age: number | null,
  gender: Gender | null,
): LunchScore {
  const total = trayNutrition(picks);
  const filled = Object.values(picks).filter(Boolean).length;
  const powers: PowerResult[] = NUTRIENTS.map((info) => {
    const target = lunchTarget(info.id, age, gender);
    const got = total[info.id];
    return { info, got, target, pct: target > 0 ? (got / target) * 100 : 0 };
  });
  const score =
    powers.length === 0
      ? 0
      : Math.round(
          powers.reduce((sum, p) => sum + Math.min(p.pct, 100), 0) / powers.length,
        );
  const needy = powers.filter((p) => p.pct < 70).sort((a, b) => a.pct - b.pct);
  const weakest = filled > 0 ? (needy[0] ?? null) : null;
  const [level, levelEmoji] =
    filled === 0
      ? ["Empty lunchbox", "🍱"]
      : score >= 90
        ? ["Champion Lunch", "🏆"]
        : score >= 70
          ? ["Super Lunch", "⭐"]
          : score >= 40
            ? ["Powering Up", "🚀"]
            : ["Getting Started", "🌱"];
  return { powers, score, filled, weakest, level, levelEmoji };
}

/** Sizzle's coaching line for the weakest power. */
export function coachLine(weakest: PowerResult): string {
  const p = Math.round(weakest.pct);
  return `${weakest.info.emoji} ${weakest.info.power} is at ${p}% — add ${weakest.info.boostLabel}!`;
}
