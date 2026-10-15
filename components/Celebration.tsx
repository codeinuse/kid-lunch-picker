"use client";

import { motion } from "framer-motion";
import { todayKey, useActiveKid, useLunchStore } from "@/lib/store";
import { ConfettiExplosion } from "@/components/ConfettiExplosion";
import { speak } from "@/lib/speak";
import { useFanfareSound, useTapSound } from "@/lib/sounds";
import { SausageMascot } from "@/components/SausageMascot";
import { stickerForPackedCount } from "@/lib/stickers";
import { useEffect, useMemo, useRef } from "react";

/** ISO date key 6 days before `today` — explorer badge window. */
function weekAgoKey(today: string | null): string | null {
  if (!today) return null;
  const [y, m, d] = today.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 6);
  return todayKey(dt);
}

/** Progress bar + celebration when the tray is complete. */
export function Celebration() {
  const { filled, total, theme, picks, tried, packedDays, todayKey: today } = useActiveKid();
  // Explorer badge: a current pick first-tasted recently, on a return tray.
  // Derived from the post-mount today key (no new Date() during prerender,
  // no setState-in-effect).
  const weekAgo = useMemo(() => weekAgoKey(today), [today]);
  const hasHistory = today !== null && packedDays.some((d) => d < today);
  const isExplorer =
    weekAgo !== null &&
    Object.values(picks).some((p) => {
      if (!p) return false;
      const first = tried[p.item.id];
      return !!first && first >= weekAgo && hasHistory;
    });
  const clearTray = useLunchStore((s) => s.clearTray);
  const recordPackedDay = useLunchStore((s) => s.recordPackedDay);
  const awardSticker = useLunchStore((s) => s.awardSticker);
  const fanfare = useFanfareSound();
  const tap = useTapSound();
  const announced = useRef(false);
  const complete = filled === total;
  // Balance nudge: when the tray is growing but has nothing fresh yet,
  // remind the kid — rainbow lunches are the tastiest!
  const pickedCats = new Set(
    Object.values(picks).flatMap((p) => (p ? [p.item.category] : [])),
  );
  const needsRainbow =
    !complete &&
    filled >= 1 &&
    !pickedCats.has("fruit") &&
    !pickedCats.has("veggie");

  useEffect(() => {
    if (complete && !announced.current) {
      announced.current = true;
      recordPackedDay();
      // Earn the next sticker in rotation for this packed lunch.
      const earned = useLunchStore.getState();
      const id = earned.activeId;
      const count = id ? (earned.packedDays[id] ?? []).length : 0;
      awardSticker(stickerForPackedCount(count).id);
      fanfare();
      speak(theme.completeLine);
    }
    if (!complete) announced.current = false;
  }, [complete, fanfare, theme, recordPackedDay, awardSticker]);

  return (
    <div className="w-full">
      <div
        className="flex w-full items-center justify-center gap-1.5"
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`You picked ${filled} of ${total} items`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={i < filled ? { scale: [1, 1.5, 1], rotate: [0, 20, 0] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            aria-hidden
            className={`text-4xl ${i < filled ? "" : "opacity-30 grayscale"}`}
          >
            ⭐
          </motion.span>
        ))}
      </div>
      <p className="mt-1 text-center font-display text-2xl font-semibold text-stone-700">
        {complete ? `🎉 ${theme.completeLine} 🎉` : `You picked ${filled} of ${total}!`}
      </p>
      {needsRainbow && (
        <p className="mt-1 text-center text-lg font-bold text-stone-500" aria-live="polite">
          🌈 Rainbow power! Add something fruity or crunchy! 🍎🥕
        </p>
      )}
      {complete && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="sticker relative mt-2 overflow-hidden p-4 text-center"
        >
          <ConfettiExplosion />
          <SausageMascot emotion="cheer" className="relative mx-auto h-36 w-auto" />
          <p className="relative mt-1 font-display text-2xl font-semibold text-stone-800">
            Sizzle loves your lunch!
          </p>
          {isExplorer && (
            <p className="relative mt-1 inline-block rounded-full bg-purple-600 px-4 py-1 font-display text-lg font-semibold text-white">
              🕵️ New food explorer!
            </p>
          )}
          <div className="relative mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                tap();
                window.print();
              }}
              className="min-h-12 rounded-full bg-sky-700 px-6 py-3 font-display text-xl font-semibold text-white shadow active:scale-95"
            >
              Print My Lunch! 🖨️
            </button>
            <button
              type="button"
              onClick={() => {
                tap();
                clearTray();
              }}
              className="min-h-12 rounded-full bg-orange-700 px-6 py-3 font-display text-xl font-semibold text-white shadow active:scale-95"
            >
              Start Over 🔄
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
