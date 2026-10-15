"use client";

import Image from "next/image";
import { useState } from "react";
import type { FoodItem } from "@/lib/types";

/**
 * Curated IconScout art per food (see public/foods/ATTRIBUTION.md).
 * Local SVGs beat remote photos: consistent style, offline-ready.
 * Foods without a file yet (live API items, granola) fall through
 * to the caller-provided fallback.
 */
const FOOD_SRC: Record<string, string> = {
  pizza: "/foods/pizza.svg",
  nuggets: "/foods/nuggets.svg",
  sandwich: "/foods/sandwich.svg",
  pasta: "/foods/pasta.svg",
  fries: "/foods/fries.svg",
  rice: "/foods/rice.svg",
  corn: "/foods/corn.svg",
  mash: "/foods/mash.svg",
  apple: "/foods/apple.svg",
  banana: "/foods/banana.svg",
  grapes: "/foods/grapes.svg",
  orange: "/foods/orange.svg",
  carrots: "/foods/carrots.svg",
  broccoli: "/foods/broccoli.svg",
  cucumber: "/foods/cucumber.svg",
  salad: "/foods/salad.svg",
  milk: "/foods/milk.svg",
  water: "/foods/water.svg",
  juice: "/foods/juice.svg",
  "choc-milk": "/foods/choc-milk.svg",
  cookie: "/foods/cookie.svg",
  yogurt: "/foods/yogurt.svg",
  pudding: "/foods/pudding.svg",
};

export function foodArtSrc(item: FoodItem): string | null {
  const exact = FOOD_SRC[item.id];
  if (exact) return exact;
  // Live API items (sp-*) share names with curated foods ("Pepperoni
  // Pizza", "Chicken Nuggets") — match by keyword so they get the same
  // consistent art instead of random remote photos. Order matters:
  // specific multi-word matches first ("chocolate milk" before "milk").
  const name = item.name.toLowerCase();
  for (const [keyword, id] of KEYWORD_ART) {
    if (name.includes(keyword)) return FOOD_SRC[id] ?? null;
  }
  return null;
}

/** [name keyword, starter food id] — most specific first. */
const KEYWORD_ART: [string, string][] = [
  ["chocolate milk", "choc-milk"],
  ["choc milk", "choc-milk"],
  ["granola", "granola"],
  ["nugget", "nuggets"],
  ["chicken", "nuggets"],
  ["sandwich", "sandwich"],
  ["burger", "sandwich"],
  ["wrap", "sandwich"],
  ["taco", "sandwich"],
  ["pizza", "pizza"],
  ["pasta", "pasta"],
  ["spaghetti", "pasta"],
  ["macaroni", "pasta"],
  ["mashed potato", "mash"],
  ["mashed", "mash"],
  ["potato", "mash"],
  ["fries", "fries"],
  ["french fry", "fries"],
  ["rice", "rice"],
  ["corn", "corn"],
  ["apple", "apple"],
  ["banana", "banana"],
  ["grape", "grapes"],
  ["orange", "orange"],
  ["carrot", "carrots"],
  ["broccoli", "broccoli"],
  ["cucumber", "cucumber"],
  ["salad", "salad"],
  ["lettuce", "salad"],
  ["milk", "milk"],
  ["yogurt", "yogurt"],
  ["yoghurt", "yogurt"],
  ["smoothie", "juice"],
  ["juice", "juice"],
  ["lemonade", "juice"],
  ["water", "water"],
  ["cookie", "cookie"],
  ["brownie", "cookie"],
  ["muffin", "cookie"],
  ["cupcake", "cookie"],
  ["donut", "cookie"],
  ["doughnut", "cookie"],
  ["cracker", "cookie"],
  ["pudding", "pudding"],
  ["custard", "pudding"],
];

/** Display order: curated foods first (reliable options + nutrition),
 *  then live items. */
export function orderCuratedFirst(items: FoodItem[]): FoodItem[] {
  return [...items].sort((a, b) => {
    const ac = a.source === "curated" ? 0 : 1;
    const bc = b.source === "curated" ? 0 : 1;
    return ac - bc;
  });
}

/**
 * One card per art: the first item claiming an icon keeps it, later
 * duplicates are dropped. Live feeds return near-identical names
 * ("Cheese Pizza", "Pepperoni Pizza", …) that would otherwise render
 * walls of the same icon. Items without art (distinct photos/emoji)
 * are never dropped.
 */
export function uniqueArtItems(items: FoodItem[]): FoodItem[] {
  const seen = new Set<string>();
  const out: FoodItem[] = [];
  for (const item of orderCuratedFirst(items)) {
    const art = foodArtSrc(item);
    if (art) {
      if (seen.has(art)) continue;
      seen.add(art);
    }
    out.push(item);
  }
  return out;
}

/** Food art with graceful fallback when the file is missing. */
export function FoodArt({
  item,
  size = 96,
  className,
  fallback,
}: {
  item: FoodItem;
  size?: number;
  className?: string;
  fallback: React.ReactNode;
}) {
  const [imgOk, setImgOk] = useState(true);
  const src = foodArtSrc(item);
  if (!src || !imgOk) return <>{fallback}</>;
  return (
    <Image
      src={src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      sizes={`${size}px`}
      className={className ?? "h-24 w-24 object-contain"}
      loading="lazy"
      onError={() => setImgOk(false)}
    />
  );
}
