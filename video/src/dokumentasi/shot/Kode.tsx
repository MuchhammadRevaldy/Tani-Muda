import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ayun, EASE, maju, pegas } from '../../v2/gerak';
import { HURUF, W } from '../../v2/tema';
import { DATA, hariKe, tgl } from '../data';
import { Gores, IsiLayar, Judul, Keterangan, Laptop, PanggungDok, TeksKecil, jalurGarisBawah } from '../dasar';

/** Adegan Coding [AG-52]: IDE, grafik commit, daftar commit dan tag. */

const MONO = "Consolas, 'Cascadia Mono', monospace";

export const S17: React.FC<{ d: number }> = ({ d }) => (
  <PanggungDok durasi={d} latar="kota" dari={{ zoom: 1.02, x: -20 }} ke={{ zoom: 1.07, x: 30 }} aksen={['daun', null, null, 'koin', null, null, 'benih']}>
    {() => (
      <>
        <Judul frasa="Kode ditulis di IDE" mulai={4} top={40} ukuran={80} sorot={['IDE']} />
        <Laptop x={440} y={175} lebar={1000} rasio={1516 / 1078} miring={7}>
          <IsiLayar
            src="dokumentasi/ide.png"
            lebarGambar={1516}
            tinggiGambar={1078}
            lebar={1000}
            tinggi={1000 / (1516 / 1078)}
            titik={[
              { f: 0, x: 0.5, y: 0.5, zoom: 1 },
              { f: 30, x: 0.47, y: 0.2, zoom: 1.9 },
              { f: 90, x: 0.47, y: 0.22, zoom: 1.9 },
              { f: 120, x: 0.55, y: 0.86, zoom: 1.8 },
              { f: d, x: 0.58, y: 0.88, zoom: 1.95 },
            ]}
            sorot={[
              { x: 500, y: 150, w: 360, h: 148, f: 40 },
              { x: 462, y: 808, w: 690, h: 222, f: 122 },
            ]}
          />
        </Laptop>
        <Keterangan>Tangkapan layar pemilik, layar-pengguna/IDE.png · jam di terminal 19 Okt 2026, 23.58</Keterangan>
      </>
    )}
  </PanggungDok>
);

