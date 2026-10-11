/**
 * Label "Mode demo" yang selalu terlihat di build demo (`npm run build:demo`, D-48), sekaligus
 * jalan pintas ke pemilih akun demo untuk peraga. Dimuat hanya bila MODE = "demo", sehingga tidak
 * ikut build produksi (dicek scripts/cek-build.mjs).
 * Selama terpasang, <html> diberi kelas `ada-label-demo`: konten dan kaki halaman mendapat ruang
 * kosong setinggi label, dan di HP label naik ke atas navigasi bawah bila ada (index.css, D-49).
 */
import { useEffect } from 'react';
import { teksDemo as t } from '../teks/demo';

export default function LabelModeDemo() {
  useEffect(() => {
    document.documentElement.classList.add('ada-label-demo');
    return () => document.documentElement.classList.remove('ada-label-demo');
  }, []);
  return (
    <a
      href="/akun-demo"
      aria-label={t.labelAria}
      title={t.labelAria}
      className="label-mode-demo fokus-cincin fixed bottom-3 right-3 z-50 inline-flex min-h-sentuh items-center gap-2 rounded-full border-1.5 border-matahari bg-matahari-lembut px-4 font-semibold text-matahari-teks no-underline lg:bottom-4 lg:right-4"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-matahari" aria-hidden="true" />
      {t.label}
    </a>
  );
}
