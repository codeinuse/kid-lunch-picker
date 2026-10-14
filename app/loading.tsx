/**
 * Route loading shell: shimmer tray cards matching the sticker layout,
 * so navigation never flashes a bare emoji loader.
 */
export default function Loading() {
  return (
    <main
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-4 px-4 py-6"
      aria-busy="true"
    >
      <div className="flex w-full items-center gap-3">
        <div className="sticker-sm h-16 w-16 shrink-0 animate-pulse bg-stone-100" aria-hidden />
        <div className="flex-1">
          <div className="h-8 w-2/3 animate-pulse rounded-full bg-stone-100" aria-hidden />
          <div className="mt-2 h-5 w-1/2 animate-pulse rounded-full bg-stone-100" aria-hidden />
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-3" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="sticker flex min-h-36 flex-col items-center justify-center gap-2 p-4"
          >
            <div className="h-24 w-24 animate-pulse rounded-2xl bg-stone-100" />
            <div className="h-5 w-2/3 animate-pulse rounded-full bg-stone-100" />
          </div>
        ))}
      </div>
      <p role="status" className="sr-only">
        Loading yummy foods…
      </p>
    </main>
  );
}
