import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { parseSubmission, type Submission } from "@/lib/survey";
import { saveSubmission } from "@/lib/store";

async function forwardToSheets(submission: Submission) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(submission),
    });
  } catch {
    // Submission sudah tersimpan; kegagalan sinkronisasi spreadsheet tidak boleh menggagalkan respons.
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format data tidak valid." }, { status: 400 });
  }

  const parsed = parseSubmission(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const submission: Submission = {
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
    ...parsed.value,
  };

  let result: "saved" | "duplicate";
  try {
    result = await saveSubmission(submission);
  } catch {
    return NextResponse.json(
      { error: "Server sedang sibuk. Silakan coba kirim ulang sebentar lagi." },
      { status: 503 },
    );
  }
  if (result === "duplicate") {
    return NextResponse.json(
      { error: "NPM ini sudah pernah mengisi survei." },
      { status: 409 },
    );
  }
  await forwardToSheets(submission);

  return NextResponse.json({ ok: true });
}
