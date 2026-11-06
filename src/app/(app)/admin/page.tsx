import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { deleteUser } from "@/app/actions";
import { Card, PageHeader, SectionTitle, Tag } from "@/components/ui";
import { CreateUserForm, ResetPasswordForm } from "@/components/password-forms";

export default async function Admin() {
  const me = await requireAdmin();
  const users = await sql<{ id: number; username: string; display_name: string; role: string }[]>`
    SELECT id, username, display_name, role FROM users ORDER BY role, username`;
  return (
    <>
      <PageHeader title="ผู้ใช้งาน" sub="สร้างบัญชีให้ผู้บริหารและทีมงาน (ไม่มีหน้าสมัครเอง)" />
      <section className="mb-8">
        <SectionTitle title="เพิ่มผู้ใช้" />
        <Card className="p-5"><CreateUserForm /></Card>
      </section>
      <section>
        <SectionTitle title="ผู้ใช้ทั้งหมด" sub={`${users.length} บัญชี`} />
        <Card className="divide-y divide-line">
          {users.map((u) => (
            <div key={u.id} className="p-4 flex flex-wrap items-center gap-3">
              <div className="min-w-[180px]">
                <div className="font-medium">{u.display_name}</div>
                <div className="text-xs text-muted">{u.username}</div>
              </div>
              <Tag tone={u.role === "admin" ? "accent" : "neutral"}>{u.role === "admin" ? "ผู้ดูแล" : "ผู้ดู"}</Tag>
              <div className="ml-auto flex items-center gap-4">
                <ResetPasswordForm id={u.id} />
                {u.id !== me.uid && (
                  <form action={deleteUser}><input type="hidden" name="id" value={u.id} /><button className="text-xs text-high hover:underline">ลบ</button></form>
                )}
              </div>
            </div>
          ))}
        </Card>
      </section>
    </>
  );
}
