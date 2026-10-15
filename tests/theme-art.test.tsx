/**
 * Theme art: every theme carries IconScout queries, and the animated
 * scene renders per theme (classic stays plain).
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { THEMES, THEME_ORDER, themePack } from "@/lib/themes";
import { ThemeScene } from "@/components/ThemeScene";

describe("theme art hooks", () => {
  it("every theme has IconScout icon + lottie queries", () => {
    for (const id of THEME_ORDER) {
      expect(THEMES[id].art.iconQuery.length).toBeGreaterThan(3);
      expect(THEMES[id].art.lottieQuery.length).toBeGreaterThan(3);
    }
  });

  it("unknown theme falls back to classic art", () => {
    expect(themePack(undefined).id).toBe("classic");
  });
});

describe("ThemeScene", () => {
  it("renders nothing for classic (plain background)", () => {
    const { container } = render(<ThemeScene theme="classic" />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(THEME_ORDER.filter((t) => t !== "classic"))(
    "renders an animated, hidden backdrop for %s",
    (theme) => {
      render(<ThemeScene theme={theme} />);
      const scene = screen.getByTestId(`theme-scene-${theme}`);
      expect(scene).toHaveAttribute("aria-hidden", "true");
    },
  );
});
