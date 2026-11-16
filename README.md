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
# Opsional, untuk tulis langsung ke Google Sheets:
# SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/xxx/exec
```

```bash
npm run dev      # http://localhost:3000
npm test         # cek validasi payload & escaping CSV
npm run build && npm start
```

## Halaman

| URL | Keterangan |
| --- | --- |
| `/` | Wizard 5 langkah: identitas → urutkan 27 K/L → urutkan 13 eselon I → rating & saran → tinjau. Draf tersimpan di `localStorage`. |
| `/admin` | Rekap responden (perlu `ADMIN_PASSWORD`), detail urutan per baris. |
| `/api/export` | Unduh CSV (UTF-8 + BOM, terbuka rapi di Excel). 53 kolom: identitas, `Pilihan K/L 1..27`, `Pilihan Eselon I 1..13`, rating, saran. |

Data tersimpan append-only di `data/submissions.jsonl` (di-ignore git karena memuat data pribadi).
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

Butuh host dengan filesystem persisten (VPS, Railway, Fly.io, Docker). Di platform serverless
seperti Vercel folder `data/` tidak writable — ganti `lib/store.ts` ke database/KV.
`ADMIN_PASSWORD` dibaca saat build oleh `proxy.ts`, jadi set sebelum `next build`.

Ponytail: dedupe NPM berbasis file, tanpa rate-limit/CAPTCHA — cukup untuk satu server internal,
tambah constraint unik/DB dan Turnstile bila survei dibuka publik.
