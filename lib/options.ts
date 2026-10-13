import type { FoodCategory } from "./types";

export interface OptionChoice {
  id: string;
  label: string;
  emoji: string;
}

export interface OptionGroup {
  id: string;
  label: string;
  choices: OptionChoice[];
}

const SIZE_LITTLE_REGULAR_BIG: OptionGroup = {
  id: "size",
  label: "Size",
  choices: [
    { id: "little", label: "Little", emoji: "🐭" },
    { id: "regular", label: "Regular", emoji: "😊" },
    { id: "big", label: "Big", emoji: "🐻" },
  ],
};

const GENERIC_BY_CATEGORY: Record<FoodCategory, OptionGroup[]> = {
  main: [
    SIZE_LITTLE_REGULAR_BIG,
    {
      id: "extra",
      label: "Extras",
      choices: [
        { id: "none", label: "No Extras", emoji: "👍" },
        { id: "cheese", label: "Extra Cheese", emoji: "🧀" },
        { id: "sauce", label: "Extra Sauce", emoji: "🥫" },
      ],
    },
  ],
  side: [SIZE_LITTLE_REGULAR_BIG],
  fruit: [
    {
      id: "cut",
      label: "How",
      choices: [
        { id: "whole", label: "Whole", emoji: "🍎" },
        { id: "cut", label: "Cut Up", emoji: "🔪" },
      ],
    },
    {
      id: "count",
      label: "How Many",
      choices: [
        { id: "one", label: "1", emoji: "☝️" },
        { id: "two", label: "2", emoji: "✌️" },
      ],
    },
  ],
  veggie: [
    {
      id: "cut",
      label: "How",
      choices: [
        { id: "whole", label: "Whole", emoji: "🥕" },
        { id: "cut", label: "Cut Up", emoji: "🔪" },
      ],
    },
    {
      id: "dip",
      label: "Dip",
      choices: [
        { id: "none", label: "No Dip", emoji: "👍" },
        { id: "ranch", label: "Ranch", emoji: "🥣" },
        { id: "hummus", label: "Hummus", emoji: "🫘" },
      ],
    },
  ],
  drink: [
    {
      id: "size",
      label: "Cup",
      choices: [
        { id: "little", label: "Little Cup", emoji: "🥤" },
        { id: "big", label: "Big Cup", emoji: "🥛" },
      ],
    },
    {
      id: "ice",
      label: "Ice",
      choices: [
        { id: "no-ice", label: "No Ice", emoji: "👍" },
        { id: "ice", label: "Ice", emoji: "🧊" },
      ],
    },
  ],
  snack: [
    {
      id: "count",
      label: "How Many",
      choices: [
        { id: "one", label: "1", emoji: "☝️" },
        { id: "two", label: "2", emoji: "✌️" },
      ],
    },
  ],
};

/** Special options for specific curated dishes. */
const ITEM_OVERRIDES: Record<string, OptionGroup[]> = {
  pizza: [
    SIZE_LITTLE_REGULAR_BIG,
    {
      id: "topping",
      label: "Topping",
      choices: [
        { id: "cheese", label: "Cheese", emoji: "🧀" },
        { id: "pepperoni", label: "Pepperoni", emoji: "🍕" },
        { id: "veggie", label: "Veggie", emoji: "🫑" },
      ],
    },
  ],
  sandwich: [
    {
      id: "filling",
      label: "Inside",
      choices: [
        { id: "pbj", label: "PB & Jelly", emoji: "🥜" },
        { id: "cheese", label: "Cheese", emoji: "🧀" },
        { id: "turkey", label: "Turkey", emoji: "🦃" },
      ],
    },
    {
      id: "cut",
      label: "Cut",
      choices: [
        { id: "whole", label: "Whole", emoji: "🥪" },
        { id: "half", label: "In Half", emoji: "🔪" },
      ],
    },
  ],
  pasta: [
    SIZE_LITTLE_REGULAR_BIG,
    {
      id: "sauce",
      label: "Sauce",
      choices: [
        { id: "red", label: "Red Sauce", emoji: "🍅" },
        { id: "white", label: "White Sauce", emoji: "🥛" },
        { id: "butter", label: "Butter", emoji: "🧈" },
      ],
    },
  ],
  nuggets: [
    {
      id: "count",
      label: "How Many",
      choices: [
        { id: "four", label: "4", emoji: "4️⃣" },
        { id: "six", label: "6", emoji: "6️⃣" },
      ],
    },
    {
      id: "dip",
      label: "Dip",
      choices: [
        { id: "none", label: "No Dip", emoji: "👍" },
        { id: "ketchup", label: "Ketchup", emoji: "🍅" },
        { id: "bbq", label: "BBQ", emoji: "🍖" },
      ],
    },
  ],
};

/** Option groups for an item: specific overrides win, else category generic. */
export function optionsFor(itemId: string, category: FoodCategory): OptionGroup[] {
  return ITEM_OVERRIDES[itemId] ?? GENERIC_BY_CATEGORY[category];
}

/** Defaults = first choice of every group. */
export function defaultOptions(groups: OptionGroup[]): Record<string, string> {
  return Object.fromEntries(groups.map((g) => [g.id, g.choices[0].id]));
}

/** Short summary for the tray, e.g. "Big • Extra Cheese". */
export function summarizeOptions(
  groups: OptionGroup[],
  options: Record<string, string>,
): string {
  const parts = groups.flatMap((g) => {
    const choice = g.choices.find((c) => c.id === options[g.id]);
    if (!choice) return [];
    // Skip boring defaults so the tray stays readable.
    if (choice.id === "none" || choice.id === "regular" || choice.id === "one") return [];
    return [`${choice.emoji} ${choice.label}`];
  });
  return parts.join(" • ");
}
