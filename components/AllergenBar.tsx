"use client";

import type { Allergen } from "@/lib/types";
import { useActiveKid, useLunchStore } from "@/lib/store";
import { useTapSound } from "@/lib/sounds";

const BIG9: { id: Allergen; label: string; emoji: string }[] = [
  { id: "milk", label: "Milk", emoji: "🥛" },
  { id: "eggs", label: "Eggs", emoji: "🥚" },
  { id: "peanuts", label: "Peanuts", emoji: "🥜" },
  { id: "tree_nuts", label: "Tree Nuts", emoji: "🌰" },
  { id: "wheat", label: "Wheat", emoji: "🌾" },
  { id: "soy", label: "Soy", emoji: "🫘" },
  { id: "fish", label: "Fish", emoji: "🐟" },
  { id: "shellfish", label: "Shellfish", emoji: "🦐" },
  { id: "sesame", label: "Sesame", emoji: "🥯" },
];

/** Parent-controlled avoid list. Toggled items are hidden from the kid. */
export function AllergenBar() {
  const { avoids } = useActiveKid();
  const toggleAvoid = useLunchStore((s) => s.toggleAvoid);
  const tap = useTapSound();
  return (
    <section aria-label="Foods to avoid" className="w-full">
      <p className="mb-2 text-center text-sm font-bold text-stone-500">
        👩‍👧 Grown-ups: tap foods to hide
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {BIG9.map((a) => {
          const active = avoids.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => {
                tap();
                toggleAvoid(a.id);
              }}
              aria-pressed={active}
              className={`min-h-11 rounded-full border-2 px-3 py-2 text-sm font-bold transition-all active:translate-y-0.5 ${
                active
                  ? "border-stone-900 bg-red-600 text-white shadow-[0_3px_0_#1c1917] active:shadow-none"
                  : "border-stone-300 bg-white text-stone-600 shadow-sm"
              }`}
            >
              <span aria-hidden>{a.emoji}</span> {active ? `No ${a.label} ✕` : a.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
