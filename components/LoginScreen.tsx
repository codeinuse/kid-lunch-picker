"use client";

import { useState } from "react";
import { useActiveKid, useLunchStore, type KidProfile } from "@/lib/store";
import { speak } from "@/lib/speak";
import { useTapSound } from "@/lib/sounds";
import { GreeterMascot, PointerMascot } from "@/components/Mascot";

const AVATARS = ["🦊", "🐼", "🐸", "🐯", "🦁", "🐰", "🐨", "🐵"];
const PIN_LENGTH = 4;

function PinPad({
  onDigit,
  onClear,
}: {
  onDigit: (d: string) => void;
  onClear: () => void;
}) {
  const tap = useTapSound();
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Clear", "0"];
  return (
    <div className="grid w-full max-w-xs grid-cols-3 gap-3">
      {keys.map((k) =>
        k === "Clear" ? (
          <button
            key={k}
            type="button"
            onClick={() => {
              tap();
              onClear();
            }}
            className="sticker-sm min-h-16 font-display text-xl font-semibold text-stone-700 active:translate-y-0.5 active:shadow-none"
          >
            ⌫
          </button>
        ) : (
          <button
            key={k}
            type="button"
            onClick={() => {
              tap();
              onDigit(k);
            }}
            aria-label={`Number ${k}`}
            className="sticker-sm min-h-16 font-display text-3xl font-semibold text-stone-800 active:translate-y-0.5 active:shadow-none"
          >
            {k}
          </button>
        ),
      )}
    </div>
  );
}

function PinDots({ count }: { count: number }) {
  return (
    <div className="flex justify-center gap-3" aria-hidden>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <span
          key={i}
          className={`h-6 w-6 rounded-full border-[3px] border-stone-900 ${
            i < count ? "bg-orange-500" : "bg-white"
          }`}
        />
      ))}
    </div>
  );
}

function EnterPin({ profile, onBack }: { profile: KidProfile; onBack: () => void }) {
  const selectProfile = useLunchStore((s) => s.selectProfile);
  const [pin, setPin] = useState("");
  const [wrong, setWrong] = useState(false);

  const digit = (d: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      if (next === profile.pin) {
        selectProfile(profile.id);
        speak(`Yay! Hi ${profile.name}!`);
      } else {
        setWrong(true);
        setPin("");
        speak("Oops, try again!");
      }
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="text-7xl" aria-hidden>
        {profile.avatar}
      </p>
      <h2 className="text-center font-display text-3xl font-semibold text-stone-800">
        Hi {profile.name}! Secret code? 🔑
      </h2>
      <PinDots count={pin.length} />
      {wrong && (
        <p className="font-display text-xl font-semibold text-red-600">
          Oops, try again! 💪
        </p>
      )}
      <PinPad onDigit={digit} onClear={() => setPin("")} />
      <button
        type="button"
        onClick={onBack}
        className="min-h-12 font-display text-lg font-semibold text-stone-500"
      >
        ←Pick someone else
      </button>
    </div>
  );
}

