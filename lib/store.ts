"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Allergen,
  FoodCategory,
  FoodItem,
  PickedFood,
  TraySelection,
} from "./types";
import { CATEGORIES } from "./categories";

interface TrayState {
  picks: TraySelection;
  avoids: Allergen[];
  setPick: (category: FoodCategory, pick: PickedFood | null) => void;
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
      setPick: (category, pick) =>
        set((s) => ({ picks: { ...s.picks, [category]: pick } })),
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
    {
      name: "lunch-tray",
      version: 1,
      migrate: (persisted: unknown) => {
        const state = persisted as { picks?: Record<string, unknown>; avoids?: Allergen[] };
        const picks = emptyTray();
        for (const cat of CATEGORIES.map((c) => c.id)) {
          const old = state.picks?.[cat] as { item?: FoodItem; id?: string } | null;
          if (old && typeof old === "object") {
            // v0 stored a bare FoodItem; v1 wraps it with options.
            picks[cat] =
              "item" in old && old.item
                ? (old as PickedFood)
                : { item: old as unknown as FoodItem, options: {} };
          }
        }
        return { picks, avoids: state.avoids ?? [] };
      },
    },
  ),
);
