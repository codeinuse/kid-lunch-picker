"use client";

import { motion } from "framer-motion";
import { Lottie } from "lottie-react";
import { useActiveKid, useLunchStore } from "@/lib/store";
import { speak } from "@/lib/speak";
import { useFanfareSound, useTapSound } from "@/lib/sounds";
import { CheererMascot } from "@/components/Mascot";
import { useEffect, useRef } from "react";

/** Progress bar + celebration when the tray is complete. */
export function Celebration() {
  const { filled } = useActiveKid();
  const total = useLunchStore((s) => s.totalSlots);
  const clearTray = useLunchStore((s) => s.clearTray);
  const fanfare = useFanfareSound();
  const tap = useTapSound();
  const announced = useRef(false);
  const complete = filled === total;

  useEffect(() => {
    if (complete && !announced.current) {
      announced.current = true;
      fanfare();
      speak("All done! Great lunch!");
    }
    if (!complete) announced.current = false;
  }, [complete, fanfare]);

  return (
    <div className="w-full">
      <div
        className="h-6 w-full overflow-hidden rounded-full border-2 border-stone-900 bg-white"
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`You picked ${filled} of ${total} items`}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
          animate={{ width: `${(filled / total) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <p className="mt-1 text-center font-display text-2xl font-semibold text-stone-700">
        {complete ? "🎉 All done! Great lunch! 🎉" : `You picked ${filled} of ${total}!`}
      </p>
      {complete && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="sticker relative mt-2 overflow-hidden p-4 text-center"
        >
          <Lottie
            src="/lottie/confetti.json"
            autoplay
            loop={false}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-40 w-full"
          />
          <CheererMascot className="relative mx-auto h-36 w-auto" />
          <p className="relative mt-1 font-display text-2xl font-semibold text-stone-800">
            Leo loves your lunch!
          </p>
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