function CreateProfile({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const createProfile = useLunchStore((s) => s.createProfile);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");

  const startPin = () => {
    if (name.trim().length === 0) {
      setError("Tell us your name! ✏️");
      return;
    }
    setError("");
    setConfirm(false);
    setPin("");
    setStarted(true);
  };

  // First PIN entry is kept here while confirming.
  const [firstPin, setFirstPin] = useState("");

  const digitFixed = (d: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    if (!confirm) {
      setPin(next);
      if (next.length === PIN_LENGTH) {
        setFirstPin(next);
        setPin("");
        setConfirm(true);
      }
    } else {
      setPin(next);
      if (next.length === PIN_LENGTH) {
        if (next === firstPin) {
          const id = createProfile(name.trim().slice(0, 16), avatar, next);
          speak(`Welcome, ${name.trim().slice(0, 16)}!`);
          onDone();
          void id;
        } else {
          setError("Codes didn't match — try again! 💪");
          setConfirm(false);
          setFirstPin("");
          setPin("");
        }
      }
    }
  };
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <h2 className="text-center font-display text-3xl font-semibold text-stone-800">
        Make your lunch login! 🎒
      </h2>

      <label className="flex w-full max-w-xs flex-col gap-1 font-display text-xl font-semibold text-stone-700">
        Your name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={16}
          placeholder="Sam"
          aria-label="Your name"
          className="sticker-sm min-h-16 px-4 text-2xl text-stone-800 placeholder:text-stone-300"
        />
      </label>

      <div className="w-full max-w-xs">
        <p className="mb-2 text-center font-display text-xl font-semibold text-stone-700">
          Pick your animal
        </p>
        <div className="grid grid-cols-4 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              aria-pressed={avatar === a}
              aria-label={`Animal ${a}`}
              className={`min-h-16 text-4xl rounded-2xl border-[3px] transition-all active:scale-95 ${
                avatar === a
                  ? "border-stone-900 bg-green-100 shadow-[0_3px_0_#1c1917]"
                  : "border-stone-200 bg-white"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {!started && (
        <button
          type="button"
          onClick={startPin}
          className="min-h-14 rounded-full border-[3px] border-stone-900 bg-green-700 px-8 font-display text-xl font-semibold text-white shadow-[0_5px_0_#1c1917] active:translate-y-1 active:shadow-none"
        >
          Next: secret code →
        </button>
      )}

      {started && (
        <>
          <p className="text-center font-display text-xl font-semibold text-stone-700">
            {confirm ? "Type it again to check ✏️" : "Pick 4 numbers 🤫"}
          </p>
          <PinDots count={pin.length} />
          <PinPad onDigit={digitFixed} onClear={() => setPin("")} />
        </>
      )}

      {error !== "" && (
        <p className="font-display text-xl font-semibold text-red-600">{error}</p>
      )}

      <button
        type="button"
        onClick={onBack}
        className="min-h-12 font-display text-lg font-semibold text-stone-500"
      >
        ← Back
      </button>
    </div>
  );
}

export function LoginScreen() {
  const { profiles } = useActiveKid();
  const tap = useTapSound();
  const [view, setView] = useState<"pick" | "create" | { pin: KidProfile }>("pick");
  const pinProfile = typeof view === "object" ? view.pin : null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-5 px-4 py-6">
      <header className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <GreeterMascot className="h-24 w-auto shrink-0 sm:h-28" />
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-stone-800 sm:text-4xl">
            {view === "create" ? "New lunch buddy!" : "Who's picking lunch?"}
          </h1>
          <p className="mt-1 text-lg font-bold text-stone-500">
            {view === "create"
              ? "Make your login below 👇"
              : "Tap your picture to start! 😋"}
          </p>
        </div>
      </header>

      {view === "pick" && (
        <>
          {profiles.length === 0 ? (
            <div className="sticker flex w-full flex-col items-center gap-3 p-6 text-center">
              <PointerMascot className="h-28 w-auto" />
              <p className="font-display text-2xl font-medium text-stone-700">
                No lunch buddies yet!
              </p>
            </div>
          ) : (
            <div className="grid w-full grid-cols-2 gap-3">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    tap();
                    speak(p.name);
                    setView({ pin: p });
                  }}
                  className="sticker flex min-h-36 flex-col items-center justify-center gap-1 p-4 active:translate-y-1 active:shadow-none"
                >
                  <span className="text-7xl" aria-hidden>
                    {p.avatar}
                  </span>
                  <span className="font-display text-2xl font-medium text-stone-800">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              tap();
              setView("create");
            }}
            className="flex min-h-16 w-full items-center justify-center rounded-full border-[3px] border-dashed border-stone-400 font-display text-2xl font-semibold text-stone-600 active:scale-95"
          >
            + New lunch buddy
          </button>
        </>
      )}

      {view === "create" && (
        <CreateProfile onDone={() => setView("pick")} onBack={() => setView("pick")} />
      )}

      {pinProfile && (
        <EnterPin profile={pinProfile} onBack={() => setView("pick")} />
      )}

      <footer className="pb-4 text-center text-sm font-semibold text-stone-400">
        Logins stay on this device — no internet needed 🔒
      </footer>
    </main>
  );
}
