/**
 * Label "Mode demo" yang selalu terlihat di build demo (`npm run build:demo`, D-48), sekaligus
 * jalan pintas ke pemilih akun demo untuk peraga. Dimuat hanya bila MODE = "demo", sehingga tidak
 * ikut build produksi (dicek scripts/cek-build.mjs). Di HP diletakkan di atas navigasi bawah.
 */
import { teksDemo as t } from '../teks/demo';

export default function LabelModeDemo() {
  return (
    <a
      href="/akun-demo"
      aria-label={t.labelAria}
      title={t.labelAria}
      className="fokus-cincin fixed bottom-24 right-3 z-50 inline-flex min-h-sentuh items-center gap-2 rounded-full border-1.5 border-matahari bg-matahari-lembut px-4 font-semibold text-matahari-teks no-underline lg:bottom-4 lg:right-4"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-matahari" aria-hidden="true" />
      {t.label}
    </a>
  );
}
