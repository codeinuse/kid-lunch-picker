"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { FoodCategory, FoodItem } from "@/lib/types";
import { categoryInfo } from "@/lib/categories";
import { defaultOptions, optionsFor } from "@/lib/options";
import { useMounted, useTrayStore } from "@/lib/store";
import { FoodCard } from "@/components/FoodCard";
import { OptionsSheet } from "@/components/OptionsSheet";
import { PointerMascot } from "@/components/Mascot";

async function fetchFoods(category: string, exclude: string): Promise<FoodItem[]> {
  const res = await fetch(
    `/api/foods/search?category=${category}&exclude=${exclude}`,
  );
  if (!res.ok) throw new Error("Could not load foods");
  const data = (await res.json()) as { items: FoodItem[] };
  return data.items;
}

export function BrowseGrid({ category }: { category: FoodCategory }) {
  const info = categoryInfo(category);
  const mounted = useMounted();
  const avoids = useTrayStore((s) => s.avoids);
  const picks = useTrayStore((s) => s.picks);
  const setPick = useTrayStore((s) => s.setPick);

  /**
   * Tap = added immediately with default options, sheet opens for tweaks.
   * Closing the sheet without changes keeps the pick — a tap never
   * results in "nothing added".
   */
  const handlePick = (item: FoodItem) => {
    const current = picks[category];
    setPick(
      category,
      current?.item.id === item.id
        ? current
        : { item, options: defaultOptions(optionsFor(item.id, item.category)) },
    );
    setPending(item);
  };
  const [pending, setPending] = useState<FoodItem | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["foods", category, avoids.join(",")],
    queryFn: () => fetchFoods(category, avoids.join(",")),
  });

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
            {info.emoji} Pick a {info.label}!
          </h1>
          <p className="text-lg font-bold text-stone-500">
            Tap the yummiest one 😋
          </p>
        </div>
      </div>

      {isLoading && (
        <p className="py-16 text-center text-6xl" aria-label="Loading" aria-hidden>
          🍳
        </p>
      )}
      {isError && (
        <div className="rounded-3xl bg-red-50 p-6 text-center ring-2 ring-red-200">
          <p className="text-4xl" aria-hidden>😢</p>
          <p className="mt-2 text-xl font-extrabold text-stone-700">
            Oh no! The foods hid.
          </p>
          <Link
            href="/"
            className="mt-3 inline-block min-h-12 rounded-full bg-orange-500 px-6 py-3 text-lg font-extrabold text-white"
          >
            Back to Tray
          </Link>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="sticker p-6 text-center">
          <PointerMascot className="mx-auto h-28 w-auto" />
          <p className="mt-2 font-display text-2xl font-medium text-stone-700">
            No foods here right now!
          </p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid w-full grid-cols-2 gap-3">
          {data.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              selected={mounted && picks[category]?.item.id === item.id}
              onPick={handlePick}
            />
          ))}
        </div>
      )}

      {data && data.length > 0 && (
        <Link
          href="/"
          className="mt-2 flex min-h-16 w-full items-center justify-center rounded-full border-[3px] border-stone-900 bg-green-700 font-display text-2xl font-semibold text-white shadow-[0_5px_0_#1c1917] active:translate-y-1 active:shadow-none"
        >
          Done! Back to Tray ✅
        </Link>
      )}

      <OptionsSheet item={pending} onClose={() => setPending(null)} />
    </main>
  );
}
