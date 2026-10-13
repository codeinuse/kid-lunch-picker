"use client";

import type { Allergen } from "@/lib/types";
import { useMounted, useTrayStore } from "@/lib/store";

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
  // Server-identical empty avoids until mounted (see Celebration).
  const mounted = useMounted();
  const storeAvoids = useTrayStore((s) => s.avoids);
  const toggleAvoid = useTrayStore((s) => s.toggleAvoid);
  const avoids = mounted ? storeAvoids : [];
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
              onClick={() => toggleAvoid(a.id)}
              aria-pressed={active}
              className={`min-h-11 rounded-full px-3 py-2 text-sm font-bold shadow-sm transition-colors ${
                active
                  ? "bg-red-500 text-white"
                  : "bg-white text-stone-600 ring-1 ring-stone-200"
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
