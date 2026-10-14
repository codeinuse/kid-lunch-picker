"use client";

import type { ReactNode } from "react";
import { useActiveKid } from "@/lib/store";
import { LoginScreen } from "@/components/LoginScreen";

/**
 * First page = login. Shows the kid picker / create-login until a
 * profile is signed in, then the lunch tray. The !mounted shell is
 * identical server/client (no hydration mismatch).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { mounted, profile } = useActiveKid();
  if (!mounted) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-5 px-4 py-6">
        <p className="py-16 text-center text-6xl" aria-hidden>
          🍱
        </p>
        <p role="status" className="sr-only">
          Getting your tray ready…
        </p>
      </main>
    );
  }
  if (!profile) return <LoginScreen />;
  return <>{children}</>;
}
