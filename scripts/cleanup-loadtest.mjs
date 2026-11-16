import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const del = await db.execute("DELETE FROM submissions WHERE npm LIKE 'LOADTEST%'");
const c = await db.execute("SELECT COUNT(*) as n FROM submissions");
console.log("terhapus:", del.rowsAffected, "| sisa:", c.rows[0].n);
