"use client";

import { useState } from "react";
import { useActiveKid, useLunchStore } from "@/lib/store";
import { GuideMascot } from "@/components/Mascot";
import { useTapSound } from "@/lib/sounds";

const STEPS = [
  {
    emoji: "🍱",
    title: "This is YOUR lunch tray!",
    body: "Tap any empty slot to pick something yummy.",
  },
  {
    emoji: "👆",
    title: "Tap a food to add it!",
    body: "Your pick lands on the tray right away — then you can tweak it.",
  },
  {
    emoji: "⭐",
    title: "Fill every slot to celebrate!",
    body: "Finish your tray to earn stickers and grow your level.",
  },
];

/**
 * First-run coachmarks: 3 scripted steps shown once per kid.
 * Plain overlay (no new deps), skippable, marks the tour seen on exit.
 */
export function OnboardingTour() {
  const { profile, themeId, seenTour } = useActiveKid();
  const markTourSeen = useLunchStore((s) => s.markTourSeen);
  const tap = useTapSound();
  const [step, setStep] = useState(0);

  if (!profile || seenTour) return null;
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  const done = () => {
    tap();
    markTourSeen();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Welcome tour, step ${step + 1} of ${STEPS.length}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
    >
      <div className="sticker w-full max-w-sm p-6 text-center">
        <GuideMascot kind={themeId} className="mx-auto h-28 w-auto" />
        <p className="mt-2 text-5xl" aria-hidden>
          {current.emoji}
        </p>
        <p className="mt-1 font-display text-2xl font-semibold text-stone-800">
          {current.title}
        </p>
        <p className="mt-1 text-lg font-bold text-stone-500">{current.body}</p>
        <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${i === step ? "bg-orange-500" : "bg-stone-200"}`}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              tap();
              if (last) markTourSeen();
              else setStep(step + 1);
            }}
            className="flex min-h-16 w-full items-center justify-center rounded-full border-[3px] border-stone-900 bg-green-700 font-display text-2xl font-semibold text-white shadow-[0_5px_0_#1c1917] active:translate-y-1 active:shadow-none"
          >
            {last ? "Let's Go! 🚀" : "Next! 👉"}
          </button>
          <button
            type="button"
            onClick={done}
            className="min-h-12 font-display text-lg font-semibold text-stone-400"
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}
