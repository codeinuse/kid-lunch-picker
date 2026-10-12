import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Allergen, FoodCategory, FoodItem } from "@/lib/types";
import { STARTER_FOODS } from "@/lib/starter-foods";

const querySchema = z.object({
  category: z.enum(["main", "side", "fruit", "veggie", "drink", "snack"]),
  q: z.string().max(60).optional().default(""),
  exclude: z.string().max(200).optional().default(""),
});

const CATEGORY_QUERIES: Record<FoodCategory, string> = {
  main: "pizza sandwich pasta",
  side: "french fries rice",
  fruit: "apple banana",
  veggie: "carrot broccoli",
  drink: "milk juice",
  snack: "cookie yogurt",
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

/** Drop live items whose title mentions an avoided allergen. */
function containsAvoidedAllergen(title: string, avoids: Allergen[]): boolean {
  const t = title.toLowerCase();
  return avoids.some((a) => ALLERGEN_KEYWORDS[a].some((k) => t.includes(k)));
}

/** Clean a menu-item title into a short kid-friendly name. */
function cleanName(title: string): string {
  const base = title.split("(")[0].split(",")[0].trim();
  if (base.length <= 24) return base;
  const cut = base.slice(0, 24);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 8 ? cut.slice(0, lastSpace) : cut).trim();
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
    const params = new URLSearchParams({
      apiKey,
      query: q || CATEGORY_QUERIES[category],
      number: "12",
      ...(avoids.length > 0 ? { intolerances: avoids.join(",") } : {}),
    });
    const res = await fetch(
      `https://api.spoonacular.com/food/menuItems/search?${params}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error(`Spoonacular ${res.status}`);
    const data = (await res.json()) as { menuItems?: SpoonacularResult[] };
    const live: FoodItem[] = (data.menuItems ?? [])
      .filter((m) => matchesCategory(m.title, category))
      .filter((m) => !containsAvoidedAllergen(m.title, avoids))
      .slice(0, 8)
      .map((m) => ({
        id: `sp-${m.id}`,
        name: cleanName(m.title),
        emoji: "🍱",
        imageUrl: m.image,
        category,
        allergens: [] as Allergen[],
        source: "spoonacular" as const,
      }));
    return NextResponse.json({ items: [...live, ...local], source: "mixed" });
  } catch {
    // API hiccup — never break the kid's flow, fall back to curated.
    return NextResponse.json({ items: local, source: "curated-fallback" });
  }
}
