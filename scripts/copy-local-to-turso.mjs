// Salin lokal SQLite -> Turso (idempoten, retry tiap baris).
import { createClient } from "@libsql/client";

const remote = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const local = createClient({ url: "file:./data/survei.db" });

const { rows } = await local.execute("SELECT * FROM submissions");
let saved = 0;
let skipped = 0;
let failed = 0;

for (const row of rows) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const result = await remote.execute({
        sql: `INSERT INTO submissions
              (id, submitted_at, npm, nama, prodi, domisili, asal, rank_kl, rank_eselon, rating, saran)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(npm) DO NOTHING`,
        args: [
          row.id, row.submitted_at, row.npm, row.nama, row.prodi,
          row.domisili, row.asal, row.rank_kl, row.rank_eselon, row.rating, row.saran,
        ],
      });
      if (result.rowsAffected > 0) saved++;
      else skipped++;
      break;
    } catch (error) {
      if (attempt === 5) {
        failed++;
        console.error("gagal permanen:", row.npm, String(error.message).slice(0, 80));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
  }
}

const count = await remote.execute("SELECT COUNT(*) as n FROM submissions");
console.log(`disalin: ${saved}, duplikat dilewati: ${skipped}, gagal: ${failed}, total turso: ${count.rows[0].n}`);
