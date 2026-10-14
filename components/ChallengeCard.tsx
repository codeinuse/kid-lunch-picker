"use client";

import Link from "next/link";
import { STARTER_FOODS } from "@/lib/starter-foods";
import { useActiveKid } from "@/lib/store";
import { speak } from "@/lib/speak";

/** Daily taste mission: first untried food (veggies + fruits first). */
export function ChallengeCard() {
  const { profile, tried } = useActiveKid();
  if (!profile) return null;

  const mission =
    STARTER_FOODS.find(
      (f) => !tried[f.id] && (f.category === "veggie" || f.category === "fruit"),
    ) ?? STARTER_FOODS.find((f) => !tried[f.id]);

  if (!mission) {
    return (
      <div className="sticker flex w-full items-center justify-center gap-2 p-3 text-center">
        <span className="font-display text-xl font-semibold text-stone-700">
          🏆 Taste champion! You tried everything!
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/browse/${mission.category}`}
      onClick={() => speak(`Mission time! Try ${mission.name}!`)}
      className="sticker flex w-full items-center gap-3 p-3 active:translate-y-1 active:shadow-none"
      aria-label={`Mission: try ${mission.name}`}
    >
      <span className="text-5xl" aria-hidden>
        {mission.emoji}
      </span>
      <span>
        <span className="block font-display text-xl font-semibold text-stone-800">
          🌟 Mission: try {mission.name}!
        </span>
        <span className="block text-base font-bold text-stone-500">
          Tap here to accept →
        </span>
      </span>
    </Link>
  );
}
