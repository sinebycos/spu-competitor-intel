import { CATEGORIES, label } from "@/lib/constants";
import type { Insight } from "@/lib/queries";
import { FacultyTag, PriorityTag, SourceLink, Tag, UniBadge } from "./ui";
import StatusSelect from "./status-select";

export default function InsightCard({ ins, compact = false }: { ins: Insight; compact?: boolean }) {
  const border = { high: "var(--high)", medium: "var(--medium)", low: "var(--low)" }[ins.priority] ?? "var(--line)";
  return (
    <article className="rounded-xl border border-line bg-surface p-5 border-l-4" style={{ borderLeftColor: border }}>
      <div className="flex flex-wrap items-center gap-2">
        <PriorityTag p={ins.priority} />
        <Tag>{label(CATEGORIES, ins.category)}</Tag>
        <FacultyTag faculty={ins.faculty} />
        {ins.uni && <UniBadge uni={ins.uni} link />}
        <div className="ml-auto"><StatusSelect id={ins.id} status={ins.status} /></div>
      </div>
      <h3 className="mt-3 text-[17px] font-semibold leading-snug">{ins.title}</h3>
      <dl className={`mt-3 grid gap-3 ${compact ? "" : "md:grid-cols-3"}`}>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-faint">เกิดอะไรขึ้น</dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted">{ins.what}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-faint">สำคัญกับเรายังไง</dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted">{ins.so_what}</dd>
        </div>
        <div className="rounded-lg bg-accent-soft/60 p-3 -m-1">
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-accent">SPU ควรทำอะไร</dt>
          <dd className="mt-1 text-sm leading-relaxed text-ink whitespace-pre-line">{ins.now_what.replace(/\s+(\d\))/g, "\n$1")}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        {ins.owner && <span>ผู้รับผิดชอบ: <span className="text-ink">{ins.owner}</span></span>}
        {ins.evidence.length > 0 && (
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">หลักฐาน: {ins.evidence.map((u) => <SourceLink key={u} url={u} />)}</span>
        )}
      </div>
    </article>
  );
}
