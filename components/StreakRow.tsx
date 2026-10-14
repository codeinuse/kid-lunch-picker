"use client";

import { useEffect, useState } from "react";
import { todayKey, useActiveKid } from "@/lib/store";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

interface DayDot {
  key: string;
  done: boolean;
  isToday: boolean;
}

/** Monday-start week dots + day streak for packed lunches. */
export function StreakRow() {
  const { profile, packedDays, streak } = useActiveKid();
  // Week dates resolve post-mount (no new Date() during prerender).
  const [week, setWeek] = useState<DayDot[] | null>(null);
  useEffect(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    setWeek(
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const key = todayKey(d);
        return { key, done: packedDays.includes(key), isToday: key === todayKey(now) };
      }),
    );
  }, [packedDays]);

  if (!profile) return null;

  return (
    <div className="flex w-full items-center justify-center gap-2" aria-label={`Lunch streak: ${streak} days`}>
      <span className="font-display text-lg font-semibold text-stone-700" aria-hidden>
        🔥 {streak}
      </span>
      <div className="flex gap-1.5">
        {(week ?? []).map((d, i) => (
          <span
            key={d.key}
            title={`${DAY_LETTERS[i]}${d.isToday ? " (today)" : ""}`}
            aria-hidden
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-extrabold ${
              d.done
                ? "border-stone-900 bg-green-500 text-white"
                : d.isToday
                  ? "border-dashed border-stone-400 bg-white text-stone-400"
                  : "border-stone-200 bg-white text-stone-300"
            }`}
          >
            {d.done ? "★" : DAY_LETTERS[i]}
          </span>
        ))}
      </div>
    </div>
  );
}
