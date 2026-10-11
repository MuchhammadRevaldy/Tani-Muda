/**
 * Grafik mini 7 pengukuran terakhir (papan 23–25): garis dan titik, pita rentang normal, titik
 * terakhir berwarna status. Posisi dari `titikGrafik` (src/lib/pengukuran.ts). Warna lewat kelas token.
 */
import type { Grafik } from '../lib/pengukuran';
import type { StatusPengukuran } from '../api/tipe';

const LEBAR = 300;
const TINGGI = 120;
const TEPI = 10;

const WARNA: Record<StatusPengukuran, string> = {
  normal: 'stroke-daun-tua',
  'terlalu-tinggi': 'stroke-matahari',
  'terlalu-rendah': 'stroke-tomat',
  kosong: 'stroke-garis-kuat',
};

export function GrafikMini({ grafik, label }: { grafik: Grafik; label: string }) {
  const n = grafik.titik.length;
  const x = (i: number) => (n <= 1 ? LEBAR / 2 : TEPI + (i * (LEBAR - 2 * TEPI)) / (n - 1));
  const y = (v: number) => TINGGI - TEPI - v * (TINGGI - 2 * TEPI);
  const terakhir = grafik.titik[n - 1];
  return (
    <svg
      viewBox={`0 0 ${LEBAR} ${TINGGI}`}
      role="img"
      aria-label={label}
      className="block h-auto w-full rounded-md bg-embun-pagi"
    >
      <rect
        x="0"
        width={LEBAR}
        y={y(grafik.pita.atas)}
        height={Math.max(0, y(grafik.pita.bawah) - y(grafik.pita.atas))}
        className="fill-daun-lembut"
      />
      {n > 1 ? (
        <polyline
          points={grafik.titik.map((t, i) => `${x(i)},${y(t.y)}`).join(' ')}
          fill="none"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="stroke-teks"
        />
      ) : null}
      {grafik.titik.slice(0, -1).map((t, i) => (
        <circle key={i} cx={x(i)} cy={y(t.y)} r="4" className="fill-teks" />
      ))}
      {terakhir ? (
        <circle
          cx={x(n - 1)}
          cy={y(terakhir.y)}
          r="6"
          strokeWidth="3"
          className={`fill-putih ${WARNA[terakhir.status]}`}
        />
      ) : null}
    </svg>
  );
}
