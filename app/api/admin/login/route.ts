import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminToken, tokenFor } from "@/lib/auth";

export async function POST(request: Request) {
  const expected = adminToken();
  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD belum diatur pada environment." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  const actual = tokenFor(password);

  const ok =
    actual.length === expected.length &&
    timingSafeEqual(Buffer.from(actual), Buffer.from(expected));

  if (!ok) {
    return NextResponse.json({ error: "Kata sandi salah." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  });
  return response;
}
