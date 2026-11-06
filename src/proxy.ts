import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Optimistic check only: pages re-verify the session server-side.
export async function proxy(req: NextRequest) {
  const token = req.cookies.get("spu_session")?.value;
  let ok = false;
  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      ok = true;
    } catch {}
  }
  if (!ok) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|ico)$).*)"],
};
