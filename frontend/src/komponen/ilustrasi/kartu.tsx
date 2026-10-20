/**
 * Ilustrasi kartu halaman depan [AG-58]: gambar vektor kecil di atas blob organik berwarna lembut.
 * Gayanya mengikuti aset hero: gradasi daun, bayangan halus di bawah, tanpa garis tepi tebal, dan
 * sedikit keluar dari tepi blob supaya terasa berlapis. Semua warna dari token (kelas `fill-*`;
 * gradasi lewat `stop-color` dari token). Dibuat sendiri, bukan gambar buatan AI.
 *
 * Bagian yang bergerak saat kartu disorot, difokus, atau diketuk punya kelas `ilu-*` (gerak di
 * src/index.css, dipicu kelas `pemicu-ilu` pada kartunya): blob berputar dan membesar pelan, tanda
 * tanya bergoyang, koin jatuh menumpuk, daun layu tegak kembali, panah harga menjadi stabil, video
 * berdenyut, gembor meneteskan air, peti terangkat.
 */
import { useId, type ReactNode } from 'react';
import { cx } from '../gabung-kelas';

export type JenisIlustrasiKartu =
  | 'pengetahuan'
  | 'modal'
  | 'jadwal'
  | 'pasar'
  | 'belajar'
  | 'hitung'
  | 'rawat'
  | 'jual';

export type WarnaBlob = 'daun' | 'matahari' | 'tanah';

const ISI_BLOB: Record<WarnaBlob, string> = {
  daun: 'fill-daun-lembut',
  matahari: 'fill-matahari-lembut',
  tanah: 'fill-tanah-lembut',
};

/** Empat bentuk blob tidak simetris dengan gaya yang sama (viewBox 140). */
const BLOB = [
  'M70 12C98 10 126 30 128 62C130 94 110 124 76 128C44 132 14 112 12 80C10 46 38 14 70 12Z',
  'M64 14C94 6 128 26 130 58C132 88 116 122 82 128C50 134 16 118 12 86C8 54 30 22 64 14Z',
  'M74 10C104 14 128 40 126 70C124 102 98 130 66 128C34 126 10 100 14 68C18 36 44 6 74 10Z',
  'M60 16C90 4 124 22 130 54C136 86 112 124 78 128C44 132 12 116 10 82C8 50 30 28 60 16Z',
];

/** Kelas stop-color dari token (string utuh supaya terbaca Tailwind). */
const STOP = {
  'limau-terang': '[stop-color:theme(colors.limau-terang)]',
  limau: '[stop-color:theme(colors.limau)]',
  'limau-tekan': '[stop-color:theme(colors.limau-tekan)]',
  daun: '[stop-color:theme(colors.daun)]',
  matahari: '[stop-color:theme(colors.matahari)]',
  'matahari-teks': '[stop-color:theme(colors.matahari-teks)]',
  oranye: '[stop-color:theme(colors.oranye)]',
  'oranye-terang': '[stop-color:theme(colors.oranye-terang)]',
  tanah: '[stop-color:theme(colors.tanah)]',
  teks: '[stop-color:theme(colors.teks)]',
  'teks-pendukung': '[stop-color:theme(colors.teks-pendukung)]',
  'garis-kuat': '[stop-color:theme(colors.garis-kuat)]',
  putih: '[stop-color:theme(colors.putih)]',
  'daun-lembut': '[stop-color:theme(colors.daun-lembut)]',
  'teks-redup': '[stop-color:theme(colors.teks-redup)]',
} as const;
type Warna = keyof typeof STOP;

function Gradasi({ id, atas, bawah }: { id: string; atas: Warna; bawah: Warna }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" className={STOP[atas]} />
      <stop offset="1" className={STOP[bawah]} />
    </linearGradient>
  );
}

/** Bayangan lembut di bawah gambar. */
const Bayang = ({ cx: x, cy, rx }: { cx: number; cy: number; rx: number }) => (
  <ellipse cx={x} cy={cy} rx={rx} ry={rx * 0.16} className="fill-teks" opacity={0.12} />
);

/** Daun bergradasi dengan urat tipis, berpangkal di (0,0) dan mengarah ke atas. */
const Daun = ({ g, s = 1 }: { g: string; s?: number }) => (
  <g transform={`scale(${s})`}>
    <path d="M0 0C-9-6-10-22 0-34C10-22 9-6 0 0Z" fill={`url(#${g})`} />
    <path d="M0-3C0-12 0-20 0-29" className="stroke-putih" strokeOpacity={0.55} strokeWidth={1.4} fill="none" strokeLinecap="round" />
  </g>
);

