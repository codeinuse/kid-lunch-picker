import { TrayGrid } from "@/components/TrayGrid";
import { Celebration } from "@/components/Celebration";
import { AllergenBar } from "@/components/AllergenBar";
import { PrintSummary } from "@/components/PrintSummary";
import { GreeterMascot } from "@/components/Mascot";
import { AuthGate } from "@/components/AuthGate";
import { ProfileChip } from "@/components/ProfileChip";

export default function Home() {
  return (
    <AuthGate>
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-5 px-4 py-6">
      <ProfileChip />
      <header className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <GreeterMascot className="h-24 w-auto shrink-0 sm:h-28" />
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-stone-800 sm:text-4xl">
            Build Your Lunch!
          </h1>
          <p className="mt-1 text-lg font-bold text-stone-500 sm:text-xl">
            Tap a spot, then tap a yummy food 👇
          </p>
        </div>
      </header>

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
