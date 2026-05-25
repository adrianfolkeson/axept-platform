"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { Role } from "@/lib/auth/session";
import {
  Home,
  Search,
  Briefcase,
  Wrench,
  Inbox,
  MessageSquare,
  ShieldCheck,
  User
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: Role[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Översikt", icon: Home },
  { href: "/marketplace", label: "Marknadsplats", icon: Search },
  { href: "/profile/equipment", label: "Mina maskiner", icon: Wrench, roles: ["equipment_owner"] },
  { href: "/profile/certifications", label: "Certifikat", icon: Briefcase, roles: ["worker"] },
  { href: "/requests", label: "Förfrågningar", icon: Inbox },
  { href: "/messages", label: "Meddelanden", icon: MessageSquare },
  { href: "/profile", label: "Min profil", icon: User },
  { href: "/admin", label: "Admin", icon: ShieldCheck, roles: ["admin"] }
];

export function Sidebar({ role }: { role: Role }) {
  const path = usePathname();
  const items = NAV.filter((n) => !n.roles || n.roles.includes(role));

  return (
    <nav className="space-y-1 p-3">
      {items.map((it) => {
        const active = path === it.href || path.startsWith(`${it.href}/`);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-sm",
              active ? "bg-panel text-ink font-medium" : "text-mute hover:bg-panel hover:text-ink"
            )}
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
