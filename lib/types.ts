/** Core domain types for the kid lunch picker. */

export type FoodCategory =
  | "main"
  | "side"
  | "fruit"
  | "veggie"
  | "drink"
  | "snack";

/** FDA "Big 9" allergens. */
export type Allergen =
  | "milk"
  | "eggs"
  | "fish"
  | "shellfish"
  | "tree_nuts"
  | "peanuts"
  | "wheat"
  | "soy"
  | "sesame";

export interface FoodItem {
  id: string;
  /** Kid-friendly name, 1–2 words (e.g. "Chicken Fingers"). */
  name: string;
  /** Big emoji visual — always available, works offline. */
  emoji: string;
  /** Optional real photo URL (Spoonacular / curated). */
  imageUrl?: string;
  category: FoodCategory;
  allergens: Allergen[];
  /** Where this item came from. */
  source: "curated" | "spoonacular" | "usda";
}

/** A food plus the kid's chosen options (size, toppings, ...). */
export interface PickedFood {
  item: FoodItem;
  /** option group id -> choice id */
  options: Record<string, string>;
}

/** One picked item per tray slot. */
export type TraySelection = Record<FoodCategory, PickedFood | null>;

/** Parent-configured avoid list, stored locally in MVP (no accounts). */
export interface LocalProfile {
  avoids: Allergen[];
}
