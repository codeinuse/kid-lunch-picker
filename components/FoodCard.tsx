"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { FoodItem } from "@/lib/types";
import { speak } from "@/lib/speak";

interface Props {
  item: FoodItem;
  selected: boolean;
  onPick: (item: FoodItem) => void;
}

/** Big tap target (min 64dp+) with photo/emoji + 1–2 word label. */
export function FoodCard({ item, selected, onPick }: Props) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.93 }}
      onClick={() => {
        onPick(item);
        speak(item.name);
      }}
      aria-pressed={selected}
      aria-label={`Pick ${item.name}`}
      className={`flex min-h-36 min-w-36 flex-col items-center justify-center gap-1 rounded-3xl border-4 bg-white p-4 shadow-sm transition-colors ${
        selected ? "border-green-500 bg-green-50" : "border-transparent"
      }`}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.name}
          width={96}
          height={96}
          className="h-24 w-24 rounded-2xl object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-7xl" role="img" aria-hidden>
          {item.emoji}
        </span>
      )}
      <span className="text-xl font-extrabold text-stone-800">{item.name}</span>
      {selected && <span className="text-3xl" aria-hidden>✅</span>}
    </motion.button>
  );
}
