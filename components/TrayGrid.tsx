"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CATEGORIES } from "@/lib/categories";
import { optionsFor, summarizeOptions } from "@/lib/options";
import { emptyTraySelection, useMounted, useTrayStore } from "@/lib/store";

/** The lunch tray: 6 slots, one per category. Tap a slot to browse it. */
export function TrayGrid() {
  // Server-identical empty tray until mounted (see Celebration).
  const mounted = useMounted();
  const storePicks = useTrayStore((s) => s.picks);
  const picks = mounted ? storePicks : emptyTraySelection();
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3" role="list">
      {CATEGORIES.map((cat) => {
        const pick = picks[cat.id];
        const summary =
          pick && pick.item
            ? summarizeOptions(
                optionsFor(pick.item.id, pick.item.category),
                pick.options,
              )
            : "";
        return (
          <Link
            key={cat.id}
            href={`/browse/${cat.id}`}
            role="listitem"
            aria-label={
              pick?.item
                ? `${cat.label}: ${pick.item.name}. Tap to change.`
                : `${cat.label}: empty. Tap to pick.`
            }
            className={`flex min-h-40 flex-col items-center justify-center gap-1 rounded-3xl p-3 shadow-sm ring-4 transition-transform active:scale-95 ${cat.bg} ${pick ? cat.accent : "ring-white/60"}`}
          >
            <motion.span
              key={pick?.item.id ?? "empty"}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              className="text-6xl"
              aria-hidden
            >
              {pick?.item ? pick.item.emoji : cat.emoji}
            </motion.span>
            <span className="text-base font-extrabold text-stone-700">
              {cat.label}
            </span>
            <span className="text-lg font-bold text-stone-800">
              {pick?.item ? pick.item.name : "Pick! 👆"}
            </span>
            {summary !== "" && (
              <span className="text-sm font-bold text-stone-500">{summary}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
