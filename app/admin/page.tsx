import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { ADMIN_COOKIE, adminToken } from "@/lib/auth";
import { listSubmissions } from "@/lib/store";
import type { Submission } from "@/lib/survey";
export const instant = false;

export default async function AdminPage() {
  await connection();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const expected = adminToken();
  if (!expected || token !== expected) redirect("/admin/login");

  const submissions = (await listSubmissions()).reverse();

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            PKN STAN 2026
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Rekap Survei Peminatan</h1>
          <p className="mt-1 text-sm text-slate-500">
            {submissions.length} responden tercatat. Klik baris untuk melihat urutan lengkap.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/export"
            className="rounded-lg bg-[#0b2f5e] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#123f78]"
          >
            Unduh CSV (Excel)
          </a>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Belum ada respons yang masuk.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">NPM</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Prodi</th>
                <th className="px-4 py-3">Domisili</th>
                <th className="px-4 py-3">Asal</th>
                <th className="px-4 py-3 text-center">Rating</th>
                <th className="px-4 py-3">Peminatan</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr key={submission.id} className="border-t border-slate-100 align-top">
                  <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {new Date(submission.submittedAt).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{submission.npm}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{submission.nama}</td>
                  <td className="px-4 py-3 text-slate-600">{submission.prodi}</td>
                  <td className="px-4 py-3 text-slate-600">{submission.domisili}</td>
                  <td className="px-4 py-3 text-slate-600">{submission.asal}</td>
                  <td className="px-4 py-3 text-center text-amber-500">
                    {"\u2605".repeat(submission.rating)}
                  </td>
                  <td className="px-4 py-3">
                    <RankingDetail submission={submission} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

function RankingDetail({ submission }: { submission: Submission }) {
  return (
    <details className="group">
      <summary className="cursor-pointer text-sm font-medium text-[#0b2f5e] group-open:mb-3">
        Lihat / tutup
      </summary>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Instansi Penempatan
          </p>
          <ol className="max-h-52 overflow-y-auto pr-2 text-xs text-slate-600">
            {submission.rankKl.map((name, i) => (
              <li key={name} className="py-0.5">
                <span className="mr-1 text-slate-400">{i + 1}.</span>
                {name}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Unit Eselon I
          </p>
          <ol className="max-h-52 overflow-y-auto pr-2 text-xs text-slate-600">
            {submission.rankEselon.map((name, i) => (
              <li key={name} className="py-0.5">
                <span className="mr-1 text-slate-400">{i + 1}.</span>
                {name}
              </li>
            ))}
          </ol>
          <p className="mt-3 mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Saran
          </p>
          <p className="whitespace-pre-line text-xs text-slate-600">{submission.saran}</p>
        </div>
      </div>
    </details>
  );
}

