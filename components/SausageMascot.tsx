"use client";

import Image from "next/image";
import { useState } from "react";
import { GreeterMascot } from "@/components/Mascot";

/**
 * Sizzle the sausage — lunch-buddy mascot from IconScout
 * (Amalia Kadji, Sausage Mascot pack, free; see
 * public/mascots/sausage/ATTRIBUTION.md). One consistent character
 * across emotions, Toca Boca-style, with the hand-drawn apple
 * as fallback if a pose is missing.
 */
export type SausageEmotion = "greet" | "cheer" | "point" | "sad" | "snack" | "playful";

const POSE_SRC: Record<SausageEmotion, { src: string; alt: string }> = {
  greet: { src: "/mascots/sausage/pose-48.svg", alt: "Sizzle the sausage waving hello" },
  cheer: { src: "/mascots/sausage/pose-45.svg", alt: "Sizzle the sausage cheering" },
  point: { src: "/mascots/sausage/pose-40.svg", alt: "Sizzle the sausage pointing" },
  sad: { src: "/mascots/sausage/pose-31.svg", alt: "Sizzle the sausage looking sad" },
  snack: { src: "/mascots/sausage/pose-35.svg", alt: "Sizzle the sausage snacking" },
  playful: { src: "/mascots/sausage/pose-33.svg", alt: "Sizzle the sausage playing" },
};

export function SausageMascot({
  emotion = "greet",
  className,
}: {
  emotion?: SausageEmotion;
  className?: string;
}) {
  const [imgOk, setImgOk] = useState(true);
  const pose = POSE_SRC[emotion];
  if (!imgOk) return <GreeterMascot className={className} />;
  return (
    <Image
      src={pose.src}
      alt={pose.alt}
      role="img"
      width={160}
      height={160}
      className={className ?? "h-28 w-auto"}
      loading="lazy"
      onError={() => setImgOk(false)}
    />
  );
}
