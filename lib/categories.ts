import type { FoodCategory } from "./types";

export interface CategoryInfo {
  id: FoodCategory;
  /** 1–2 word kid label. */
  label: string;
  emoji: string;
  /** Card background. */
  bg: string;
  /** Accent / ring color. */
  accent: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "main", label: "Main Dish", emoji: "🍽️", bg: "bg-red-100", accent: "ring-red-400" },
  { id: "side", label: "Side Dish", emoji: "🍟", bg: "bg-yellow-100", accent: "ring-yellow-400" },
  { id: "fruit", label: "Fruit", emoji: "🍎", bg: "bg-orange-100", accent: "ring-orange-400" },
  { id: "veggie", label: "Veggie", emoji: "🥕", bg: "bg-green-100", accent: "ring-green-500" },
  { id: "drink", label: "Drink", emoji: "🧃", bg: "bg-sky-100", accent: "ring-sky-400" },
  { id: "snack", label: "Snack", emoji: "🍪", bg: "bg-purple-100", accent: "ring-purple-400" },
];

export const categoryInfo = (id: FoodCategory): CategoryInfo =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
