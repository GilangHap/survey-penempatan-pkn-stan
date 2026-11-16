import { NextResponse } from "next/server";
import { toCsv } from "@/lib/csv";
import { listSubmissions } from "@/lib/store";
import { ESELON_I, INSTANSI_KL } from "@/lib/survey";

export async function GET() {
  const submissions = await listSubmissions();

  const header = [
    "Waktu",
    "NPM",
    "Nama",
    "Program Studi",
    "Kota/Kab Domisili",
    "Kota/Kab Asal",
    ...INSTANSI_KL.map((_, i) => `Pilihan K/L ${i + 1}`),
    ...ESELON_I.map((_, i) => `Pilihan Eselon I ${i + 1}`),
    "Rating KLP Fest",
    "Saran",
  ];

  const rows = submissions.map((s) => [
    new Date(s.submittedAt).toLocaleString("id-ID"),
    s.npm,
    s.nama,
    s.prodi,
    s.domisili,
    s.asal,
    ...INSTANSI_KL.map((_, i) => s.rankKl[i] ?? ""),
    ...ESELON_I.map((_, i) => s.rankEselon[i] ?? ""),
    s.rating,
    s.saran,
  ]);

  const csv = "\uFEFF" + toCsv([header, ...rows]);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="survei-peminatan-pkn-stan-2026.csv"',
      "cache-control": "no-store",
    },
  });
}
