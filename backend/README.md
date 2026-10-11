# Tani Muda: backend

API Laravel 13 untuk Tani Muda, beralamat dasar `/api/v1`. Bentuk data dan endpoint mengikuti [`docs/kontrak-api.md`](../docs/kontrak-api.md); rancangan di [`docs/arsitektur-backend.md`](../docs/arsitektur-backend.md); langkah menjalankan di [`docs/menjalankan-lokal.md`](../docs/menjalankan-lokal.md).

| Perintah (di `backend/`) | Fungsi |
| --- | --- |
| `php artisan serve` | API di http://127.0.0.1:8000 (atau `npm run dev` di akar untuk API + frontend) |
| `composer uji` | Tes Pest dengan basis data `tani_muda_uji` |
| `composer rapi:cek` | Periksa kerapian kode (Laravel Pint) tanpa mengubah berkas |
| `composer rapi` | Rapikan kode dengan Pint |
| `php artisan migrate:fresh --seed` | Buat ulang basis data pengembangan `tani_muda` dari nol |
| `php artisan about` | Versi PHP dan Laravel, zona waktu, dan koneksi basis data |

Aturan yang dijaga di sini:

- Kunci rahasia hanya ada di `backend/.env` (tidak di-commit). `.env.example` tanpa nilai rahasia.
- Respons sukses `{ "data": … }`; galat `{ "galat": { "kode", "pesan", "rincian"? } }` dari satu tempat, `app/Http/Galat/PenerjemahGalat.php`. Teks galat sama dengan frontend (dicek `tests/Unit/KodeGalatTest.php`).
- Aplikasi dan basis data dalam UTC; waktu dikirim sebagai ISO 8601 `…000Z`.
- Data milik pengguna lain dijawab 404, sama seperti data yang tidak ada (D-22).
- Rumus uang, kapasitas, dan jarak harus lolos `shared/kasus-uji/*.json`, berkas yang sama dengan Vitest (`tests/Unit/KasusUjiBersamaTest.php`).
