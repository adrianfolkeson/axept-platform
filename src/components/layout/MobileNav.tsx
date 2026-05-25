"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Inbox, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Item {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Hem", icon: Home },
  { href: "/marketplace", label: "Marknad", icon: Search },
  { href: "/requests", label: "Förfrågn.", icon: Inbox },
  { href: "/messages", label: "Inkorg", icon: MessageSquare },
  { href: "/profile", label: "Profil", icon: User }
];

export function MobileNav() {
  const path = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((it) => {
          const active = path === it.href || path.startsWith(`${it.href}/`);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-ink" : "text-mute"
                )}
              >
                <it.icon className={cn("h-5 w-5", active ? "text-brand" : "text-mute")} />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
