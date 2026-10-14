"use client";

import { motion } from "framer-motion";
import { useActiveKid, useLunchStore } from "@/lib/store";
import { ConfettiExplosion } from "@/components/ConfettiExplosion";
import { speak } from "@/lib/speak";
import { useFanfareSound, useTapSound } from "@/lib/sounds";
import { CheererMascot, GuideMascot } from "@/components/Mascot";
import { useEffect, useRef, useState } from "react";

/** Progress bar + celebration when the tray is complete. */
export function Celebration() {
  const { filled, total, themeId, theme, picks, tried, packedDays, todayKey: today } = useActiveKid();
  // Explorer badge: a current pick first-tasted recently, on a return tray.
  // Dates resolve post-mount (no new Date() during prerender).
  const [weekAgo, setWeekAgo] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setWeekAgo(`${y}-${m}-${day}`);
  }, []);
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
  const fanfare = useFanfareSound();
  const tap = useTapSound();
  const announced = useRef(false);
  const complete = filled === total;

  useEffect(() => {
    if (complete && !announced.current) {
      announced.current = true;
      recordPackedDay();
      fanfare();
      speak(theme.completeLine);
    }
    if (!complete) announced.current = false;
  }, [complete, fanfare, theme, recordPackedDay]);

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
      {complete && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="sticker relative mt-2 overflow-hidden p-4 text-center"
        >
          <ConfettiExplosion />
          {themeId === "classic" ? (
            <CheererMascot className="relative mx-auto h-36 w-auto" />
          ) : (
            <GuideMascot kind={themeId} className="relative mx-auto h-36 w-auto" />
          )}
          <p className="relative mt-1 font-display text-2xl font-semibold text-stone-800">
            {themeId === "classic" ? "Leo loves your lunch!" : `${theme.name} crew loves your lunch!`}
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
