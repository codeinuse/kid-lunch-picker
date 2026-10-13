import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Allergen, FoodCategory, FoodItem } from "@/lib/types";
import { STARTER_FOODS } from "@/lib/starter-foods";

const querySchema = z.object({
  category: z.enum(["main", "side", "fruit", "veggie", "drink", "snack"]),
  q: z.string().max(60).optional().default(""),
  exclude: z.string().max(200).optional().default(""),
});

/**
 * Single-word search terms per category. Spoonacular's menu-item search
 * handles one term reliably; multi-word queries often return nothing.
 * The route fans out over these (in parallel, cached 1h) and merges.
 */
const CATEGORY_TERMS: Record<FoodCategory, string[]> = {
  main: ["pizza", "sandwich"],
  side: ["fries", "rice"],
  fruit: ["apple", "banana"],
  veggie: ["broccoli", "salad"],
  drink: ["juice", "smoothie"],
  snack: ["cookie", "yogurt"],
};

interface SpoonacularResult {
  id: number;
  title: string;
  image: string;
}

/** Keywords used to screen live API titles for avoided allergens. */
const ALLERGEN_KEYWORDS: Record<Allergen, string[]> = {
  milk: ["milk", "cheese", "cheddar", "mozzarella", "yogurt", "cream", "butter", "whey", "latte", "cappuccino"],
  eggs: ["egg"],
  fish: ["fish", "tuna", "salmon", "cod"],
  shellfish: ["shrimp", "crab", "lobster", "clam"],
  tree_nuts: ["almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut"],
  peanuts: ["peanut"],
  wheat: ["wheat", "bread", "bun", "pizza", "pasta", "flour", "cookie", "sandwich", "tortilla", "bagel", "crust"],
  soy: ["soy", "tofu"],
  sesame: ["sesame"],
};

import { createHash } from "crypto";

/** Process-level cache so repeat visits don't re-download photos. */
const fingerprintCache = new Map<string, { hash: string; size: number } | null>();

/** Cache for Wikimedia thumbnail lookups (24h server fetch cache too). */
const thumbCache = new Map<string, string | null>();

/**
 * Real-food photo backfill from Wikimedia Commons (free, no key).
 * Used when Spoonacular has no usable photo for an item.
 */
async function wikimediaThumb(query: string): Promise<string | null> {
  const cached = thumbCache.get(query);
  if (cached !== undefined) return cached;
  let thumb: string | null = null;
  try {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      generator: "search",
      // JPEG-only: real photos. Rejects GIF warnings, PDF scans, SVG icons.
      gsrsearch: `${query} filemime:image/jpeg`,
      gsrnamespace: "6",
      gsrlimit: "5",
      prop: "imageinfo",
      iiprop: "url|size",
      iiurlwidth: "320",
    });
    // NOTE: no `next.revalidate` here — combining it with `signal` breaks
    // the fetch inside route handlers. thumbCache above covers repeats.
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      signal: AbortSignal.timeout(15000),
      // Wikimedia throttles/block anonymous bursts — identify ourselves.
      headers: {
        "User-Agent": "kid-lunch-picker/1.0 (https://github.com/codeinuse/kid-lunch-picker)",
      },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        query?: { pages?: Record<string, { index: number; imageinfo?: { thumburl?: string; width?: number; height?: number }[] }> };
      };
      const pages = Object.values(data.query?.pages ?? {}).sort(
        (a, b) => a.index - b.index,
      );
      for (const page of pages) {
        const info = page.imageinfo?.[0];
        // Skip tiny icons and extreme panoramas.
        if (info?.thumburl && (info.width ?? 0) >= 200 && (info.height ?? 0) >= 150) {
          thumb = info.thumburl;
          break;
        }
      }
    }
  } catch {
    thumb = null;
  }
  thumbCache.set(query, thumb);
  return thumb;
}

/** Bounded-parallel map (gentle on free APIs). */
async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const idx = next++;
        results[idx] = await fn(items[idx]);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

/** Full name first, then the last word ("Aloha Pineapple Smoothie" → "Smoothie"). */
async function thumbWithFallback(name: string): Promise<string | null> {
  const direct = await wikimediaThumb(name);
  if (direct) return direct;
  const words = name.split(/\s+/);
  if (words.length > 1) {
    return wikimediaThumb(words[words.length - 1]);
  }
  return null;
}

/** Photos smaller than this that are shared across items = placeholder art. */
const PLACEHOLDER_MAX_BYTES = 10240;

/**
 * Fingerprint an upstream photo by content hash + size. Spoonacular's
 * `image` field often points at dead files (404) or a generic grey-dome
 * placeholder served byte-identical under many different URLs.
 * Returns null when the photo is missing/unreadable.
 */
async function imageFingerprint(
  url: string,
): Promise<{ hash: string; size: number } | null> {
  const cached = fingerprintCache.get(url);
  if (cached !== undefined) return cached;
  let fp: { hash: string; size: number } | null = null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 0) {
        fp = { hash: createHash("md5").update(buf).digest("hex"), size: buf.length };
      }
    }
  } catch {
    fp = null;
  }
  fingerprintCache.set(url, fp);
  return fp;
}

/** Drop live items whose title mentions an avoided allergen. */
function containsAvoidedAllergen(title: string, avoids: Allergen[]): boolean {
  const t = title.toLowerCase();
  return avoids.some((a) => ALLERGEN_KEYWORDS[a].some((k) => t.includes(k)));
}

/** Clean a menu-item title into a short kid-friendly name. */
function cleanName(title: string): string {
  let base = title.split("(")[0].split(",")[0].split(" - ")[0].trim();
  base = base
    .replace(/\\'/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+(LG|SM|MD|RG|XL)\.?$/i, "")
    .replace(/\s+No\s+.*$/i, "")
    .trim();
  if (base.length <= 24) return base;
  const cut = base.slice(0, 24);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 8 ? cut.slice(0, lastSpace) : cut).trim();
}

