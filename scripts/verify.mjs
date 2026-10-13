/**
 * Live verification for kid-lunch-picker.
 *
 * Checks every page and every food feed the way a tester would:
 * pages load, feeds return items, photos actually exist, no dupes,
 * no fish-in-veggie junk, allergen excludes work, names are clean.
 *
 * Usage: npm run verify [-- baseUrl]
 * Requires the app running (default http://localhost:3000).
 * Exit code 0 = all green, 1 = something failed.
 */
const BASE = process.argv[2] ?? process.env.BASE_URL ?? "http://localhost:3000";
const CATEGORIES = ["main", "side", "fruit", "veggie", "drink", "snack"];
const MEATY = [
  "chicken", "beef", "pork", "bacon", "ham", "turkey", "steak",
  "fish", "salmon", "tuna", "flounder", "shrimp", "crab",
  "lobster", "clam", "cod", "tilapia", "meat", "pepperoni",
];

let pass = 0;
let fail = 0;
const failures = [];

function ok(name) {
  pass++;
  console.log(`  ✅ ${name}`);
}
function bad(name, detail = "") {
  fail++;
  failures.push(name);
  console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function get(path, timeoutMs = 30000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, { signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function headOk(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

console.log(`\n🔍 Verifying ${BASE}\n`);

console.log("— pages —");
try {
  const home = await get("/");
  home.status === 200 ? ok("GET / → 200") : bad("GET / → 200", `got ${home.status}`);
  const html = await home.text();
  html.includes("Build Your Lunch")
    ? ok("home shows tray title")
    : bad("home shows tray title");
  html.includes('id="print-summary"')
    ? ok("home includes print summary")
    : bad("home includes print summary");
} catch (e) {
  bad("home page reachable", `${e.cause?.code ?? e.message} (is the dev server running?)`);
  console.log(`\n${fail} failed, ${pass} passed. Start the app first: npm run dev`);
  process.exit(1);
}

for (const c of CATEGORIES) {
  try {
    const res = await get(`/browse/${c}`);
    res.status === 200 ? ok(`GET /browse/${c} → 200`) : bad(`GET /browse/${c}`, `got ${res.status}`);
  } catch (e) {
    bad(`GET /browse/${c}`, e.message);
  }
}

console.log("\n— feeds —");
const feeds = {};
for (const c of CATEGORIES) {
  try {
    const res = await get(`/api/foods/search?category=${c}`, 60000);
    if (!res.ok) {
      bad(`feed ${c} → 200`, `got ${res.status}`);
      continue;
    }
    const data = await res.json();
    feeds[c] = data.items ?? [];
    const items = feeds[c];
    items.length >= 4
      ? ok(`feed ${c}: ${items.length} items`)
      : bad(`feed ${c}: item count`, `only ${items.length}`);
    const live = items.filter((i) => i.source === "spoonacular").length;
    live >= 1
      ? ok(`feed ${c}: ${live} live photos`)
      : bad(`feed ${c}: live photos`, "zero live items");
  } catch (e) {
    bad(`feed ${c}`, e.message);
  }
}

console.log("\n— quality (dupes, junk, names) —");
for (const c of CATEGORIES) {
  const items = feeds[c] ?? [];
  const names = items.map((i) => i.name.toLowerCase());
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  dupes.length === 0
    ? ok(`${c}: no duplicate names`)
    : bad(`${c}: no duplicates`, [...new Set(dupes)].join(", "));

  if (["fruit", "veggie", "drink"].includes(c)) {
    const junk = items.filter((i) =>
      MEATY.some((k) => i.name.toLowerCase().includes(k)),
    );
    junk.length === 0
      ? ok(`${c}: no meaty junk`)
      : bad(`${c}: no meaty junk`, junk.map((i) => i.name).join(", "));
  }

  const ugly = items.filter(
    (i) => i.name.includes("\\'") || i.name.includes("&amp;") || /\s(LG|SM|MD|RG|XL)\.?$/i.test(i.name),
  );
  ugly.length === 0
    ? ok(`${c}: names clean`)
    : bad(`${c}: names clean`, ugly.map((i) => i.name).join(", "));
}

console.log("\n— allergen filtering (exclude=milk) —");
for (const c of ["drink", "snack"]) {
  try {
    const res = await get(`/api/foods/search?category=${c}&exclude=milk`, 60000);
    const data = await res.json();
    const items = data.items ?? [];
    const milkByTag = items.filter((i) => (i.allergens ?? []).includes("milk"));
    const milkByName = items.filter((i) => /milk|cheese|yogurt|cream|butter/i.test(i.name));
    milkByTag.length === 0 && milkByName.length === 0
      ? ok(`${c} + no-milk: clean (${items.length} items)`)
      : bad(
          `${c} + no-milk`,
          [...milkByTag, ...milkByName].map((i) => i.name).join(", "),
        );
  } catch (e) {
    bad(`${c} + no-milk`, e.message);
  }
}

console.log("\n— photo URLs actually load —");
const photoItems = Object.entries(feeds).flatMap(([c, items]) =>
  (items ?? []).filter((i) => i.imageUrl).map((i) => ({ ...i, c })),
);
console.log(`  checking ${photoItems.length} photos…`);
const photoResults = await Promise.all(
  photoItems.map(async (i) => ({ item: i, alive: await headOk(i.imageUrl) })),
);
const dead = photoResults.filter((r) => !r.alive);
dead.length === 0
  ? ok(`all ${photoItems.length} photos load`)
  : bad(
      "photos load",
      `${dead.length} dead: ` + dead.map((r) => `${r.item.c}/${r.item.name}`).join(", "),
    );

console.log(`\n${fail === 0 ? "🎉" : "⚠️"} ${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
