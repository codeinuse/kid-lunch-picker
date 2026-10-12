import type { FoodCategory } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { BrowseGrid } from "@/components/BrowseGrid";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export default async function BrowsePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <BrowseGrid category={category as FoodCategory} />;
}