/** Tanda tanya dalam gelembung putih. */
const GelembungTanya = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <g className="ilu-tanya">
      <path d="M-15-14H15A9 9 0 0 1 24-5V7A9 9 0 0 1 15 16H-2L-9 23L-8 16H-15A9 9 0 0 1-24 7V-5A9 9 0 0 1-15-14Z" className="fill-putih" />
      <path d="M-4-4C-4-9 4-10 4-4C4 0-1 0-1 5" className="stroke-oranye" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <circle cx={-1} cy={10.5} r={2} className="fill-oranye" />
    </g>
  </g>
);

/** Tumpukan koin; `ilu-koin` jatuh dan menumpuk saat dipicu. */
const Koin = ({ x, y, n = 3 }: { x: number; y: number; n?: number }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: n }, (_, i) => (
      <g key={i} transform={`translate(0 ${-i * 7})`}>
        <g className="ilu-koin" style={{ animationDelay: `${(n - 1 - i) * 80}ms` }}>
          <ellipse cx={0} cy={3} rx={13} ry={5} className="fill-matahari-teks" />
          <ellipse cx={0} cy={0} rx={13} ry={5} className="fill-matahari" />
          <ellipse cx={-3} cy={-1} rx={5} ry={1.6} className="fill-putih" opacity={0.5} />
        </g>
      </g>
    ))}
  </g>
);

