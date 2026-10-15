/**
 * Curated food art: every starter food except granola has a local
 * IconScout SVG; live API items and granola fall back to photo/emoji.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { STARTER_FOODS } from "@/lib/starter-foods";
import { FoodArt, foodArtSrc, uniqueArtItems } from "@/components/FoodArt";
import type { FoodItem } from "@/lib/types";
describe("foodArtSrc", () => {
  it("covers every starter food except granola (pending IconScout match)", () => {
    const missing = STARTER_FOODS.filter((f) => !foodArtSrc(f)).map((f) => f.id);
    expect(missing).toEqual(["granola"]);
  });

  it("maps live API items to art by name keyword", () => {
    const live = (name: string) => ({
      id: "sp-1", name, emoji: "🍱", category: "main" as const, allergens: [], source: "spoonacular" as const,
    });
    expect(foodArtSrc(live("Pepperoni Pizza"))).toBe("/foods/pizza.svg");
    expect(foodArtSrc(live("Chocolate Milk Shake"))).toBe("/foods/choc-milk.svg");
    expect(foodArtSrc(live("Mystery Blob Surprise"))).toBeNull();
  });
});

describe("uniqueArtItems", () => {
  const live = (id: string, name: string): FoodItem => ({
    id, name, emoji: "🍱", category: "main", allergens: [], source: "spoonacular",
  });

  it("drops live duplicates sharing curated art, curated first", () => {
    const pizza = STARTER_FOODS.find((f) => f.id === "pizza")!;
    const shown = uniqueArtItems([live("sp-1", "Combo Pizza"), live("sp-2", "BBQ Bacon Pizza"), pizza]);
    expect(shown.map((f) => f.id)).toEqual(["pizza"]);
  });

  it("keeps items without art (distinct photos/emoji)", () => {
    const shown = uniqueArtItems([
      live("sp-1", "Mystery Blob Surprise"),
      live("sp-2", "Enigma Loaf Special"),
    ]);
    expect(shown).toHaveLength(2);
  });
});
describe("FoodArt", () => {
  it("renders the local art and falls back to emoji for granola", () => {
    const pizza = STARTER_FOODS.find((f) => f.id === "pizza")!;
    const { container, rerender } = render(<FoodArt item={pizza} fallback={<span>fallback</span>} />);
    // next/image optimizes the src — just prove a real image rendered.
    expect(container.querySelector("img")).toBeInTheDocument();
    expect(screen.queryByText("fallback")).not.toBeInTheDocument();
    const granola = STARTER_FOODS.find((f) => f.id === "granola")!;
    rerender(<FoodArt item={granola} fallback={<span>fallback</span>} />);
    expect(screen.getByText("fallback")).toBeInTheDocument();
  });
});
