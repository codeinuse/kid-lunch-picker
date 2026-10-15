"use client";

import Image from "next/image";
import { useState } from "react";
import type { ThemeId } from "@/lib/themes";

const ICON_SRC: Record<ThemeId, { src: string; alt: string; fallback: string }> = {
  classic: { src: "/icons/classic/bento.svg", alt: "Lunch box icon", fallback: "🍱" },
  space: { src: "/icons/space/rocket.svg", alt: "Rocket icon", fallback: "🚀" },
  jungle: { src: "/icons/jungle/monkey.svg", alt: "Monkey icon", fallback: "🌴" },
  ocean: { src: "/icons/ocean/octopus.svg", alt: "Octopus icon", fallback: "🌊" },
};

/**
 * Theme icon from IconScout (see public/icons/ATTRIBUTION.md).
 * Falls back to the theme emoji if the SVG is missing.
 */
export function ThemeIcon({ theme, size = 28 }: { theme: ThemeId; size?: number }) {
  const [imgOk, setImgOk] = useState(true);
  const icon = ICON_SRC[theme];
  if (!imgOk) {
    return (
      <span className="text-2xl" aria-hidden>
        {icon.fallback}
      </span>
    );
  }
  return (
    <Image
      src={icon.src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className="h-7 w-7"
      loading="lazy"
      onError={() => setImgOk(false)}
    />
  );
}
