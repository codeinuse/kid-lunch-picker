"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Allergen, FoodCategory, FoodItem, TraySelection } from "./types";
import { CATEGORIES } from "./categories";

interface TrayState {
  picks: TraySelection;
  avoids: Allergen[];
  setPick: (category: FoodCategory, item: FoodItem | null) => void;
  toggleAvoid: (allergen: Allergen) => void;
  clearTray: () => void;
  /** Number of filled slots. */
  filledCount: () => number;
  totalSlots: number;
}

const emptyTray = (): TraySelection =>
  Object.fromEntries(CATEGORIES.map((c) => [c.id, null])) as TraySelection;

export const useTrayStore = create<TrayState>()(
  persist(
    (set, get) => ({
      picks: emptyTray(),
      avoids: [],
      setPick: (category, item) =>
        set((s) => ({ picks: { ...s.picks, [category]: item } })),
      toggleAvoid: (allergen) =>
        set((s) => ({
          avoids: s.avoids.includes(allergen)
            ? s.avoids.filter((a) => a !== allergen)
            : [...s.avoids, allergen],
        })),
      clearTray: () => set({ picks: emptyTray() }),
      filledCount: () =>
        Object.values(get().picks).filter((p) => p !== null).length,
      totalSlots: CATEGORIES.length,
    }),
    { name: "lunch-tray" },
  ),
);
