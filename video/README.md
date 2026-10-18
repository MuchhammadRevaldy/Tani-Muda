# Video teaser Tani Muda (Remotion)

Teaser motion graphic 1920×1080, 30 fps, H.264, paling lama 3:00 (pedoman lomba butir 12.b.4).
Durasi saat ini sekitar 2:50; angka pastinya dicetak oleh `npm run cek`.
Proyek ini terpisah dari `frontend/` dan tidak ikut bundel aplikasi.

Riwayat: AG-42 (versi pertama, ditolak), AG-43 (ulang sebagai motion graphic),
AG-44 (narasi suara, durasi mengikuti suara, ikon aplikasi dipakai ulang).

## Perintah

```bash
npm install
npm run siapkan-tts     # sekali saja: Edge TTS + ffmpeg lengkap di .venv-tts (Python 3)
npm run narasi          # buat/ukur narasi, tulis src/data/narasi.json dan naskah-narasi.md
npm run cek             # ikon aplikasi sinkron, narasi berisi suara, durasi <= 3:00
npm run start           # Remotion Studio
npm run pratinjau-ikon  # keluaran/pratinjau-ikon.png
npm run papan-gaya      # keluaran/papan-gaya/01..10.png
npm run pratinjau       # keluaran/pratinjau-teaser-0.5x.mp4 (skala 0,5)
npm run render          # keluaran/teaser-tani-muda.mp4 (konkurensi 1)
```

`keluaran/`, `rekaman/`, `.venv-tts/` tidak di-commit.

## Narasi

- Teks narasi hanya ada di `scripts/naskah.mjs`. `naskah-narasi.md` dibuat ulang otomatis dari situ.
- Urutan sumber suara per adegan:
  1. **Rekaman manusia**: taruh di `public/audio/narasi/NN.mp3`, lalu `npm run narasi`.
     Berkas yang tidak dibuat skrip tidak pernah ditimpa (kecuali `-- --timpa`).
  2. **Edge TTS** (sementara): suara `id-ID-ArdiNeural`. Ganti dengan `npm run narasi -- --suara=id-ID-GadisNeural`.
     Layanan ini tidak resmi untuk dipakai di luar peramban Edge dan bisa berhenti sewaktu-waktu;
     berkas yang sudah dibuat tetap tersimpan di repo.
- Supaya tidak terdengar seperti mesin: suara dibuat per kalimat dengan laju -6% (kalimat kunci -10%),
  hening di ujung kalimat dipotong, kalimat disambung dengan jeda 0,28–0,45 detik yang bervariasi,
  lalu high-pass 80 Hz, kompresi ringan, dan normalisasi -16 LUFS.
  Angka dan "pH" ditulis seperti diucapkan khusus untuk mesin suara (kolom `ucap`).
- Bila narasi lebih pendek dari animasi adegan, sisa waktunya dibagi ke jeda antarkalimat
  (paling banyak +1 detik per jeda), supaya kalimat jatuh di gambar yang sesuai.
- `npm run cek` gagal bila berkas narasi hilang, berupa nada atau hening, atau lebih cepat dari 160 kata/menit.

## Linimasa

- Durasi adegan = maks(panjang animasi adegan, 0,5 dtk + panjang narasi + 0,8 dtk).
  Rumusnya ada di `src/linimasa.ts` dan `scripts/cek-durasi.mjs` (ubah keduanya bersamaan).
- Komposisi memakai `calculateMetadata` yang mengukur berkas narasi langsung, jadi rekaman baru
  yang lebih panjang tidak terpotong.
- Adegan 3, 7, 8, dan 9 membaca waktu kalimat (`useAwalKalimat`): pergantian shot, koin uang muka,
  gembok, centang kiriman, dan dana cair terjadi saat kalimatnya diucapkan.
- Subtitel dibakar dari teks naskah per kalimat: putih, tepi gelap, tanpa kotak, 42 px.

## Ikon

- **Dari aplikasi** (`src/ikon/ikon-aplikasi-data.ts`): uang, pin, panen, kamera, chat, kebun, belajar,
  kunci, centang, pengukur, peta. Salinan apa adanya dari `frontend/src/komponen/ikon.tsx`;
  `scripts/cek-ikon-aplikasi.mjs` gagal bila berbeda. Bila ikon aplikasi berubah, salin ulang string-nya.
- **Buatan video** (`src/ikon/koleksi-ikon.tsx`), karena tidak ada di aplikasi: kalkulator, gembor,
  timbangan, grafik turun, daun berulat, rantai, truk, cuaca, kotak stok, petani muda.
  Tebal garisnya disamakan dengan ikon aplikasi (setara 1,7 pada grid 24).
- Pengukur pH di adegan Rawat tetap gambar khusus karena jarumnya harus bergerak.
- Lencana dan logo dari `public/lencana/` dan `public/logo/` (salinan aset aplikasi).

## Audio dan lisensi

| Berkas | Asal | Lisensi |
|---|---|---|
| `public/audio/narasi/01..10.mp3` | Edge TTS `id-ID-ArdiNeural`, dibuat `scripts/buat-narasi.mjs` | Suara sintetis Microsoft; ganti dengan rekaman sendiri bila pedoman lomba melarang suara buatan AI |
| `public/audio/musik.mp3` | Disintesis dengan kode, `scripts/buat-musik.mjs` (progresi G-D-Em-C, tanpa sampel pihak ketiga) | Milik sendiri |
| Huruf Outfit | `public/fonts/` | SIL Open Font License (`OFL-outfit.txt`) |

Musik turun ke sekitar 30% volumenya saat kalimat narasi berbunyi, lalu naik lagi di jeda.
Bila ingin musik lain, sumber bebas pakai yang disarankan: YouTube Audio Library atau Pixabay Music.
Catat di sini sebelum dipakai:

| Judul | Pencipta | Sumber (tautan) | Lisensi | Tanggal unduh |
|---|---|---|---|---|
| | | | | |

Tanpa efek suara pihak ketiga.
