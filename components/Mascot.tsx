// Mascots: original cartoon food friends, hand-drawn in-repo.
// No license needed — these SVGs belong to this project.

interface MascotProps {
  className?: string;
}

type GuideKind = "classic" | "space" | "jungle" | "ocean";

/** Theme guide shown in the header + celebration (classic = apple buddy). */
export function GuideMascot({ kind, className }: MascotProps & { kind: GuideKind }) {
  if (kind === "space") return <SpaceGuide className={className} />;
  if (kind === "jungle") return <JungleGuide className={className} />;
  if (kind === "ocean") return <OceanGuide className={className} />;
  return <GreeterMascot className={className} />;
}

/** Zippy the alien — Space guide. */
function SpaceGuide({ className }: MascotProps) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Friendly alien guide" className={className ?? "h-28 w-auto"}>
      <line x1="82" y1="52" x2="70" y2="26" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
      <line x1="118" y1="52" x2="130" y2="26" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
      <circle cx="70" cy="22" r="8" fill="#f472b6" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="130" cy="22" r="8" fill="#f472b6" stroke={OUTLINE} strokeWidth="4" />
      <ellipse cx="100" cy="118" rx="58" ry="62" fill="#4ade80" stroke={OUTLINE} strokeWidth="5" />
      <ellipse cx="100" cy="130" rx="34" ry="34" fill="#bbf7d0" />
      <ellipse cx="84" cy="112" rx="13" ry="17" fill="#fff" stroke={OUTLINE} strokeWidth="4" />
      <ellipse cx="116" cy="112" rx="13" ry="17" fill="#fff" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="86" cy="116" r="6" fill={OUTLINE} />
      <circle cx="118" cy="116" r="6" fill={OUTLINE} />
      <circle cx="88" cy="113" r="2" fill="#fff" />
      <circle cx="120" cy="113" r="2" fill="#fff" />
      <path d="M86 142 Q100 154 114 142" fill="none" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="68" cy="132" rx="8" ry="5" fill="#f9a8d4" />
      <ellipse cx="132" cy="132" rx="8" ry="5" fill="#f9a8d4" />
      <rect x="146" y="110" width="14" height="36" rx="7" transform="rotate(-24 153 128)" fill="#4ade80" stroke={OUTLINE} strokeWidth="4" />
    </svg>
  );
}

/** Momo the monkey — Jungle guide. */
function JungleGuide({ className }: MascotProps) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Friendly monkey guide" className={className ?? "h-28 w-auto"}>
      <circle cx="52" cy="96" r="16" fill="#a16207" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="52" cy="96" r="7" fill="#fde68a" />
      <circle cx="148" cy="96" r="16" fill="#a16207" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="148" cy="96" r="7" fill="#fde68a" />
      <ellipse cx="100" cy="116" rx="56" ry="60" fill="#a16207" stroke={OUTLINE} strokeWidth="5" />
      <ellipse cx="100" cy="128" rx="34" ry="36" fill="#fde68a" />
      <circle cx="84" cy="106" r="11" fill="#fff" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="116" cy="106" r="11" fill="#fff" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="86" cy="108" r="4.5" fill={OUTLINE} />
      <circle cx="118" cy="108" r="4.5" fill={OUTLINE} />
      <ellipse cx="72" cy="122" rx="7" ry="4.5" fill="#f9a8d4" />
      <ellipse cx="128" cy="122" rx="7" ry="4.5" fill="#f9a8d4" />
      <ellipse cx="100" cy="140" rx="12" ry="9" fill="#92400e" />
      <path d="M90 138 Q100 146 110 138" fill="none" stroke="#fde68a" strokeWidth="4" strokeLinecap="round" />
      <path d="M150 150 Q172 140 178 118" fill="none" stroke="#a16207" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

/** Bubbles the octopus — Ocean guide. */
function OceanGuide({ className }: MascotProps) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Friendly octopus guide" className={className ?? "h-28 w-auto"}>
      <path d="M52 150 Q46 172 58 180 M78 152 Q76 174 88 180 M122 152 Q124 174 112 180 M148 150 Q154 172 142 180" fill="none" stroke="#7c3aed" strokeWidth="11" strokeLinecap="round" />
      <ellipse cx="100" cy="108" rx="56" ry="60" fill="#a78bfa" stroke={OUTLINE} strokeWidth="5" />
      <circle cx="66" cy="52" r="6" fill="none" stroke="#7c3aed" strokeWidth="3" />
      <circle cx="134" cy="52" r="6" fill="none" stroke="#7c3aed" strokeWidth="3" />
      <circle cx="52" cy="30" r="4" fill="none" stroke="#7c3aed" strokeWidth="3" />
      <circle cx="148" cy="30" r="4" fill="none" stroke="#7c3aed" strokeWidth="3" />
      <circle cx="82" cy="100" r="12" fill="#fff" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="118" cy="100" r="12" fill="#fff" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="84" cy="102" r="5" fill={OUTLINE} />
      <circle cx="120" cy="102" r="5" fill={OUTLINE} />
      <circle cx="86" cy="100" r="1.6" fill="#fff" />
      <circle cx="122" cy="100" r="1.6" fill="#fff" />
      <ellipse cx="68" cy="118" rx="8" ry="5" fill="#f9a8d4" />
      <ellipse cx="132" cy="118" rx="8" ry="5" fill="#f9a8d4" />
      <path d="M86 124 Q100 138 114 124" fill="none" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="66" r="5" fill="#fde047" stroke={OUTLINE} strokeWidth="3" />
    </svg>
  );
}

