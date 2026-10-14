"use client";

import { useEffect, useRef } from "react";
import { GuideMascot } from "@/components/Mascot";
import { useActiveKid } from "@/lib/store";
import { speak } from "@/lib/speak";
import { greeting } from "@/lib/guide-lines";

/** Home header: theme guide + title + themed tagline. */
export function HomeHeaderText() {
  const { themeId, theme, profile } = useActiveKid();
  const greeted = useRef<string | null>(null);

  // The guide greets the kid by name, once per sign-in.
  useEffect(() => {
    if (profile && greeted.current !== profile.id) {
      greeted.current = profile.id;
      speak(greeting(profile.name, themeId));
    }
  }, [profile, themeId]);
  return (
    <header className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
      <GuideMascot kind={themeId} className="h-24 w-auto shrink-0 sm:h-28" />
      <div className="min-w-0">
        <h1 className="font-display text-3xl font-semibold text-stone-800 sm:text-4xl">
          Build Your Lunch!
        </h1>
        <p className="mt-1 text-lg font-bold text-stone-500">
          {theme.tagline} {theme.emoji}
        </p>
      </div>
    </header>
  );
}
