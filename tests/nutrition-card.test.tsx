/**
 * NutritionCard renders the live scoreboard: six power bars that
 * respond to the tray, plus Sizzle's coaching.
 */
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { STARTER_FOODS } from "@/lib/starter-foods";
import { useLunchStore } from "@/lib/store";
import { NutritionCard } from "@/components/NutritionCard";

vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("@/lib/sounds", () => ({
  useTapSound: () => vi.fn(),
  useAddSound: () => vi.fn(),
  useFanfareSound: () => vi.fn(),
}));

function freshKidWithTray(ids: string[]) {
  localStorage.clear();
  useLunchStore.setState({
    profiles: [], activeId: null, trays: {}, packedDays: {},
    triedAt: {}, seenTour: {}, stickers: {},
  });
  useLunchStore.getState().createProfile("Sam", "🦊", "1234", "classic", 6);
  const s = useLunchStore.getState();
  for (const id of ids) {
    const item = STARTER_FOODS.find((f) => f.id === id)!;
    s.setPick(item.category, { item, options: {} });
  }
}

beforeEach(() => {
  freshKidWithTray([]);
});

describe("NutritionCard", () => {
  it("shows an empty state with six power bars", () => {
    render(<NutritionCard />);
    expect(screen.getByText(/Lunch Power: 0/)).toBeInTheDocument();
    expect(screen.getByText("Empty lunchbox")).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar")).toHaveLength(6);
    expect(screen.getByText(/Pick foods to charge your powers/)).toBeInTheDocument();
  });

  it("a full tray scores high with nothing to coach", () => {
    freshKidWithTray(["pizza", "fries", "apple", "carrots", "milk", "cookie"]);
    render(<NutritionCard />);
    const card = screen.getByRole("region", { name: "Lunch power score" });
    expect(within(card).getByText(/Super Lunch|Champion Lunch/)).toBeInTheDocument();
    expect(within(card).queryByText(/% — add /)).not.toBeInTheDocument();
  });

  it("a one-sided tray coaches the weakest power", () => {
    freshKidWithTray(["milk"]);
    render(<NutritionCard />);
    const card = screen.getByRole("region", { name: "Lunch power score" });
    expect(within(card).getByText(/% — add /)).toBeInTheDocument();
  });
});
