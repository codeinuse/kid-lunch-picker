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
import { THEMES, themePack, type ThemeId } from "./themes";

export interface KidProfile {
  id: string;
  name: string;
  avatar: string;
  /** 4-digit device PIN (kept on this device only). */
  pin: string;
  theme: ThemeId;
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
  createProfile: (name: string, avatar: string, pin: string, theme?: ThemeId) => string;
  selectProfile: (id: string) => void;
  logout: () => void;
  setTheme: (theme: ThemeId) => void;
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
      createProfile: (name, avatar, pin, theme = "classic") => {
        const id = newId();
        set((s) => ({
          profiles: [...s.profiles, { id, name, avatar, pin, theme }],
          trays: { ...s.trays, [id]: freshTray() },
          activeId: id,
        }));
        return id;
      },
      selectProfile: (id) => set({ activeId: id }),
      logout: () => set({ activeId: null }),
      setTheme: (theme) =>
        set((s) => {
          if (!s.activeId) return s;
          return {
            profiles: s.profiles.map((p) =>
              p.id === s.activeId ? { ...p, theme } : p,
            ),
          };
        }),
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
      version: 3,
      // v3 adds per-profile themes; older profiles get the classic look.
      migrate: (persisted: unknown) => {
        const state = persisted as {
          profiles?: (Omit<KidProfile, "theme"> & { theme?: ThemeId })[];
          activeId?: string | null;
          trays?: Record<string, TrayData>;
        };
        return {
          profiles: (state.profiles ?? []).map((p) => ({
            ...p,
            theme: (p.theme && THEMES[p.theme] ? p.theme : "classic") as ThemeId,
          })),
          activeId: state.activeId ?? null,
          trays: state.trays ?? {},
        };
      },
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
  const themeId = profile?.theme ?? "classic";
  return {
    mounted,
    profiles: mounted ? profiles : [],
    profile,
    themeId,
    theme: themePack(mounted ? themeId : "classic"),
    picks: tray?.picks ?? emptyTraySelection(),
    avoids: tray?.avoids ?? [],
    filled: profile
      ? Object.values(tray?.picks ?? {}).filter((p) => p !== null).length
      : 0,
  };
}

// Back-compat re-export for components migrated to useActiveKid.
export const useTrayStore = useLunchStore;
