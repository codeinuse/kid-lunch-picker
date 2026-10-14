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

/** Parent-controlled avoid list + voice settings. Toggled items are hidden. */
export function AllergenBar() {
  const { avoids } = useActiveKid();
  const toggleAvoid = useLunchStore((s) => s.toggleAvoid);
  const settings = useLunchStore((s) => s.settings);
  const setVoiceOn = useLunchStore((s) => s.setVoiceOn);
  const setVoiceRate = useLunchStore((s) => s.setVoiceRate);
  const tap = useTapSound();
  return (
    <section aria-label="Grown-ups settings" className="w-full">
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
              className={`min-h-12 rounded-full border-2 px-3 py-2 text-sm font-bold transition-all active:translate-y-0.5 ${
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
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            tap();
            setVoiceOn(!settings.voiceOn);
          }}
          aria-pressed={settings.voiceOn}
          aria-label="Guide voice on or off"
          className={`min-h-12 rounded-full border-2 px-4 py-2 text-sm font-bold transition-all active:translate-y-0.5 ${
            settings.voiceOn
              ? "border-stone-900 bg-green-700 text-white shadow-[0_3px_0_#1c1917] active:shadow-none"
              : "border-stone-300 bg-white text-stone-500 shadow-sm"
          }`}
        >
          {settings.voiceOn ? "🔊 Voice on" : "🔇 Voice off"}
        </button>
        <label className="flex min-h-12 items-center gap-2 rounded-full border-2 border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-600">
          <span aria-hidden>🐢</span>
          <input
            type="range"
            min={0.7}
            max={1.2}
            step={0.1}
            value={settings.voiceRate}
            onChange={(e) => setVoiceRate(Number(e.target.value))}
            aria-label="Voice speed"
            className="w-24 accent-orange-600"
          />
          <span aria-hidden>🐇</span>
        </label>
      </div>
    </section>
  );
}
