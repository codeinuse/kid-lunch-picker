"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { FoodCategory, FoodItem } from "@/lib/types";
import { categoryInfo } from "@/lib/categories";
import { defaultOptions, optionsFor } from "@/lib/options";
import { useActiveKid, useLunchStore } from "@/lib/store";
import { FoodCard } from "@/components/FoodCard";
import { OptionsSheet } from "@/components/OptionsSheet";
import { SausageMascot } from "@/components/SausageMascot";
import { Card } from "@/components/Card";
import { uniqueArtItems } from "@/components/FoodArt";
import { speak } from "@/lib/speak";
import { browsePrompt } from "@/lib/guide-lines";

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
  const { mounted, avoids, picks, profile } = useActiveKid();
  const setPick = useLunchStore((s) => s.setPick);

  // No auto-talk on mount (autoplay surprise): the guide speaks on taps,
  // and the kid can replay the prompt with the speaker button.
  const replayPrompt = () => speak(browsePrompt(profile?.name ?? "friend", category));

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

  // One card per icon (curated first): live feeds repeat the same names
  // and would otherwise show walls of identical art.
  const shown = useMemo(() => uniqueArtItems(data ?? []), [data]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-4 px-4 py-6">
      <Card label={`Pick a ${info.label}`}>
      <div className="flex w-full items-center gap-3">
        <Link
          href="/"
          aria-label="Back to tray"
          className="sticker-sm flex min-h-16 min-w-16 shrink-0 items-center justify-center text-3xl active:translate-y-0.5 active:shadow-none"
        >
          ←
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold text-stone-800">
            {info.emoji} Pick a {info.label}!
          </h1>
          <p className="text-lg font-bold text-stone-500">
            Tap the yummiest one 😋
          </p>
        </div>
        <button
          type="button"
          onClick={replayPrompt}
          aria-label="Hear the guide's hint"
          className="sticker-sm flex min-h-16 min-w-16 shrink-0 items-center justify-center text-3xl active:translate-y-0.5 active:shadow-none"
        >
          🔊
        </button>
      </div>
      </Card>

      {isLoading && (
        <div className="grid w-full grid-cols-2 gap-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="sticker flex min-h-36 flex-col items-center justify-center gap-2 p-4"
              aria-hidden
            >
              <div className="h-24 w-24 animate-pulse rounded-2xl bg-stone-100" />
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-stone-100" />
            </div>
          ))}
          <p role="status" className="sr-only">
            Loading yummy foods…
          </p>
        </div>
      )}
      {isError && (
        <div className="rounded-3xl bg-red-50 p-6 text-center ring-2 ring-red-200">
          <SausageMascot emotion="sad" className="mx-auto h-28 w-auto" />
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
          <SausageMascot emotion="point" className="mx-auto h-28 w-auto" />
          <p className="mt-2 font-display text-2xl font-medium text-stone-700">
            No foods here right now!
          </p>
        </div>
      )}

      {shown.length > 0 && (
        <div className="grid w-full grid-cols-2 gap-3">
          {shown.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              selected={mounted && picks[category]?.item.id === item.id}
              onPick={handlePick}
            />
          ))}
        </div>
      )}

      {shown.length > 0 && (
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
