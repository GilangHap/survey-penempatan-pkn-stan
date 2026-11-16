"use client";

import { useEffect, useState } from "react";
import RankList from "@/components/RankList";
import Select from "@/components/Select";
import Stars from "@/components/Stars";
import Shell from "@/components/Shell";
import { ESELON_I, INSTANSI_KL, PRODI } from "@/lib/survey";

const STEPS = [
  "Pendahuluan",
  "Identitas",
  "Peminatan instansi",
  "Unit eselon I",
  "Umpan balik",
  "Tinjau",
];

const STORAGE_KEY = "survei-peminatan-pkn-stan-2026";

type FormState = {
  npm: string;
  nama: string;
  prodi: string;
  domisili: string;
  asal: string;
  rankKl: string[];
  rankEselon: string[];
  rating: number;
  saran: string;
};

const initialForm = (): FormState => ({
  npm: "",
  nama: "",
  prodi: "",
  domisili: "",
  asal: "",
  rankKl: [...INSTANSI_KL],
  rankEselon: [...ESELON_I],
  rating: 0,
  saran: "",
});

function loadDraft(): FormState {
  const base = initialForm();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<FormState>;
    return {
      ...base,
      ...saved,
      rankKl:
        Array.isArray(saved.rankKl) && saved.rankKl.length === INSTANSI_KL.length
          ? saved.rankKl
          : base.rankKl,
      rankEselon:
        Array.isArray(saved.rankEselon) && saved.rankEselon.length === ESELON_I.length
          ? saved.rankEselon
          : base.rankEselon,
    };
  } catch {
    // Draf rusak/format lama: abaikan, responden mulai dari awal.
    return base;
  }
}

const field =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent/15";
const labelClass = "block text-[13px] font-medium text-ink";
const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0d3557] disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ground disabled:opacity-50";
const btnGhost = "whitespace-nowrap text-[13px] font-medium text-accent hover:underline";

