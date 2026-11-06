import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
  if (await getSession()) redirect("/");
  return (
    <main className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      <section className="hidden lg:flex flex-col justify-between bg-ink text-white p-12">
        <div className="text-sm tracking-wide text-white/60">มหาวิทยาลัยศรีปทุม · ฝ่ายรับสมัครและการตลาด</div>
        <div className="max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">Competitor Intel</h1>
          <p className="mt-4 text-white/70 leading-relaxed">
            ติดตามทุน กิจกรรม ข้อความ PR และบูธของมหาวิทยาลัยคู่แข่งทุกสัปดาห์ พร้อมสรุปสิ่งที่ศรีปทุมควรทำต่อ
          </p>
          <div className="mt-8 flex gap-2">
            {["--uni-spu", "--uni-utcc", "--uni-dpu", "--uni-bu", "--uni-rsu"].map((c) => (
              <span key={c} className="h-1.5 w-10 rounded-full" style={{ background: `var(${c})` }} />
            ))}
          </div>
        </div>
        <div className="text-xs text-white/40">ข้อมูลภายใน ห้ามเผยแพร่</div>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <div className="text-xs text-muted">มหาวิทยาลัยศรีปทุม</div>
            <div className="text-2xl font-semibold">Competitor Intel</div>
          </div>
          <h2 className="text-xl font-semibold">เข้าสู่ระบบ</h2>
          <p className="text-sm text-muted mt-1">ใช้บัญชีที่ผู้ดูแลระบบสร้างให้</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
