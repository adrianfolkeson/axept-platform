import { requireUser } from "@/lib/auth/session";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();

  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] md:grid-cols-[240px_1fr] md:grid-rows-1">
      <aside className="hidden border-r border-border bg-bg md:block">
        <div className="flex h-14 items-center border-b border-border px-5 text-sm font-semibold tracking-tight">
          <span className="text-brand">●</span>
          <span className="ml-2">Axept</span>
        </div>
        <Sidebar role={session.role} />
      </aside>

      <div className="flex min-h-screen flex-col">
        <TopBar session={session} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:py-8 md:pb-12">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
