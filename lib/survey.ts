export const PRODI = [
  "D-IV Akuntansi Sektor Publik",
  "D-IV Manajemen Keuangan Negara",
  "D-IV Manajemen Aset Publik",
] as const;

export const INSTANSI_KL = [
  "Kementerian Koordinator Bidang Hukum, HAM, Imigrasi dan Pemasyarakatan",
  "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan",
  "Kementerian Koordinator Bidang Pemberdayaan Masyarakat",
  "Kementerian Pendidikan Tinggi, Sains, dan Teknologi",
  "Kementerian Hak Asasi Manusia",
  "Kementerian Kebudayaan",
  "Kementerian Perlindungan Pekerja Migran Indonesia",
  "Kementerian Transmigrasi",
  "Kementerian Komunikasi dan Digital",
  "Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi",
  "Kementerian Pariwisata",
  "Kementerian Ekonomi Kreatif",
  "Badan Intelijen Negara",
  "Badan Narkotika Nasional",
  "Badan Nasional Penanggulangan Bencana",
  "Badan Nasional Penanggulangan Terorisme",
  "Badan Pemeriksa Keuangan",
  "Badan Pengawasan Keuangan dan Pembangunan",
  "Badan Pusat Statistik",
  "Badan Siber dan Sandi Negara",
  "Badan Gizi Nasional",
  "Lembaga Kebijakan Pengadaan Barang/Jasa Pemerintah",
  "Lembaga Perlindungan Saksi dan Korban",
  "Pusat Pelaporan dan Analisis Transaksi Keuangan",
  "Komisi Pemberantasan Korupsi",
  "Sekretariat Jenderal DPR RI",
  "Badan Nasional Pengelola Perbatasan",
] as const;

export const ESELON_I = [
  "Sekretariat Jenderal",
  "Direktorat Jenderal Anggaran",
  "Direktorat Jenderal Strategi Ekonomi dan Fiskal",
  "Direktorat Jenderal Pajak",
  "Direktorat Jenderal Bea dan Cukai",
  "Direktorat Jenderal Perbendaharaan",
  "Direktorat Jenderal Kekayaan Negara",
  "Direktorat Jenderal Perimbangan Keuangan",
  "Direktorat Jenderal Pengelolaan Pembiayaan dan Risiko",
  "Inspektorat Jenderal",
  "Direktorat Jenderal Stabilitas dan Pengembangan Sektor Keuangan",
  "Badan Pendidikan dan Pelatihan Keuangan",
  "Badan Teknologi, Informasi, dan Intelijen Keuangan",
] as const;

export type Submission = {
  id: string;
  submittedAt: string;
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

export type SubmissionInput = Omit<Submission, "id" | "submittedAt">;

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

function sameOrderedSet(value: unknown, allowed: readonly string[]) {
  if (!Array.isArray(value)) return null;
  const list = value.filter((v): v is string => typeof v === "string");
  if (list.length !== allowed.length) return null;
  if (new Set(list).size !== allowed.length) return null;
  if (!list.every((v) => allowed.includes(v))) return null;
  return list;
}

export function parseSubmission(
  input: unknown,
): { ok: true; value: SubmissionInput } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Data tidak valid." };
  }
  const body = input as Record<string, unknown>;

  const npm = text(body.npm, 20);
  const nama = text(body.nama, 120);
  const prodi = text(body.prodi, 80);
  const domisili = text(body.domisili, 80);
  const asal = text(body.asal, 80);
  const saran = text(body.saran, 2000);
  const rating = Number(body.rating);

  if (!/^[0-9A-Za-z./-]{4,20}$/.test(npm)) {
    return { ok: false, error: "NPM wajib diisi (4-20 karakter)." };
  }
  if (nama.length < 3) return { ok: false, error: "Nama lengkap wajib diisi." };
  if (!(PRODI as readonly string[]).includes(prodi)) {
    return { ok: false, error: "Program studi tidak valid." };
  }
  if (!domisili) return { ok: false, error: "Kota/Kab domisili wajib diisi." };
  if (!asal) return { ok: false, error: "Kota/Kab asal wajib diisi." };

  const rankKl = sameOrderedSet(body.rankKl, INSTANSI_KL);
  if (!rankKl) {
    return { ok: false, error: "Urutan peminatan instansi belum lengkap." };
  }
  const rankEselon = sameOrderedSet(body.rankEselon, ESELON_I);
  if (!rankEselon) {
    return { ok: false, error: "Urutan peminatan unit eselon I belum lengkap." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Rating bintang wajib dipilih (1-5)." };
  }
  if (!saran) return { ok: false, error: "Saran wajib diisi." };

  return {
    ok: true,
    value: { npm, nama, prodi, domisili, asal, rankKl, rankEselon, rating, saran },
  };
}
