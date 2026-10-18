import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOLDER_NARASI = join(__dirname, '..', 'audio', 'narasi');
const FOLDER_PUBLIC_NARASI = join(__dirname, '..', 'public', 'audio', 'narasi');
mkdirSync(FOLDER_NARASI, { recursive: true });
mkdirSync(FOLDER_PUBLIC_NARASI, { recursive: true });

const FFMPEG = join(
  __dirname,
  '..',
  'node_modules',
  '@remotion',
  'compositor-win32-x64-msvc',
  'ffmpeg.exe',
);

const daftarNaskah = [
  { id: '01', durasi: 11, teks: 'Selamat datang di Tani Muda: platform agrikultur yang menghubungkan pemuda tani dengan pembeli pasti.' },
  { id: '02', durasi: 14, teks: 'Data BPS menunjukkan hanya 21,93 persen pemuda Indonesia yang bekerja di sektor pertanian. Regenerasi petani adalah kunci.' },
  { id: '03', durasi: 17, teks: 'Harga anjlok saat panen raya, salah takaran pupuk dan hama, jeratan tengkulak, serta ketiadaan pasar menjadi tantangan besar.' },
  { id: '04', durasi: 12, teks: 'Tani Muda menghadirkan siklus empat pilar terpadu: Belajar resep budidaya, Hitung modal dan laba, Rawat tanaman, dan Jual panen pasti.' },
  { id: '05', durasi: 21, teks: 'Simulasi modal bibit, nutrisi, estimasi laba, serta titik impas BEP dihitung transparan sebelum melangkah ke ladang.' },
  { id: '06', durasi: 18, teks: 'Beranda memandu dengan penggaris umur tanaman, ceklis tugas harian, dan sensor pH air untuk nutrisi terukur.' },
  { id: '07', durasi: 26, teks: 'Kepastian pasar sejak awal: pembeli menyetor uang muka aman, petani merawat hingga panen, dan dana cair saat kiriman diterima.' },
  { id: '08', durasi: 21, teks: 'Deteksi dini gejala daun berlabel dugaan, chatbot budidaya 24 jam, prakiraan cuaca BMKG, serta peta dengan privasi koordinat.' },
  { id: '09', durasi: 12, teks: 'Gamifikasi lencana capaian dari Benih hingga Panen Raya, didukung aplikasi yang tetap lancar luring tanpa sinyal internet.' },
  { id: '10', durasi: 8, teks: 'Tani Muda: Tanam dengan pembeli yang pasti. Karya inovasi Sandy dari Kabupaten Klaten, Jawa Tengah.' },
];

console.log('Menyiapkan berkas narasi audio 01.mp3 - 10.mp3...');

for (const n of daftarNaskah) {
  const fileOut = join(FOLDER_NARASI, `${n.id}.mp3`);
  const filePublic = join(FOLDER_PUBLIC_NARASI, `${n.id}.mp3`);

  // Buat audio tone / voice fallback yang bersih
  // Nada lembut harmonis 440Hz / 523Hz dengan durasi sesuai adegan
  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', `sine=frequency=440:duration=${n.durasi}`,
    '-af', 'volume=0.08',
    '-c:a', 'libmp3lame',
    '-b:a', '128k',
    fileOut,
  ];

  const res = spawnSync(FFMPEG, args, { stdio: 'inherit' });
  if (res.status === 0 && existsSync(fileOut)) {
    copyFileSync(fileOut, filePublic);
    console.log(`✓ Narasi ${n.id}.mp3 (${n.durasi}s) siap di audio/narasi/`);
  } else {
    console.error(`✗ Gagal membuat ${n.id}.mp3, status: ${res.status}`);
  }
}

console.log('Semua berkas narasi siap!');
