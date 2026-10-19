import React from 'react';
import { useCurrentFrame } from 'remotion';
import { ayun, EASE, maju, pegas } from '../../v2/gerak';
import { LogoAsli } from '../../v2/LogoAsli';
import { HURUF, W } from '../../v2/tema';
import uji from '../../data/dokumentasi-uji.json';
import { DATA, tgl } from '../data';
import { Centang, Hp, IsiLayar, Judul, Keterangan, Laptop, LayarHp, Nyala, PanggungDok, TeksKecil } from '../dasar';

/** Adegan Pengujian, Hasil akhir, dan Penutup [AG-52]. */

const MONO = "Consolas, 'Cascadia Mono', monospace";

interface BarisTerminal {
  teks: string;
  perintah?: boolean;
  sorot?: boolean;
}

/** Terminal terang di layar laptop; baris diketik satu per satu dari keluaran asli. */
const Terminal: React.FC<{ baris: BarisTerminal[]; lebar: number; tinggi: number; mulai?: number; laju?: number }> = ({ baris, lebar, tinggi, mulai = 6, laju = 2.2 }) => {
  const frame = useCurrentFrame();
  let f = mulai;
  const jadwal = baris.map((b) => {
    const awal = f;
    f += Math.ceil(b.teks.length / (b.perintah ? laju : laju * 4)) + (b.perintah ? 8 : 2);
    return awal;
  });
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FBFBF7', fontFamily: MONO, fontSize: 25, color: W.teks }}>
      <div style={{ height: 44, background: '#ECEFE6', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', fontFamily: HURUF, fontSize: 20, color: W.teksPendukung }}>
        {[W.tomat, W.matahari, W.limau].map((w) => (
          <span key={w} style={{ width: 14, height: 14, borderRadius: 7, background: w }} />
        ))}
        <span style={{ marginLeft: 14 }}>Terminal</span>
      </div>
      <div style={{ padding: '18px 26px', lineHeight: 1.55 }}>
        {baris.map((b, i) => {
          const n = Math.floor((frame - jadwal[i]) * (b.perintah ? laju : laju * 4));
          if (n <= 0) return null;
          return (
            <div key={i} style={{ whiteSpace: 'pre', color: b.perintah ? W.daun : b.sorot ? W.daunTekan : W.teks, fontWeight: b.sorot || b.perintah ? 700 : 400 }}>
              {b.perintah ? '> ' : ''}
              {b.teks.slice(0, n)}
              {n < b.teks.length && <span style={{ background: W.daun, color: W.daun }}>_</span>}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, width: lebar, height: tinggi, pointerEvents: 'none' }} />
    </div>
  );
};

/** Akhir jadwal ketik (frame) untuk menaruh centang "lolos". */
function akhirKetik(baris: BarisTerminal[], mulai = 6, laju = 2.2) {
  return baris.reduce((f, b) => f + Math.ceil(b.teks.length / (b.perintah ? laju : laju * 4)) + (b.perintah ? 8 : 2), mulai);
}

const ShotTerminal: React.FC<{ d: number; judul: string; baris: BarisTerminal[]; keterangan: string; latar: 'kota' | 'bedengan' }> = ({ d, judul, baris, keterangan, latar }) => {
  const frame = useCurrentFrame();
  const fLolos = Math.min(d - 40, akhirKetik(baris) + 4);
  const pc = maju(frame, fLolos, 20, EASE.keluar);
  const sp = pegas(frame, fLolos + 4, 'pantul');
  const lebar = 1060;
  return (
    <PanggungDok durasi={d} latar={latar} dari={{ zoom: 1.0, x: -20 }} ke={{ zoom: 1.08, x: 20, y: 10 }} aksen={['daun', null, 'tetes', null, null, null, 'benih']}>
      {() => (
        <>
          <Judul frasa={judul} mulai={4} top={40} ukuran={80} />
          <Laptop x={250} y={190} lebar={lebar} miring={9}>
            <Terminal baris={baris} lebar={lebar} tinggi={lebar / 1.6} />
          </Laptop>
          <div style={{ position: 'absolute', left: 1400, top: 380, transform: `scale(${0.5 + sp * 0.5}) rotate(${(1 - sp) * -20}deg)`, opacity: Math.min(1, pc * 2) }}>
            <Centang p={pc} ukuran={220} />
            <div style={{ fontFamily: HURUF, fontWeight: 800, fontSize: 88, color: W.daun, marginTop: 10, textAlign: 'center', width: 220 }}>lolos</div>
          </div>
          <Keterangan>{keterangan}</Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

const KET_UJI = `dijalankan ulang ${tgl(uji.dijalankan)} pada commit ${uji.commit} (kode ${tgl(DATA.aplikasi?.sekarang.tanggal)})`;

export const S21: React.FC<{ d: number }> = ({ d }) => (
  <ShotTerminal d={d} latar="kota" judul="Tes otomatis lolos" baris={uji.tes as BarisTerminal[]} keterangan={`Keluaran asli Pest dan Vitest, ${KET_UJI}`} />
);

export const S22: React.FC<{ d: number }> = ({ d }) => (
  <ShotTerminal d={d} latar="bedengan" judul="Naskah demo diuji ulang" baris={uji.naskah as BarisTerminal[]} keterangan={`Keluaran asli npm run uji:naskah ke demo:backend, ${KET_UJI}`} />
);

export const S23: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const potong = 54;
  const lebar = 1080;
  return (
    <PanggungDok durasi={d} latar="kota" dari={{ zoom: 1.02, x: 20 }} ke={{ zoom: 1.08, x: -30 }} aksen={['daun', null, null, 'koin', null, null, 'benih']}>
      {() => (
        <>
          <Judul frasa="Data tersimpan di MariaDB" mulai={4} top={40} ukuran={80} sorot={['MariaDB']} />
          {frame < potong ? (
            <Laptop x={(1920 - lebar) / 2 - 18} y={200} lebar={lebar} rasio={827 / 535} miring={-7}>
              <IsiLayar
                src="dokumentasi/xampp.png"
                lebarGambar={827}
                tinggiGambar={535}
                lebar={lebar}
                tinggi={lebar / (827 / 535)}
                titik={[{ f: 0, x: 0.5, y: 0.5, zoom: 1 }, { f: potong, x: 0.3, y: 0.3, zoom: 1.5 }]}
                sorot={[{ x: 70, y: 118, w: 300, h: 72, f: 12 }]}
              />
            </Laptop>
          ) : (
            <Laptop x={(1920 - lebar) / 2 - 18} y={200} lebar={lebar} rasio={1918 / 1027} miring={7} masuk={potong - 40}>
              <IsiLayar
                src="dokumentasi/phpmyadmin.png"
                lebarGambar={1918}
                tinggiGambar={1027}
                lebar={lebar}
                tinggi={lebar / (1918 / 1027)}
                titik={[{ f: potong, x: 0.5, y: 0.45, zoom: 1 }, { f: potong + 50, x: 0.55, y: 0.5, zoom: 1.7 }, { f: d, x: 0.62, y: 0.52, zoom: 1.85 }]}
                lapisan={(s) => (
                  // dua baris terbaru tabel `pesan` (19 Okt) menyala
                  <>
                    <Nyala x={282 * s} y={499 * s} w={1548 * s} h={30 * s} mulai={potong + 40} />
                    <Nyala x={282 * s} y={530 * s} w={1548 * s} h={30 * s} mulai={potong + 48} />
                  </>
                )}
              />
            </Laptop>
          )}
          <Keterangan>{frame < potong ? 'Tangkapan layar pemilik, layar-pengguna/XAMPP.png · Apache dan MySQL berjalan' : 'Tangkapan layar pemilik, layar-pengguna/phpmyadmin.png · dua baris terbaru bertanggal 19 Okt 2026'}</Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

const LAYAR = ['belajar', 'hitung', 'rawat', 'jual'] as const;
const NAMA_LAYAR = { belajar: 'Belajar', hitung: 'Hitung', rawat: 'Rawat', jual: 'Jual' };

export const S24: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const per = d / LAYAR.length;
  const i = Math.min(LAYAR.length - 1, Math.floor(frame / per));
  const lokal = frame - i * per;
  const geser = i === 0 ? 1 : maju(lokal, 0, 10, EASE.keluar);
  const lebar = 980;
  const nama = LAYAR[i];
  const sp = pegas(lokal, 0, 'pantul');
  return (
    <PanggungDok durasi={d} latar="sawah" dari={{ zoom: 1.0, x: -30 }} ke={{ zoom: 1.08, x: 30 }} aksen={['daun', 'sawi', null, 'koin', null, 'keranjang', null, 'tomat']}>
      {() => (
        <>
          <div style={{ position: 'absolute', left: 0, width: 1920, top: 40, textAlign: 'center', fontFamily: HURUF, fontWeight: 800, fontSize: 96, color: W.daun, transform: `translateY(${(1 - sp) * 40}px) scale(${0.8 + sp * 0.2})`, opacity: Math.min(1, sp * 1.5) }}>
            {NAMA_LAYAR[nama]}
          </div>
          <Laptop x={700} y={220} lebar={lebar} miring={-8}>
            {i > 0 && geser < 1 && (
              <IsiLayar src={`dokumentasi/sekarang-${LAYAR[i - 1]}-desktop.png`} lebarGambar={1440} tinggiGambar={900} lebar={lebar} tinggi={lebar / 1.6} titik={[{ f: 0, x: 0.5, y: 0.45, zoom: 1.12 }]} />
            )}
            <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - geser) * lebar}px)` }}>
              <IsiLayar src={`dokumentasi/sekarang-${nama}-desktop.png`} lebarGambar={1440} tinggiGambar={900} lebar={lebar} tinggi={lebar / 1.6} titik={[{ f: i * per, x: 0.5, y: 0.4, zoom: 1.0 }, { f: (i + 1) * per, x: 0.5, y: 0.45, zoom: 1.12 }]} />
            </div>
          </Laptop>
          <Hp x={260} y={190} tinggi={720} miring={14} masuk={4}>
            {i > 0 && geser < 1 && <LayarHp src={`dokumentasi/sekarang-${LAYAR[i - 1]}-mobile.png`} />}
            <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - geser) * 100}%)` }}>
              <LayarHp src={`dokumentasi/sekarang-${nama}-mobile.png`} />
            </div>
          </Hp>
          <Keterangan>Build demo versi sekarang ({DATA.aplikasi?.sekarang.hash}, {tgl(DATA.aplikasi?.sekarang.tanggal)}) · HP 390 px dan laptop 1440 px</Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

const ADMIN = ['admin-daftar-petani', 'admin-detail-arif', 'admin-sengketa'];

export const S25: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const per = d / ADMIN.length;
  const i = Math.min(ADMIN.length - 1, Math.floor(frame / per));
  const lebar = 1100;
  return (
    <PanggungDok durasi={d} latar="kota" dari={{ zoom: 1.02 }} ke={{ zoom: 1.08, x: 30 }} aksen={['daun', null, null, 'koin', null, null, 'benih']}>
      {() => (
        <>
          <Judul frasa="Panel admin di hari terakhir" mulai={4} top={40} ukuran={80} />
          <Laptop x={(1920 - lebar) / 2 - 18} y={200} lebar={lebar} miring={i % 2 ? 7 : -7}>
            <IsiLayar src={`dokumentasi/${ADMIN[i]}.png`} lebarGambar={1440} tinggiGambar={1011} lebar={lebar} tinggi={lebar / 1.6} titik={[{ f: i * per, x: 0.45, y: 0.3, zoom: 1.0 }, { f: (i + 1) * per, x: 0.55, y: 0.4, zoom: 1.3 }]} />
          </Laptop>
          <Keterangan>docs/tangkapan/ag-51 · {tgl(DATA.tanggalBahan.panelAdmin.awal)} · cabang admin-lokasi, belum digabung ke master</Keterangan>
        </>
      )}
    </PanggungDok>
  );
};

export const S26: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const bagian = ['tanah', 'batang', 'daunKiri', 'daunKanan', 'kilapKiri', 'kilapKanan'] as const;
  const geser = Object.fromEntries(
    bagian.map((b, i) => {
      const sp = pegas(frame, 4 + i * 4, i % 2 ? 'pantul' : 'lembut');
      return [b, { y: (1 - sp) * (40 + i * 12), x: (1 - sp) * (i % 2 ? 30 : -30), putar: (1 - sp) * (i % 2 ? 25 : -25), o: Math.min(1, sp * 1.5) }];
    }),
  );
  const pNama = pegas(frame, 30, 'pantul');
  return (
    <PanggungDok durasi={d} latar="sawah" senja={0.55} dari={{ zoom: 1.08, y: 20 }} ke={{ zoom: 1.0, y: -10 }} aksen={['daun', 'benih', 'sawi', 'tetes', 'keranjang', 'koin', 'matahari', 'tomat']}>
      {() => (
        <>
          <div style={{ position: 'absolute', left: 960 - 170, top: 150, transform: `translateY(${ayun(frame, 0, 6, 120)}px)` }}>
            <LogoAsli ukuran={340} geser={geser} idPrefix="dok-tutup" />
          </div>
          <div style={{ position: 'absolute', left: 0, width: 1920, top: 500, textAlign: 'center', fontFamily: HURUF, fontWeight: 800, fontSize: 130, color: W.daun, transform: `scale(${0.7 + pNama * 0.3})`, opacity: Math.min(1, pNama * 1.5), textShadow: '0 4px 0 rgba(255,255,255,0.7)' }}>
            Tani Muda
          </div>
          <Judul frasa="Belajar, Hitung, Rawat, Jual" mulai={50} top={670} ukuran={64} />
          <TeksKecil style={{ position: 'absolute', left: 0, width: 1920, top: 800, textAlign: 'center', color: W.teks, opacity: maju(frame, 80, 16) }}>
            {DATA.git.total} commit · 5–19 Oktober 2026 · dikembangkan dengan bantuan AI (Antigravity dan Claude)
          </TeksKecil>
        </>
      )}
    </PanggungDok>
  );
};
