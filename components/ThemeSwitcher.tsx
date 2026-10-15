"use client";

import { motion } from "framer-motion";
import { THEME_ORDER, themePack, type ThemeId } from "@/lib/themes";
import { useActiveKid, useLunchStore } from "@/lib/store";
import { useTapSound } from "@/lib/sounds";
import { ThemeIcon } from "@/components/ThemeIcon";

/** Big emoji buttons to swap the kid's world theme. */
export function ThemeSwitcher() {
  const { themeId } = useActiveKid();
  const setTheme = useLunchStore((s) => s.setTheme);
  const tap = useTapSound();
  const pick = (id: ThemeId) => {
    tap();
    setTheme(id);
  };
  return (
    <div className="flex w-full items-center justify-center gap-2" role="group" aria-label="Pick a theme">
      {THEME_ORDER.map((id) => {
        const t = themePack(id);
        const active = themeId === id;
        return (
          <motion.button
            key={id}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => pick(id)}
            aria-pressed={active}
            aria-label={`${t.name} theme`}
            title={t.name}
            className={`flex min-h-14 min-w-14 flex-col items-center justify-center rounded-2xl border-[3px] px-2 py-1 transition-all active:translate-y-0.5 ${
              active
                ? "border-stone-900 bg-white shadow-[0_3px_0_#1c1917]"
                : "border-transparent bg-white/60"
            }`}
          >
            <motion.span
              className="flex items-center gap-1 text-2xl"
              aria-hidden
              initial={false}
              animate={active ? { scale: [1, 1.35, 1], rotate: [0, -10, 0] } : { scale: 1 }}
              transition={{ duration: 0.45 }}
            >
              <ThemeIcon theme={id} />
              <span aria-hidden>{t.emoji}</span>
            </motion.span>
            <span className="text-[11px] font-extrabold text-stone-600">{t.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
