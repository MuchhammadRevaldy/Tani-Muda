# Kasus uji perhitungan bersama

Kasus uji rumus uang, kapasitas lahan, dan jarak yang dipakai **frontend (Vitest)** dan **backend (Pest)** sekaligus (T5.02, D-49). Satu berkas JSON berlaku untuk keduanya, sehingga hitungan di server terbukti sama dengan hitungan di aplikasi (D-08).

| Berkas | Isi |
| --- | --- |
| `uang.json` | Pembulatan rupiah dan ke ratusan, nilai pesanan, uang muka, biaya layanan, jumlah kiriman rutin, pembayaran kiriman, konfirmasi kiriman |
| `kapasitas.json` | Sisa lahan, muat siklus baru, luas per panen, petak bersamaan, kebutuhan lahan pesanan, ambil sebagian, batas alokasi |
| `jarak.json` | Jarak Haversine dan radius pesanan |

## Format

```json
{
  "keterangan": "Isi berkas dan keputusan yang dirujuk.",
  "kasus": [
    { "nama": "rutin 10 kg × 12 kiriman × Rp5.000", "fungsi": "hitungNilaiPesanan", "masukan": { … }, "keluaran": { … } },
    { "nama": "harga 0 ditolak", "fungsi": "hitungNilaiPesanan", "masukan": { … }, "galat": "HARGA_KOSONG" }
  ]
}
```

- `fungsi`: nama fungsi di `frontend/src/lib`; di backend fungsi PHP dengan nama yang sama di `backend/app/Domain/Hitung`.
- `masukan`: argumen bernama (camelCase, sama dengan tipe domain frontend). Adaptor di tiap sisi mengubahnya menjadi panggilan fungsi.
- `keluaran`: nilai bila berhasil. Fungsi yang mengembalikan `Hasil` dibandingkan dengan `nilai`-nya.
- `galat`: kode galat bila gagal (daftar di `frontend/src/lib/hasil.ts`). Setiap kasus memakai tepat satu dari `keluaran` atau `galat`.
- `sebagian: true`: hanya kolom yang ditulis yang dicocokkan.
- `toleransi`: selisih angka yang diterima (untuk jarak pecahan).

## Pembaca

- Frontend: `frontend/src/lib/kasus-bersama.test.ts` (Vitest), dijalankan bersama `npm test`.
- Backend: `backend/tests/Unit/KasusUjiBersamaTest.php` (Pest), dijalankan bersama `composer uji`. Pest memeriksa bentuk setiap kasus (kolom wajib, tepat satu dari `keluaran`/`galat`, nama unik). Rumus PHP ditulis di gelombang 5.4–5.5 dan didaftarkan di `ADAPTOR_HITUNG`; sampai saat itu tiap fungsi ditandai "belum diport" (dilewati), satu baris per fungsi.

Mengubah angka di berkas ini mengubah aturan bisnis di kedua sisi. Catat alasannya di `docs/keputusan.md`.
