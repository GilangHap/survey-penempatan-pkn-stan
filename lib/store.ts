import { createClient, type Client } from "@libsql/client";
import type { Submission } from "./survey";

// Turso bila TURSO_DATABASE_URL diisi (prod/Vercel);
// fallback SQLite lokal (file:./data/survei.db) untuk dev/self-host.
let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function db(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL ?? "file:./data/survei.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = db()
      .execute(
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
      )
      .then(() => undefined);
  }
  return schemaReady;
}

type Row = { id: unknown; submitted_at: unknown } & Record<string, unknown>;

function rowToSubmission(row: Row): Submission {
  return {
    id: String(row.id),
    submittedAt: String(row.submitted_at),
    npm: String(row.npm),
    nama: String(row.nama),
    prodi: String(row.prodi),
    domisili: String(row.domisili),
    asal: String(row.asal),
    rankKl: JSON.parse(String(row.rank_kl)) as string[],
    rankEselon: JSON.parse(String(row.rank_eselon)) as string[],
    rating: Number(row.rating),
    saran: String(row.saran),
  };
}

export async function listSubmissions(): Promise<Submission[]> {
  await ensureSchema();
  const result = await db().execute(
    "SELECT * FROM submissions ORDER BY submitted_at",
  );
  return result.rows.map((row) => rowToSubmission(row as unknown as Row));
}

export async function saveSubmission(
  submission: Submission,
): Promise<"saved" | "duplicate"> {
  await ensureSchema();
  const result = await db().execute({
    sql: `INSERT INTO submissions
          (id, submitted_at, npm, nama, prodi, domisili, asal, rank_kl, rank_eselon, rating, saran)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(npm) DO NOTHING
          RETURNING id`,
    args: [
      submission.id,
      submission.submittedAt,
      submission.npm,
      submission.nama,
      submission.prodi,
      submission.domisili,
      submission.asal,
      JSON.stringify(submission.rankKl),
      JSON.stringify(submission.rankEselon),
      submission.rating,
      submission.saran,
    ],
  });
  return result.rows.length > 0 ? "saved" : "duplicate";
}
