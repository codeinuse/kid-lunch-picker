import Link from "next/link";
import { PointerMascot } from "@/components/Mascot";

/** Unknown route: point the kid back to the tray. */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-4 px-4 py-6">
      <div className="sticker p-6 text-center">
        <PointerMascot className="mx-auto h-28 w-auto" />
        <p className="mt-2 font-display text-3xl font-semibold text-stone-800">
          Hmm, no lunch down this road!
        </p>
        <p className="mt-1 text-lg font-bold text-stone-500">
          Let&apos;s head back to your tray.
        </p>
        <Link
          href="/"
          className="mt-4 flex min-h-16 w-full items-center justify-center rounded-full border-[3px] border-stone-900 bg-green-700 font-display text-2xl font-semibold text-white shadow-[0_5px_0_#1c1917] active:translate-y-1 active:shadow-none"
        >
          Back to Tray 🏠
        </Link>
      </div>
    </main>
  );
}
