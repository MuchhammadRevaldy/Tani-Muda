/**
 * Layar memuat muat pertama [AG-55] ada di index.html (SVG dan CSS sebaris) supaya tampil sebelum
 * bundel JavaScript selesai. Begitu aplikasi siap, layar itu memudar lalu dihapus. Bila aplikasi
 * siap lebih cepat, layar tetap terlihat sampai sekitar 0,8 detik sejak halaman dibuka supaya
 * animasinya terbaca, tidak lebih lama dari itu. Pindah halaman tidak memunculkannya lagi.
 */
const TAMPIL_MINIMAL_MS = 800;
const LAMA_PUDAR_MS = 300;

export function tutupLayarMemuat(): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('layar-memuat');
  if (!el) return;
  const geraknyaDikurangi =
    document.documentElement.classList.contains('tanpa-animasi') ||
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (geraknyaDikurangi) {
    el.remove();
    return;
  }
  const sisa = Math.max(0, TAMPIL_MINIMAL_MS - performance.now());
  window.setTimeout(() => {
    el.classList.add('pudar');
    window.setTimeout(() => el.remove(), LAMA_PUDAR_MS);
  }, sisa);
}
