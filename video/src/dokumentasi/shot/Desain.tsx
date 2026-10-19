import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { acak, antara, ayun, EASE, maju, pegas } from '../../v2/gerak';
import { BAGIAN_LOGO, LogoAsli } from '../../v2/LogoAsli';
import { HURUF, W } from '../../v2/tema';
import { DATA, rentangBahan, tgl } from '../data';
import { Gores, Hp, IsiLayar, Judul, Keterangan, Laptop, LayarHp, PanggungDok, TeksKecil, jalurGarisBawah } from '../dasar';

/** Adegan Desain [AG-52]: papan, kerangka, geser sebelum-sesudah, logo, aset gambar. */

// ---------------------------------------------------------------- 08 papan menyebar

const TATA_PAPAN: Record<string, { x: number; y: number }> = {
  '00-sistem-desain-desktop': { x: 90, y: 190 },
  '01-halaman-depan-desktop': { x: 500, y: 165 },
  '03-beranda-petani-desktop': { x: 910, y: 195 },
  '08-belajar-hidroponik-desktop': { x: 110, y: 520 },
  '16-hitung-modal-sawi-bedengan-desktop': { x: 520, y: 500 },
  '20-jadwal-sawi-bedengan-desktop': { x: 930, y: 530 },
  '29-pesanan-di-sekitar-desktop': { x: 1340, y: 560 },
  '03-beranda-petani-mobile': { x: 1340, y: 150 },
  '10-hitung-pilih-tanaman-mobile': { x: 1510, y: 180 },
  '31-detail-pesanan-mobile': { x: 1690, y: 160 },
};

