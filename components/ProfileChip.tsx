"use client";

import { useActiveKid, useLunchStore } from "@/lib/store";
import { useTapSound } from "@/lib/sounds";

/** Signed-in kid + switch button in the home header. */
export function ProfileChip() {
  const { profile } = useActiveKid();
  const logout = useLunchStore((s) => s.logout);
  const tap = useTapSound();
  if (!profile) return null;
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <p className="min-h-11 rounded-full border-2 border-stone-900 bg-white px-4 py-2 font-display text-lg font-semibold text-stone-800">
        <span aria-hidden>{profile.avatar}</span> {profile.name}
      </p>
      <button
        type="button"
        onClick={() => {
          tap();
          logout();
        }}
        className="min-h-11 rounded-full border-2 border-stone-300 bg-white px-4 py-2 text-base font-bold text-stone-500 active:scale-95"
      >
        Switch ↪
      </button>
    </div>
  );
}
