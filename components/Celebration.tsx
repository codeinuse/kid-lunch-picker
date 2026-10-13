"use client";

import { motion } from "framer-motion";
import { useMounted, useTrayStore } from "@/lib/store";
import { speak } from "@/lib/speak";
import { useEffect, useRef } from "react";

/** Progress bar + celebration when the tray is complete. */
export function Celebration() {
  // Render the server-identical empty state until mounted (persisted
  // picks would otherwise mismatch the SSR HTML → hydration error).
  const mounted = useMounted();
  const filledCount = useTrayStore((s) => s.filledCount);
  const total = useTrayStore((s) => s.totalSlots);
  const filled = mounted ? filledCount() : 0;
  const clearTray = useTrayStore((s) => s.clearTray);
  const announced = useRef(false);
  const complete = filled === total;

  useEffect(() => {
    if (complete && !announced.current) {
      announced.current = true;
      speak("All done! Great lunch!");
    }
    if (!complete) announced.current = false;
  }, [complete]);

  return (
    <div className="w-full">
      <div
        className="h-5 w-full overflow-hidden rounded-full bg-stone-200"
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
      <p className="mt-1 text-center text-lg font-extrabold text-stone-700">
        {complete ? "🎉 All done! Great lunch! 🎉" : `You picked ${filled} of ${total}!`}
      </p>
      {complete && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-2 rounded-3xl bg-yellow-100 p-4 text-center ring-4 ring-yellow-300"
        >
          <p className="text-4xl" aria-hidden>🦁🎊🍱🎊🦁</p>
          <p className="mt-1 text-xl font-black text-stone-800">
            Leo the Lion loves your lunch!
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-12 rounded-full bg-sky-500 px-6 py-3 text-lg font-extrabold text-white shadow active:scale-95"
            >
              Print My Lunch! 🖨️
            </button>
            <button
              type="button"
              onClick={clearTray}
              className="min-h-12 rounded-full bg-orange-500 px-6 py-3 text-lg font-extrabold text-white shadow active:scale-95"
            >
              Start Over 🔄
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
