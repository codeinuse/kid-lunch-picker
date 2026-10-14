"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Allergen,
  FoodCategory,
  PickedFood,
  TraySelection,
} from "./types";
import { CATEGORIES, visibleCategories } from "./categories";
import { THEMES, themePack, type ThemeId } from "./themes";

export interface KidProfile {
  id: string;
  name: string;
  avatar: string;
  /** 4-digit device PIN (kept on this device only). */
  pin: string;
  theme: ThemeId;
  /** Age in years (10 = 10+); null when unknown. Drives slot count. */
  age: number | null;
}

export interface TrayData {
  picks: TraySelection;
  avoids: Allergen[];
}

export interface VoiceSettings {
  voiceOn: boolean;
  voiceRate: number;
}

/** ISO dates (yyyy-mm-dd) the tray was completed, per profile. */
export type PackedDays = Record<string, string[]>;

/** First-picked date per food, per profile — powers explorer badges. */
export type TriedAt = Record<string, Record<string, string>>;

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Consecutive-day streak ending `today` (yesterday counts as alive). */
export function streakCount(days: string[], today: Date): number {
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date(today);
  if (!set.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(todayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

interface LunchState {
  profiles: KidProfile[];
  activeId: string | null;
  trays: Record<string, TrayData>;
  settings: VoiceSettings;
  packedDays: PackedDays;
  triedAt: TriedAt;
  /** Tour seen once per profile — first-run coachmarks. */
  seenTour: Record<string, boolean>;
  /** Earned sticker ids per profile — the rewards collection. */
  stickers: Record<string, string[]>;
  totalSlots: number;
  createProfile: (name: string, avatar: string, pin: string, theme?: ThemeId, age?: number | null) => string;
  selectProfile: (id: string) => void;
  logout: () => void;
  setTheme: (theme: ThemeId) => void;
  setVoiceOn: (on: boolean) => void;
  setVoiceRate: (rate: number) => void;
  recordPackedDay: () => void;
  setPick: (category: FoodCategory, pick: PickedFood | null) => void;
  toggleAvoid: (allergen: Allergen) => void;
  clearTray: () => void;
  markTourSeen: () => void;
  awardSticker: (id: string) => void;
}

export const emptyTraySelection = (): TraySelection =>
  Object.fromEntries(CATEGORIES.map((c) => [c.id, null])) as TraySelection;

const freshTray = (): TrayData => ({ picks: emptyTraySelection(), avoids: [] });

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Shared empty defaults. Fresh `[]`/`{}` literals here would create a new
 * identity on every render — any effect depending on them (e.g. StreakRow's
 * week builder) would re-run forever, starving router transitions until
 * taps silently die. These constants keep the identity stable.
 */
const EMPTY_PACKED: string[] = [];
const EMPTY_TRIED: Record<string, string> = {};

export const useLunchStore = create<LunchState>()(
  persist(
    (set) => ({
      profiles: [],
      activeId: null,
      trays: {},
      settings: { voiceOn: true, voiceRate: 0.9 },
      packedDays: {} as PackedDays,
      triedAt: {} as TriedAt,
      seenTour: {},
      stickers: {},
      totalSlots: CATEGORIES.length,
      createProfile: (name, avatar, pin, theme = "classic", age = null) => {
        const id = newId();
        set((s) => ({
          profiles: [...s.profiles, { id, name, avatar, pin, theme, age }],
          trays: { ...s.trays, [id]: freshTray() },
          activeId: id,
        }));
        return id;
      },
      selectProfile: (id) => set({ activeId: id }),
      logout: () => set({ activeId: null }),
      setVoiceOn: (on) =>
        set((s) => ({ settings: { ...s.settings, voiceOn: on } })),
      setVoiceRate: (rate) =>
        set((s) => ({ settings: { ...s.settings, voiceRate: rate } })),
      recordPackedDay: () =>
        set((s) => {
          if (!s.activeId) return s;
          const key = todayKey();
          const days = s.packedDays[s.activeId] ?? [];
          if (days.includes(key)) return s;
          return {
            packedDays: { ...s.packedDays, [s.activeId]: [...days, key] },
          };
        }),
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
          const tried = s.triedAt[s.activeId] ?? {};
          const key = todayKey();
          return {
            trays: {
              ...s.trays,
              [s.activeId]: {
                ...tray,
                picks: { ...tray.picks, [category]: pick },
              },
            },
            triedAt: {
              ...s.triedAt,
              [s.activeId]:
                pick && !tried[pick.item.id]
                  ? { ...tried, [pick.item.id]: key }
                  : tried,
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
      markTourSeen: () =>
        set((s) => {
          if (!s.activeId) return s;
          return { seenTour: { ...s.seenTour, [s.activeId]: true } };
        }),
      awardSticker: (id) =>
        set((s) => {
          if (!s.activeId) return s;
          const earned = s.stickers[s.activeId] ?? [];
          if (earned.includes(id)) return s;
          return { stickers: { ...s.stickers, [s.activeId]: [...earned, id] } };
        }),
    }),
    {
      name: "lunch-tray",
      version: 7,
      // v6 adds ages + first-tried dates; v7 adds tour flags + stickers.
      migrate: (persisted: unknown) => {
        const state = persisted as {
          profiles?: (Omit<KidProfile, "theme" | "age"> & { theme?: ThemeId; age?: number | null })[];
          activeId?: string | null;
          trays?: Record<string, TrayData>;
          settings?: VoiceSettings;
          packedDays?: PackedDays;
          triedAt?: TriedAt;
          seenTour?: Record<string, boolean>;
          stickers?: Record<string, string[]>;
        };
        return {
          profiles: (state.profiles ?? []).map((p) => ({
            ...p,
            theme: (p.theme && THEMES[p.theme] ? p.theme : "classic") as ThemeId,
            age: p.age ?? null,
          })),
          activeId: state.activeId ?? null,
          trays: state.trays ?? {},
          settings: state.settings ?? { voiceOn: true, voiceRate: 0.9 },
          packedDays: state.packedDays ?? {},
          triedAt: state.triedAt ?? {},
          seenTour: state.seenTour ?? {},
          stickers: state.stickers ?? {},
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
  // No setState-in-effect: server snapshot false, client snapshot true.
  // Keeps the first client render identical to SSR HTML (no mismatch).
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * The signed-in kid's profile + tray. Before mount (or signed out),
 * returns safe empty defaults matching the SSR HTML.
 */
export function useActiveKid() {
  const mounted = useMounted();
  // "Today" is captured post-mount only: constructing dates during render
  // breaks prerendering (Next 16 flags new Date() in client components).
  // Derived during render — no setState-in-effect. Only date strings and
  // counts flow downstream, so the fresh Date identity is harmless.
  const today = mounted ? new Date() : null;
  const profiles = useLunchStore((s) => s.profiles);
  const activeId = useLunchStore((s) => s.activeId);
  const trays = useLunchStore((s) => s.trays);
  const profile = mounted ? profiles.find((p) => p.id === activeId) ?? null : null;
  const tray = profile ? trays[profile.id] : undefined;
  const themeId = profile?.theme ?? "classic";
  const packedDaysMap = useLunchStore((s) => s.packedDays);
  const triedAtMap = useLunchStore((s) => s.triedAt);
  const seenTourMap = useLunchStore((s) => s.seenTour);
  const stickersMap = useLunchStore((s) => s.stickers);
  const packed =
    profile && mounted ? (packedDaysMap[profile.id] ?? EMPTY_PACKED) : EMPTY_PACKED;
  const tried =
    profile && mounted ? (triedAtMap[profile.id] ?? EMPTY_TRIED) : EMPTY_TRIED;
  const slots = visibleCategories(profile?.age ?? null);
  const visibleIds = new Set(slots.map((c) => c.id));
  return {
    mounted,
    profiles: mounted ? profiles : [],
    profile,
    themeId,
    theme: themePack(mounted ? themeId : "classic"),
    packedDays: packed,
    todayKey: today ? todayKey(today) : null,
    streak: today ? streakCount(packed, today) : 0,
    tried,
    seenTour: profile && mounted ? (seenTourMap[profile.id] ?? false) : false,
    stickers: profile && mounted ? (stickersMap[profile.id] ?? []) : [],
    slots,
    total: slots.length,
    picks: tray?.picks ?? emptyTraySelection(),
    avoids: tray?.avoids ?? [],
    filled: profile
      ? Object.entries(tray?.picks ?? {})
          .filter(([cat, p]) => p !== null && visibleIds.has(cat as FoodCategory))
          .length
      : 0,
  };
}

// Back-compat re-export for components migrated to useActiveKid.
export const useTrayStore = useLunchStore;
