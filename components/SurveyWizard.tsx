"use client";

import { useEffect, useState } from "react";
import RankList from "@/components/RankList";
import Stars from "@/components/Stars";
import { ESELON_I, INSTANSI_KL, PRODI } from "@/lib/survey";

const STEPS = [
  "Pendahuluan",
  "Identitas",
  "Peminatan Instansi",
  "Unit Eselon I",
  "Umpan Balik",
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

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0b2f5e] focus:ring-2 focus:ring-[#0b2f5e]/15";
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export default function SurveyPage() {
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
          window.scrollTo({ top: 0, behavior: "smooth" });
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
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mt-5 text-xl font-semibold text-slate-900">
            Jawaban berhasil dikirim
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Terima kasih, {form.nama.trim() || "rekan-rekan"}. Peminatan Anda telah tercatat dan
            akan menjadi bahan masukan proses penempatan. Keputusan akhir penempatan tetap
            menjadi kewenangan Biro Sumber Daya Manusia.
          </p>
          <p className="mt-6 text-xs text-slate-400">
            Biro Sumber Daya Manusia &middot; Sekretariat Jenderal Kementerian Keuangan
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="bg-[#0b2f5e] text-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
            Kementerian Keuangan Republik Indonesia
          </p>
          <h1 className="mt-2 text-lg font-semibold leading-snug sm:text-xl">
            Survei Peminatan Penempatan Lulusan PKN STAN 2026
          </h1>
          <p className="mt-1 text-xs text-white/70">
            Biro Sumber Daya Manusia &middot; Sekretariat Jenderal
          </p>
        </div>
        {step > 0 ? (
          <div className="h-1 w-full bg-white/15">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        {step > 0 ? (
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Langkah {step} dari {STEPS.length - 1} &middot;{" "}
              <span className="font-medium text-slate-700">{STEPS[step]}</span>
            </span>
            <span className="hidden sm:inline">Jawaban tersimpan otomatis di perangkat ini</span>
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-slate-900">Selamat datang</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                Terima kasih atas kesediaan dan partisipasi rekan-rekan dalam Survei Peminatan
                Penempatan Lulusan PKN STAN Tahun 2026. Survei ini menghimpun preferensi dan
                aspirasi lulusan sebagai salah satu bahan masukan dalam proses penempatan.
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                <p className="font-medium">Perlu diperhatikan</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Hasil survei bersifat tidak mengikat dan tidak menjamin penempatan.</li>
                  <li>
                    Keputusan akhir penempatan sepenuhnya menjadi kewenangan Biro Sumber Daya
                    Manusia dengan mempertimbangkan kebutuhan organisasi, formasi, kompetensi,
                    serta kriteria lainnya.
                  </li>
                  <li>Pengisian membutuhkan sekitar 10-15 menit dan hanya dapat dilakukan sekali.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-800">Alur pengisian</p>
                <p className="mt-1">
                  Identitas &rarr; urutkan 27 instansi penempatan &rarr; urutkan 13 unit eselon I
                  Kemenkeu &rarr; umpan balik &rarr; tinjau dan kirim.
                </p>
              </div>
              <button
                type="button"
                onClick={() => goTo(1)}
                className="w-full rounded-lg bg-[#0b2f5e] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#123f78] sm:w-auto"
              >
                Mulai mengisi
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <StepTitle
                title="A. Identitas Responden"
                description="Isi data berikut sesuai data akademik Anda."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>
                    Nomor Pokok Mahasiswa (NPM) <Required />
                  </span>
                  <input
                    className={inputClass}
                    value={form.npm}
                    onChange={(event) => update("npm", event.target.value)}
                    placeholder="Contoh: 1123456789"
                    inputMode="text"
                    autoCapitalize="none"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>
                    Nama Lengkap <Required />
                  </span>
                  <input
                    className={inputClass}
                    value={form.nama}
                    onChange={(event) => update("nama", event.target.value)}
                    placeholder="Nama sesuai ijazah"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelClass}>
                    Program Studi <Required />
                  </span>
                  <select
                    className={inputClass}
                    value={form.prodi}
                    onChange={(event) => update("prodi", event.target.value)}
                  >
                    <option value="">Pilih program studi</option>
                    {PRODI.map((prodi) => (
                      <option key={prodi} value={prodi}>
                        {prodi}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className={labelClass}>
                    Kota/Kab Domisili Saat Ini <Required />
                  </span>
                  <input
                    className={inputClass}
                    value={form.domisili}
                    onChange={(event) => update("domisili", event.target.value)}
                    placeholder="Contoh: Kota Tangerang Selatan"
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>
                    Kota/Kab Asal <Required />
                  </span>
                  <input
                    className={inputClass}
                    value={form.asal}
                    onChange={(event) => update("asal", event.target.value)}
                    placeholder="Contoh: Kabupaten Sleman"
                  />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <StepTitle
                title="B. Peminatan Instansi Penempatan"
                description="Seret (drag) kartu atau gunakan tombol panah untuk MENGURUTKAN 27 instansi berikut sesuai PRIORITAS peminatan Anda. Posisi 1 adalah prioritas tertinggi."
              />
              <RankList items={form.rankKl} onChange={(items) => update("rankKl", items)} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <StepTitle
                title="Peminatan Unit Eselon I Kemenkeu"
                description="Urutkan 13 unit eselon I berikut sesuai PRIORITAS peminatan Anda. Posisi 1 adalah prioritas tertinggi."
              />
              <RankList
                items={form.rankEselon}
                onChange={(items) => update("rankEselon", items)}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <StepTitle
                title="C. Saran Kegiatan Penempatan"
                description="Umpan balik Anda membantu perbaikan proses penempatan berikutnya."
              />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Apakah informasi yang diperoleh melalui KLP Fest Tahun 2026 membantu dalam
                  menentukan peminatan penempatan? <Required />
                </p>
                <div className="mt-2">
                  <Stars value={form.rating} onChange={(rating) => update("rating", rating)} />
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Saran atau informasi lain yang ingin disampaikan terkait proses penempatan{" "}
                  <Required />
                </span>
                <textarea
                  className={`${inputClass} mt-2 min-h-32 resize-y`}
                  value={form.saran}
                  onChange={(event) => update("saran", event.target.value)}
                  placeholder="Tuliskan saran Anda"
                  maxLength={2000}
                />
                <span className="mt-1 block text-right text-xs text-slate-400">
                  {form.saran.length}/2000
                </span>
              </label>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <StepTitle
                title="Tinjau Jawaban"
                description="Periksa kembali sebelum mengirim. Jawaban tidak dapat diubah setelah dikirim."
              />
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <Summary label="NPM" value={form.npm} />
                <Summary label="Nama Lengkap" value={form.nama} />
                <Summary label="Program Studi" value={form.prodi} />
                <Summary label="Kota/Kab Domisili" value={form.domisili} />
                <Summary label="Kota/Kab Asal" value={form.asal} />
                <Summary label="Rating KLP Fest" value={form.rating ? `${form.rating} / 5` : "-"} />
                <div className="sm:col-span-2">
                  <Summary label="Saran" value={form.saran} />
                </div>
              </dl>
              <div className="grid gap-4 sm:grid-cols-2">
                <Preview title="3 Prioritas Instansi" items={form.rankKl} />
                <Preview title="3 Prioritas Eselon I" items={form.rankEselon} />
              </div>
              <p className="text-xs text-slate-500">
                Urutan lengkap 27 instansi dan 13 unit eselon I akan tersimpan sesuai pengurutan
                Anda.
              </p>
            </div>
          )}

          {error ? (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          ) : null}
        </section>

        {step > 0 ? (
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sebelumnya
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => goTo(step + 1)}
                className="rounded-lg bg-[#0b2f5e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#123f78]"
              >
                Selanjutnya
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? "Mengirim..." : "Kirim Jawaban"}
              </button>
            )}
          </div>
        ) : null}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Survei Peminatan Penempatan Lulusan PKN STAN 2026
      </footer>
    </div>
  );
}

function Required() {
  return <span className="text-red-500">*</span>;
}

function StepTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value || "-"}</dd>
    </div>
  );
}

function Preview({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ol className="mt-2 space-y-1 text-sm text-slate-700">
        {items.slice(0, 3).map((item, index) => (
          <li key={item} className="flex gap-2">
            <span className="text-slate-400">{index + 1}.</span>
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
