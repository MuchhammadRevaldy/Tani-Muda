/**
 * Ilustrasi besar yang tertanam di papan desain: Masuk HP (papan 02 mobile), Masuk desktop (papan 02
 * desktop), dan Beranda kosong (papan 05). Disalin dari desain; warna memakai kelas token.
 */

const TUNAS = (
  <>
    <path d="M0 0V-10" fill="none" />
    <path d="M0-6C-3-11-9-12-12-10-10-6-4-4 0-6Z" />
    <path d="M0-9C3-14 9-15 12-13 10-9 4-7 0-9Z" />
  </>
);

/** Matahari terbit, garis tanah, dan lima tunas (358×132). */
export function IlustrasiMasukHp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 358 132"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={['block h-auto w-full', className].filter(Boolean).join(' ')}
    >
      <circle
        cx="262"
        cy="70"
        r="28"
        strokeWidth="2"
        className="fill-matahari-lembut stroke-matahari"
      />
      <path
        d="M262 30V20M234 42l-7-7M290 42l7-7M222 70h-10M302 70h10"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-matahari"
      />
      <rect x="0" y="71" width="358" height="61" className="fill-embun-pagi" />
      <path d="M8 70h342" strokeWidth="2" strokeLinecap="round" className="stroke-tanah" />
      <path
        d="M24 100c50-9 260-9 310 0"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-tanah"
      />
      <g
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="fill-daun-lembut stroke-daun-tua"
      >
        {[
          [70, 95],
          [130, 93],
          [190, 93],
          [250, 93],
          [306, 95],
        ].map(([x, y]) => (
          <g key={x} transform={`translate(${x} ${y})`}>
            {TUNAS}
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Tiga bedengan menuju matahari terbit (560×560). */
export function IlustrasiMasukLebar({ className }: { className?: string }) {
  const tunas: [number, number, number][] = [
    [226, 236, 0.7],
    [208, 290, 1.1],
    [180, 370, 1.6],
    [144, 480, 2.2],
    [280, 236, 0.7],
    [280, 290, 1.1],
    [280, 370, 1.6],
    [280, 480, 2.2],
    [334, 236, 0.7],
    [352, 290, 1.1],
    [380, 370, 1.6],
    [416, 480, 2.2],
  ];
  return (
    <svg
      viewBox="0 0 560 560"
      aria-hidden="true"
      focusable="false"
      className={['block h-auto w-full max-w-teks', className].filter(Boolean).join(' ')}
    >
      <circle
        cx="392"
        cy="196"
        r="58"
        strokeWidth="2.5"
        className="fill-matahari-lembut stroke-matahari"
      />
      <path
        d="M392 116V96M336 140l-14-14M448 140l14-14M316 196h-20M468 196h20"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="fill-none stroke-matahari"
      />
      <rect x="0" y="198" width="560" height="362" className="fill-daun-lembut" />
      <path d="M20 196h520" strokeWidth="2.5" strokeLinecap="round" className="stroke-tanah" />
      {[
        'M40 560L214 200h40L150 560Z',
        'M210 560L262 200h36L350 560Z',
        'M410 560L306 200h40L520 560Z',
      ].map((d) => (
        <path
          key={d}
          d={d}
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="fill-tanah-lembut stroke-tanah"
        />
      ))}
      <g
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="fill-putih stroke-daun-tua"
      >
        {tunas.map(([x, y, s]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0 0V-10" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M0-6C-3-11-9-12-12-10-10-6-4-4 0-6Z" vectorEffect="non-scaling-stroke" />
            <path d="M0-9C3-14 9-15 12-13 10-9 4-7 0-9Z" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Bungkus benih, bedengan, dan matahari untuk Beranda tanpa siklus (220×140). */
export function IlustrasiKebunKosong({ className }: { className?: string }) {
  return (
    <svg
      width="220"
      height="140"
      viewBox="0 0 220 140"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle
        cx="178"
        cy="34"
        r="16"
        strokeWidth="2"
        className="fill-matahari-lembut stroke-matahari"
      />
      <path
        d="M178 8v-4M200 34h4M194 18l3-3M162 18l-3-3"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-matahari"
      />
      <path
        d="M22 116c30-24 146-24 176 0Z"
        strokeWidth="2"
        strokeLinejoin="round"
        className="fill-tanah-lembut stroke-tanah"
      />
      <path d="M10 116h200" strokeWidth="2" strokeLinecap="round" className="stroke-tanah" />
      <path
        d="M70 106h.01M100 102h.01M130 102h.01M160 106h.01"
        strokeWidth="5"
        strokeLinecap="round"
        className="stroke-tanah"
      />
      <rect
        x="36"
        y="28"
        width="44"
        height="56"
        rx="4"
        strokeWidth="2"
        className="fill-putih stroke-daun-tua"
      />
      <path d="M36 38h44" strokeWidth="2" className="stroke-daun-tua" />
      <g
        transform="translate(58 74)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-daun-tua"
      >
        <path d="M0 0V-14" fill="none" />
        <path d="M0-8C-4-15-12-17-17-14-14-8-6-6 0-8Z" className="fill-daun-lembut" />
        <path d="M0-12C4-20 12-21 17-18 14-12 6-10 0-12Z" className="fill-daun-lembut" />
      </g>
    </svg>
  );
}

/** Pin lokasi di atas pot dan busur radius putus-putus (papan 30, 220×140). */
export function IlustrasiPesananKosong({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 140"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={['block h-auto w-full', className].filter(Boolean).join(' ')}
    >
      <path
        d="M110 14c-13 0-22 10-22 22 0 16 22 36 22 36s22-20 22-36c0-12-9-22-22-22Z"
        strokeWidth="2"
        strokeLinejoin="round"
        className="fill-putih stroke-daun-tua"
      />
      <circle cx="110" cy="36" r="7" strokeWidth="2" className="fill-daun-lembut stroke-daun-tua" />
      <path
        d="M60 84h100l-8 40H68Z"
        strokeWidth="2"
        strokeLinejoin="round"
        className="fill-tanah-lembut stroke-tanah"
      />
      <path
        d="M66 98h88M70 112h80M20 124h180"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-tanah"
      />
      <path
        d="M36 70a74 74 0 0 1 148 0"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 8"
        className="stroke-garis-kuat"
      />
    </svg>
  );
}
