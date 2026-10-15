import { TrayGrid } from "@/components/TrayGrid";
import { Celebration } from "@/components/Celebration";
import { AllergenBar } from "@/components/AllergenBar";
import { PrintSummary } from "@/components/PrintSummary";
import { AuthGate } from "@/components/AuthGate";
import { ProfileChip } from "@/components/ProfileChip";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { HomeHeaderText } from "@/components/HomeHeaderText";
import { StreakRow } from "@/components/StreakRow";
import { ChallengeCard } from "@/components/ChallengeCard";
import { OnboardingTour } from "@/components/OnboardingTour";
import { StickerCollection } from "@/components/StickerCollection";
import { NutritionCard } from "@/components/NutritionCard";
import { Card } from "@/components/Card";

export default function Home() {
  return (
    <AuthGate>
    <OnboardingTour />
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-5 px-4 py-6">
      <ProfileChip />

      <Card tone="sunny">
        <HomeHeaderText />
      </Card>

      <Card icon="🌍" title="My World" subtitle="Pick a world, keep the streak" tone="sky">
        <div className="flex flex-col gap-3">
          <ThemeSwitcher />
          <StreakRow />
        </div>
      </Card>

      <Celebration />
      <ChallengeCard />
      <StickerCollection />
      <Link
        href="/lab"
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-3xl border-[3px] border-dashed border-stone-400 bg-white/60 font-display text-xl font-semibold text-stone-600 active:scale-95"
      >
        🔬 Snack Lab — just for fun!
      </Link>

      <Card icon="🧺" title="My Tray" subtitle="Tap a spot, then tap a yummy food">
        <TrayGrid />
      </Card>

      <NutritionCard />

      <AllergenBar />

      <footer className="pb-4 text-center text-sm font-semibold text-stone-400">
        Made with 💛 for lunch packers
      </footer>
    </main>
    <PrintSummary />
    </AuthGate>
  );
}
