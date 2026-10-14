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

export default function Home() {
  return (
    <AuthGate>
    <OnboardingTour />
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-5 px-4 py-6">
      <ProfileChip />
      <HomeHeaderText />
      <ThemeSwitcher />

      <Celebration />
      <StreakRow />
      <ChallengeCard />
      <StickerCollection />
      <Link
        href="/lab"
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full border-[3px] border-dashed border-stone-400 font-display text-xl font-semibold text-stone-600 active:scale-95"
      >
        🔬 Snack Lab — just for fun!
      </Link>
      <TrayGrid />

      <div className="my-1 w-full border-t-2 border-dashed border-stone-200" />
      <AllergenBar />

      <footer className="pb-4 text-center text-sm font-semibold text-stone-400">
        Made with 💛 for lunch packers
      </footer>
    </main>
    <PrintSummary />
    </AuthGate>
  );
}
