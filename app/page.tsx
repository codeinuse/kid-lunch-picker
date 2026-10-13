import { TrayGrid } from "@/components/TrayGrid";
import { Celebration } from "@/components/Celebration";
import { AllergenBar } from "@/components/AllergenBar";
import { PrintSummary } from "@/components/PrintSummary";

export default function Home() {
  return (
    <>
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-5 px-4 py-6">
      <header className="text-center">
        <p className="text-6xl" aria-hidden>
          🍱
        </p>
        <h1 className="mt-1 text-4xl font-black text-stone-800">
          Build Your Lunch!
        </h1>
        <p className="mt-1 text-xl font-bold text-stone-500">
          Tap a spot, then tap a yummy food 👇
        </p>
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
    </>
  );
}
