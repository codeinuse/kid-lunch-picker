# IconScout theme pack (kid-lunch-picker)

IconScout MCP search/download is **not connected** in this workspace
(`tools.opencode.list_mcp_resources` returns no resources), so this doc
is the human click-path until the connector is enabled in `opencode.json`.

## Where drops go (code already hooks these)

- Icons: `public/icons/<theme>/<name>.svg` (e.g. `public/icons/space/rocket.svg`)
- Lottie: `public/lottie/<theme>.json` (e.g. `public/lottie/space.json`)
- Queries per theme: `lib/themes.ts` → `THEMES[<id>].art.iconQuery` / `lottieQuery`

`components/ThemeScene.tsx` keeps the in-repo animated SVG backdrop as the
fallback. When IconScout files land, render them **inside** the matching
`theme === "<id>"` branch (icons via `next/image`, Lottie via `lottie-react`
with `autoplay loop`), keeping `aria-hidden` + `MotionConfig reducedMotion="user"`.

## Downloaded (2026-10-15, free tier)

Icons in `public/icons/` (wired via `components/ThemeIcon.tsx` into
`ThemeSwitcher` with emoji fallback), Lottie staged in `public/lottie/`
(not wired — `Celebration` uses framer-motion since this renderer drops
Lottie keyframes, see commit `69c92c1`):

- `icons/space/rocket.svg` — Rocket (`rocket-7136073`, Rahmat Sigit Prasetyo, no attribution)
- `icons/jungle/monkey.svg` — monkey (`monkey-1602247`, Kerismaker, **attribution required**)
- `icons/ocean/octopus.svg` — Octopus (`octopus-15349560`, Yame Design, no attribution)
- `icons/classic/bento.svg` — Bento (`bento-15271243`, Fluent Emoji/Microsoft, no attribution)
- `lottie/space-rocket.json` — Rocket (`rocket-14959411`, Google Inc., **attribution required**)
- `lottie/celebration-fireworks.json` — Fireworks (`fireworks-8934510`, free)

Full credits: `public/icons/ATTRIBUTION.md`, `public/lottie/ATTRIBUTION.md`.

## Exact searches (kid-friendly, flat/line, ages 5+)

| Theme | Icons query | Lottie query |
|---|---|---|
| classic | `kids lunch box flat icon` | `kids lunch celebration confetti` |
| space | `cute rocket planet astronaut line icon` | `cute space rocket launch kids` |
| jungle | `cute monkey palm leaf jungle flat icon` | `cute jungle animals swinging kids` |
| ocean | `cute octopus fish bubble ocean flat icon` | `cute octopus swimming bubbles kids` |

Filter: free, flat or line style, 48px+ touch context, WCAG AA contrast
(4.5:1 body / 3:1 large) per `docs/research/2026-10-13-kid-friendly-ui-resources.md`.

## License checklist (before committing downloads)

- Prefer Lottie Simple License / CC0 / MIT; record author + URL in
  `public/icons/<theme>/ATTRIBUTION.md` and `public/lottie/ATTRIBUTION.md`.
- Avoid Storyset free tier (attribution-required) and Freesound samples
  with per-sample variance — same rule as the research doc.
- Keep the hand-drawn `components/Mascot.tsx` guides as the default;
  IconScout art is enrichment, not replacement, until attribution is cleared.
