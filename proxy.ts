import { NextResponse } from "next/server";

const ADMIN_COOKIE = "survey_admin";

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function proxy(request: Request) {
  const { pathname } = new URL(request.url);
  if (pathname === "/admin/login") return;

  const password = process.env.ADMIN_PASSWORD;
  const expected = password ? await sha256Hex(`survey-admin:${password}`) : null;
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim().split("="))
    .find(([name]) => name === ADMIN_COOKIE)?.[1];

  if (expected && token === expected) return;

  return NextResponse.redirect(new URL("/admin/login", request.url), 307);
}

export const config = {
  matcher: ["/admin/:path*", "/api/export"],
};
