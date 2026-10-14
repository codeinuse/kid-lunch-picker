"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import type { FoodItem } from "@/lib/types";
import { defaultOptions, optionsFor } from "@/lib/options";
import { useActiveKid, useLunchStore } from "@/lib/store";
import { speak } from "@/lib/speak";
import { addedLine } from "@/lib/guide-lines";
import { useAddSound, useTapSound } from "@/lib/sounds";

interface Props {
  item: FoodItem | null;
  onClose: () => void;
}

/** Bottom sheet: big photo + option chips + "Add to Tray!". */
export function OptionsSheet({ item, onClose }: Props) {
  const router = useRouter();
  const setPick = useLunchStore((s) => s.setPick);
  const tap = useTapSound();
  const add = useAddSound();

  // Every tweak lands on the tray instantly — closing the sheet can never
  // lose the kid's choices. "Add to Tray" just confirms + heads home.
  const choose = (groupId: string, choiceId: string, choiceLabel: string) => {
    if (!item) return;
    tap();
    const next = { ...options, [groupId]: choiceId };
    setOptions(next);
    setPick(item.category, { item, options: next });
    speak(choiceLabel);
  };
  const [options, setOptions] = useState<Record<string, string>>({});
  const [imgOk, setImgOk] = useState(true);
  const [lastId, setLastId] = useState<string | null>(null);

  const groups = item ? optionsFor(item.id, item.category) : [];

  const { picks } = useActiveKid();
  const existing = item ? picks[item.category] : null;

  // Sync sheet state when a (different) item opens — during render, not in
  // an effect. Starts from the live tray pick so reopening never wipes
  // the kid's tweaks.
  if ((item?.id ?? null) !== lastId) {
    setLastId(item?.id ?? null);
    setOptions(
      item && existing?.item.id === item.id && existing.options
        ? existing.options
        : item
          ? defaultOptions(optionsFor(item.id, item.category))
          : {},
    );
    setImgOk(true);
  }

  // The guide names the food on open — external system, so an effect.
  useEffect(() => {
    if (item) speak(item.name);
  }, [item]);

  return (
    <Dialog.Root open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-orange-50 p-5 pb-8 shadow-2xl"
        >
          <Dialog.Description className="sr-only">
            Pick options for {item?.name}, then add it to your tray.
          </Dialog.Description>
          {item && (
            <div className="flex flex-col items-center gap-4">
              <div
                className="h-1.5 w-16 rounded-full bg-stone-300"
                aria-hidden
              />
              <Dialog.Title className="text-center font-display text-3xl font-semibold text-stone-800">
                {item.emoji} {item.name}!
              </Dialog.Title>

              {item.imageUrl && imgOk ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={192}
                  height={192}
                  priority
                  className="h-48 w-48 rounded-3xl object-cover shadow"
                  onError={() => setImgOk(false)}
                />
              ) : (
                <span className="text-9xl" role="img" aria-hidden>
                  {item.emoji}
                </span>
              )}

              {groups.map((group) => (
                <fieldset key={group.id} className="w-full">
                  <legend className="mb-2 text-center text-xl font-extrabold text-stone-600">
                    {group.label}?
                  </legend>
                  <div className="flex flex-wrap justify-center gap-2">
                    {group.choices.map((choice) => {
                      const active = options[group.id] === choice.id;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => choose(group.id, choice.id, choice.label)}
                          aria-pressed={active}
                          className={`flex min-h-16 min-w-16 flex-col items-center justify-center rounded-2xl border-[3px] px-4 py-2 transition-all active:translate-y-0.5 ${
                            active
                              ? "border-stone-900 bg-green-700 text-white shadow-[0_3px_0_#1c1917]"
                              : "sticker-sm text-stone-700 active:shadow-none"
                          }`}
                        >
                          <span className="text-3xl" aria-hidden>
                            {choice.emoji}
                          </span>
                          <span className="text-base font-extrabold">
                            {choice.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              <button
                type="button"
                onClick={() => {
                  add();
                  setPick(item.category, { item, options });
                  speak(addedLine(item.name, item.id));
                  onClose();
                  router.push("/");
                }}
                className="mt-1 flex min-h-16 w-full items-center justify-center rounded-full border-[3px] border-stone-900 bg-green-700 font-display text-2xl font-semibold text-white shadow-[0_5px_0_#1c1917] active:translate-y-1 active:shadow-none"
              >
                Add to Tray! ✅
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
