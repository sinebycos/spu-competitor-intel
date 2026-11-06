import Link from "next/link";
import { FACULTIES, KINDS, PRIORITY, UNIS, label, type UniKey } from "@/lib/constants";
import { fmtRange, hostOf } from "@/lib/format";
import type { Item } from "@/lib/queries";

export function uniColor(uni: string) {
  return UNIS[uni as UniKey]?.color ?? "var(--faint)";
}

export function UniBadge({ uni, link = false }: { uni: string; link?: boolean }) {
  const u = UNIS[uni as UniKey];
  const inner = (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap">
      <span className="size-2 rounded-full" style={{ background: uniColor(uni) }} />
      {u?.label ?? uni}
      {u?.self && <span className="text-[10px] rounded bg-accent-soft text-accent px-1">เรา</span>}
    </span>
  );
  return link ? <Link href={`/competitors/${uni}`} className="hover:underline">{inner}</Link> : inner;
}

export function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "accent" | "high" | "medium" | "low" | "good" }) {
  const tones = {
    neutral: "bg-sunken text-muted",
    accent: "bg-accent-soft text-accent",
    high: "bg-high-soft text-high",
    medium: "bg-medium-soft text-medium",
    low: "bg-low-soft text-low",
    good: "bg-good-soft text-good",
  };
  return <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}

export function FacultyTag({ faculty }: { faculty: string }) {
  return <Tag>{label(FACULTIES, faculty)}</Tag>;
}

export function PriorityTag({ p }: { p: string }) {
  return <Tag tone={p as "high" | "medium" | "low"}>{label(PRIORITY, p)}</Tag>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-surface ${className}`}>{children}</div>;
}

export function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-3">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function PageHeader({ title, sub, right }: { title: string; sub?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <div className="text-sm text-muted mt-1">{sub}</div>}
      </div>
      {right}
    </header>
  );
}

export function Stat({ label: l, value, note }: { label: string; value: React.ReactNode; note?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted">{l}</div>
      <div className="mt-1 text-3xl font-semibold num">{value}</div>
      {note && <div className="mt-1 text-xs text-muted">{note}</div>}
    </Card>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">{children}</div>;
}

export function SourceLink({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline break-all">
      {hostOf(url)} ↗
    </a>
  );
}

export function ItemRow({ it, showUni = true, latest }: { it: Item; showUni?: boolean; latest?: string }) {
  const isNew = latest && it.first_seen === latest;
  return (
    <li className="py-3 flex gap-3">
      <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: uniColor(it.uni) }} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {showUni && <UniBadge uni={it.uni} />}
          <Tag>{label(KINDS, it.kind)}</Tag>
          <FacultyTag faculty={it.faculty} />
          {isNew && <Tag tone="accent">ใหม่</Tag>}
          {it.source === "field" && <Tag tone="good">Field Intel</Tag>}
        </div>
        <div className="mt-1 font-medium leading-snug">{it.title}</div>
        {it.value_text && <div className="text-sm text-ink mt-0.5">{it.value_text}</div>}
        {it.summary && <p className="text-sm text-muted mt-0.5 leading-relaxed">{it.summary}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
          <span>{fmtRange(it.start_date, it.end_date)}</span>
          {(it.location || it.province) && <span>{[it.location, it.province].filter(Boolean).join(" · ")}</span>}
          {it.created_by && <span>รายงานโดย {it.created_by}</span>}
          <SourceLink url={it.source_url} />
        </div>
      </div>
    </li>
  );
}