function Gambar({ jenis, id }: { jenis: JenisIlustrasiKartu; id: string }): ReactNode {
  const g = (n: string) => `${id}-${n}`;
  const defsDaun = <Gradasi id={g('daun')} atas="limau-terang" bawah="limau-tekan" />;
  switch (jenis) {
    case 'pengetahuan':
      return (
        <>
          <defs>
            {defsDaun}
            <Gradasi id={g('layar')} atas="daun-lembut" bawah="putih" />
          </defs>
          <Bayang cx={70} cy={120} rx={36} />
          <rect x={46} y={34} width={46} height={82} rx={9} className="fill-teks" />
          <rect x={50} y={42} width={38} height={62} rx={4} fill={`url(#${g('layar')})`} />
          <rect x={56} y={52} width={26} height={4} rx={2} className="fill-garis-kuat" opacity={0.6} />
          <rect x={56} y={61} width={18} height={4} rx={2} className="fill-garis-kuat" opacity={0.4} />
          <rect x={64} y={108} width={10} height={3} rx={1.5} className="fill-teks-pendukung" />
          <g transform="translate(30 118)">
            <path d="M0 0V-16" className="stroke-daun" strokeWidth={2.4} strokeLinecap="round" />
            <g transform="translate(0 -12) rotate(-40)">
              <Daun g={g('daun')} s={0.55} />
            </g>
            <g transform="translate(0 -15) rotate(38)">
              <Daun g={g('daun')} s={0.6} />
            </g>
          </g>
          <GelembungTanya x={104} y={26} />
        </>
      );
    case 'modal':
      return (
        <>
          <defs>
            <Gradasi id={g('karung')} atas="oranye-terang" bawah="tanah" />
          </defs>
          <Bayang cx={66} cy={122} rx={44} />
          <path d="M34 54C32 46 40 40 48 44L74 44C82 40 90 46 88 54C98 72 98 104 86 116C72 122 50 122 36 116C24 104 24 72 34 54Z" fill={`url(#${g('karung')})`} />
          <path d="M40 48C48 52 74 52 82 48" className="stroke-tanah" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M48 44C50 36 56 32 61 34C66 32 72 36 74 44" className="fill-matahari-teks" />
          <circle cx={52} cy={80} r={2.2} className="fill-putih" opacity={0.55} />
          <circle cx={61} cy={86} r={2.2} className="fill-putih" opacity={0.55} />
          <circle cx={56} cy={95} r={2.2} className="fill-putih" opacity={0.55} />
          <Koin x={104} y={114} n={4} />
          <GelembungTanya x={108} y={52} />
        </>
      );
    case 'jadwal':
      return (
        <>
          <defs>{defsDaun}</defs>
          <Bayang cx={66} cy={120} rx={40} />
          <rect x={26} y={36} width={78} height={78} rx={10} className="fill-putih" />
          <path d="M26 46A10 10 0 0 1 36 36H94A10 10 0 0 1 104 46V56H26Z" className="fill-tomat" />
          <rect x={42} y={28} width={6} height={16} rx={3} className="fill-teks" />
          <rect x={82} y={28} width={6} height={16} rx={3} className="fill-teks" />
          {[0, 1, 2, 3].map((c) =>
            [0, 1, 2].map((r) => (
              <rect
                key={`${c}-${r}`}
                x={36 + c * 16}
                y={64 + r * 15}
                width={10}
                height={8}
                rx={2}
                className={c === 2 && r === 1 ? 'fill-oranye' : 'fill-garis'}
              />
            )),
          )}
          {/* Daun layu: tegak kembali saat dipicu. */}
          <g transform="translate(112 120)">
            <path d="M0 0V-10" className="stroke-daun" strokeWidth={2.4} strokeLinecap="round" />
            <g transform="translate(0 -10)">
              <g className="ilu-layu">
                <path d="M0 0V-14" className="stroke-daun" strokeWidth={2.4} strokeLinecap="round" />
                <g transform="translate(0 -12)">
                  <Daun g={g('daun')} s={0.7} />
                </g>
              </g>
            </g>
          </g>
        </>
      );
    case 'pasar':
      return (
        <>
          <defs>
            {defsDaun}
            <Gradasi id={g('keranjang')} atas="matahari" bawah="matahari-teks" />
          </defs>
          <Bayang cx={64} cy={122} rx={42} />
          <g transform="translate(44 76) rotate(-24)">
            <Daun g={g('daun')} s={1.1} />
          </g>
          <g transform="translate(60 72)">
            <Daun g={g('daun')} s={1.2} />
          </g>
          <circle cx={78} cy={70} r={12} className="fill-tomat" />
          <path d="M74 60C77 62 80 62 83 60" className="stroke-daun" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <path d="M26 76H102L94 114C93 118 90 120 86 120H42C38 120 35 118 34 114Z" fill={`url(#${g('keranjang')})`} />
          <path d="M30 88H98M33 100H95" className="stroke-matahari-teks" strokeOpacity={0.45} strokeWidth={3} />
          {/* Panah harga: naik-turun saat diam, menjadi stabil saat dipicu. */}
          <g transform="translate(96 22)">
            <path className="ilu-panah-goyah stroke-oranye" d="M-12 18L-4 6L4 16L14 0" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path className="ilu-panah-goyah fill-oranye" d="M14 0L4 1L13 9Z" />
            <path className="ilu-panah-stabil stroke-daun" d="M-12 10H12" strokeWidth={4} fill="none" strokeLinecap="round" />
            <path className="ilu-panah-stabil fill-daun" d="M17 10L9 4V16Z" />
          </g>
        </>
      );
    case 'belajar':
      return (
        <>
          <defs>
            {defsDaun}
            <Gradasi id={g('layar')} atas="daun-lembut" bawah="putih" />
          </defs>
          <Bayang cx={70} cy={120} rx={46} />
          <rect x={22} y={40} width={96} height={64} rx={10} className="fill-teks" />
          <rect x={28} y={46} width={84} height={52} rx={5} fill={`url(#${g('layar')})`} />
          <path d="M36 92C56 86 84 86 104 92" className="stroke-tanah" strokeOpacity={0.5} strokeWidth={3} fill="none" strokeLinecap="round" />
          <g transform="translate(46 90)">
            <g transform="rotate(-30)">
              <Daun g={g('daun')} s={0.75} />
            </g>
            <g transform="rotate(26)">
              <Daun g={g('daun')} s={0.85} />
            </g>
          </g>
          <g transform="translate(82 70)">
            <g className="ilu-video">
              <circle r={14} className="fill-putih" />
              <path d="M-4-7L8 0L-4 7Z" className="fill-oranye" />
            </g>
          </g>
        </>
      );
    case 'hitung':
      return (
        <>
          <Bayang cx={66} cy={122} rx={42} />
          <rect x={30} y={22} width={58} height={94} rx={10} className="fill-teks" />
          <rect x={37} y={30} width={44} height={20} rx={4} className="fill-daun-lembut" />
          <rect x={60} y={38} width={16} height={5} rx={2} className="fill-daun" />
          {[0, 1, 2].map((c) =>
            [0, 1, 2, 3].map((r) => (
              <rect
                key={`${c}-${r}`}
                x={37 + c * 16}
                y={58 + r * 14}
                width={12}
                height={10}
                rx={3}
                className={c === 2 && r === 3 ? 'fill-limau' : 'fill-putih'}
                opacity={c === 2 && r === 3 ? 1 : 0.85}
              />
            )),
          )}
          <Koin x={106} y={114} n={3} />
        </>
      );
    case 'rawat':
      return (
        <>
          <defs>
            {defsDaun}
            <Gradasi id={g('gembor')} atas="teks-redup" bawah="teks-pendukung" />
          </defs>
          <Bayang cx={66} cy={122} rx={44} />
          <path d="M24 120C30 106 58 104 66 120Z" className="fill-tanah" />
          <g transform="translate(45 112)">
            <path d="M0 0V-26" className="stroke-daun" strokeWidth={3} strokeLinecap="round" />
            <g transform="translate(0 -18) rotate(-42)">
              <Daun g={g('daun')} s={0.9} />
            </g>
            <g transform="translate(0 -24) rotate(36)">
              <Daun g={g('daun')} s={1} />
            </g>
          </g>
          <g transform="translate(96 54) rotate(-14)">
            <path d="M-18-6H14A4 4 0 0 1 18-2V20A6 6 0 0 1 12 26H-12A6 6 0 0 1-18 20Z" fill={`url(#${g('gembor')})`} />
            <path d="M-18 2L-38 -8L-36 -12L-16 -4Z" fill={`url(#${g('gembor')})`} />
            <ellipse cx={-38} cy={-10} rx={4} ry={6} transform="rotate(30 -38 -10)" className="fill-teks-pendukung" />
            <path d="M14 0C26 0 26 18 14 18" className="stroke-teks-pendukung" strokeWidth={4} fill="none" />
          </g>
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className="ilu-tetes fill-teks-redup"
              style={{ animationDelay: `${i * 200}ms` }}
              d={`M${58 + i * 7} ${56 + i * 4}c-2 3-3 5-3 6a3 3 0 0 0 6 0c0-1-1-3-3-6Z`}
            />
          ))}
        </>
      );
    case 'jual':
      return (
        <>
          <defs>
            {defsDaun}
            <Gradasi id={g('kayu')} atas="matahari" bawah="matahari-teks" />
          </defs>
          <Bayang cx={70} cy={122} rx={48} />
          <g className="ilu-peti">
            <g transform="translate(46 70) rotate(-28)">
              <Daun g={g('daun')} s={1.15} />
            </g>
            <g transform="translate(62 66)">
              <Daun g={g('daun')} s={1.3} />
            </g>
            <circle cx={84} cy={64} r={12} className="fill-tomat" />
            <path d="M96 66C104 54 114 52 118 56C112 60 104 66 96 66Z" className="fill-oranye" />
            <rect x={24} y={70} width={92} height={46} rx={5} fill={`url(#${g('kayu')})`} />
            <path d="M24 86H116M24 101H116" className="stroke-matahari-teks" strokeOpacity={0.5} strokeWidth={3} />
            <rect x={30} y={76} width={6} height={36} rx={2} className="fill-matahari-teks" opacity={0.4} />
            <rect x={104} y={76} width={6} height={36} rx={2} className="fill-matahari-teks" opacity={0.4} />
          </g>
        </>
      );
  }
}

