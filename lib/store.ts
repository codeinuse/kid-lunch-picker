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

export interface KidProfile {
  id: string;
  name: string;
  avatar: string;
  /** 4-digit device PIN (kept on this device only). */
  pin: string;
}

export interface TrayData {
  picks: TraySelection;
  avoids: Allergen[];
}

interface LunchState {
  profiles: KidProfile[];
  activeId: string | null;
  trays: Record<string, TrayData>;
  totalSlots: number;
  createProfile: (name: string, avatar: string, pin: string) => string;
  selectProfile: (id: string) => void;
  logout: () => void;
  setPick: (category: FoodCategory, pick: PickedFood | null) => void;
  toggleAvoid: (allergen: Allergen) => void;
  clearTray: () => void;
}

export const emptyTraySelection = (): TraySelection =>
  Object.fromEntries(CATEGORIES.map((c) => [c.id, null])) as TraySelection;

const freshTray = (): TrayData => ({ picks: emptyTraySelection(), avoids: [] });

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useLunchStore = create<LunchState>()(
  persist(
    (set) => ({
      profiles: [],
      activeId: null,
      trays: {},
      totalSlots: CATEGORIES.length,
      createProfile: (name, avatar, pin) => {
        const id = newId();
        set((s) => ({
          profiles: [...s.profiles, { id, name, avatar, pin }],
          trays: { ...s.trays, [id]: freshTray() },
          activeId: id,
        }));
        return id;
      },
      selectProfile: (id) => set({ activeId: id }),
      logout: () => set({ activeId: null }),
      setPick: (category, pick) =>
        set((s) => {
          if (!s.activeId) return s;
          const tray = s.trays[s.activeId] ?? freshTray();
          return {
            trays: {
              ...s.trays,
              [s.activeId]: {
                ...tray,
                picks: { ...tray.picks, [category]: pick },
              },
            },
          };
        }),
      toggleAvoid: (allergen) =>
        set((s) => {
          if (!s.activeId) return s;
          const tray = s.trays[s.activeId] ?? freshTray();
          const avoids = tray.avoids.includes(allergen)
            ? tray.avoids.filter((a) => a !== allergen)
            : [...tray.avoids, allergen];
          return {
            trays: { ...s.trays, [s.activeId]: { ...tray, avoids } },
          };
        }),
      clearTray: () =>
        set((s) => {
          if (!s.activeId) return s;
          const tray = s.trays[s.activeId] ?? freshTray();
          return {
            trays: {
              ...s.trays,
              [s.activeId]: { ...tray, picks: emptyTraySelection() },
            },
          };
        }),
    }),
    {
      name: "lunch-tray",
      version: 2,
      // v2 introduces kid profiles; old single-tray data doesn't map to a
      // kid, so everyone starts fresh (pre-release, picks take seconds).
      migrate: () => ({ profiles: [], activeId: null, trays: {} }),
    },
  ),
);

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

/**
 * The signed-in kid's profile + tray. Before mount (or signed out),
 * returns safe empty defaults matching the SSR HTML.
 */
export function useActiveKid() {
  const mounted = useMounted();
  const profiles = useLunchStore((s) => s.profiles);
  const activeId = useLunchStore((s) => s.activeId);
  const trays = useLunchStore((s) => s.trays);
  const profile = mounted ? profiles.find((p) => p.id === activeId) ?? null : null;
  const tray = profile ? trays[profile.id] : undefined;
  return {
    mounted,
    profiles: mounted ? profiles : [],
    profile,
    picks: tray?.picks ?? emptyTraySelection(),
    avoids: tray?.avoids ?? [],
    filled: profile
      ? Object.values(tray?.picks ?? {}).filter((p) => p !== null).length
      : 0,
  };
}

// Back-compat re-export for components migrated to useActiveKid.
export const useTrayStore = useLunchStore;
