"use client";

import useSound from "use-sound";

// UI sounds: Kenney Interface Sounds + Music Jingles, CC0 public domain
// (see public/sounds/KENNEY-LICENSE.txt). OGG plays on Chrome/Android/desktop;
// older Safari skips audio gracefully (speech still works).

export function useTapSound() {
  const [play] = useSound("/sounds/tap.ogg", { volume: 0.5 });
  return play;
}

export function useAddSound() {
  const [play] = useSound("/sounds/add.ogg", { volume: 0.6 });
  return play;
}

export function useFanfareSound() {
  const [play] = useSound("/sounds/fanfare.ogg", { volume: 0.6 });
  return play;
}
