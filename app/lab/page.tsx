"use client";

import Link from "next/link";
import { useState } from "react";
import type { FoodItem } from "@/lib/types";
import { STARTER_FOODS } from "@/lib/starter-foods";
import { foodFact } from "@/lib/food-facts";
import { FoodCard } from "@/components/FoodCard";
import { PointerMascot } from "@/components/Mascot";
import { speak } from "@/lib/speak";

/**
 * Snack Lab: pressure-free food exploration. No tray, no progress —
 * tap anything to hear its name and a wow fact. (Synthesis Playground.)
 */
export default function LabPage() {
  const [current, setCurrent] = useState<FoodItem | null>(null);

  const explore = (item: FoodItem) => {
    setCurrent(item);
    speak(`${item.name}! ${foodFact(item.id, item.category)}`);
  };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-4 px-4 py-6">
      <div className="flex w-full items-center gap-3">
        <Link
          href="/"
          aria-label="Back to tray"
          className="sticker-sm flex min-h-16 min-w-16 shrink-0 items-center justify-center text-3xl active:translate-y-0.5 active:shadow-none"
        >
          ←
        </Link>
        <div>
          <h1 className="font-display text-3xl font-semibold text-stone-800">
            🔬 Snack Lab!
          </h1>
          <p className="text-lg font-bold text-stone-500">
            Just for fun — tap anything! 😋
          </p>
        </div>
      </div>

      {current ? (
        <div className="sticker flex w-full items-center gap-3 p-4" aria-live="polite">
          <span className="text-6xl" aria-hidden>
            {current.emoji}
          </span>
          <div>
            <p className="font-display text-2xl font-semibold text-stone-800">
              {current.name}!
            </p>
            <p className="text-lg font-bold text-stone-600">
              {foodFact(current.id, current.category)}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center justify-center gap-2 rounded-3xl bg-white/70 p-3">
          <PointerMascot className="h-16 w-auto" />
          <p className="font-display text-xl font-medium text-stone-600">
            What shall we discover?
          </p>
        </div>
      )}

      <div className="grid w-full grid-cols-2 gap-3">
        {STARTER_FOODS.map((item) => (
          <FoodCard
            key={item.id}
            item={item}
            selected={current?.id === item.id}
            onPick={explore}
          />
        ))}
      </div>

      <Link
        href="/"
        className="mt-2 flex min-h-16 w-full items-center justify-center rounded-full border-[3px] border-stone-900 bg-green-700 font-display text-2xl font-semibold text-white shadow-[0_5px_0_#1c1917] active:translate-y-1 active:shadow-none"
      >
        Back to Tray ✅
      </Link>
    </main>
  );
}
