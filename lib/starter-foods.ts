import type { FoodItem } from "./types";

/**
 * Curated fallback lunch items. Always available (no API key needed,
 * works offline). The API route returns these when Spoonacular
 * is not configured, and merges them with live results otherwise.
 */
export const STARTER_FOODS: FoodItem[] = [
  // ——— Main dish ———
  { id: "pizza", name: "Pizza", emoji: "🍕", category: "main", allergens: ["milk", "wheat"], source: "curated" },
  { id: "nuggets", name: "Nuggets", emoji: "🍗", category: "main", allergens: ["wheat", "eggs"], source: "curated" },
  { id: "sandwich", name: "Sandwich", emoji: "🥪", category: "main", allergens: ["wheat"], source: "curated" },
  { id: "pasta", name: "Pasta", emoji: "🍝", category: "main", allergens: ["wheat", "milk"], source: "curated" },
  // ——— Side dish ———
  { id: "fries", name: "Fries", emoji: "🍟", category: "side", allergens: [], source: "curated" },
  { id: "rice", name: "Rice", emoji: "🍚", category: "side", allergens: [], source: "curated" },
  { id: "corn", name: "Corn", emoji: "🌽", category: "side", allergens: [], source: "curated" },
  { id: "mash", name: "Mash", emoji: "🥔", category: "side", allergens: ["milk"], source: "curated" },
  // ——— Fruit ———
  { id: "apple", name: "Apple", emoji: "🍎", category: "fruit", allergens: [], source: "curated" },
  { id: "banana", name: "Banana", emoji: "🍌", category: "fruit", allergens: [], source: "curated" },
  { id: "grapes", name: "Grapes", emoji: "🍇", category: "fruit", allergens: [], source: "curated" },
  { id: "orange", name: "Orange", emoji: "🍊", category: "fruit", allergens: [], source: "curated" },
  // ——— Veggie ———
  { id: "carrots", name: "Carrots", emoji: "🥕", category: "veggie", allergens: [], source: "curated" },
  { id: "broccoli", name: "Broccoli", emoji: "🥦", category: "veggie", allergens: [], source: "curated" },
  { id: "cucumber", name: "Cucumber", emoji: "🥒", category: "veggie", allergens: [], source: "curated" },
  { id: "salad", name: "Salad", emoji: "🥗", category: "veggie", allergens: [], source: "curated" },
  // ——— Drink ———
  { id: "milk", name: "Milk", emoji: "🥛", category: "drink", allergens: ["milk"], source: "curated" },
  { id: "water", name: "Water", emoji: "💧", category: "drink", allergens: [], source: "curated" },
  { id: "juice", name: "Juice", emoji: "🧃", category: "drink", allergens: [], source: "curated" },
  { id: "choc-milk", name: "Choc Milk", emoji: "🍫", category: "drink", allergens: ["milk"], source: "curated" },
  // ——— Snack ———
  { id: "cookie", name: "Cookie", emoji: "🍪", category: "snack", allergens: ["milk", "wheat", "eggs"], source: "curated" },
  { id: "yogurt", name: "Yogurt", emoji: "🍦", category: "snack", allergens: ["milk"], source: "curated" },
  { id: "granola", name: "Granola Bar", emoji: "🍫", category: "snack", allergens: ["wheat", "tree_nuts"], source: "curated" },
  { id: "pudding", name: "Pudding", emoji: "🍮", category: "snack", allergens: ["milk", "eggs"], source: "curated" },
];
