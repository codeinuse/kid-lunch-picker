import { TrayGrid } from "@/components/TrayGrid";
import { Celebration } from "@/components/Celebration";
import { AllergenBar } from "@/components/AllergenBar";
import { PrintSummary } from "@/components/PrintSummary";
import { AuthGate } from "@/components/AuthGate";
import { ProfileChip } from "@/components/ProfileChip";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { HomeHeaderText } from "@/components/HomeHeaderText";

export default function Home() {
  return (
    <AuthGate>
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-5 px-4 py-6">
      <ProfileChip />
      <HomeHeaderText />
      <ThemeSwitcher />

      <Celebration />
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
