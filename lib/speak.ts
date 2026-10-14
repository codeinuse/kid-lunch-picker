"use client";

import { useLunchStore } from "./store";

/** Speak aloud — respects the grown-ups voice toggle + speed. */
export function speak(text: string) {
  if (typeof window === "undefined") return;
  const { voiceOn, voiceRate } = useLunchStore.getState().settings;
  if (!voiceOn) return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = voiceRate;
  utterance.pitch = 1.1;
  synth.speak(utterance);
}
