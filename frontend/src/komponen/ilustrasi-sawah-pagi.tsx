/**
 * Ilustrasi sawah pagi (panel kanan halaman Masuk) sebagai SVG sebaris [AG-57]. Sumbernya
 * src/aset/ilustrasi/sawah-pagi.svg (dulu public/ilustrasi/ilustrasi-masuk.svg) dengan setiap aset
 * dikelompokkan (kelas `sp-*`), sehingga tiap aset bisa dianimasikan tanpa mengubah tampilan akhir:
 * langit memudar, matahari terbit dari balik bukit lalu berdenyut, awan masuk dari kiri dan kanan
 * lalu melayang, bukit naik, bedengan terbentang, bibit muncul per baris dari depan, tanaman depan
 * tumbuh lalu bergoyang. Urutan sekitar 2 detik (src/index.css, `.sawah-pagi`).
 *
 * Gerak yang berulang dijeda saat tab tidak terlihat. Semua gerak mati bila gerak dikurangi atau
 * VITE_ANIMASI=mati (keadaan akhir diam).
 */
import { useEffect, useRef } from 'react';
import mentah from '../aset/ilustrasi/sawah-pagi.svg?raw';
import { cx } from './gabung-kelas';

// Peran dan label diberikan pembungkus; SVG di dalamnya hanya gambar yang mengisi panel (cover).
const SVG = mentah
  .replace(' role="img" aria-label="Kebun sayur di pagi hari"', ' aria-hidden="true" focusable="false"')
  .replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" class="block h-full w-full" ');

export function IlustrasiSawahPagi({ label, className }: { label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const perbarui = () => el.classList.toggle('jeda', document.hidden);
    perbarui();
    document.addEventListener('visibilitychange', perbarui);
    return () => document.removeEventListener('visibilitychange', perbarui);
  }, []);
  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className={cx('sawah-pagi', className)}
      // Isi dari berkas SVG milik proyek sendiri (bukan masukan pengguna).
      dangerouslySetInnerHTML={{ __html: SVG }}
    />
  );
}
