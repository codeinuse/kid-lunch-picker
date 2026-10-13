"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { optionsFor, summarizeOptions } from "@/lib/options";
import { useActiveKid } from "@/lib/store";

/**
 * Paper-friendly lunch order. Hidden on screen (`hidden`), shown only
 * in print (`print:block`). The print stylesheet hides everything else,
 * so "Save as PDF" from the print dialog captures just this order.
 */
export function PrintSummary() {
  const { profile, picks } = useActiveKid();
  // Date only exists after mount (Next 16 forbids new Date() at prerender).
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <section
      id="print-summary"
      aria-label="Printable lunch order"
      className="hidden print:block"
    >
      <h1 style={{ fontSize: 30, fontWeight: 600, fontFamily: "Fredoka, Nunito, sans-serif" }}>
        🍱 {profile ? `${profile.name}'s Lunch Order` : "My Lunch Order"}
      </h1>
      <p style={{ fontSize: 16 }}>{today}</p>
      <hr />
      <ul style={{ listStyle: "none", padding: 0 }}>
        {CATEGORIES.map((cat) => {
          const pick = picks[cat.id];
          const summary =
            pick?.item
              ? summarizeOptions(
                  optionsFor(pick.item.id, pick.item.category),
                  pick.options,
                )
              : "";
          return (
            <li key={cat.id} style={{ fontSize: 20, margin: "12px 0" }}>
              <strong>
                {cat.emoji} {cat.label}:
              </strong>{" "}
              {pick?.item ? (
                <>
                  {pick.item.emoji} {pick.item.name}
                  {summary !== "" && (
                    <span style={{ color: "#555" }}> ({summary})</span>
                  )}
                </>
              ) : (
                <span style={{ color: "#999" }}>— not picked —</span>
              )}
            </li>
          );
        })}
      </ul>
      <hr />
      <p style={{ fontSize: 16 }}>Packed with 💛 by Lunch Tray</p>
    </section>
  );
}
