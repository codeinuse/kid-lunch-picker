// Mascots: Open Peeps characters by Pablo Stanley, CC0 public domain
// (https://www.openpeeps.com — free for commercial/personal use, no credit needed).
// Vendored as static SVGs; keep the source note if you swap characters.

interface MascotProps {
  className?: string;
}

/** Warm greeter for the home header. */
export function GreeterMascot({ className }: MascotProps) {
  return (
    <img
      src="/mascots/greeter.svg"
      alt="Smiling kid with glasses waving hello"
      className={className ?? "h-28 w-auto"}
      draggable={false}
    />
  );
}

/** Heart-eyes fan for the tray-complete celebration. */
export function CheererMascot({ className }: MascotProps) {
  return (
    <img
      src="/mascots/cheerer.svg"
      alt="Happy kid with heart eyes cheering for your lunch"
      className={className ?? "h-36 w-auto"}
      draggable={false}
    />
  );
}

/** Pointing buddy for empty states and pick prompts. */
export function PointerMascot({ className }: MascotProps) {
  return (
    <img
      src="/mascots/pointer.svg"
      alt="Kid pointing up, showing you where to tap"
      className={className ?? "h-24 w-auto"}
      draggable={false}
    />
  );
}
