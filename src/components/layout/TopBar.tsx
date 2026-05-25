import Link from "next/link";
import { logoutAction } from "@/features/auth/actions";
import type { SessionProfile } from "@/lib/auth/session";

export function TopBar({ session }: { session: SessionProfile }) {
  return (
    <header
      className="flex h-14 items-center justify-between border-b border-border bg-bg px-4 sm:px-6"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <Link href="/dashboard" className="text-sm font-semibold tracking-tight md:hidden">
        <span className="text-brand">●</span> Axept
      </Link>
      <span className="hidden text-sm font-semibold tracking-tight md:inline">&nbsp;</span>

      <div className="flex items-center gap-2 text-sm">
        <span className="hidden max-w-[12rem] truncate text-mute sm:inline">
          {session.full_name}
        </span>
        <span className="hidden text-xs uppercase tracking-wide text-mute md:inline">
          {session.role}
        </span>
        <form action={logoutAction}>
          <button className="inline-flex h-10 items-center rounded-md px-3 text-mute hover:bg-panel hover:text-ink">
            Logga ut
          </button>
        </form>
      </div>
    </header>
  );
}
