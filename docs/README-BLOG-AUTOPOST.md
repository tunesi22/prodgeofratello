# Blog Autopost — GEO/SEO blog otomatis

Status per **2026-08-19, 22:30 WIB**. Ditulis setelah setup awal selesai dan satu artikel live sebagai tes end-to-end.

## Apa ini

Pipeline otomatis yang setiap hari jam **08:00 WIB**:

1. Ambil 1 topik belum dipakai dari `backend/scripts/blog-topics.json`
2. Generate artikel ID + EN pakai **Claude Sonnet 5** (structured JSON output, retry kalau format/keyword salah)
3. Tulis file post baru + update `index.ts` di kedua folder blog (`id/`, `en/`)
4. Tandai topik `used: true` di topic bank
5. `git commit` + `git push` ke GitHub (`main`)
6. Jalanin `deploy/deploy.sh` (build zero-downtime, `pm2 reload`)

Semua otomatis, **tanpa approval manual** — sesuai keputusan awal.

File-file terkait:
- `backend/scripts/blog-autopost.ts` — logic utama
- `backend/scripts/blog-topics.json` — bank topik (43 total, isi: `primaryKeyword`, `keywords`, `targetQueries`, `used`)
- `backend/scripts/run-blog-autopost.sh` — wrapper yang di-panggil cron (source nvm manual dulu, karena `.bashrc` skip load nvm kalau shell non-interactive)
- Cron di VPS (`crontab -l`): `0 8 * * * .../run-blog-autopost.sh >> ~/logs/blog-autopost.log 2>&1`

## Kondisi blog sekarang

- **1 artikel live**: `geo-industri-pendidikan-kampus-bimbel-2026` (ID + EN), published manual sebagai tes — https://hifratello.com/blog/geo-industri-pendidikan-kampus-bimbel-2026
- **42 topik tersisa** di bank (cukup ±42 hari kalau 1/hari). Berikutnya: `geo-sektor-properti-agen-real-estate`
- **Cron belum pernah jalan sendiri** — baru dipasang, run otomatis pertama besok 08:00 WIB
- Script versi terakhir sudah termasuk fix keyword-stuffing (pakai `primaryKeyword` + `targetQueries`, bukan paksa banyak kata)

## Yang harus dicek besok (setelah jam 08:00 WIB)

1. **Cek log run otomatis pertama:**
   ```
   ssh vpsgeonineten "tail -100 ~/logs/blog-autopost.log"
   ```
   Cari baris `[BLOG-AUTOPOST] Done. Published: ...` di akhir → berarti sukses penuh (generate → commit → push → deploy).

2. **Kalau gagal**, error-nya bakal ada di log yang sama (`[BLOG-AUTOPOST] FAILED: ...`). Kemungkinan penyebab paling umum:
   - ANTHROPIC_API_KEY habis kuota/invalid
   - Ada perubahan manual di VPS yang bikin `git push`/`git commit` conflict (working tree harus bersih relatif terhadap file yang disentuh script)
   - Topic bank kehabisan (baru terjadi ±42 hari lagi, bukan besok)

3. **Cek artikel keduanya beneran live** di https://hifratello.com/blog dan versi EN-nya.

4. **Cek `blog-topics.json`** — pastikan topik hari itu ke-mark `used: true` dengan `usedDate` hari ini.

## Yang belum dikerjain (didiskusikan, sengaja ditunda dulu)

- **Notifikasi kalau gagal** — sekarang kalau run gagal, nggak ada yang ngasih tau kecuali kamu cek log manual. Belum ada WhatsApp/email alert.
- **Logging token usage per run** — biar biaya bulanan bisa dihitung dari data real, bukan estimasi. Belum ditambahin ke script.
- **Git identity di VPS** — commit dari VPS pakai identitas default (`Ubuntu@Geo-ninetendev...`), bukan nama/email asli. Kosmetik doang, nggak ganggu fungsi.
- **Log rotation** — `~/logs/blog-autopost.log` belum di-rotate, bakal terus membesar (walau lambat, ~1 run/hari).

Kalau mau ngerjain salah satu di atas, tinggal bilang aja pas lanjut sesi berikutnya.
