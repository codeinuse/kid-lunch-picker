"use client";

import type { ReactNode } from "react";

/**
 * The app's one card: chunky rounded panel, thick outline, hard offset
 * shadow — Toca Boca sticker style. Every home section is one of these,
 * so the whole app reads as a deck of cards.
 */
const TONES: Record<string, string> = {
  plain: "bg-white",
  sunny: "bg-amber-50",
  berry: "bg-pink-50",
  mint: "bg-green-50",
  sky: "bg-sky-50",
};

export type CardTone = keyof typeof TONES;

export function Card({
  icon,
  title,
  subtitle,
  tone = "plain",
  label,
  action,
  children,
  className = "",
}: {
  icon?: string;
  title?: string;
  subtitle?: string;
  tone?: CardTone;
  /** Accessible name for the section (defaults to the title). */
  label?: string;
  /** Right-side header slot (e.g. a replay button). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const name = label ?? title;
  return (
    <section
      aria-label={name}
      className={`w-full rounded-3xl border-[3px] border-stone-900 p-4 shadow-[0_5px_0_#1c1917] ${TONES[tone]} ${className}`}
    >
      {(icon ?? title) && (
        <div className="mb-2 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="font-display text-2xl font-semibold text-stone-800">
                {icon && (
                  <span aria-hidden className="mr-1">
                    {icon}
                  </span>
                )}
                {title}
              </h2>
            )}
            {subtitle && <p className="text-base font-bold text-stone-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
