import assert from "node:assert/strict";
import test from "node:test";
import { ESELON_I, INSTANSI_KL, PRODI, parseSubmission } from "./survey.ts";

const valid = {
  npm: "1122334455",
  nama: "Gilang Ramadhan",
  prodi: PRODI[0],
  domisili: "Kota Tangerang Selatan",
  asal: "Kabupaten Sleman",
  rankKl: [...INSTANSI_KL].reverse(),
  rankEselon: [...ESELON_I],
  rating: 4,
  saran: "Saran",
};

test("menerima jawaban lengkap dan mempertahankan urutan", () => {
  const parsed = parseSubmission(valid);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.value.rankKl.length, INSTANSI_KL.length);
  assert.equal(parsed.value.rankKl[0], INSTANSI_KL[INSTANSI_KL.length - 1]);
});

test("menolak urutan tidak lengkap atau duplikat", () => {
  assert.equal(parseSubmission({ ...valid, rankKl: INSTANSI_KL.slice(1) }).ok, false);
  assert.equal(
    parseSubmission({ ...valid, rankKl: [INSTANSI_KL[0], ...INSTANSI_KL.slice(0, 26)] }).ok,
    false,
  );
  assert.equal(parseSubmission({ ...valid, rankEselon: [] }).ok, false);
});

test("menolak rating di luar 1-5 dan isian wajib yang kosong", () => {
  assert.equal(parseSubmission({ ...valid, rating: 6 }).ok, false);
  assert.equal(parseSubmission({ ...valid, rating: 0 }).ok, false);
  assert.equal(parseSubmission({ ...valid, saran: "   " }).ok, false);
  assert.equal(parseSubmission({ ...valid, prodi: "D-III Lain" }).ok, false);
  assert.equal(parseSubmission({ ...valid, npm: "ab" }).ok, false);
});
