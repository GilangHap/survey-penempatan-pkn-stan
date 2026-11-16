import { createHash } from "node:crypto";

export const ADMIN_COOKIE = "survey_admin";

export function tokenFor(password: string) {
  return createHash("sha256").update(`survey-admin:${password}`).digest("hex");
}

export function adminToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  return password ? tokenFor(password) : null;
}
