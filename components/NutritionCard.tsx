"use client";

import { motion } from "framer-motion";
import { useActiveKid, useLunchStore } from "@/lib/store";
import { coachLine, scoreTray } from "@/lib/nutrition";
import { SausageMascot } from "@/components/SausageMascot";
import { useTapSound } from "@/lib/sounds";

function barColor(pct: number): string {
  if (pct >= 70) return "bg-green-500";
  if (pct >= 40) return "bg-yellow-400";
  return "bg-red-400";
}

/**
 * Lunch Power: live nutrition scoreboard. Six kid-named powers fill
 * as the tray fills, against lunch targets tuned by the kid's age
 * and gender. Estimates for fun — not doctor advice.
 */
export function NutritionCard() {
  const { picks, profile } = useActiveKid();
  const setGender = useLunchStore((s) => s.setGender);
  const tap = useTapSound();
  const result = scoreTray(picks, profile?.age ?? null, profile?.gender ?? null);
  return (
    <section aria-label="Lunch power score" className="sticker w-full p-4">
      <div className="flex items-center gap-3">
        <SausageMascot
          emotion={result.score >= 70 ? "cheer" : result.score >= 40 ? "playful" : "greet"}
          className="h-20 w-auto shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-semibold text-stone-800">
            Lunch Power: {result.score}
            <span aria-hidden>⚡</span>
          </h2>
          <p className="text-lg font-bold text-stone-500">
            <span aria-hidden>{result.levelEmoji} </span>
            {result.level}
          </p>
        </div>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {result.powers.map((p) => {
          const pct = Math.round(p.pct);
          return (
            <li key={p.info.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-extrabold text-stone-700">
                  <span aria-hidden>{p.info.emoji} </span>
                  {p.info.power}
                </span>
                <span className="text-sm font-bold text-stone-500">
                  {Math.round(p.got)}/{Math.round(p.target)}
                  {p.info.unit} · {pct}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`${p.info.power}: ${pct} percent of lunch need`}
                aria-valuenow={Math.min(pct, 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-1 h-4 overflow-hidden rounded-full bg-stone-100 ring-1 ring-stone-200"
              >
                <motion.div
                  initial={false}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${barColor(pct)}`}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {result.weakest && (
        <p className="mt-3 text-center text-lg font-bold text-stone-600" aria-live="polite">
          💡 {coachLine(result.weakest)}
        </p>
      )}
      {result.filled === 0 && (
        <p className="mt-3 text-center text-lg font-bold text-stone-500">
          Pick foods to charge your powers! ⚡
        </p>
      )}

      {profile && profile.gender === null && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-sm font-bold text-stone-500">Targets tuned for:</span>
          {(["boy", "girl"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                tap();
                setGender(g);
              }}
              className="min-h-10 rounded-full border-2 border-stone-300 bg-white px-4 text-sm font-extrabold text-stone-600 active:scale-95"
            >
              {g === "boy" ? "💙 Boy" : "💜 Girl"}
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-center text-xs font-semibold text-stone-400">
        Fun estimates per serving, not doctor advice. Lunch ≈ 30% of the day.
      </p>
    </section>
  );
}
