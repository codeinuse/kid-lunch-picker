"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import type { FoodItem } from "@/lib/types";
import { useTapSound } from "@/lib/sounds";
import { FoodArt, foodArtSrc } from "@/components/FoodArt";

interface Props {
  item: FoodItem;
  selected: boolean;
  onPick: (item: FoodItem) => void;
}

/** Big tap target (min 64dp+) with photo/emoji + 1–2 word label. */
export function FoodCard({ item, selected, onPick }: Props) {
  // If the photo fails to load, fall back to the emoji — never a broken card.
  const [imgOk, setImgOk] = useState(true);
  const showPhoto = item.imageUrl && imgOk;
  const tap = useTapSound();
  // Curated IconScout art first (consistent + offline), then the live
  // photo, then emoji. The emoji stays for live API items without art.
  const photoOrEmoji = showPhoto ? (
    <Image
      src={item.imageUrl!}
      alt={item.name}
      width={96}
      height={96}
      sizes="96px"
      className="h-24 w-24 rounded-2xl object-cover"
      loading="lazy"
      onError={() => setImgOk(false)}
    />
  ) : (
    <span className="text-7xl" role="img" aria-hidden>
      {item.emoji}
    </span>
  );
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.93 }}
      onClick={() => {
        tap();
        onPick(item);
        // The options sheet speaks the name on open — no double talk.
      }}
      aria-pressed={selected}
      aria-label={`Pick ${item.name}`}
      className={`sticker flex min-h-36 min-w-36 flex-col items-center justify-center gap-1 p-4 transition-colors ${
        selected ? "bg-green-100 ring-4 ring-green-700" : ""
      }`}
    >
      {foodArtSrc(item) ? (
        <FoodArt item={item} fallback={photoOrEmoji} />
      ) : (
        photoOrEmoji
      )}
      <span className="font-display text-xl font-medium text-stone-800">{item.name}</span>
      {selected && (
        <span className="rounded-full bg-green-700 px-3 py-0.5 text-base font-extrabold text-white">
          <span aria-hidden>✅ </span>Picked!
        </span>
      )}
    </motion.button>
  );
}
