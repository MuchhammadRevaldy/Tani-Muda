import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buangKomentar, cekTeksTampil, periksaBerkas, stringLiteral, teksJsx } from './aturan.mjs';

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
  it('menolak service role', () => {
    expect(
      kode('src/data/x.ts', 'const k = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;'),
    ).toContain('SERVICE_ROLE');
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
