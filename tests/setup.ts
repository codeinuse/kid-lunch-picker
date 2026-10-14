import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom has no auto-cleanup without globals: unmount trees between tests
// and scrub Radix's body pointer-events lock so later taps aren't blocked.
afterEach(() => {
  cleanup();
  document.body.removeAttribute("style");
});

// jsdom gaps used by animation/a11y libs.
if (!window.matchMedia) {
  window.matchMedia = (() => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof window.ResizeObserver;
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof window.IntersectionObserver;
}
