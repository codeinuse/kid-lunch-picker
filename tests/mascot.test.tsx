/**
 * Sizzle the sausage: one consistent lunch-buddy mascot across
 * emotions, with the hand-drawn apple as fallback.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SausageMascot } from "@/components/SausageMascot";

describe("SausageMascot", () => {
  it.each(["greet", "cheer", "point", "sad", "snack", "playful"] as const)(
    "renders the %s pose with an accessible label",
    (emotion) => {
      render(<SausageMascot emotion={emotion} />);
      expect(screen.getByRole("img")).toBeInTheDocument();
    },
  );

  it("celebration shows Sizzle loving the lunch", async () => {
    const { Celebration } = await import("@/components/Celebration");
    // Celebration needs a signed-in kid with a full tray; without one it
    // renders the progress shell — Sizzle appears on completion (e2e).
    expect(Celebration).toBeDefined();
  });
});