export const S18: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const hari = DATA.git.perHari;
  const maks = DATA.git.puncak.jumlah;
  const iPuncak = hariKe(DATA.git.puncak.tanggal);
  const kiri = 330;
  const jarak = 88;
  const dasar = 840;
  const tinggiMaks = 540;
  const naik = hari.map((_, i) => pegas(frame, 8 + i * 5, i % 2 ? 'pantul' : 'lembut'));
  const total = Math.round(hari.reduce((s, h, i) => s + h.jumlah * Math.min(1, naik[i]), 0));
  const pPuncak = maju(frame, 100, 20, EASE.keluar);
  const xp = kiri + iPuncak * jarak;
  const yp = dasar - (hari[iPuncak].jumlah / maks) * tinggiMaks;
  return (
    <PanggungDok durasi={d} latar="bedengan" dari={{ zoom: 1.0, x: -20 }} ke={{ zoom: 1.08, x: 60, y: -10 }} aksen={[null, null, null, null, null, null, 'daun', 'matahari', null, null]}>
      {() => (
        <>
          <Judul frasa={`${DATA.git.total} commit dalam 15 hari`} mulai={4} top={40} ukuran={80} sorot={[String(DATA.git.total)]} />
          <div style={{ position: 'absolute', left: 120, top: 200, fontFamily: HURUF, fontWeight: 800, fontSize: 150, color: W.daun, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{total}</div>
          <TeksKecil style={{ position: 'absolute', left: 126, top: 352, color: W.teks }}>commit sejauh ini</TeksKecil>
          <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <line x1={kiri - 50} y1={dasar} x2={kiri + 14 * jarak + 50} y2={dasar} stroke={W.teks} strokeOpacity={0.4} strokeWidth={3} />
            {hari.map((h, i) => {
              const tinggi = Math.max(4, (h.jumlah / maks) * tinggiMaks) * Math.max(0, naik[i]);
              const x = kiri + i * jarak;
              const puncak = i === iPuncak;
              return (
                <g key={h.tanggal}>
                  <rect x={x - 30} y={dasar - tinggi} width={60} height={tinggi} rx={10} fill={puncak && pPuncak > 0 ? W.oranye : h.jumlah ? W.limau : W.logam} />
                  <rect x={x - 30} y={dasar - tinggi} width={60} height={Math.min(tinggi, 12)} rx={6} fill="#fff" opacity={0.25} />
                  <text x={x} y={dasar - tinggi - 14} textAnchor="middle" fontFamily={HURUF} fontWeight={700} fontSize={28} fill={W.teks} opacity={Math.min(1, naik[i])}>
                    {h.jumlah}
                  </text>
                  <text x={x} y={dasar + 36} textAnchor="middle" fontFamily={HURUF} fontWeight={600} fontSize={24} fill={W.teksPendukung}>
                    {Number(h.tanggal.slice(8))}
                  </text>
                </g>
              );
            })}
          </svg>
          <Gores
            d={`M${xp - 60} ${yp - 60} C ${xp - 80} ${yp - 130}, ${xp + 70} ${yp - 150}, ${xp + 64} ${yp - 70} S ${xp - 30} ${yp + 10}, ${xp - 66} ${yp - 50}`}
            p={pPuncak}
            lebar={1920}
            tinggi={1080}
            tebal={7}
          />
          <div style={{ position: 'absolute', left: xp - 330, top: yp - 160, width: 260, textAlign: 'right', fontFamily: HURUF, fontWeight: 800, fontSize: 40, color: W.oranye, opacity: pPuncak, transform: `translateX(${(1 - pPuncak) * 30}px)` }}>
            puncak {tgl(DATA.git.puncak.tanggal, true)}
          </div>
          <Keterangan>git log · {tgl(DATA.git.perHari[0].tanggal, true)}–{tgl(DATA.git.perHari[14].tanggal)} · tidak ada commit pada 10 dan 16 Okt</Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

const BARIS = 46;

export const S19: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const commit = DATA.git.commit;
  const tagPer = new Map<string, string[]>();
  for (const t of DATA.git.tag) tagPer.set(t.hash, [...(tagPer.get(t.hash) ?? []), t.nama]);
  const tinggiPanel = 640;
  const totalTinggi = commit.length * BARIS;
  const gulir = interpolate(frame, [0, d], [0, totalTinggi - tinggiPanel + 40], { easing: EASE.halus });
  const sp = pegas(frame, 0, 'berat');
  return (
    <PanggungDok durasi={d} latar="langit" dari={{ zoom: 1.02 }} ke={{ zoom: 1.07, x: -30 }} aksen={['daun', 'benih', null, 'koin', 'sawi', null]}>
      {() => (
        <>
          <Judul frasa="Tag di setiap tonggak demo" mulai={4} top={40} ukuran={80} sorot={['Tag']} />
          <div style={{ position: 'absolute', left: 330, top: 190, width: 1260, height: tinggiPanel, perspective: 1600 }}>
            <div style={{ width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden', background: W.kertas, boxShadow: '0 40px 70px rgba(46,53,71,0.25)', transform: `translateY(${(1 - sp) * 500}px) rotateX(${10 + ayun(frame, 0, 1.5, 150)}deg) rotateY(${-4 + ayun(frame, 30, 1.5, 170)}deg)` }}>
              <div style={{ position: 'absolute', left: 0, top: 20 - gulir, width: '100%' }}>
                {commit.map((c, i) => {
                  const tags = tagPer.get(c.hash);
                  const yLayar = 20 + i * BARIS - gulir;
                  const dekat = Math.max(0, 1 - Math.abs(yLayar - tinggiPanel / 2) / 220);
                  return (
                    <div key={c.hash} style={{ position: 'absolute', top: i * BARIS, left: 0, width: '100%', height: BARIS, display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px', boxSizing: 'border-box', fontFamily: HURUF, fontSize: 24, color: W.teks, background: tags ? `rgba(245,165,36,${0.12 + dekat * 0.25})` : undefined }}>
                      <span style={{ width: 110, color: W.teksPendukung }}>{tgl(c.tanggal, true)}</span>
                      <span style={{ width: 100, fontFamily: MONO, fontSize: 21, color: W.daun }}>{c.hash}</span>
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.judul}</span>
                      {tags && (
                        <span style={{ position: 'relative', fontWeight: 800, color: W.matahariTeks, whiteSpace: 'nowrap' }}>
                          tag {tags.join(', ')}
                          <Gores d={jalurGarisBawah(0, 6, 200)} p={dekat > 0.1 ? 1 : 0} lebar={220} tinggi={14} tebal={4} style={{ top: 30 }} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <Keterangan>git log dan git tag · {DATA.git.total} commit, {DATA.git.tag.length} tag · {tgl(DATA.git.tag[0].tanggal, true)} sampai {tgl(DATA.git.tag[DATA.git.tag.length - 1].tanggal)}</Keterangan>
        </>
      )}
    </PanggungDok>
  );
};
