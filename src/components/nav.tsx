"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavGroup = { title?: string; links: { href: string; label: string; dot?: string }[] };

export default function Nav({ groups }: { groups: NavGroup[] }) {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <nav className="flex lg:flex-col gap-1 lg:gap-5 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0">
      {groups.map((g, i) => (
        <div key={i} className="flex lg:flex-col gap-1 lg:gap-0.5 shrink-0">
          {g.title && <div className="hidden lg:block px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-faint">{g.title}</div>}
          {g.links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                active(l.href) ? "bg-surface text-ink font-medium shadow-[0_0_0_1px_var(--line)]" : "text-muted hover:text-ink hover:bg-sunken"}`}>
              {l.dot && <span className="size-2 rounded-full" style={{ background: l.dot }} />}
              {l.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
