# Survei Peminatan Penempatan Lulusan PKN STAN 2026

Aplikasi survei wizard (Next.js App Router) untuk menghimpun peminatan instansi penempatan
dan unit eselon I Kemenkeu, lengkap dengan pengurutan drag-and-drop serta rekap untuk panitia.

## Menjalankan

```bash
npm install
```

Buat `.env.local`:

```env
ADMIN_PASSWORD=ganti-dengan-sandi-kuat
# Database: kosong = SQLite lokal (file:./data/survei.db) untuk dev/self-host.
# Prod di Vercel/serverless, pakai Turso (https://turso.tech):
#   turso db create survei
#   turso db tokens create survei
# TURSO_DATABASE_URL=libsql://survei-<org>.turso.io
# TURSO_AUTH_TOKEN=<token>
# Opsional, untuk tulis langsung ke Google Sheets:
# SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/xxx/exec
```

Data lama dari JSONL dimigrasi dengan `node scripts/migrate.mjs` (aman dijalankan berulang,
baris duplikat otomatis dilewati).

```bash
npm run dev      # http://localhost:3000
npm test         # cek validasi payload
npm run build && npm start
```

## Halaman

| URL | Keterangan |
| --- | --- |
| `/` | Wizard 5 langkah: identitas → urutkan 28 K/L → urutkan 13 eselon I → rating & saran → tinjau. Draf tersimpan di `localStorage`. |
| `/admin` | Rekap responden (perlu `ADMIN_PASSWORD`), detail urutan per baris. |
| `/api/export` | Unduh Excel (.xlsx): judul + subjudul, header navy dengan filter & freeze pane, 54 kolom (identitas, K/L 1..28, Eselon I 1..13, rating, saran). |

Data tersimpan di SQLite/Turso (tabel submissions, unique constraint pada NPM). Lokal: file `data/survei.db`; Turso: database cloud.
Satu NPM hanya boleh mengirim satu kali.

## Google Sheets langsung

1. Buat Google Sheet, lalu Extensions → Apps Script, tempel:

   ```js
   function doPost(e) {
     const d = JSON.parse(e.postData.contents);
     SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().appendRow([
       new Date(), d.npm, d.nama, d.prodi, d.domisili, d.asal,
       d.rankKl.join(" > "), d.rankEselon.join(" > "), d.rating, d.saran,
     ]);
     return ContentService.createTextOutput("ok");
   }
   ```

2. Deploy → New deployment → Web app → Execute as **Me**, access **Anyone**, salin URL ke
   `SHEETS_WEBHOOK_URL`. Setiap kiriman akan langsung menambah baris di sheet.

## Deploy

Jalan di mana saja, termasuk Vercel/serverless (data via Turso) maupun VPS (SQLite lokal).
`ADMIN_PASSWORD` dibaca saat build oleh `proxy.ts`, jadi set sebelum `next build`.

Ponytail: tanpa rate-limit/CAPTCHA — tambahkan Turnstile bila survei dibuka publik.
