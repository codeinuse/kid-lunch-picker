/**
 * Generates public/lottie/confetti.json — our own tiny confetti burst.
 * Zero license risk (generated in-repo), rendered by lottie-react.
 * Run: node scripts/make-confetti.mjs
 */
// Seeded RNG for stable output.
let seed = 42;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const W = 400;
const H = 400;
const FR = 60;
const DUR = 2.2; // seconds
const END = Math.round(FR * DUR);
const PIECES = 70;
const PALETTE = [
  [1, 0.35, 0.35], // red
  [1, 0.62, 0.1], // orange
  [1, 0.85, 0.2], // yellow
  [0.3, 0.75, 0.35], // green
  [0.25, 0.55, 1], // blue
  [0.65, 0.4, 1], // purple
  [1, 0.45, 0.75], // pink
];

const layers = [];
for (let i = 0; i < PIECES; i++) {
  const color = PALETTE[i % PALETTE.length];
  const x0 = W / 2 + (rand() - 0.5) * 120;
  const drift = (rand() - 0.5) * 220;
  const delay = Math.round(rand() * 25);
  const end = Math.min(END, delay + 70 + Math.round(rand() * 35));
  const spin = (rand() - 0.5) * 1080;
  const w = 7 + rand() * 7;
  const h = 9 + rand() * 9;
  layers.push({
    ddd: 0,
    ind: i + 1,
    ty: 4,
    nm: `confetti-${i}`,
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: delay, s: [0], h: 1 },
          { t: delay + 4, s: [100], h: 1 },
          { t: end - 12, s: [100], h: 1 },
          { t: end, s: [0] },
        ],
      },
      r: {
        a: 1,
        k: [
          { t: delay, s: [rand() * 360], h: 1 },
          { t: end, s: [rand() * 360 + spin] },
        ],
      },
      p: {
        a: 1,
        k: [
          { t: delay, s: [x0, -20, 0], h: 1 },
          {
            t: end,
            s: [x0 + drift, H + 30, 0],
            o: { x: 0.3, y: 0 },
            i: { x: 0.6, y: 1 },
          },
        ],
      },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    shapes: [
      {
        ty: "gr",
        nm: "rect",
        it: [
          { ty: "rc", d: 1, s: { a: 0, k: [w, h] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } },
          { ty: "fl", c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 } },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
        ],
      },
    ],
    ip: delay,
    op: end + 1,
    st: 0,
  });
}

const animation = {
  v: "5.7.4",
  fr: FR,
  ip: 0,
  op: END + 1,
  w: W,
  h: H,
  nm: "Lunch Tray Confetti (generated in-repo, no license needed)",
  layers,
};

const out = new URL("../public/lottie/confetti.json", import.meta.url);
await import("node:fs/promises").then(async (fs) => {
  await fs.mkdir(new URL("../public/lottie/", import.meta.url), { recursive: true });
  await fs.writeFile(out, JSON.stringify(animation));
  console.log(`wrote confetti.json (${layers.length} pieces)`);
});
