/**
 * Rewards + onboarding: the tour appears once per kid, stickers grow
 * the collection shelf, and completing a tray earns the next sticker.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingTour } from "@/components/OnboardingTour";
import { StickerCollection } from "@/components/StickerCollection";
import { Celebration } from "@/components/Celebration";
import { STARTER_FOODS } from "@/lib/starter-foods";
import { defaultOptions, optionsFor } from "@/lib/options";
import { STICKERS } from "@/lib/stickers";
import { useLunchStore } from "@/lib/store";
import { visibleCategories } from "@/lib/categories";

vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("@/lib/sounds", () => ({
  useTapSound: () => vi.fn(),
  useAddSound: () => vi.fn(),
  useFanfareSound: () => vi.fn(),
}));

function freshKid() {
  localStorage.clear();
  useLunchStore.setState({
    profiles: [],
    activeId: null,
    trays: {},
    packedDays: {},
    triedAt: {},
    seenTour: {},
    stickers: {},
  });
  return useLunchStore.getState().createProfile("Sam", "🦊", "1234");
}

beforeEach(() => {
  freshKid();
});

describe("onboarding tour", () => {
  it("welcomes a new kid and disappears after Skip", async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Skip tour" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const id = useLunchStore.getState().activeId!;
    expect(useLunchStore.getState().seenTour[id]).toBe(true);
  });

  it("walks all three steps to launch", async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);
    await user.click(screen.getByRole("button", { name: /Next/ }));
    await user.click(screen.getByRole("button", { name: /Next/ }));
    await user.click(screen.getByRole("button", { name: /Let's Go/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("sticker collection", () => {
  it("shows the sprout level with a fully locked grid", () => {
    render(<StickerCollection />);
    expect(screen.getByText("Lunch Sprout")).toBeInTheDocument();
    const shelf = screen.getByRole("region", { name: /Sticker collection/ });
    expect(
      within(shelf).getAllByLabelText(/^Locked:/),
    ).toHaveLength(STICKERS.length);
  });

  it("completing the tray earns the first sticker", () => {
    const s = useLunchStore.getState();
    for (const cat of visibleCategories(null)) {
      const item = STARTER_FOODS.find((f) => f.category === cat.id)!;
      s.setPick(cat.id, {
        item,
        options: defaultOptions(optionsFor(item.id, item.category)),
      });
    }
    render(<Celebration />);
    const id = useLunchStore.getState().activeId!;
    expect(useLunchStore.getState().stickers[id]).toEqual([STICKERS[0].id]);
    expect(useLunchStore.getState().packedDays[id]).toHaveLength(1);
  });
});
