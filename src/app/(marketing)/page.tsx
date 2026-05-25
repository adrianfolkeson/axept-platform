import Link from "next/link";

export default function MarketingPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-4xl flex-col justify-center px-5 py-16 sm:px-6 sm:py-20">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1 text-xs uppercase tracking-wide text-mute">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Axept — beta
        </div>
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Bygg snabbare.
          <br />
          Hyr smartare.
        </h1>
        <p className="max-w-xl text-lg text-mute">
          Marknadsplatsen som kopplar samman byggföretag, arbetare och maskinägare i Norden.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-brand px-5 text-sm font-medium text-brand-fg hover:opacity-90"
          >
            Kom igång
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-bg px-5 text-sm font-medium hover:bg-panel"
          >
            Logga in
          </Link>
        </div>
      </div>
    </main>
  );
}
