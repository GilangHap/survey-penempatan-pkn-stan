import ExcelJS from "exceljs";
import { listSubmissions } from "@/lib/store";
import { ESELON_I, INSTANSI_KL } from "@/lib/survey";

const NAVY = "FF123F66";
const PALE = "FFF5F4F0";
const LINE = "FFE6E4DE";

export async function GET() {
  const submissions = await listSubmissions();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Biro Sumber Daya Manusia - Sekretariat Jenderal Kementerian Keuangan";
  const sheet = workbook.addWorksheet("Rekap Survei", {
    views: [{ state: "frozen", ySplit: 4, xSplit: 3 }],
  });

  const lastColumn = 6 + INSTANSI_KL.length + ESELON_I.length + 2;

  // Judul
  sheet.mergeCells(1, 1, 1, lastColumn);
  const title = sheet.getCell(1, 1);
  title.value = "Survei Peminatan Penempatan Lulusan PKN STAN 2026";
  title.font = { size: 14, bold: true, color: { argb: "FF171A1E" } };
  title.alignment = { vertical: "middle" };
  sheet.getRow(1).height = 26;

  sheet.mergeCells(2, 1, 2, lastColumn);
  const subtitle = sheet.getCell(2, 1);
  subtitle.value = `Rekap respons · ${submissions.length} responden · diekspor ${new Date().toLocaleString("id-ID")} · Biro Sumber Daya Manusia, Sekretariat Jenderal Kementerian Keuangan`;
  subtitle.font = { size: 10, color: { argb: "FF555A60" } };
  sheet.getRow(2).height = 18;

  // Header kolom
  const header = sheet.getRow(4);
  header.height = 30;
  const columns = [
    "Waktu",
    "NPM",
    "Nama",
    "Program Studi",
    "Kota/Kab Domisili",
    "Kota/Kab Asal",
    ...INSTANSI_KL.map((_, index) => `K/L ${index + 1}`),
    ...ESELON_I.map((_, index) => `Eselon I ${index + 1}`),
    "Rating KLP Fest",
    "Saran",
  ];
  columns.forEach((name, index) => {
    const cell = header.getCell(index + 1);
    cell.value = name;
    cell.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      right: { style: "thin", color: { argb: "FFFFFFFF" } },
      bottom: { style: "thin", color: { argb: NAVY } },
    };
  });

  // Lebar kolom
  const widths = [19, 14, 26, 30, 22, 22];
  for (let index = 0; index < INSTANSI_KL.length; index++) widths.push(42);
  for (let index = 0; index < ESELON_I.length; index++) widths.push(36);
  widths.push(13, 60);
  widths.forEach((width, index) => {
    sheet.getColumn(index + 1).width = width;
  });

  // Baris data
  submissions.forEach((submission, rowIndex) => {
    const row = sheet.getRow(rowIndex + 5);
    const values = [
      new Date(submission.submittedAt),
      submission.npm,
      submission.nama,
      submission.prodi,
      submission.domisili,
      submission.asal,
      ...INSTANSI_KL.map((_, index) => submission.rankKl[index] ?? ""),
      ...ESELON_I.map((_, index) => submission.rankEselon[index] ?? ""),
      submission.rating,
      submission.saran,
    ];
    values.forEach((value, columnIndex) => {
      const cell = row.getCell(columnIndex + 1);
      cell.value = value;
      cell.alignment = { vertical: "top" };
      cell.border = { bottom: { style: "hair", color: { argb: LINE } } };
      if (rowIndex % 2 === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PALE } };
      }
    });
    row.getCell(1).numFmt = "dd/mm/yyyy hh:mm";
    row.getCell(2).font = { size: 11 };
    row.getCell(3).font = { size: 11, bold: true };
    row.getCell(7 + INSTANSI_KL.length + ESELON_I.length).alignment = {
      vertical: "top",
      horizontal: "center",
    };
    row.commit();
  });

  sheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: Math.max(4, submissions.length + 4), column: lastColumn },
  };

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "content-type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition":
        'attachment; filename="survei-peminatan-pkn-stan-2026.xlsx"',
      "cache-control": "no-store",
    },
  });
}
