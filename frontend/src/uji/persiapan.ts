import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

/**
 * Persiapan tes komponen dan halaman (jsdom). Tiga sumber hasil yang berubah-ubah dikunci di sini:
 *
 * 1. Jam. Data contoh klien tiruan dibuat relatif terhadap "sekarang", dan halaman membaca tanggal
 *    serta jam dari Date. Tanpa kunci, hasil tes bisa bergantung pada jam saat tes dijalankan (batas
 *    periksa kiriman 13.00, salam, pergantian hari, selisih UTC dan WIB). Date dipalsukan ke
 *    WAKTU_UJI (Senin 5 Oktober 2026 pukul 08.00 WIB, sama dengan tes kontrak API) dan tetap berjalan
 *    supaya penantian dan pewaktu biasa bekerja. UJI_WAKTU (ISO) menggantinya untuk menyapu jam lain.
 * 2. Penyimpanan peramban. localStorage dan sessionStorage dikosongkan sebelum setiap tes, jadi tidak
 *    ada keadaan yang terbawa dari tes sebelumnya atau dari urutan tes.
 * 3. Beban mesin. Batas tunggu findBy/waitFor dinaikkan dari 1 detik ke 5 detik; penantian selesai
 *    begitu kondisinya terpenuhi, jadi tes tidak melambat, hanya tidak gagal saat mesin sibuk
 *    (mis. coverage atau peramban lain berjalan).
 */
export const WAKTU_UJI = '2026-10-05T01:00:00.000Z';
const waktu = process.env.UJI_WAKTU ?? WAKTU_UJI;

configure({ asyncUtilTimeout: 5000 });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date(waktu), shouldAdvanceTime: true });
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  // Juga memulihkan pewaktu palsu tes yang gagal sebelum sempat memanggil useRealTimers.
  vi.useRealTimers();
});
