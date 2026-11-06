// Creates tables and the first admin account. Safe to re-run.
// Usage: pnpm db:setup
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { sql } from "../src/lib/db";

async function main() {
  await sql.unsafe(readFileSync(join(process.cwd(), "src/lib/schema.sql"), "utf8"));
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  if (u && p) {
    const hash = await bcrypt.hash(p, 10);
    const res = await sql`
      INSERT INTO users (username, password_hash, display_name, role)
      VALUES (${u}, ${hash}, 'ผู้ดูแลระบบ', 'admin')
      ON CONFLICT (username) DO NOTHING RETURNING id`;
    console.log(res.length ? `Created admin user "${u}"` : `Admin user "${u}" already exists (password unchanged)`);
  }
  console.log("Schema ready.");
  await sql.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
