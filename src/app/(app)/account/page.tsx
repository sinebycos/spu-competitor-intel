import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { ChangePasswordForm } from "@/components/password-forms";

export default async function Account() {
  const s = await requireUser();
  return (
    <>
      <PageHeader title="บัญชีของฉัน" sub={`${s.name} · ${s.username}`} />
      <Card className="p-5"><div className="font-semibold mb-4">เปลี่ยนรหัสผ่าน</div><ChangePasswordForm /></Card>
    </>
  );
}
