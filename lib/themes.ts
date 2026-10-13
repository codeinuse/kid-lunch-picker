/** Visual theme packs: Space, Jungle, Ocean (+ classic Lunch Tray). */

export type ThemeId = "classic" | "space" | "jungle" | "ocean";

export interface ThemePack {
  id: ThemeId;
  name: string;
  emoji: string;
  /** Spoken + shown when the tray is complete. */
  completeLine: string;
  /** Short greeting flavor for the header subtitle. */
  tagline: string;
}

export const THEMES: Record<ThemeId, ThemePack> = {
  classic: {
    id: "classic",
    name: "Lunch Tray",
    emoji: "🍱",
    completeLine: "All done! Great lunch!",
    tagline: "Tap a spot, then tap a yummy food",
  },
  space: {
    id: "space",
    name: "Space",
    emoji: "🚀",
    completeLine: "Blast off! Great lunch, cadet!",
    tagline: "Fuel up your rocket lunch",
  },
  jungle: {
    id: "jungle",
    name: "Jungle",
    emoji: "🌴",
    completeLine: "Swinging great lunch, explorer!",
    tagline: "Forage a wild lunch",
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    completeLine: "Splish splash! Great lunch, diver!",
    tagline: "Dive into a tasty lunch",
  },
};

export const THEME_ORDER: ThemeId[] = ["classic", "space", "jungle", "ocean"];

export const themePack = (id: ThemeId | undefined): ThemePack =>
  (id && THEMES[id]) || THEMES.classic;
