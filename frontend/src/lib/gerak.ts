/**
 * Sakelar animasi (D-61, [AG-23]). SVG beranimasi di <img> (sawi hero, tunas memuat) tidak bisa membaca
 * kelas di <html>, jadi saat animasi mati komponen memakai versi diam. prefers-reduced-motion
 * ditangani SVG itu sendiri.
 */
export function animasiMati(): boolean {
  return (
    typeof document !== 'undefined' && document.documentElement.classList.contains('tanpa-animasi')
  );
}
