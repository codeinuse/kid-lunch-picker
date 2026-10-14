"use client";

import { useActiveKid } from "@/lib/store";
import { STICKERS, levelFor, nextLevel, stickerById } from "@/lib/stickers";

/**
 * Rewards shelf: earned sticker collection + level progress.
 * Retention hook — every packed lunch visibly grows this shelf.
 */
export function StickerCollection() {
  const { profile, stickers, packedDays } = useActiveKid();
  if (!profile) return null;

  const packedCount = packedDays.length;
  const level = levelFor(packedCount);
  const upcoming = nextLevel(packedCount);

  return (
    <section
      aria-label={`Sticker collection, ${stickers.length} of ${STICKERS.length} earned`}
      className="sticker w-full p-4"
    >
      <div className="flex items-center justify-center gap-2">
        <span className="text-3xl" aria-hidden>
          {level.emoji}
        </span>
        <p className="font-display text-2xl font-semibold text-stone-800">
          {level.name}
        </p>
      </div>
      {upcoming && (
        <p className="mt-0.5 text-center text-base font-bold text-stone-500">
          {upcoming.at - packedCount} more {upcoming.at - packedCount === 1 ? "lunch" : "lunches"} to
          become {upcoming.name} {upcoming.emoji}
        </p>
      )}
      <div className="mt-3 grid grid-cols-6 gap-2" role="list">
        {STICKERS.map((s) => {
          const earned = stickers.includes(s.id);
          const meta = stickerById(s.id);
          return (
            <div
              key={s.id}
              role="listitem"
              title={earned ? meta?.name : "Keep packing to earn!"}
              aria-label={earned ? `Earned: ${s.name}` : `Locked: ${s.name}`}
              className={`flex aspect-square items-center justify-center rounded-2xl border-2 text-3xl ${
                earned
                  ? "border-stone-900 bg-yellow-100 shadow-[0_3px_0_#1c1917]"
                  : "border-dashed border-stone-200 bg-stone-50 opacity-40 grayscale"
              }`}
            >
              <span aria-hidden>{earned ? s.emoji : "❔"}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