/**
 * Ilustrasi berlatar blob. `alas` = blob kedua berwarna latar bagian di bawahnya (tidak ikut
 * meredup), supaya garis penghubung Siklus tetap tertutup. `blobJawaban` = blob daun-lembut yang
 * memudar masuk saat jawaban kartu Masalah muncul.
 */
export function IlustrasiKartu({
  jenis,
  warna,
  bentuk = 0,
  alas,
  blobJawaban,
  className,
}: {
  jenis: JenisIlustrasiKartu;
  warna: WarnaBlob;
  bentuk?: number;
  alas?: 'embun' | 'putih';
  blobJawaban?: boolean;
  className?: string;
}) {
  const id = useId().replace(/:/g, '');
  const d = BLOB[bentuk % BLOB.length] ?? BLOB[0];
  return (
    <svg viewBox="0 0 140 140" aria-hidden="true" focusable="false" className={cx('block overflow-visible', className)}>
      {alas ? <path d={d} className={alas === 'embun' ? 'fill-embun-pagi' : 'fill-putih'} /> : null}
      <g className="ilu-isi">
        <g className="ilu-blob">
          <path d={d} className={ISI_BLOB[warna]} />
          {blobJawaban ? <path d={d} className="ilu-blob-jawaban fill-daun-lembut" /> : null}
        </g>
        <Gambar jenis={jenis} id={id} />
      </g>
    </svg>
  );
}
