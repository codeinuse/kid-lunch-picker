"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FoodItem } from "@/lib/types";
import { STARTER_FOODS } from "@/lib/starter-foods";
import { foodFact } from "@/lib/food-facts";
import { defaultOptions, optionsFor } from "@/lib/options";
import { useActiveKid, useLunchStore } from "@/lib/store";
import { FoodCard } from "@/components/FoodCard";
import { PointerMascot } from "@/components/Mascot";
import { speak } from "@/lib/speak";
import { addedLine } from "@/lib/guide-lines";
import { useAddSound } from "@/lib/sounds";

/**
 * Snack Lab: pressure-free food exploration that can flow into the tray.
 * Tap anything to hear its name and a wow fact — love it? Add it!
 */
export default function LabPage() {
  const router = useRouter();
  const [current, setCurrent] = useState<FoodItem | null>(null);
  const setPick = useLunchStore((s) => s.setPick);
  const add = useAddSound();
  const { profile } = useActiveKid();

  const explore = (item: FoodItem) => {
    setCurrent(item);
    speak(`${item.name}! ${foodFact(item.id, item.category)}`);
  };

  const addToTray = (item: FoodItem) => {
    if (!profile) return;
    add();
    setPick(item.category, {
      item,
      options: defaultOptions(optionsFor(item.id, item.category)),
    });
    speak(addedLine(item.name, item.id));
    router.push("/");
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
        <div className="sticker flex w-full flex-col gap-3 p-4" aria-live="polite">
          <div className="flex items-center gap-3">
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
          {profile && (
            <button
              type="button"
              onClick={() => addToTray(current)}
              className="flex min-h-16 w-full items-center justify-center rounded-full border-[3px] border-stone-900 bg-green-700 font-display text-2xl font-semibold text-white shadow-[0_5px_0_#1c1917] active:translate-y-1 active:shadow-none"
            >
              Add {current.name} to My Tray! ✅
            </button>
          )}
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