const OUTLINE = "#1c1917";

/** Apple buddy waving hello — home header greeter. */
export function GreeterMascot({ className }: MascotProps) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Smiling apple waving hello" className={className ?? "h-28 w-auto"}>
      {/* waving arm */}
      <rect x="150" y="105" width="16" height="44" rx="8" transform="rotate(-28 158 127)" fill="#ef4444" stroke={OUTLINE} strokeWidth="5" />
      <line x1="176" y1="88" x2="186" y2="76" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
      <line x1="186" y1="94" x2="198" y2="88" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="100" cy="122" rx="62" ry="58" fill="#ef4444" stroke={OUTLINE} strokeWidth="5" />
      <ellipse cx="76" cy="100" rx="13" ry="19" fill="#fff" opacity="0.45" />
      {/* stem + leaf */}
      <rect x="95" y="42" width="10" height="26" rx="5" fill="#92400e" stroke={OUTLINE} strokeWidth="4" />
      <ellipse cx="124" cy="52" rx="19" ry="10" transform="rotate(-28 124 52)" fill="#22c55e" stroke={OUTLINE} strokeWidth="4" />
      {/* face */}
      <circle cx="82" cy="114" r="12" fill="#fff" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="118" cy="114" r="12" fill="#fff" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="84" cy="116" r="5" fill={OUTLINE} />
      <circle cx="120" cy="116" r="5" fill={OUTLINE} />
      <circle cx="86" cy="114" r="1.6" fill="#fff" />
      <circle cx="122" cy="114" r="1.6" fill="#fff" />
      <ellipse cx="68" cy="130" rx="8" ry="5" fill="#f9a8d4" />
      <ellipse cx="132" cy="130" rx="8" ry="5" fill="#f9a8d4" />
      <path d="M86 136 Q100 150 114 136" fill="none" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** Pizza pal with a party hat — tray-complete cheerer. */
export function CheererMascot({ className }: MascotProps) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Happy pizza slice cheering for your lunch" className={className ?? "h-36 w-auto"}>
      {/* arms up */}
      <line x1="52" y1="112" x2="34" y2="82" stroke={OUTLINE} strokeWidth="9" strokeLinecap="round" />
      <line x1="148" y1="112" x2="166" y2="82" stroke={OUTLINE} strokeWidth="9" strokeLinecap="round" />
      <circle cx="34" cy="78" r="7" fill="#fbbf24" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="166" cy="78" r="7" fill="#fbbf24" stroke={OUTLINE} strokeWidth="4" />
      {/* slice */}
      <polygon points="40,66 160,66 100,178" fill="#fbbf24" stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round" />
      {/* crust */}
      <rect x="30" y="46" width="140" height="26" rx="13" fill="#d97706" stroke={OUTLINE} strokeWidth="5" />
      {/* party hat */}
      <polygon points="100,6 84,48 116,48" fill="#8b5cf6" stroke={OUTLINE} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="100" cy="8" r="8" fill="#fff" stroke={OUTLINE} strokeWidth="4" />
      <circle cx="100" cy="28" r="3" fill="#fde047" />
      {/* pepperoni */}
      <circle cx="80" cy="92" r="10" fill="#dc2626" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="120" cy="92" r="10" fill="#dc2626" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="100" cy="118" r="10" fill="#dc2626" stroke={OUTLINE} strokeWidth="3" />
      {/* face */}
      <circle cx="82" cy="136" r="7" fill="#fff" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="118" cy="136" r="7" fill="#fff" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="83" cy="137" r="3" fill={OUTLINE} />
      <circle cx="119" cy="137" r="3" fill={OUTLINE} />
      <path d="M88 148 Q100 160 112 148" fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="70" cy="146" rx="7" ry="4.5" fill="#f9a8d4" />
      <ellipse cx="130" cy="146" rx="7" ry="4.5" fill="#f9a8d4" />
    </svg>
  );
}

/** Milk carton pointing up — empty states and pick prompts. */
export function PointerMascot({ className }: MascotProps) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Milk carton pointing up where to tap" className={className ?? "h-24 w-auto"}>
      {/* pointing arm */}
      <rect x="128" y="96" width="15" height="42" rx="7" transform="rotate(-32 135 117)" fill="#e0f2fe" stroke={OUTLINE} strokeWidth="4" />
      <path d="M162 62 l0 -14 M154 70 l8 -8 8 8" fill="none" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* carton */}
      <polygon points="62,84 100,58 138,84" fill="#bae6fd" stroke={OUTLINE} strokeWidth="5" strokeLinejoin="round" />
      <rect x="62" y="84" width="76" height="92" rx="6" fill="#fff" stroke={OUTLINE} strokeWidth="5" />
      <rect x="62" y="126" width="76" height="20" fill="#3b82f6" />
      <rect x="62" y="126" width="76" height="20" fill="none" stroke={OUTLINE} strokeWidth="4" />
      {/* face */}
      <circle cx="86" cy="106" r="9" fill="#fff" stroke={OUTLINE} strokeWidth="3.5" />
      <circle cx="114" cy="106" r="9" fill="#fff" stroke={OUTLINE} strokeWidth="3.5" />
      <circle cx="87" cy="107" r="3.6" fill={OUTLINE} />
      <circle cx="115" cy="107" r="3.6" fill={OUTLINE} />
      <path d="M90 156 Q100 164 110 156" fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="76" cy="116" rx="6" ry="4" fill="#f9a8d4" />
      <ellipse cx="124" cy="116" rx="6" ry="4" fill="#f9a8d4" />
    </svg>
  );
}