export const S08: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const fokus = DATA.papan.findIndex((p) => p.nama === '03-beranda-petani-desktop');
  const tz = maju(frame, 95, 70, EASE.tajam);
  const pf = TATA_PAPAN[DATA.papan[fokus].nama];
  const cx = pf.x + 190;
  const cy = pf.y + 119;
  const zoom = antara(tz, 1, 3.6);
  const judulPudar = 1 - maju(frame, 90, 20);
  return (
    <PanggungDok durasi={d} latar="langit" dari={{ zoom: 1.02 }} ke={{ zoom: 1.06, x: 20 }} aksen={['daun', null, 'benih', 'sawi', null, null, null, null, 'tetes', 'koin']}>
      {() => (
        <>
          <div style={{ position: 'absolute', inset: 0, transform: `translate(${(960 - cx) * tz}px, ${(520 - cy) * tz}px) scale(${zoom})`, transformOrigin: `${cx}px ${cy}px` }}>
            {DATA.papan.map((p, i) => {
              const t = TATA_PAPAN[p.nama];
              const sp = pegas(frame, 6 + i * 4, i % 2 ? 'pantul' : 'lembut');
              const w = p.hp ? 145 : 380;
              const h = p.hp ? 314 : 237;
              const putar = (acak(i + 3) - 0.5) * 10 * (1 - tz);
              const x = antara(sp, 960 - w / 2, t.x);
              const y = antara(sp, 560 - h / 2, t.y) + ayun(frame, i * 13, 5, 90 + i * 6) * (1 - tz);
              return (
                <div
                  key={p.nama}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: w,
                    height: h,
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: W.putih,
                    border: `5px solid ${W.putih}`,
                    boxShadow: '0 24px 40px rgba(46,53,71,0.24)',
                    transform: `rotate(${putar + (1 - sp) * (i - 5) * 4}deg)`,
                    zIndex: i === fokus ? 20 : i,
                  }}
                >
                  <Img src={staticFile(p.gambar)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                </div>
              );
            })}
          </div>
          <div style={{ opacity: judulPudar }}>
            <Judul frasa={`${DATA.jumlahPapan} papan desain`} mulai={30} top={40} ukuran={84} sorot={[String(DATA.jumlahPapan)]} />
          </div>
          <Keterangan mulai={20}>
            design/desain-tani-muda.html · {tgl(DATA.tanggalBahan.desain.awal)} · {tz > 0.5 ? 'papan 03 Beranda petani, desktop 1440 px' : 'papan mobile 390 px dan desktop 1440 px'}
          </Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

// ---------------------------------------------------------------- 09 kerangka tahap 1

export const S09: React.FC<{ d: number }> = ({ d }) => (
  <PanggungDok durasi={d} latar="bedengan" dari={{ zoom: 1.0, x: -30 }} ke={{ zoom: 1.08, x: 30 }} aksen={['cangkul', null, null, null, null, 'benih', 'daun']}>
    {() => (
      <>
        <Judul frasa="Kerangka halaman pertama" mulai={4} top={50} ukuran={80} />
        <Laptop x={330} y={200} lebar={1050} miring={8}>
          <IsiLayar
            src="dokumentasi/kerangka-petani-desktop.png"
            lebarGambar={1440}
            tinggiGambar={900}
            lebar={1050}
            tinggi={656}
            titik={[
              { f: 0, x: 0.5, y: 0.5, zoom: 1 },
              { f: 60, x: 0.2, y: 0.35, zoom: 1.5 },
              { f: 135, x: 0.35, y: 0.5, zoom: 1.25 },
            ]}
            sorot={[{ x: 10, y: 60, w: 330, h: 420, f: 40 }]}
          />
        </Laptop>
        <Hp x={1430} y={250} tinggi={600} miring={-14} masuk={12}>
          <LayarHp src="dokumentasi/kerangka-petani-mobile.png" />
        </Hp>
        <Keterangan>docs/tangkapan/arsip/tahap-1 · {tgl(DATA.tanggalBahan.kerangka.awal)}</Keterangan>
      </>
    )}
  </PanggungDok>
);

// ---------------------------------------------------------------- 10 geser sebelum-sesudah

export const S10: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const lebar = 980;
  const tinggi = lebar / 1.6;
  const geser = interpolate(frame, [0, 20, 80, 120, 165], [0.97, 0.97, 0.12, 0.12, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.halus });
  const aman = DATA.aplikasi?.demoAman;
  const kini = DATA.aplikasi?.sekarang;
  return (
    <PanggungDok durasi={d} latar="sawah" dari={{ zoom: 1.03, x: 20 }} ke={{ zoom: 1.08, x: -20 }} aksen={['daun', 'sawi', null, 'tomat', null, null, null, null, 'benih']}>
      {() => (
        <>
          <Judul frasa="Sebelum dan sesudah tema baru" mulai={4} top={40} ukuran={80} sorot={['sesudah']} />
          <Laptop x={(1920 - lebar) / 2 - 18} y={165} lebar={lebar} miring={-6}>
            <IsiLayar src="dokumentasi/sekarang-beranda-desktop.png" lebarGambar={1440} tinggiGambar={900} lebar={lebar} tinggi={tinggi} titik={[{ f: 0, x: 0.5, y: 0.5, zoom: 1 }, { f: 180, x: 0.45, y: 0.4, zoom: 1.12 }]} />
            <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${(1 - geser) * 100}% 0 0)` }}>
              <IsiLayar src="dokumentasi/demo-aman-beranda-desktop.png" lebarGambar={1440} tinggiGambar={900} lebar={lebar} tinggi={tinggi} titik={[{ f: 0, x: 0.5, y: 0.5, zoom: 1 }, { f: 180, x: 0.45, y: 0.4, zoom: 1.12 }]} />
            </div>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: geser * lebar - 3, width: 6, background: W.putih, boxShadow: '0 0 12px rgba(46,53,71,0.4)' }} />
            <svg width={64} height={64} viewBox="0 0 64 64" style={{ position: 'absolute', left: geser * lebar - 32, top: tinggi / 2 - 32 }}>
              <circle cx={32} cy={32} r={29} fill={W.putih} stroke={W.daun} strokeWidth={4} />
              <path d="M24 22 L14 32 L24 42 M40 22 L50 32 L40 42" fill="none" stroke={W.daun} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Laptop>
          <TeksKecil style={{ position: 'absolute', left: 330, top: 868, color: W.teks, opacity: maju(frame, 10, 12) }}>
            ← tag demo-aman ({aman?.hash}, {tgl(aman?.tanggal)})
          </TeksKecil>
          <TeksKecil style={{ position: 'absolute', right: 330, top: 868, color: W.teks, opacity: maju(frame, 16, 12) }}>
            versi sekarang ({kini?.hash}, {tgl(kini?.tanggal)}) →
          </TeksKecil>
          <Keterangan mulai={30} top={940}>
            demo-aman dibangun ulang dari git di worktree terpisah; keduanya halaman Beranda petani
          </Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

// ---------------------------------------------------------------- 11 logo tumbuh

const VERSI_LOGO = [
  { src: 'logo/logo-tanda.svg', nama: 'logo-tanda' },
  { src: 'logo/logo-ikon.svg', nama: 'logo-ikon' },
  { src: 'logo/logo-satu-warna.svg', nama: 'logo-satu-warna' },
  { src: 'logo/logo-ikon-maskable.svg', nama: 'logo-ikon-maskable' },
];

/** Tunas tumbuh dari garis tanah memakai bagian-bagian logo asli. */
const TunasLogo: React.FC<{ frame: number; ukuran: number }> = ({ frame, ukuran }) => {
  const pTanah = maju(frame, 4, 22, EASE.keluar);
  const pBatang = pegas(frame, 20, 'lembut');
  const pKiri = pegas(frame, 38, 'pantul');
  const pKanan = pegas(frame, 46, 'pantul');
  const pKilap = maju(frame, 62, 14);
  return (
    <svg viewBox="0 0 100 100" width={ukuran} height={ukuran} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="dok-daun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9D85A" />
          <stop offset=".6" stopColor="#8CC63A" />
          <stop offset="1" stopColor="#76B42B" />
        </linearGradient>
        <linearGradient id="dok-tanah" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#46507A" />
          <stop offset="1" stopColor="#2E3547" />
        </linearGradient>
      </defs>
      <g transform={`translate(50 70) scale(${0.15 + pKiri * 0.85}) rotate(${(1 - pKiri) * 50}) translate(-50 -70)`} opacity={Math.min(1, pKiri * 3)}>
        <path d={BAGIAN_LOGO.daunKiri} fill="url(#dok-daun)" />
        <path d={BAGIAN_LOGO.kilapKiri} stroke="#fff" strokeOpacity={0.45 * pKilap} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </g>
      <g transform={`translate(50 70) scale(${0.15 + pKanan * 0.85}) rotate(${(1 - pKanan) * -50}) translate(-50 -70)`} opacity={Math.min(1, pKanan * 3)}>
        <path d={BAGIAN_LOGO.daunKanan} fill="url(#dok-daun)" />
        <path d={BAGIAN_LOGO.kilapKanan} stroke="#fff" strokeOpacity={0.3 * pKilap} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      </g>
      <g transform={`translate(50 70) scale(1 ${Math.max(0.001, pBatang)}) translate(-50 -70)`}>
        <path d={BAGIAN_LOGO.batang} fill="url(#dok-daun)" />
      </g>
      <path d={BAGIAN_LOGO.tanah} stroke="url(#dok-tanah)" strokeWidth="9" strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pTanah} />
    </svg>
  );
};

export const S11: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const pindah = maju(frame, 88, 22, EASE.tajam);
  const slotX = (i: number) => 230 + i * 400;
  const besar = antara(pindah, 520, 260);
  const x = antara(pindah, 960 - 260, slotX(0));
  const y = antara(pindah, 200, 330);
  return (
    <PanggungDok durasi={d} latar="sawah" dari={{ zoom: 1.1, y: 20 }} ke={{ zoom: 1.02, y: -10 }} aksen={['daun', null, null, 'benih', null, null, null, null, 'tetes', 'sawi']}>
      {() => (
        <>
          <Judul frasa="Logo tumbuh dari tanah" mulai={6} top={50} ukuran={80} sorot={['tanah']} />
          <div style={{ position: 'absolute', left: x, top: y }}>
            {pindah < 1 ? <TunasLogo frame={frame} ukuran={besar} /> : <LogoAsli ukuran={besar} idPrefix="dok-logo" />}
          </div>
          {VERSI_LOGO.map((v, i) => {
            if (i === 0) return null;
            const sp = pegas(frame, 100 + i * 8, 'pantul');
            return (
              <div key={v.nama} style={{ position: 'absolute', left: slotX(i), top: 330, width: 260, height: 260, transform: `translateY(${(1 - sp) * 300}px) scale(${sp}) rotate(${ayun(frame, i * 30, 3, 110)}deg)`, opacity: Math.min(1, sp * 2) }}>
                <Img src={staticFile(v.src)} style={{ width: 260, height: 260 }} />
              </div>
            );
          })}
          {VERSI_LOGO.map((v, i) => (
            <TeksKecil key={v.nama} style={{ position: 'absolute', left: slotX(i), top: 620, width: 260, textAlign: 'center', color: W.teks, opacity: maju(frame, 112 + i * 8, 12) }}>
              {v.nama}.svg
            </TeksKecil>
          ))}
          <Keterangan mulai={20}>frontend/public/logo · {tgl(DATA.tanggalBahan.logo.awal)} · empat versi yang dipakai aplikasi</Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

// ---------------------------------------------------------------- 12 ikon, ilustrasi, lencana

const KOMODITAS = ['bayam', 'cabai-rawit', 'jagung-manis', 'kangkung', 'kedelai', 'mentimun', 'padi', 'pakcoy', 'sawi', 'selada', 'terong', 'tomat'];
const LENCANA = ['tanam-pertama', 'panen-pertama', 'pelajar-rajin', 'pengukur-teliti', 'tepat-waktu-7-hari', 'kebun-terdokumentasi', 'pesanan-pertama', 'pembeli-setia', 'bintang-lima', 'dipercaya-pembeli', 'level-benih', 'level-tunas', 'level-daun', 'level-berbunga', 'level-panen-raya'];

const Baris: React.FC<{ frame: number; y: number; laju: number; ukuran: number; jarak: number; isi: string[]; mulai: number; arah: number }> = ({ frame, y, laju, ukuran, jarak, isi, mulai, arah }) => (
  <>
    {isi.map((src, i) => {
      const sp = pegas(frame, mulai + i * 2, i % 2 ? 'pantul' : 'cepat');
      const x = 80 + i * jarak + arah * (frame * laju) - (arah > 0 ? 200 : 0);
      return (
        <div key={src} style={{ position: 'absolute', left: x, top: y + ayun(frame, i * 19, 8, 80 + (i % 5) * 9), width: ukuran, height: ukuran, transform: `scale(${sp}) rotate(${(1 - sp) * 30}deg)` }}>
          <Img src={staticFile(src)} style={{ width: ukuran, height: ukuran }} />
        </div>
      );
    })}
  </>
);

export const S12: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const ikon = DATA.ikonResmi.map((n) => `dokumentasi/ikon/${n}`);
  return (
    <PanggungDok durasi={d} latar="langit" dari={{ zoom: 1.0 }} ke={{ zoom: 1.08, y: -15 }} aksen={[]}>
      {() => (
        <>
          <Judul frasa="Ikon, ilustrasi, dan lencana" mulai={4} top={40} ukuran={80} />
          <div style={{ position: 'absolute', left: 0, top: 190, width: 1920, height: 120, background: 'rgba(255,255,255,0.55)', borderRadius: 0 }} />
          <Baris frame={frame} y={208} laju={0.9} ukuran={84} jarak={112} isi={ikon} mulai={6} arah={-1} />
          <Baris frame={frame} y={350} laju={1.6} ukuran={190} jarak={215} isi={KOMODITAS.map((k) => `ilustrasi/komoditas/${k}.svg`)} mulai={14} arah={1} />
          <Baris frame={frame} y={590} laju={1.1} ukuran={170} jarak={190} isi={LENCANA.map((k) => `lencana/${k}.svg`)} mulai={24} arah={-1} />
          <Gores d={jalurGarisBawah(80, 10, 520)} p={maju(frame, 30, 18)} lebar={700} tinggi={30} style={{ top: 312 }} tebal={5} warna={W.daun} />
          <Keterangan mulai={24}>
            {ikon.length} ikon design/icons ({tgl(DATA.tanggalBahan.ikon.awal, true)}) · ilustrasi komoditas ({rentangBahan('ilustrasi')}) · lencana frontend/public/lencana ({tgl(DATA.tanggalBahan.lencana.awal)})
          </Keterangan>
        </>
      )}
    </PanggungDok>
  );
};
