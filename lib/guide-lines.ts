import type { FoodCategory } from "./types";
import type { ThemeId } from "./themes";

/**
 * The theme guide speaks: greetings, per-step narration, encouragement.
 * One consistent character voice per theme (Synthesis-style companion).
 */

export function greeting(name: string, theme: ThemeId): string {
  switch (theme) {
    case "space":
      return `Hi ${name}! Zippy here. Let's fuel up your rocket lunch!`;
    case "jungle":
      return `Hi ${name}! Momo here. Let's forage a wild lunch!`;
    case "ocean":
      return `Hi ${name}! Bubbles here. Let's dive into lunch!`;
    default:
      return `Hi ${name}! Let's build your lunch!`;
  }
}

const CATEGORY_PROMPT: Record<FoodCategory, string> = {
  main: "yummy main dish",
  side: "tasty side dish",
  fruit: "sweet fruit",
  veggie: "crunchy veggie",
  drink: "yummy drink",
  snack: "fun snack",
};

export function browsePrompt(name: string, category: FoodCategory): string {
  return `Pick a ${CATEGORY_PROMPT[category]}, ${name}! Tap the yummiest one!`;
}

const PRAISE = [
  "Yum! Great pick!",
  "Nice choice!",
  "Ooh, tasty!",
  "Awesome pick!",
];

export function praiseFor(itemId: string): string {
  let hash = 0;
  for (const ch of itemId) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return PRAISE[hash % PRAISE.length];
}

export function addedLine(itemName: string, itemId: string): string {
  return `${itemName} added! ${praiseFor(itemId)}`;
}
