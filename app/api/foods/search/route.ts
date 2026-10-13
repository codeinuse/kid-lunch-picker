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

/** HEAD-check an upstream photo; Spoonacular's `image` field often 404s. */
async function imageWorks(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
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
    const seen = new Set<string>();
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
    // Strip dead photo URLs so cards never show broken images
    // (the emoji fallback renders instead). CDN checks, not API quota.
    const checks = await Promise.all(
      live.map((item) => (item.imageUrl ? imageWorks(item.imageUrl) : false)),
    );
    live.forEach((item, i) => {
      if (item.imageUrl && !checks[i]) delete item.imageUrl;
    });
    return NextResponse.json({ items: [...live, ...local], source: "mixed" });
  } catch {
    // API hiccup — never break the kid's flow, fall back to curated.
    return NextResponse.json({ items: local, source: "curated-fallback" });
  }
}
