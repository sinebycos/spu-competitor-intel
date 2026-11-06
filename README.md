# SPU Competitor Intel

Dashboard ที่ต้อง login สำหรับมหาวิทยาลัยศรีปทุม ใช้ติดตามการรับสมัครของ ม.หอการค้าไทย, ม.ธุรกิจบัณฑิตย์, ม.กรุงเทพ และ ม.รังสิต

## รันบนเครื่อง
```bash
pnpm install
pnpm db:setup      # สร้างตาราง + บัญชี admin (ดู ADMIN_USERNAME / ADMIN_PASSWORD ใน .env.local)
pnpm ingest        # โหลด research/data/*.json + research/insights/<week>.json เข้าฐานข้อมูล
pnpm dev           # http://localhost:3000
```
ต้องมี Postgres ทำงานอยู่ และตั้ง `DATABASE_URL` กับ `AUTH_SECRET` ไว้ใน `.env.local`

## โครงสร้าง
- `research/SCHEMA.md`: รูปแบบข้อมูลที่ได้จากรีเสิร์ชของแต่ละมหาวิทยาลัย
- `research/WEEKLY_ROUTINE.md`: ขั้นตอนรีเสิร์ชรายสัปดาห์ (รันเองทุกคืนวันอาทิตย์ผ่าน scheduled task ของ Claude)
- `research/data/`: ข้อมูลรอบล่าสุด
- `research/insights/`: insight รายสัปดาห์
- `scripts/ingest.ts`: นำข้อมูลเข้า DB โดยใช้ `first_seen` / `last_seen` ระบุว่ารายการไหนเพิ่งพบใหม่
- `src/app/(app)/`: หน้า dashboard ทั้งหมด
- `src/proxy.ts`: บังคับให้ทุกหน้าต้อง login ก่อน

## เว็บจริง
- URL: https://spu-competitor-intel.vercel.app (Vercel โปรเจกต์ `spu-competitor-intel`, region สิงคโปร์)
- ฐานข้อมูล: Neon โปรเจกต์ `spu-competitor-intel` (สิงคโปร์) ค่าเชื่อมต่อและบัญชี admin ของเว็บจริงอยู่ใน `.env.neon` (ไม่ commit)
- Vercel ตั้ง env ไว้แล้ว: `DATABASE_URL` (Neon pooled) และ `AUTH_SECRET`
- นำข้อมูลรอบใหม่ขึ้นเว็บ: `pnpm ingest:neon <YYYY-MM-DD>` (ไม่ต้อง deploy ใหม่)
- แก้โค้ดแล้ว deploy: `vercel deploy --prod`
