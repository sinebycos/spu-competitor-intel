"use client";
import { setInsightStatus } from "@/app/actions";
import { STATUS } from "@/lib/constants";

export default function StatusSelect({ id, status }: { id: number; status: string }) {
  return (
    <form action={setInsightStatus}>
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={status} aria-label="สถานะ"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="text-xs rounded-md border border-line bg-surface px-2 py-1 text-muted">
        {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </form>
  );
}
