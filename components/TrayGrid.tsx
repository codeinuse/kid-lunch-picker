"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { optionsFor, summarizeOptions } from "@/lib/options";
import { useActiveKid } from "@/lib/store";

/** The lunch tray: one slot per visible category (4 for under-7s). */
export function TrayGrid() {
  const { picks, slots } = useActiveKid();
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3" role="list">
      {slots.map((cat) => {
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
            className={`sticker flex min-h-40 flex-col items-center justify-center gap-1 p-3 transition-transform active:translate-y-1 active:shadow-none ${cat.bg}`}
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
            <span className="break-words text-center font-display text-lg font-medium leading-tight text-stone-800">
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
