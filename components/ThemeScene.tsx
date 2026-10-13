"use client";

import { useEffect } from "react";
import { useActiveKid } from "@/lib/store";
import type { ThemeId } from "@/lib/themes";

/** Applies data-theme to <html> so CSS vars follow the kid's theme. */
export function ThemeApplier() {
  const { themeId } = useActiveKid();
  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
  }, [themeId]);
  return null;
}

/** Scene for the signed-in kid's theme (classic = plain background). */
export function ThemeSceneGate() {
  const { themeId } = useActiveKid();
  return <ThemeScene theme={themeId} />;
}

function Stars() {
  const spots: [number, number, number][] = [
    [8, 12, 1.4], [22, 30, 1], [38, 8, 1.2], [55, 22, 1], [70, 10, 1.4],
    [84, 28, 1], [93, 12, 1.2], [15, 45, 1], [45, 40, 1], [66, 48, 1.2],
    [88, 44, 1], [30, 60, 1], [58, 62, 1], [80, 64, 1.2], [8, 78, 1],
  ];
  return (
    <g fill="#fff">
      {spots.map(([x, y, r], i) => (
        <circle key={i} cx={`${x}%`} cy={`${y}%`} r={r} />
      ))}
    </g>
  );
}

/** Fixed decorative backdrop per theme. Pure decoration (aria-hidden). */
export function ThemeScene({ theme }: { theme: ThemeId }) {
  if (theme === "classic") return null;
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      {theme === "space" && (
        <>
          <rect width="100" height="100" fill="#e0e7ff" />
          <g fill="#c7d2fe" opacity="0.9">
            <Stars />
          </g>
          <circle cx="82" cy="78" r="12" fill="#f472b6" stroke="#1c1917" strokeWidth="1" />
          <ellipse cx="82" cy="78" rx="20" ry="5" fill="none" stroke="#1c1917" strokeWidth="1" transform="rotate(-18 82 78)" />
          <circle cx="14" cy="80" r="7" fill="#93c5fd" stroke="#1c1917" strokeWidth="1" />
        </>
      )}
      {theme === "jungle" && (
        <>
          <rect width="100" height="100" fill="#dcfce7" />
          <g stroke="#16a34a" strokeWidth="2.5" fill="#4ade80" opacity="0.85">
            <ellipse cx="6" cy="14" rx="9" ry="4.5" transform="rotate(-30 6 14)" />
            <ellipse cx="94" cy="10" rx="9" ry="4.5" transform="rotate(30 94 10)" />
            <ellipse cx="4" cy="52" rx="9" ry="4.5" transform="rotate(-30 4 52)" />
            <ellipse cx="96" cy="48" rx="9" ry="4.5" transform="rotate(30 96 48)" />
            <ellipse cx="8" cy="88" rx="9" ry="4.5" transform="rotate(-30 8 88)" />
            <ellipse cx="92" cy="86" rx="9" ry="4.5" transform="rotate(30 92 86)" />
          </g>
          <circle cx="50" cy="92" r="6" fill="#fbbf24" stroke="#1c1917" strokeWidth="1" />
          <circle cx="72" cy="90" r="4" fill="#f472b6" stroke="#1c1917" strokeWidth="1" />
        </>
      )}
      {theme === "ocean" && (
        <>
          <rect width="100" height="100" fill="#e0f2fe" />
          <g fill="none" stroke="#38bdf8" strokeWidth="1.6" opacity="0.8">
            <path d="M-5 70 Q10 64 25 70 T55 70 T85 70 T115 70" />
            <path d="M-5 82 Q10 76 25 82 T55 82 T85 82 T115 82" />
            <path d="M-5 94 Q10 88 25 94 T55 94 T85 94 T115 94" />
          </g>
          <g fill="#bae6fd" stroke="#0284c7" strokeWidth="0.8">
            <circle cx="20" cy="30" r="3" />
            <circle cx="30" cy="18" r="2" />
            <circle cx="70" cy="24" r="2.5" />
            <circle cx="82" cy="40" r="2" />
            <circle cx="55" cy="12" r="1.8" />
          </g>
          <g transform="translate(80 55)">
            <path d="M0 -8 L6 -1 L0 3 L-6 -1 Z" fill="#fdba74" stroke="#1c1917" strokeWidth="1" />
            <path d="M0 3 L-5 14 M0 3 L5 14" stroke="#1c1917" strokeWidth="1" />
          </g>
        </>
      )}
    </svg>
  );
}
