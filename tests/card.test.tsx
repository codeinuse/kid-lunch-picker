/**
 * Card: the app's one panel — titled sticker section in a tone.
 */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "@/components/Card";

describe("Card", () => {
  it("renders title, subtitle, and children in a labeled section", () => {
    render(
      <Card icon="🧺" title="My Tray" subtitle="Pick yummy foods">
        <p>hello tray</p>
      </Card>,
    );
    const section = screen.getByRole("region", { name: "My Tray" });
    expect(section).toBeInTheDocument();
    expect(screen.getByText("Pick yummy foods")).toBeInTheDocument();
    expect(screen.getByText("hello tray")).toBeInTheDocument();
  });

  it("works titleless as a plain panel with an explicit label", () => {
    render(
      <Card label="Snack Lab">
        <p>lab header</p>
      </Card>,
    );
    expect(screen.getByRole("region", { name: "Snack Lab" })).toBeInTheDocument();
  });
});
