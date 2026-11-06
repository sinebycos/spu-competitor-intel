import { requireUser } from "@/lib/auth";
import { UNIS, UNI_KEYS } from "@/lib/constants";
import Nav, { type NavGroup } from "@/components/nav";
import { logout } from "../actions";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const s = await requireUser();
  const groups: NavGroup[] = [
    { title: "ภาพรวม", links: [
      { href: "/", label: "สรุปผู้บริหาร" },
      { href: "/actions", label: "Action Tracker" },
      { href: "/reports", label: "รายงานรายสัปดาห์" },
    ] },
    { title: "มหาวิทยาลัย", links: UNI_KEYS.map((u) => ({ href: `/competitors/${u}`, label: UNIS[u].label, dot: UNIS[u].color })) },
    { title: "เจาะลึก", links: [
      { href: "/faculties", label: "มุมมองรายคณะ" },
      { href: "/scholarships", label: "ทุนการศึกษา" },
      { href: "/messaging", label: "Keyword & PR" },
      { href: "/social", label: "Social Media" },
      { href: "/events", label: "กิจกรรม & บูธ" },
      { href: "/feed", label: "ข้อมูลทั้งหมด" },
    ] },
    { title: "ระบบ", links: [
      ...(s.role === "admin" ? [{ href: "/admin", label: "ผู้ใช้งาน" }] : []),
      { href: "/account", label: "บัญชีของฉัน" },
    ] },
  ];
  return (
    <div className="lg:grid lg:grid-cols-[236px_1fr] min-h-screen">
      <aside className="lg:sticky lg:top-0 lg:h-screen border-b lg:border-b-0 lg:border-r border-line px-4 lg:px-3 py-4 lg:py-6 flex flex-col gap-4 lg:gap-6 bg-paper">
        <div className="flex items-center justify-between lg:block px-0 lg:px-3">
          <div>
            <div className="text-[11px] text-faint">มหาวิทยาลัยศรีปทุม</div>
            <div className="font-semibold">Competitor Intel</div>
          </div>
          <form action={logout} className="lg:hidden"><button className="text-xs text-muted hover:text-ink">ออกจากระบบ</button></form>
        </div>
        <Nav groups={groups} />
        <div className="hidden lg:block mt-auto px-3 text-xs text-muted">
          <div className="font-medium text-ink">{s.name}</div>
          <div>{s.username} · {s.role === "admin" ? "ผู้ดูแล" : "ผู้ดู"}</div>
          <form action={logout} className="mt-2"><button className="hover:text-ink underline underline-offset-2">ออกจากระบบ</button></form>
        </div>
      </aside>
      <main className="min-w-0 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-[1280px]">{children}</main>
    </div>
  );
}
