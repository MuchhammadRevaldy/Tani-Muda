/**
 * Daftar video modul asli (D-44) yang ditulis `npm run pasang-video`: setiap entri menunjuk modul
 * yang ada dan berkas MP4 yang ada di public/video/modul/, dalam batas ukuran konfigurasi.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { buatKlienTiruan } from '../klien-tiruan';
import konfigurasi from '@data-contoh/konfigurasi.json';
import modul from '@data-contoh/modul.json';
import videoModul from '@data-contoh/video-modul.json';

const daftar: Record<string, { berkas: string; ukuran_mb: number }> = videoModul;

describe('video modul asli', () => {
  it('setiap entri menunjuk modul yang ada dan berkas yang ada', () => {
    const id = new Set(modul.map((m) => m.id));
    for (const [modulId, v] of Object.entries(daftar)) {
      expect(id.has(modulId), modulId).toBe(true);
      expect(v.berkas).toBe(`${modulId}.mp4`);
      expect(existsSync(join(process.cwd(), 'public', 'video', 'modul', v.berkas)), v.berkas).toBe(
        true,
      );
      expect(v.ukuran_mb).toBeLessThanOrEqual(konfigurasi.batas_video_mb);
    }
  });

  it('klien tiruan memakai video asli menggantikan video contoh', async () => {
    vi.resetModules();
    vi.doMock('@data-contoh/video-modul.json', () => ({
      default: { 'modul-sawi-bedengan-4': { berkas: 'modul-sawi-bedengan-4.mp4', ukuran_mb: 4.2 } },
    }));
    const { buatKlienTiruan: buat } = await import('../klien-tiruan');
    const t = buat({ tampilkanResepContoh: true, kv: null });
    await t.kontrol.masukSebagai('petani-arif');
    expect(await t.klien.belajar.ambilModul('modul-sawi-bedengan-4')).toMatchObject({
      video_url: '/video/modul/modul-sawi-bedengan-4.mp4',
      ukuran_video_mb: 4.2,
    });
    // Modul lain tetap memakai data contoh.
    expect((await t.klien.belajar.ambilModul('modul-sawi-bedengan-2')).video_url).toBe(
      '/video/contoh/semai-sawi.webm',
    );
    vi.doUnmock('@data-contoh/video-modul.json');
    vi.resetModules();
    // Tanpa video asli: modul tanpa video tetap kosong.
    const t2 = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
    await t2.kontrol.masukSebagai('petani-arif');
    expect((await t2.klien.belajar.ambilModul('modul-sawi-bedengan-4')).video_url).toBeNull();
  });
});
