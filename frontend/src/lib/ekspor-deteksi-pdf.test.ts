import { describe, expect, it } from 'vitest';
import { buatPdfDeteksiBytes, type DataLaporanDeteksi } from './ekspor-deteksi-pdf';

describe('ekspor-deteksi-pdf', () => {
  it('menghasilkan berkas PDF yang valid dengan penanda standar PDF-1.4', () => {
    const contoh: DataLaporanDeteksi = {
      id: 'deteksi-uji-01',
      dibuat_pada: '2026-10-18T10:00:00.000000Z',
      hasil: {
        dugaan: [
          {
            nama: 'Serangan hama ulat (Lepidoptera)',
            keyakinan: 'tinggi',
            alasan: 'Daun berlubang dan jaringan rusak menyisakan tulang daun.',
          },
          {
            nama: 'Kerusakan sekunder',
            keyakinan: 'sedang',
            alasan: 'Bercak kuning di tepi daun.',
          },
        ],
        gejala_terlihat: ['Daun berlubang', 'Ujung daun mengering'],
        langkah_aman: ['Pangkas daun yang terinfeksi parah', 'Jaga sanitasi kebun'],
        perlu_penyuluh: true,
        catatan: 'Observasi berkala.',
      },
    };

    const bytes = buatPdfDeteksiBytes(contoh, 'daun berlubang');
    const teks = new TextDecoder('utf-8').decode(bytes);

    expect(bytes.length).toBeGreaterThan(500);
    expect(teks.startsWith('%PDF-1.4')).toBe(true);
    expect(teks.includes('%%EOF')).toBe(true);
    expect(teks.includes('TANI MUDA')).toBe(true);
    expect(teks.includes('Serangan hama ulat')).toBe(true);
    expect(teks.includes('Keyakinan: TINGGI')).toBe(true);
  });
});
