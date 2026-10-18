# Video teaser Tani Muda (Remotion)

Teaser motion graphic 1920×1080, 30 fps, H.264, paling lama 3:00 (pedoman lomba butir 12.b.4).
Durasi = panjang rekaman suara + 2,5 detik penutup (saat ini 2:07,7; angka pastinya dicetak `npm run cek`).
Proyek ini terpisah dari `frontend/` dan tidak ikut bundel aplikasi.

Riwayat: AG-42 (versi pertama), AG-43 (motion graphic), AG-44 (suara Edge TTS),
**AG-45** (rekaman suara asli, satu shot per kalimat, latar terisi, logo asli, rekaman HP sungguhan).

## Alur kerja

```bash
npm install
npm run siapkan-alat   # sekali: ffmpeg lengkap (imageio-ffmpeg) di .venv-tts, Python 3
npm run suara          # record-voiceover.mpeg → public/audio/narasi/rekaman.wav (48 kHz, dirapikan)
npm run transkrip      # whisper.cpp lokal (model small) → .whisper/transkrip.json
npm run selaraskan     # 35 kalimat naskah ↔ transkrip → src/data/waktu-kalimat.json, naskah-narasi.md
npm run rekam          # rekam ulang layar HP (butuh `npm run demo:backend` di frontend/, port 4174)
npm run cek            # logo asli sinkron, durasi ≤ 3:00, 35 kalimat = 35 shot
npm run lembar-kontak  # satu bingkai tengah per shot → keluaran/lembar-kontak.png
npm run pratinjau      # keluaran/pratinjau-teaser-0.5x.mp4
npm run render         # keluaran/teaser-tani-muda.mp4 (konkurensi 1)
npm run start          # Remotion Studio
```

Tidak di-commit: `keluaran/`, `rekaman/`, `public/rekaman/` (rekaman layar), `.venv-tts/`, `.whisper/`,
`public/audio/narasi/rekaman.wav` (dibuat ulang dengan `npm run suara`).

## Narasi

- Sumber: `record-voiceover.mpeg`, suara pemilik produk (125,2 detik). Olahan ringan: high-pass 80 Hz,
  pengurang derau FFT 12 dB, kompresor 2:1, kenyaringan -16 LUFS. ffmpeg bawaan Remotion tidak punya
  filter itu, jadi dipakai ffmpeg lengkap dari `.venv-tts`.
- Waktu kalimat dicari dengan whisper.cpp 1.5.5 model `small` (`@remotion/install-whisper-cpp`), lalu
  35 kalimat naskah dijajarkan per kata (pemrograman dinamis) supaya salah eja whisper tidak mengganggu.
- Subtitel memakai teks naskah. Ucapan yang benar-benar berbeda diberi kolom `subtitel` di
  `scripts/naskah.mjs` (08.4 diucapkan "perkiraan cuaca"). Perbedaan lain dari whisper tercatat di
  `naskah-narasi.md`.

## Komposisi

- `src/v2/linimasa.ts`: satu kalimat = satu shot, mulai 0,15 detik sebelum kalimat diucapkan.
- `src/v2/shot/`: 35 komponen shot (`A01.tsx` … `A09A10.tsx`), terdaftar di `shot/index.ts`.
- Setiap shot memakai `Panggung`: (a) latar ilustrasi penuh bergerak parallax (`Latar.tsx`: sawah,
  bedengan, kota, jalan, langit; bisa senja dan hujan), (b) objek utama mengikuti kamera yang selalu
  bergerak, (c) ikon tani berisi warna yang melayang dengan kedalaman berbeda (`IkonTani.tsx`).
- Judul besar ≥ 64 px masuk per kata tepat saat kata itu diucapkan (`JudulKata`).
- Antaradegan: sapuan bukit (`Sapuan.tsx`). Subtitel di sepertiga bawah tanpa kotak (`Subtitel.tsx`).
- Logo: `src/v2/LogoAsli.tsx` adalah path `frontend/public/logo/logo-tanda.svg` apa adanya, dipecah per
  bagian supaya bisa dirakit; `scripts/cek-logo.mjs` memastikan sama persis.
- Ilustrasi digambar sendiri sebagai SVG berlapis (`src/v2/ilustrasi/`). Aset nyata: lencana dan foto
  bayam dari `public/` (salinan `frontend/public/`). Tanpa emoji, pustaka ikon, atau gambar buatan AI.
- Peta Jawa Tengah di 08.5 digambar dari titik tengah 571 kecamatan (`shared/wilayah`, ODbL,
  © kontributor OpenStreetMap) lewat `npm run peta`.
- Identitas penutup ada di `src/v2/identitas.ts`.

## Rekaman layar HP

`scripts/rekam-hp.mjs` merekam 12 skenario dengan viewport HP sungguhan (390×844, isMobile, hasTouch,
deviceScaleFactor 2) dan mencatat detik setiap langkah di `src/data/penanda-rekaman.json`. Playwright
merekam seukuran viewport CSS, jadi berkas videonya 390×844 (ukuran 780×1688 hanya menambah bantalan
abu-abu). Di video, layar HP tampil selebar ±358 px, jadi resolusi ini tetap tajam.

Hasil deteksi penyakit tidak direkam: di mode backend `POST /deteksi` menolak foto karena frontend
mengirim `foto_base64` sedangkan backend meminta `berkas_id`. Shot 08.2 menampilkan rekaman sampai
foto terpasang, lalu hasil "dugaan" digambar di video.

## Audio dan lisensi

| Berkas | Asal | Lisensi |
|---|---|---|
| `record-voiceover.mpeg` | Rekaman suara pemilik produk | Milik sendiri |
| `public/audio/musik.mp3` | Disintesis kode, `scripts/buat-musik.mjs` (tanpa sampel pihak ketiga) | Milik sendiri |
| Huruf Outfit | `public/fonts/` | SIL Open Font License |
| Titik kecamatan | `shared/wilayah/titik-kecamatan-jateng.json` | ODbL, © kontributor OpenStreetMap |

Musik turun ke sekitar 30% saat narasi berbunyi. Bila ingin musik lain, sumber bebas pakai yang
disarankan: YouTube Audio Library atau Pixabay Music. Catat sebelum dipakai:

| Judul | Pencipta | Sumber (tautan) | Lisensi | Tanggal unduh |
|---|---|---|---|---|
| | | | | |
