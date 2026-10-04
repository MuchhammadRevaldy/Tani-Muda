# Tani Muda

Aplikasi web (PWA) yang menemani petani muda dari belajar menanam, menghitung modal, merawat tanaman dengan pengingat, sampai menjual panen lewat Pesan Sebelum Tanam.

## Dokumen penting

Baca berurutan sebelum mengerjakan tugas:

1. [docs/KEPUTUSAN.md](docs/KEPUTUSAN.md) — keputusan produk; **mengalahkan PRD dan desain**.
2. [docs/ATURAN-PROYEK.md](docs/ATURAN-PROYEK.md) — aturan wajib di setiap tugas.
3. [docs/RENCANA-KERJA.md](docs/RENCANA-KERJA.md) — daftar tugas dan progres.
4. [docs/RINGKASAN-DESAIN.md](docs/RINGKASAN-DESAIN.md) — token, komponen, halaman.

## Menjalankan

Butuh Node.js 24 dan npm.

```bash
npm install
cp .env.example .env    # isi nilainya; jangan commit .env
npm run dev             # http://localhost:5173
```

Halaman `/komponen` menampilkan semua komponen untuk dicek terhadap papan desain 00.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Cek tipe + build produksi |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm test` | Semua tes (fungsi murni di Node, komponen di jsdom) |
| `npm run test:cakupan` | Tes + cakupan `src/lib` (ambang 90%) |
| `npm run lint` | ESLint + pemeriksa aturan proyek (hex, warna bawaan, teks kecil, service role, kata terlarang) |
| `npm run tangkap -- <url> <folder>` | Tangkapan layar 390px dan 1440px dengan Chrome/Edge terpasang |

## Struktur

```
src/lib/        fungsi murni + tes (format, tata letak penggaris, …)
src/teks/       semua teks UI (Bahasa Indonesia)
src/komponen/   komponen berbagi (Tombol, Kartu, BarisTugas, PenggarisUmurTanam, …)
src/halaman/    halaman
src/data/       akses data (Supabase, TanStack Query, Dexie) — Tahap 3 dan 5
src/penyedia/   antarmuka PenyediaPembayaran dan PenyediaOtp — Tahap 4 dan 5
scripts/        pemeriksa aturan dan tangkapan layar
design/         sumber desain (jangan diubah); hasil ekstraksi di design/extracted/
```

## Catatan keamanan

Hanya variabel berawalan `VITE_` yang sampai ke browser, dan semuanya terbuka untuk publik. Service role key Supabase, kunci payment gateway, dan kunci VAPID privat hanya disimpan sebagai rahasia Edge Function.

## Lisensi pihak ketiga

Font Plus Jakarta Sans (SIL Open Font License 1.1) disalin dari bundle desain ke `public/fonts/`.