/** Meat/fish keywords — never belong in fruit/veggie/drink grids. */
const MEATY = [
  "chicken", "beef", "pork", "bacon", "ham", "turkey", "steak",
  "fish", "salmon", "tuna", "flounder", "shrimp", "crab",
  "lobster", "clam", "cod", "tilapia", "meat", "pepperoni",
];

function isJunkForCategory(name: string, category: FoodCategory): boolean {
  if (category !== "fruit" && category !== "veggie" && category !== "drink") {
    return false;
  }
  const t = name.toLowerCase();
  return MEATY.some((k) => t.includes(k));
}

/** Map a Spoonacular menu-item title to our category (best effort). */
function matchesCategory(title: string, category: FoodCategory): boolean {
  const t = title.toLowerCase();
  const hints: Record<FoodCategory, string[]> = {
    main: ["pizza", "sandwich", "pasta", "nugget", "burger", "chicken", "taco", "wrap"],
    side: ["fries", "rice", "corn", "potato", "mash"],
    fruit: ["apple", "banana", "grape", "orange", "berry", "fruit"],
    veggie: ["carrot", "broccoli", "cucumber", "salad", "veggie", "green bean"],
    drink: ["milk", "juice", "water", "smoothie", "lemonade"],
    snack: ["cookie", "yogurt", "granola", "pudding", "cracker", "muffin"],
  };
  return hints[category].some((h) => t.includes(h));
}

export async function GET(req: NextRequest) {
  const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const { category, q, exclude } = parsed.data;
  const avoids = exclude
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as Allergen[];

  const local = STARTER_FOODS.filter(
    (f) =>
      f.category === category &&
      !f.allergens.some((a) => avoids.includes(a)) &&
      (q === "" || f.name.toLowerCase().includes(q.toLowerCase())),
  );

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    // No key configured — curated items only. App works fully offline.
    return NextResponse.json({ items: local, source: "curated" });
  }

  try {
    const terms = q === "" ? CATEGORY_TERMS[category] : [q];
    const searches = await Promise.all(
      terms.map(async (term) => {
        const params = new URLSearchParams({
          apiKey,
          query: term,
          number: "10",
          ...(avoids.length > 0 ? { intolerances: avoids.join(",") } : {}),
        });
        const res = await fetch(
          `https://api.spoonacular.com/food/menuItems/search?${params}`,
          { next: { revalidate: 3600 } },
        );
        if (!res.ok) throw new Error(`Spoonacular ${res.status}`);
        const data = (await res.json()) as { menuItems?: SpoonacularResult[] };
        return data.menuItems ?? [];
      }),
    );
    const menuItems = searches.flat();
    // Match + dedupe on the cleaned name (raw titles carry side-dish
    // parentheticals like "Salmon (Broccoli)" that pollute matching).
    // Seed with curated names so live results can't shadow them.
    const seen = new Set<string>(local.map((f) => f.name.toLowerCase()));
    const live: FoodItem[] = [];
    for (const m of menuItems) {
      const name = cleanName(m.title);
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      if (!matchesCategory(name, category)) continue;
      if (isJunkForCategory(name, category)) continue;
      if (containsAvoidedAllergen(m.title, avoids)) continue;
      seen.add(key);
      live.push({
        id: `sp-${m.id}`,
        name,
        emoji: "🍱",
        imageUrl: m.image,
        category,
        allergens: [] as Allergen[],
        source: "spoonacular" as const,
      });
      if (live.length >= 8) break;
    }
    // Strip dead AND placeholder photos. Placeholders are byte-identical
    // across different items AND tiny; a photo shared by 2+ items that is
    // also small is generic art. Large shared photos are kept (real photo
    // reused for variants beats an emoji). Cards fall back to emoji instead.
    // (CDN downloads, not API quota; fingerprinted once then cached.)
    const fps = await Promise.all(
      live.map((item) =>
        item.imageUrl ? imageFingerprint(item.imageUrl) : null,
      ),
    );
    const seenFp = new Map<string, number>();
    for (const fp of fps) {
      if (fp) seenFp.set(fp.hash, (seenFp.get(fp.hash) ?? 0) + 1);
    }
    live.forEach((item, i) => {
      const fp = fps[i];
      if (
        !item.imageUrl ||
        !fp ||
        ((seenFp.get(fp.hash) ?? 0) > 1 && fp.size < PLACEHOLDER_MAX_BYTES)
      ) {
        delete item.imageUrl;
      }
    });
    // Backfill missing photos with real Commons pictures — live items
    // and curated items alike. Curated items are copied, never mutated,
    // so the offline/no-key path stays pristine.
    const missing = live.filter((item) => !item.imageUrl);
    const thumbs = await mapPool(missing, 4, (item) => thumbWithFallback(item.name));
    missing.forEach((item, i) => {
      if (thumbs[i]) item.imageUrl = thumbs[i] ?? undefined;
    });
    const noPhotoLocal = local.filter((f) => !f.imageUrl);
    const localThumbs = await mapPool(noPhotoLocal, 4, (f) => thumbWithFallback(f.name));
    const localThumbById = new Map(noPhotoLocal.map((f, i) => [f.id, localThumbs[i]]));
    const enrichedLocal = local.map((f) => {
      const t = localThumbById.get(f.id);
      return t ? { ...f, imageUrl: t } : f;
    });
    return NextResponse.json({ items: [...live, ...enrichedLocal], source: "mixed" });
  } catch {
    // API hiccup — never break the kid's flow, fall back to curated.
    return NextResponse.json({ items: local, source: "curated-fallback" });
  }
}
