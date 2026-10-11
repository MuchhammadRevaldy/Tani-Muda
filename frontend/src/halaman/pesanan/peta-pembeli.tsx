/**
 * Peta pembeli (papan 29 desktop): latar peta dari desain, lingkaran putus-putus = radius dari kebun,
 * titik bernomor = titik tengah desa antar (D-06, D-39; bukan alamat). Posisi dari `posisiPeta`.
 */
import type { TitikPeta } from '../../api/tipe';
import { Kartu } from '../../komponen/kartu';
import { posisiPeta } from '../../lib/pesanan-tampil';
import { teksPesanan as t } from '../../teks/pesanan';

/** Pusat dan jari-jari lingkaran radius di viewBox 400×280. */
const CX = 200;
const CY = 140;
const R = 120;

export function PetaPembeli({
  pusat,
  desa,
  radius,
  titik,
  dipilihId,
}: {
  pusat: TitikPeta;
  desa: string | null;
  radius: number;
  titik: { id: string; nomor: number; titik: TitikPeta | null }[];
  dipilihId: string | null;
}) {
  return (
    <Kartu judul={t.petaJudul} keterangan={t.petaKet(radius)}>
      <svg
        viewBox="0 0 400 280"
        role="img"
        aria-label={t.petaLabel(desa)}
        className="block h-auto w-full overflow-hidden rounded-md"
      >
        <rect width="400" height="280" className="fill-daun-lembut" />
        <path
          d="M0 60 C 80 40, 140 90, 220 70 S 340 30, 400 50 L 400 0 L 0 0 Z"
          className="fill-embun-pagi"
        />
        <path d="M260 280 C 280 230, 340 220, 400 230 L 400 280 Z" className="fill-embun-pagi" />
        <path d="M0 210 C 60 200, 90 240, 120 280 L 0 280 Z" className="fill-tanah-lembut" />
        <g fill="none" strokeLinecap="round" className="stroke-putih">
          <path d="M-10 120 C 90 110, 150 150, 230 130 S 350 100, 410 120" strokeWidth="10" />
          <path d="M150 -10 C 170 70, 200 120, 210 170 S 240 250, 250 290" strokeWidth="8" />
          <path d="M300 290 C 300 240, 320 190, 360 150 S 400 120, 410 110" strokeWidth="6" />
        </g>
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          strokeWidth="2"
          strokeDasharray="6 6"
          className="stroke-garis-kuat"
        />
        <circle cx={CX} cy={CY} r="11" strokeWidth="3" className="fill-tanah stroke-putih" />
        <text
          x={CX}
          y={CY + 34}
          textAnchor="middle"
          fontSize="18"
          fontWeight="600"
          strokeWidth="4"
          paintOrder="stroke"
          className="fill-teks stroke-putih"
        >
          {t.kebunmu}
        </text>
        {/* Titik terpilih digambar terakhir supaya tidak tertutup titik lain. */}
        {[...titik]
          .sort((a, b) => Number(a.id === dipilihId) - Number(b.id === dipilihId))
          .map((x) => {
            if (!x.titik) return null;
            const pos = posisiPeta(pusat, x.titik, radius);
            const dipilih = x.id === dipilihId;
            const cx = CX + pos.x * R;
            const cy = CY + pos.y * R;
            return (
              <g key={x.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="15"
                  strokeWidth="2.5"
                  className={dipilih ? 'fill-daun-tua stroke-putih' : 'fill-putih stroke-daun-tua'}
                />
                <text
                  x={cx}
                  y={cy + 6}
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="600"
                  className={dipilih ? 'fill-putih' : 'fill-daun-tua'}
                >
                  {x.nomor}
                </text>
              </g>
            );
          })}
      </svg>
    </Kartu>
  );
}