export default function SurveyWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(loadDraft);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form, done]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate(target: number) {
    if (target === 1) {
      if (!/^[0-9A-Za-z./-]{4,20}$/.test(form.npm.trim())) {
        return "NPM wajib diisi dengan 4-20 karakter (huruf, angka, titik, garis miring, atau strip).";
      }
      if (form.nama.trim().length < 3) return "Nama lengkap wajib diisi.";
      if (!form.prodi) return "Program studi wajib dipilih.";
      if (!form.domisili.trim()) return "Kota/Kab domisili wajib diisi.";
      if (!form.asal.trim()) return "Kota/Kab asal wajib diisi.";
    }
    if (target === 4) {
      if (!form.rating) return "Silakan pilih rating bintang terlebih dahulu.";
      if (!form.saran.trim()) return "Saran wajib diisi.";
    }
    return "";
  }

  function goTo(target: number) {
    const message = validate(step);
    if (message && target > step) {
      setError(message);
      return;
    }
    setError("");
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetRank(key: "rankKl" | "rankEselon") {
    update(key, key === "rankKl" ? [...INSTANSI_KL] : [...ESELON_I]);
  }

  function submit() {
    const message = validate(1) || validate(4);
    if (message) {
      setError(message);
      return;
    }
    setSubmitting(true);
    setError("");
    fetch("/api/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async (response) => {
        if (response.ok) {
          localStorage.removeItem(STORAGE_KEY);
          setDone(true);
          window.scrollTo({ top: 0 });
          return;
        }
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Gagal mengirim jawaban. Silakan coba lagi.");
        setSubmitting(false);
      })
      .catch(() => {
        setError("Tidak dapat menghubungi server. Periksa koneksi Anda.");
        setSubmitting(false);
      });
  }

  if (done) {
    return (
      <Shell>
        <main className="mx-auto w-full max-w-[620px] flex-1 px-5 py-12 sm:px-6 sm:py-16">
          <div className="rounded-[14px] border border-line bg-surface px-6 py-10 text-center sm:px-10">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-positive/10 text-positive">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <h2 className="mt-5 font-display text-[28px] leading-tight tracking-[-0.01em] sm:text-[32px]">
              Terima kasih, {form.nama.trim().split(" ")[0] || "rekan-rekan"}.
            </h2>
            <p className="mx-auto mt-3 max-w-[44ch] text-[14px] leading-relaxed text-muted">
              Jawaban Anda sudah tercatat dan akan menjadi bahan masukan proses penempatan.
              Keputusan akhir tetap menjadi kewenangan Biro Sumber Daya Manusia.
            </p>

            <div className="mt-8 rounded-[10px] border border-line text-left">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-[13px] font-semibold">Ringkasan jawaban</p>
                <p className="text-xs text-muted tabular-nums">{form.npm}</p>
              </div>
              <div className="grid gap-px bg-line sm:grid-cols-2">
                <div className="bg-surface px-4 py-3">
                  <p className="text-xs text-muted">Prioritas pertama K/L</p>
                  <p className="mt-1 text-[13px] leading-snug">{form.rankKl[0]}</p>
                </div>
                <div className="bg-surface px-4 py-3">
                  <p className="text-xs text-muted">Prioritas pertama eselon I</p>
                  <p className="mt-1 text-[13px] leading-snug">{form.rankEselon[0]}</p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-muted">
              Jawaban tidak dapat diubah setelah dikirim.
            </p>
          </div>
        </main>
      </Shell>
    );
  }

  return (
    <Shell width="narrow">
      <main className="mx-auto w-full max-w-[812px] flex-1 px-5 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-9">
        {step > 0 ? (
          <>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <p className="text-xs font-medium text-muted">
                Langkah {step} dari 5 · {STEPS[step]}
              </p>
              <p className="hidden text-xs text-muted sm:block">
                Jawaban tersimpan otomatis di perangkat ini
              </p>
            </div>
            <div className="mb-6 flex gap-1.5" aria-hidden="true">
              {STEPS.slice(1).map((label, index) => (
                <span
                  key={label}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index < step ? "bg-accent" : "bg-line-strong/60"
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}

        <section className="rounded-[14px] border border-line bg-surface">
          <div className="px-5 py-6 sm:px-8 sm:py-8">
            {step === 0 && (
              <div>
                <h2 className="max-w-[24ch] font-display text-[30px] leading-[1.12] tracking-[-0.01em] sm:text-[36px]">
                  Penempatan lulusan PKN STAN 2026
                </h2>
                <p className="mt-4 max-w-[56ch] text-[14.5px] leading-relaxed text-muted">
                  Survei ini menghimpun preferensi dan aspirasi lulusan sebagai salah satu
                  bahan masukan dalam proses penempatan. Melalui survei ini, lulusan dapat
                  menyampaikan minat terhadap instansi atau lokasi penugasan sesuai informasi
                  yang diperoleh selama KLP Fest dan pengenalan instansi.
                </p>

                <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-4">
                  {[
                    [String(INSTANSI_KL.length), "Instansi K/L"],
                    [String(ESELON_I.length), "Unit eselon I"],
                    ["10–15", "Menit pengisian"],
                    ["Sekali", "Per mahasiswa"],
                  ].map(([value, label]) => (
                    <div key={label} className="bg-surface px-4 py-3.5">
                      <dt className="text-xs text-muted">{label}</dt>
                      <dd className="mt-1 text-[22px] font-semibold leading-none tabular-nums">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 rounded-[10px] bg-accent-soft/70 px-5 py-4">
                  <h3 className="text-[14px] font-semibold">Sebelum mulai</h3>
                  <ul className="mt-2 space-y-2 text-[13.5px] leading-relaxed text-muted">
                    <li className="flex gap-2">
                      <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                      Hasil survei bersifat tidak mengikat dan tidak menjamin penempatan.
                    </li>
                    <li className="flex gap-2">
                      <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                      Keputusan akhir penempatan sepenuhnya menjadi kewenangan Biro Sumber
                      Daya Manusia dengan mempertimbangkan kebutuhan organisasi, formasi,
                      kompetensi, serta kriteria lainnya.
                    </li>
                    <li className="flex gap-2">
                      <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                      Pengisian hanya dapat dilakukan satu kali. Periksa jawaban sebelum
                      mengirim.
                    </li>
                  </ul>
                </div>

                <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => goTo(1)}
                    className={`${btnPrimary} h-11 shrink-0 px-6 sm:w-auto`}
                  >
                    Mulai mengisi
                  </button>
                  <p className="text-xs leading-relaxed text-muted">
                    Draf pengisian tersimpan di perangkat ini bila Anda menutup halaman.
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <StepTitle
                  title="Identitas responden"
                  description="Isi sesuai data akademik Anda. NPM dipakai untuk memastikan satu respons per mahasiswa."
                />
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label>
                    <span className={labelClass}>
                      Nomor Pokok Mahasiswa <Required />
                    </span>
                    <input
                      className={field}
                      value={form.npm}
                      onChange={(event) => update("npm", event.target.value)}
                      placeholder="Contoh: 1123456789"
                      inputMode="text"
                      autoCapitalize="none"
                    />
                  </label>
                  <label>
                    <span className={labelClass}>
                      Nama lengkap <Required />
                    </span>
                    <input
                      className={field}
                      value={form.nama}
                      onChange={(event) => update("nama", event.target.value)}
                      placeholder="Nama sesuai ijazah"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <span className={labelClass}>
                      Program studi <Required />
                    </span>
                    <div className="mt-1.5">
                      <Select
                        value={form.prodi}
                        options={[...PRODI]}
                        placeholder="Pilih program studi"
                        onChange={(prodi) => update("prodi", prodi)}
                      />
                    </div>
                  </div>
                  <label>
                    <span className={labelClass}>
                      Kota/Kab domisili saat ini <Required />
                    </span>
                    <input
                      className={field}
                      value={form.domisili}
                      onChange={(event) => update("domisili", event.target.value)}
                      placeholder="Contoh: Kota Tangerang Selatan"
                    />
                  </label>
                  <label>
                    <span className={labelClass}>
                      Kota/Kab asal <Required />
                    </span>
                    <input
                      className={field}
                      value={form.asal}
                      onChange={(event) => update("asal", event.target.value)}
                      placeholder="Contoh: Kabupaten Sleman"
                    />
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <StepTitle
                  title="Peminatan instansi penempatan"
                  description={`Seret kartu atau gunakan tombol panah untuk mengurutkan ${INSTANSI_KL.length} instansi berikut sesuai prioritas Anda. Posisi 1 adalah prioritas tertinggi.`}
                />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <p className="text-xs text-muted tabular-nums">
                    {INSTANSI_KL.length} instansi · urut menurun
                  </p>
                  <button
                    type="button"
                    onClick={() => resetRank("rankKl")}
                    className={btnGhost}
                  >
                    Kembalikan urutan awal
                  </button>
                </div>
                <div className="mt-2">
                  <RankList items={form.rankKl} onChange={(items) => update("rankKl", items)} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <StepTitle
                  title="Peminatan unit eselon I Kemenkeu"
                  description={`Urutkan ${ESELON_I.length} unit eselon I berikut sesuai prioritas Anda. Posisi 1 adalah prioritas tertinggi.`}
                />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <p className="text-xs text-muted tabular-nums">
                    {ESELON_I.length} unit · urut menurun
                  </p>
                  <button
                    type="button"
                    onClick={() => resetRank("rankEselon")}
                    className={btnGhost}
                  >
                    Kembalikan urutan awal
                  </button>
                </div>
                <div className="mt-2">
                  <RankList
                    items={form.rankEselon}
                    onChange={(items) => update("rankEselon", items)}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <StepTitle
                  title="Umpan balik kegiatan penempatan"
                  description="Masukan Anda membantu perbaikan proses penempatan berikutnya."
                />
                <div className="mt-6">
                  <p className="text-[13px] font-medium">
                    Apakah informasi dari KLP Fest 2026 membantu menentukan peminatan?{" "}
                    <Required />
                  </p>
                  <div className="mt-2">
                    <Stars value={form.rating} onChange={(rating) => update("rating", rating)} />
                  </div>
                </div>
                <label className="mt-6 block">
                  <span className={labelClass}>
                    Saran atau informasi lain terkait proses penempatan <Required />
                  </span>
                  <textarea
                    className={`${field} min-h-36 resize-y leading-relaxed`}
                    value={form.saran}
                    onChange={(event) => update("saran", event.target.value)}
                    placeholder="Tuliskan saran Anda"
                    maxLength={2000}
                  />
                  <span className="mt-1 block text-right text-xs tabular-nums text-muted">
                    {form.saran.length}/2000
                  </span>
                </label>
              </div>
            )}

            {step === 5 && (
              <div>
                <StepTitle
                  title="Tinjau jawaban"
                  description="Periksa kembali sebelum mengirim. Jawaban tidak dapat diubah setelah dikirim."
                />

                <div className="mt-6 space-y-4">
                  <ReviewBlock title="Identitas" onEdit={() => goTo(1)}>
                    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                      <ReviewItem label="NPM" value={form.npm} />
                      <ReviewItem label="Nama lengkap" value={form.nama} />
                      <ReviewItem label="Program studi" value={form.prodi} />
                      <ReviewItem label="Kota/Kab domisili" value={form.domisili} />
                      <ReviewItem label="Kota/Kab asal" value={form.asal} />
                    </dl>
                  </ReviewBlock>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ReviewBlock title="Instansi" onEdit={() => goTo(2)}>
                      <RankPreview items={form.rankKl} total={INSTANSI_KL.length} />
                    </ReviewBlock>
                    <ReviewBlock title="Unit eselon I" onEdit={() => goTo(3)}>
                      <RankPreview items={form.rankEselon} total={ESELON_I.length} />
                    </ReviewBlock>
                  </div>

                  <ReviewBlock title="Umpan balik" onEdit={() => goTo(4)}>
                    <dl className="space-y-4">
                      <ReviewItem
                        label="Rating KLP Fest"
                        value={form.rating ? `${form.rating} dari 5` : "Belum dipilih"}
                      />
                      <div>
                        <dt className="text-xs text-muted">Saran</dt>
                        <dd className="mt-1 whitespace-pre-line text-[14px] leading-relaxed">
                          {form.saran || "-"}
                        </dd>
                      </div>
                    </dl>
                  </ReviewBlock>
                </div>
              </div>
            )}
          </div>

          {step > 0 ? (
            <div className="sticky bottom-0 z-10 rounded-b-[13px] border-t border-line bg-surface px-5 py-3 sm:px-8">
              {error ? (
                <p role="alert" className="mb-2 text-[13px] leading-snug text-negative">
                  {error}
                </p>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => goTo(step - 1)} className={btnSecondary}>
                  Sebelumnya
                </button>
                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={() => goTo(step + 1)} className={btnPrimary}>
                    Selanjutnya
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting}
                    className={btnPrimary}
                  >
                    {submitting ? "Mengirim..." : "Kirim jawaban"}
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </Shell>
  );
}

function Required() {
  return (
    <span className="text-negative" aria-hidden="true">
      *
    </span>
  );
}

function StepTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-[21px] font-semibold leading-snug tracking-[-0.01em] sm:text-[24px]">
        {title}
      </h2>
      <p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[10px] border border-line">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <h3 className="text-[13px] font-semibold">{title}</h3>
        <button type="button" onClick={onEdit} className={btnGhost}>
          Ubah
        </button>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 text-[14px] font-medium leading-snug">{value || "-"}</dd>
    </div>
  );
}

function RankPreview({ items, total }: { items: string[]; total: number }) {
  return (
    <div>
      <ol className="space-y-1.5">
        {items.slice(0, 3).map((item, index) => (
          <li key={item} className="flex gap-2 text-[13px] leading-snug">
            <span className="tabular-nums text-muted">{index + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-muted">
        {total} pilihan tersimpan berurutan
      </p>
    </div>
  );
}
