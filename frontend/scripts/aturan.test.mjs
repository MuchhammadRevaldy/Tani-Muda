import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  buangKomentar,
  cekTeksTampil,
  periksaBerkas,
  periksaEnvContoh,
  stringLiteral,
  teksJsx,
} from './aturan.mjs';

const daftar = JSON.parse(readFileSync(new URL('./kata-terlarang.json', import.meta.url), 'utf8'));
const kode = (jalur, isi) => periksaBerkas(jalur, isi, daftar).map((p) => p.kode);

describe('aturan warna dan ukuran', () => {
  it('menolak hex dan rgb', () => {
    expect(kode('src/komponen/A.tsx', '<div style={{ color: "#1e6b45" }} />')).toContain('HEX');
    expect(kode('src/komponen/A.tsx', 'const w = "rgb(0 0 0)";')).toContain('RGB');
  });
  it('menolak warna bawaan Tailwind', () => {
    expect(kode('src/komponen/A.tsx', '<div className="bg-green-600" />')).toContain(
      'WARNA_BAWAAN',
    );
    expect(kode('src/komponen/A.tsx', '<div className="text-white" />')).toContain('WARNA_BAWAAN');
  });
  it('menolak teks kecil dan bayangan jatuh', () => {
    expect(kode('src/komponen/A.tsx', '<p className="text-sm" />')).toContain('TEKS_KECIL');
    expect(kode('src/komponen/A.tsx', '<p className="shadow-md" />')).toContain('BAYANGAN');
  });
  it('menolak nilai sembarang', () => {
    expect(kode('src/komponen/A.tsx', '<p className="w-[53px]" />')).toContain('NILAI_SEMBARANG');
    expect(kode('src/komponen/A.tsx', '<p className="bg-[#fff]" />')).toContain('NILAI_SEMBARANG');
  });
  it('menolak nama kunci rahasia backend di frontend', () => {
    for (const nama of [
      'APP_KEY',
      'DB_PASSWORD',
      'VAPID_PRIVATE_KEY',
      'PEMBAYARAN_SERVER_KEY',
      'X_SECRET',
    ]) {
      expect(kode('src/api/x.ts', `const k = '${nama}';`)).toContain('RAHASIA_BACKEND');
    }
    expect(kode('src/api/x.ts', 'const k = import.meta.env.VITE_SERVICE_ROLE_KEY;')).toContain(
      'RAHASIA_BACKEND',
    );
  });
  it('variabel publik dan nama biasa lolos', () => {
    expect(kode('src/api/x.ts', 'const k = import.meta.env.VITE_VAPID_PUBLIC_KEY;')).toEqual([]);
    expect(kode('src/api/x.ts', 'const dev = import.meta.env.DEV;')).toEqual([]);
    expect(kode('src/api/x.ts', 'const kunci = kunciKueri.pesanan;')).toEqual([]);
  });
  it('menolak path khusus Windows', () => {
    expect(kode('src/api/x.ts', "const d = 'C:\\\\data\\\\a.json';")).toContain('PATH_WINDOWS');
    expect(kode('src/api/x.ts', 'const d = "D:/tani/a.json";')).toContain('PATH_WINDOWS');
    expect(kode('src/api/x.ts', "const jam = 'Pukul 06:00';")).toEqual([]);
  });
  it('menolak membaca env bukan VITE_', () => {
    expect(kode('src/api/x.ts', 'const u = import.meta.env.API_URL;')).toContain(
      'ENV_BUKAN_PUBLIK',
    );
  });
  it('.env.example frontend hanya berisi variabel publik', () => {
    const kodeEnv = (isi) => periksaEnvContoh('.env.example', isi).map((p) => p.kode);
    expect(kodeEnv('# komentar\nVITE_API_URL=\nVITE_VAPID_PUBLIC_KEY=\n')).toEqual([]);
    expect(kodeEnv('DB_PASSWORD=\n')).toEqual(['ENV_BUKAN_PUBLIK']);
    expect(kodeEnv('VITE_APP_KEY=\n')).toEqual(['RAHASIA_BACKEND']);
    expect(kodeEnv('VITE_VAPID_PRIVATE_KEY=abc\n')).toEqual(['RAHASIA_BACKEND']);
  });
  it('kelas token lolos', () => {
    expect(
      kode(
        'src/komponen/A.tsx',
        '<div className="bg-daun-tua text-putih shadow-fokus text-keterangan" />',
      ),
    ).toEqual([]);
  });
  it('komentar tidak diperiksa', () => {
    expect(
      kode('src/komponen/A.tsx', '// warna desain #1E6B45\n/* bg-green-600 */\nconst a = 1;'),
    ).toEqual([]);
  });
});

describe('aturan bahasa', () => {
  it('menolak "Pembayaran DP berhasil" dan "HST 13" di src/teks', () => {
    expect(kode('src/teks/a.ts', "export const t = { a: 'Pembayaran DP berhasil' };")).toContain(
      'BAHASA',
    );
    expect(kode('src/teks/a.ts', "export const t = { a: 'HST 13' };")).toContain('BAHASA');
  });
  it('"HST" boleh di panel mentor saja; "DP" tetap ditolak di sana', () => {
    expect(kode('src/teks/panel.ts', "export const t = { a: 'HST mulai' };")).toEqual([]);
    expect(kode('src/halaman/mentor/A.tsx', '<th>HST selesai</th>')).toEqual([]);
    expect(kode('src/teks/panel.ts', "export const t = { a: 'Bayar DP' };")).toContain('BAHASA');
    expect(kode('src/halaman/beranda.tsx', '<p>HST 13</p>')).toContain('BAHASA');
  });
  it('menolak kata Inggris di teks JSX', () => {
    expect(kode('src/halaman/A.tsx', '<button>Submit</button>')).toContain('BAHASA');
    expect(kode('src/halaman/A.tsx', '<a aria-label="Dashboard pembeli" />')).toContain('BAHASA');
  });
  it('atribut kode tidak dianggap teks', () => {
    expect(kode('src/halaman/A.tsx', '<button type="submit">Simpan rencana</button>')).toEqual([]);
  });
  it('kata yang mengandung potongan terlarang tetap lolos', () => {
    expect(cekTeksTampil('Tugas berulang', daftar)).toEqual([]);
    expect(cekTeksTampil('Hari ke-13', daftar)).toEqual([]);
    expect(cekTeksTampil('CONTOH, belum divalidasi penyuluh', daftar)).toEqual([]);
  });
  it('huruf kapital semua ditolak', () => {
    expect(cekTeksTampil('SIMPAN RENCANA', daftar)).toContain('huruf kapital semua');
  });
});

describe('pembantu', () => {
  it('stringLiteral', () => {
    expect(stringLiteral('a(\'x\') + "y" + `z`').map((s) => s.isi)).toEqual(['x', 'y', 'z']);
  });
  it('teksJsx', () => {
    expect(teksJsx('<p>Halo kamu</p><i title="Judul" />').map((s) => s.isi)).toEqual([
      'Halo kamu',
      'Judul',
    ]);
  });
  it('buangKomentar menjaga nomor baris', () => {
    expect(buangKomentar('a\n/* x\ny */\nb').split('\n')).toHaveLength(4);
    expect(buangKomentar("const u = 'https://contoh';")).toContain('https://contoh');
  });
});
