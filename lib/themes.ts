/** Visual theme packs: Space, Jungle, Ocean (+ classic Lunch Tray). */

export type ThemeId = "classic" | "space" | "jungle" | "ocean";

export interface ThemeArt {
  /** IconScout search to enrich this theme (drop SVGs into public/icons/<id>/). */
  iconQuery: string;
  /** IconScout Lottie search for celebration/backdrop (drop into public/lottie/<id>.json). */
  lottieQuery: string;
}

export interface ThemePack {
  id: ThemeId;
  name: string;
  emoji: string;
  /** Spoken + shown when the tray is complete. */
  completeLine: string;
  /** Short greeting flavor for the header subtitle. */
  tagline: string;
  art: ThemeArt;
}

export const THEMES: Record<ThemeId, ThemePack> = {
  classic: {
    id: "classic",
    name: "Lunch Tray",
    emoji: "🍱",
    completeLine: "All done! Great lunch!",
    tagline: "Tap a spot, then tap a yummy food",
    art: {
      iconQuery: "kids lunch box flat icon",
      lottieQuery: "kids lunch celebration confetti",
    },
  },
  space: {
    id: "space",
    name: "Space",
    emoji: "🚀",
    completeLine: "Blast off! Great lunch, cadet!",
    tagline: "Fuel up your rocket lunch",
    art: {
      iconQuery: "cute rocket planet astronaut line icon",
      lottieQuery: "cute space rocket launch kids",
    },
  },
  jungle: {
    id: "jungle",
    name: "Jungle",
    emoji: "🌴",
    completeLine: "Swinging great lunch, explorer!",
    tagline: "Forage a wild lunch",
    art: {
      iconQuery: "cute monkey palm leaf jungle flat icon",
      lottieQuery: "cute jungle animals swinging kids",
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    emoji: "🌊",
    completeLine: "Splish splash! Great lunch, diver!",
    tagline: "Dive into a tasty lunch",
    art: {
      iconQuery: "cute octopus fish bubble ocean flat icon",
      lottieQuery: "cute octopus swimming bubbles kids",
    },
  },
};

export const THEME_ORDER: ThemeId[] = ["classic", "space", "jungle", "ocean"];

export const themePack = (id: ThemeId | undefined): ThemePack =>
  (id && THEMES[id]) || THEMES.classic;
