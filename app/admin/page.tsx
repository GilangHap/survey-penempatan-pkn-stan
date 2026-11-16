import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { connection } from "next/server";
import AdminFilters from "@/components/AdminFilters";
import Shell from "@/components/Shell";
import { ADMIN_COOKIE, adminToken } from "@/lib/auth";
import { listSubmissions } from "@/lib/store";

export const instant = false;

const PAGE_SIZE = 10;

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function pageHref(filters: { q: string; prodi: string }, page: number) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.prodi) params.set("prodi", filters.prodi);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/admin?${search}` : "/admin";
}

function pageItems(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const wanted = new Set(
    [1, 2, page - 1, page, page + 1, count - 1, count].filter(
      (item) => item >= 1 && item <= count,
    ),
  );
  const items: (number | "…")[] = [];
  let previous = 0;
  for (let current = 1; current <= count; current++) {
    if (wanted.has(current)) {
      items.push(current);
      previous = current;
    } else if (previous > 0 && items[items.length - 1] !== "…") {
      items.push("…");
    }
  }
  return items;
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  await connection();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const expected = adminToken();
  if (!expected || token !== expected) redirect("/admin/login");

  const submissions = (await listSubmissions()).reverse();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const prodi = typeof params.prodi === "string" ? params.prodi : "";
  const query = q.trim().toLowerCase();
  const filters = { q, prodi };

  const filtered = submissions.filter(
    (submission) =>
      (!query ||
        submission.nama.toLowerCase().includes(query) ||
        submission.npm.toLowerCase().includes(query)) &&
      (!prodi || submission.prodi === prodi),
  );

  const total = submissions.length;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), pageCount);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);
  const average = total
    ? (submissions.reduce((sum, item) => sum + item.rating, 0) / total).toFixed(1)
    : null;

  return (
    <Shell
      right={
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="h-9 rounded-lg px-3 text-[13px] font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            Keluar
          </button>
        </form>
      }
    >
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold leading-tight tracking-[-0.01em] sm:text-[26px]">
              Rekap survei peminatan
            </h2>
            <p className="mt-1.5 max-w-[60ch] text-[13.5px] leading-relaxed text-muted">
              Data tersusun dari respons terbaru. Buka satu baris untuk melihat urutan
              peminatan lengkap dan saran responden.
            </p>
          </div>
          <a
            href="/api/export"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0d3557]"
          >
            Unduh Excel
          </a>
        </div>

        <dl className="mt-6 grid gap-px overflow-hidden rounded-[12px] border border-line bg-line sm:grid-cols-3">
          <div className="bg-surface px-5 py-4">
            <dt className="text-xs text-muted">Respons masuk</dt>
            <dd className="mt-1 text-[26px] font-semibold leading-none tabular-nums">{total}</dd>
          </div>
          <div className="bg-surface px-5 py-4">
            <dt className="text-xs text-muted">Rata-rata rating KLP Fest</dt>
            <dd className="mt-1 text-[26px] font-semibold leading-none tabular-nums">
              {average ?? "–"}
              {average ? <span className="text-[13px] font-normal text-muted"> / 5</span> : null}
            </dd>
          </div>
          <div className="bg-surface px-5 py-4">
            <dt className="text-xs text-muted">Respons terakhir</dt>
            <dd className="mt-1.5 text-[14px] font-medium leading-snug">
              {submissions[0] ? dateFormat.format(new Date(submissions[0].submittedAt)) : "–"}
            </dd>
          </div>
        </dl>

        {total === 0 ? (
          <div className="mt-6 rounded-[12px] border border-line bg-surface px-6 py-12 text-center">
            <p className="text-[15px] font-medium">Belum ada respons</p>
            <p className="mx-auto mt-1 max-w-[40ch] text-[13.5px] leading-relaxed text-muted">
              Halaman rekap akan terisi otomatis begitu responden pertama mengirim jawaban.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex h-9 items-center rounded-lg border border-line-strong px-3 text-[13px] font-medium transition-colors hover:bg-ground"
            >
              Buka survei
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <AdminFilters q={q} prodi={prodi} />
            </div>

            {filtered.length === 0 ? (
              <div className="mt-4 rounded-[12px] border border-line bg-surface px-6 py-12 text-center">
                <p className="text-[15px] font-medium">Tidak ada respons yang cocok</p>
                <p className="mx-auto mt-1 max-w-[40ch] text-[13.5px] leading-relaxed text-muted">
                  Coba kata kunci lain, atau hapus filter program studi.
                </p>
                <Link
                  href="/admin"
                  className="mt-5 inline-flex h-9 items-center rounded-lg border border-line-strong px-3 text-[13px] font-medium transition-colors hover:bg-ground"
                >
                  Reset filter
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <div className="hidden md:grid md:grid-cols-[minmax(0,1.8fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_24px] md:gap-4 md:px-5 md:pb-2 md:text-xs md:text-muted">
                    <span>Responden</span>
                    <span>Program studi</span>
                    <span>Domisili / asal</span>
                    <span>Rating</span>
                    <span aria-hidden="true" />
                  </div>

                  <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
                    {rows.map((submission) => (
                      <details
                        key={submission.id}
                        className="group border-t border-line first:border-t-0"
                      >
                        <summary className="grid cursor-pointer list-none gap-2 px-4 py-3.5 transition-colors hover:bg-ground/60 md:grid-cols-[minmax(0,1.8fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_24px] md:items-center md:gap-4 md:px-5">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold tracking-wide text-accent">
                              {initials(submission.nama)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-medium">
                                {submission.nama}
                              </p>
                              <p className="text-xs tabular-nums text-muted">
                                {submission.npm} ·{" "}
                                {dateFormat.format(new Date(submission.submittedAt))}
                              </p>
                            </div>
                          </div>
                          <p className="text-[13px] text-muted md:truncate">{submission.prodi}</p>
                          <div className="min-w-0">
                            <p className="text-[13px] text-muted md:truncate">
                              {submission.domisili}
                            </p>
                            <p className="text-xs text-muted md:truncate">{submission.asal}</p>
                          </div>
                          <div className="flex items-center gap-0.5 text-star">
                            <Rating value={submission.rating} />
                            <span className="ml-1.5 text-xs tabular-nums text-muted">
                              {submission.rating}/5
                            </span>
                          </div>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="hidden h-4 w-4 text-muted transition-transform group-open:rotate-180 md:block"
                            aria-hidden="true"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </summary>

                        <div className="border-t border-line bg-ground/40 px-4 py-5 md:px-5">
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                              <RankingList title="Instansi penempatan" items={submission.rankKl} />
                            </div>
                            <div>
                              <RankingList title="Unit eselon I" items={submission.rankEselon} />
                              <h3 className="mt-5 text-xs font-medium text-muted">Saran</h3>
                              <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed">
                                {submission.saran}
                              </p>
                            </div>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>

                {pageCount > 1 || filtered.length !== total ? (
                  <nav
                    className="mt-4 flex flex-wrap items-center justify-between gap-3"
                    aria-label="Paginasi daftar respons"
                  >
                    <p className="text-xs tabular-nums text-muted">
                      Menampilkan {rangeStart}–{rangeEnd} dari {filtered.length} respons
                    </p>
                    <div className="flex items-center gap-1">
                      <PageLink
                        href={pageHref(filters, page - 1)}
                        disabled={page === 1}
                        label="Halaman sebelumnya"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M15 6l-6 6 6 6" />
                        </svg>
                      </PageLink>
                      {pageItems(page, pageCount).map((item, index) =>
                        item === "…" ? (
                          <span
                            key={`gap-${index}`}
                            className="px-1 text-[13px] text-muted"
                            aria-hidden="true"
                          >
                            …
                          </span>
                        ) : (
                          <PageLink
                            key={item}
                            href={pageHref(filters, item)}
                            active={item === page}
                            label={`Halaman ${item}`}
                          >
                            {item}
                          </PageLink>
                        ),
                      )}
                      <PageLink
                        href={pageHref(filters, page + 1)}
                        disabled={page === pageCount}
                        label="Halaman berikutnya"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </PageLink>
                    </div>
                  </nav>
                ) : null}
              </>
            )}
          </>
        )}
      </main>
    </Shell>
  );
}

function PageLink({
  href,
  disabled = false,
  active = false,
  label,
  children,
}: {
  href: string;
  disabled?: boolean;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const className = `flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-[13px] tabular-nums transition-colors ${
    active ? "bg-ink font-semibold text-white" : "text-muted hover:bg-ground hover:text-ink"
  } ${disabled ? "pointer-events-none opacity-30" : ""}`;

  if (disabled) {
    return (
      <span className={className} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={className}>
      {children}
    </Link>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} dari 5 bintang`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            d="M12 3.6l2.4 5.2 5.6.7-4.1 3.9 1.1 5.6L12 16.3 6.9 19l1.1-5.6L4 9.5l5.6-.7z"
            fill={star <= value ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            className={star <= value ? "" : "text-line-strong"}
          />
        </svg>
      ))}
    </span>
  );
}

function RankingList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-medium text-muted">{title}</h3>
      <ol className="mt-1.5 space-y-1 text-[13px] leading-snug">
        {items.map((item, index) => (
          <li key={item} className="flex gap-2">
            <span className="w-4 shrink-0 tabular-nums text-muted">{index + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
