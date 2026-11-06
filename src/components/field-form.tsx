"use client";
import { useActionState, useRef, useEffect } from "react";
import { addFieldReport } from "@/app/actions";
import { FACULTIES, OFFLINE_TYPES, UNIS, UNI_KEYS } from "@/lib/constants";

const input = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

export default function FieldForm() {
  const [state, action, pending] = useActionState(addFieldReport, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="grid sm:grid-cols-2 gap-3">
      <label className="text-xs text-muted">มหาวิทยาลัย
        <select name="uni" required className={`${input} mt-1`} defaultValue="">
          <option value="" disabled>เลือก</option>
          {UNI_KEYS.filter((u) => u !== "spu").map((u) => <option key={u} value={u}>{UNIS[u].name}</option>)}
        </select>
      </label>
      <label className="text-xs text-muted">ประเภทงาน
        <select name="event_type" className={`${input} mt-1`}>{Object.entries(OFFLINE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </label>
      <label className="text-xs text-muted sm:col-span-2">ชื่องาน / สิ่งที่เห็น
        <input name="title" required placeholder="เช่น บูธ ม.กรุงเทพ ในงาน Dek-D TCAS Fair" className={`${input} mt-1`} />
      </label>
      <label className="text-xs text-muted">วันที่<input name="date" type="date" className={`${input} mt-1`} /></label>
      <label className="text-xs text-muted">คณะที่โปรโมต
        <select name="faculty" className={`${input} mt-1`} defaultValue="all">{Object.entries(FACULTIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </label>
      <label className="text-xs text-muted">สถานที่<input name="venue" placeholder="เช่น ไบเทค บางนา" className={`${input} mt-1`} /></label>
      <label className="text-xs text-muted">จังหวัด<input name="province" className={`${input} mt-1`} /></label>
      <label className="text-xs text-muted sm:col-span-2">รายละเอียด (โปร ของแจก ทุนที่ประกาศ จำนวนคน)
        <textarea name="summary" rows={3} className={`${input} mt-1`} />
      </label>
      <div className="sm:col-span-2 flex items-center gap-3">
        <button disabled={pending} className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium disabled:opacity-60">{pending ? "กำลังบันทึก…" : "บันทึก Field Intel"}</button>
        {state?.ok && <span className="text-sm text-good">บันทึกแล้ว</span>}
        {state?.error && <span className="text-sm text-high">{state.error}</span>}
      </div>
    </form>
  );
}
