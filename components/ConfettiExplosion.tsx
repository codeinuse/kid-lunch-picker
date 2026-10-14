"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Celebration overlay: corner cannons + top rain + star pop + rings.
 * Pure framer-motion + static SVG (no Lottie keyframes — this stack's
 * lottie-web build silently drops animated opacity/scale keyframes).
 * Plays once on mount.
 */

const PALETTE = [
  "#ef4444", "#f97316", "#facc15", "#4ade80",
  "#60a5fa", "#a78bfa", "#f472b6",
];

interface Piece {
  left: number;
  drift: number;
  delay: number;
  duration: number;
  size: number;
  spin: number;
  color: string;
  round: boolean;
}

/** Deterministic PRNG so every celebration bursts the same way. */
function makeRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function usePieces(count: number): Piece[] {
  return useMemo(() => {
    const rand = makeRand(20261013);
    return Array.from({ length: count }, (_, i) => {
      const cannon = i < 30;
      return {
        left: cannon
          ? i % 2 === 0
            ? 4 + rand() * 10
            : 86 + rand() * 10
          : rand() * 100,
        drift: cannon
          ? (i % 2 === 0 ? 1 : -1) * -(20 + rand() * 60)
          : (rand() - 0.5) * 60,
        delay: cannon ? rand() * 0.15 : 0.25 + rand() * 0.6,
        duration: 1.6 + rand() * 0.9,
        size: 8 + rand() * 9,
        spin: (rand() - 0.5) * 900,
        color: PALETTE[Math.floor(rand() * PALETTE.length)],
        round: rand() > 0.6,
      };
    });
  }, [count]);
}

export function ConfettiExplosion() {
  const pieces = usePieces(70);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: "-12%", rotate: 0, opacity: 0 }}
          animate={{ x: [0, p.drift * 0.5, p.drift], y: ["-12%", "45%", "112%"], rotate: [0, p.spin], opacity: [0, 1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, times: [0, 0.06, 0.85, 1], ease: "easeIn" }}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.3,
            background: p.color,
            borderRadius: p.round ? "50%" : 3,
          }}
        />
      ))}
      {/* centerpiece star pop */}
      <motion.svg
        viewBox="0 0 200 200"
        initial={{ scale: 0, rotate: -18, opacity: 0, x: "-50%" }}
        animate={{ scale: [0, 1.25, 1], rotate: [-18, 8, 0], opacity: [0, 1, 1], x: "-50%" }}
        transition={{ duration: 0.7, delay: 0.45, times: [0, 0.6, 1] }}
        className="absolute left-1/2 top-[16%] h-24 w-24"
      >
        <polygon
          points="50,4 62,38 98,38 69,59 80,94 50,72 20,94 31,59 2,38 38,38"
          fill="#fde047"
          stroke="#1c1917"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </motion.svg>
      {/* expanding rings */}
      {["#fb923c", "#f472b6"].map((color, i) => (
        <motion.span
          key={color}
          initial={{ scale: 0.15, opacity: 0.9, x: "-50%" }}
          animate={{ scale: 1.6, opacity: 0, x: "-50%" }}
          transition={{ duration: 0.9, delay: 0.55 + i * 0.18, ease: "easeOut" }}
          className="absolute left-1/2 top-[16%] h-28 w-28 rounded-full"
          style={{ border: `6px solid ${color}` }}
        />
      ))}
    </div>
  );
}
