"use client";

/**
 * Rewards collection: hand-crafted in-repo (zero signup, zero license risk).
 * Stickers are emoji + names matching the app's sticker style; a packed
 * lunch earns the next sticker in rotation, and packed-day counts drive
 * levels. Pure functions — easy to test.
 */

export interface Sticker {
  id: string;
  emoji: string;
  name: string;
}

export const STICKERS: Sticker[] = [
  { id: "apple-star", emoji: "🍎", name: "Apple Star" },
  { id: "pizza-party", emoji: "🍕", name: "Pizza Party" },
  { id: "berry-buddy", emoji: "🍓", name: "Berry Buddy" },
  { id: "carrot-captain", emoji: "🥕", name: "Carrot Captain" },
  { id: "taco-hero", emoji: "🌮", name: "Taco Hero" },
  { id: "banana-bounce", emoji: "🍌", name: "Banana Bounce" },
  { id: "broccoli-boss", emoji: "🥦", name: "Broccoli Boss" },
  { id: "cookie-champ", emoji: "🍪", name: "Cookie Champ" },
  { id: "grape-glider", emoji: "🍇", name: "Grape Glider" },
  { id: "sandwich-skipper", emoji: "🥪", name: "Sandwich Skipper" },
  { id: "melon-marvel", emoji: "🍉", name: "Melon Marvel" },
  { id: "pancake-pilot", emoji: "🥞", name: "Pancake Pilot" },
];

export function stickerById(id: string): Sticker | undefined {
  return STICKERS.find((s) => s.id === id);
}

/** Next sticker to earn for `packedCount` total packed days (rotates). */
export function stickerForPackedCount(packedCount: number): Sticker {
  return STICKERS[(Math.max(1, packedCount) - 1) % STICKERS.length];
}

export interface Level {
  id: string;
  emoji: string;
  name: string;
  /** Packed days needed to reach this level. */
  at: number;
}

export const LEVELS: Level[] = [
  { id: "sprout", emoji: "🌱", name: "Lunch Sprout", at: 0 },
  { id: "helper", emoji: "🧺", name: "Picnic Helper", at: 3 },
  { id: "star", emoji: "⭐", name: "Lunch Star", at: 7 },
  { id: "champion", emoji: "🏆", name: "Taste Champion", at: 14 },
];

/** Highest level reached for `packedCount` packed days. */
export function levelFor(packedCount: number): Level {
  let level = LEVELS[0];
  for (const l of LEVELS) {
    if (packedCount >= l.at) level = l;
  }
  return level;
}

/** Next level after the current one, or null at max. */
export function nextLevel(packedCount: number): Level | null {
  return LEVELS.find((l) => l.at > packedCount) ?? null;
}
