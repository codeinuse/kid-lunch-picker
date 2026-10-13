"use client";

import { useEffect, useState } from "react";
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

export const emptyTraySelection = (): TraySelection =>
  Object.fromEntries(CATEGORIES.map((c) => [c.id, null])) as TraySelection;

/**
 * False during SSR and the first client render, true afterwards.
 * Gate persisted-store reads on this so the first client render
 * is identical to the server HTML (no hydration mismatch).
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

export const useTrayStore = create<TrayState>()(
  persist(
    (set, get) => ({
      picks: emptyTraySelection(),
      avoids: [],
      setPick: (category, pick) =>
        set((s) => ({ picks: { ...s.picks, [category]: pick } })),
      toggleAvoid: (allergen) =>
        set((s) => ({
          avoids: s.avoids.includes(allergen)
            ? s.avoids.filter((a) => a !== allergen)
            : [...s.avoids, allergen],
        })),
      clearTray: () => set({ picks: emptyTraySelection() }),
      filledCount: () =>
        Object.values(get().picks).filter((p) => p !== null).length,
      totalSlots: CATEGORIES.length,
    }),
    {
      name: "lunch-tray",
      version: 1,
      migrate: (persisted: unknown) => {
        const state = persisted as { picks?: Record<string, unknown>; avoids?: Allergen[] };
        const picks = emptyTraySelection();
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
