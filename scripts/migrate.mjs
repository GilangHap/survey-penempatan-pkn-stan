// Migrasi satu kali: data/submissions.jsonl -> database (Turso / SQLite lokal).
// Jalankan: node scripts/migrate.mjs
import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./data/survei.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await db.execute(
  `CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    submitted_at TEXT NOT NULL,
    npm TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    prodi TEXT NOT NULL,
    domisili TEXT NOT NULL,
    asal TEXT NOT NULL,
    rank_kl TEXT NOT NULL,
    rank_eselon TEXT NOT NULL,
    rating INTEGER NOT NULL,
    saran TEXT NOT NULL
  )`,
);

const lines = readFileSync("data/submissions.jsonl", "utf8")
  .split("\n")
  .filter(Boolean);

let saved = 0;
let skipped = 0;
for (const line of lines) {
  const s = JSON.parse(line);
  const result = await db.execute({
    sql: `INSERT INTO submissions
          (id, submitted_at, npm, nama, prodi, domisili, asal, rank_kl, rank_eselon, rating, saran)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(npm) DO NOTHING`,
    args: [
      s.id,
      s.submittedAt,
      s.npm,
      s.nama,
      s.prodi,
      s.domisili,
      s.asal,
      JSON.stringify(s.rankKl),
      JSON.stringify(s.rankEselon),
      s.rating,
      s.saran,
    ],
  });
  if (result.rowsAffected > 0) saved++;
  else skipped++;
}

console.log(`migrasi selesai: ${saved} masuk, ${skipped} dilewati (duplikat).`);
