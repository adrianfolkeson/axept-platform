import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-ink p-10 text-white lg:flex">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          <span className="text-brand">●</span> Axept
        </Link>
        <div className="space-y-4">
          <h2 className="max-w-md text-3xl font-semibold leading-tight">
            Bygg snabbare. Hyr smartare.
          </h2>
          <p className="max-w-md text-white/70">
            Hitta arbetare, maskiner och företag i Norden — på en enda plats.
          </p>
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} Axept</p>
      </aside>

      <main className="flex flex-col px-5 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:items-center lg:justify-center">
        <Link
          href="/"
          className="mb-8 text-sm font-semibold tracking-tight text-ink lg:hidden"
        >
          <span className="text-brand">●</span> Axept
        </Link>
        <div className="mx-auto w-full max-w-sm flex-1 lg:flex-none">{children}</div>
      </main>
    </div>
  );
}
