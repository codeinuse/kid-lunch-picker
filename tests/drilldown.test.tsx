/**
 * Drill-down regression tests: tapping a food MUST open its options,
 * choosing options + Add to Tray MUST land them on the tray.
 * (Covers the reported "click an option does not drill down" bug class.)
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowseGrid } from "@/components/BrowseGrid";
import { STARTER_FOODS } from "@/lib/starter-foods";
import { useLunchStore } from "@/lib/store";

vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("@/lib/sounds", () => ({
  useTapSound: () => vi.fn(),
  useAddSound: () => vi.fn(),
  useFanfareSound: () => vi.fn(),
}));

const MAINS = STARTER_FOODS.filter((f) => f.category === "main");

function stubFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => ({
      ok: true,
      json: async () => ({ items: MAINS, source: "curated" }),
    })),
  );
}

function renderBrowse() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <BrowseGrid category="main" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  useLunchStore.setState({
    profiles: [],
    activeId: null,
    trays: {},
    triedAt: {},
    seenTour: {},
    stickers: {},
  });
  useLunchStore.getState().createProfile("Sam", "🦊", "1234");
  stubFetch();
});

describe("drill-down: browse → options → tray", () => {
  it("tapping a food opens its options sheet", async () => {
    const user = userEvent.setup();
    renderBrowse();
    await user.click(await screen.findByRole("button", { name: "Pick Pizza" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Topping?")).toBeInTheDocument();
    expect(screen.getByText("Size?")).toBeInTheDocument();
  });

  it("choosing options + Add to Tray lands them on the tray", async () => {
    const user = userEvent.setup();
    renderBrowse();
    await user.click(await screen.findByRole("button", { name: "Pick Pizza" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /Pepperoni/ }));
    await user.click(within(dialog).getByRole("button", { name: /Big/ }));
    await user.click(within(dialog).getByRole("button", { name: /Add to Tray/ }));

    const id = useLunchStore.getState().activeId!;
    const pick = useLunchStore.getState().trays[id].picks.main;
    expect(pick?.item.id).toBe("pizza");
    expect(pick?.options).toMatchObject({ topping: "pepperoni", size: "big" });
  });

  it("tapping a food adds it immediately even if the sheet is dismissed", async () => {
    const user = userEvent.setup();
    renderBrowse();
    await user.click(await screen.findByRole("button", { name: "Pick Nuggets" }));
    // Dismiss via Escape without touching Add to Tray.
    await user.keyboard("{Escape}");
    const id = useLunchStore.getState().activeId!;
    const pick = useLunchStore.getState().trays[id].picks.main;
    // Instant-add: tap alone must never result in "nothing added".
    expect(pick?.item.id).toBe("nuggets");
  });

  it("reopening the sheet keeps the kid's tweaks, not defaults", async () => {
    const user = userEvent.setup();
    renderBrowse();
    await user.click(await screen.findByRole("button", { name: "Pick Pizza" }));
    let dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: /Pepperoni/ }));
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Pick Pizza" }));
    dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByRole("button", { name: /Pepperoni/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("sends the grown-ups avoid list to the API", async () => {
    useLunchStore.getState().toggleAvoid("milk");
    renderBrowse();
    await screen.findByRole("button", { name: "Pick Pizza" });
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    expect(fetchMock).toHaveBeenCalled();
    // First call fires pre-mount with empty avoids; the store-driven
    // refetch must carry the avoid list.
    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls.some((u) => u.includes("exclude=milk"))).toBe(true);
  });
});
