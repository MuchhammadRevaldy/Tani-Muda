/**
 * Halaman depan (papan 01, T4.32; susunan baru [AG-54]): hero (tidak diubah), tombol "Lihat cara
 * kerjanya", lalu Masalah, Siklus Tani Muda, cara kerja Pesan Sebelum Tanam, fitur pendukung,
 * pembeli, tanya jawab, ajakan penutup, dan kaki. Latar bagian berselang-seling putih dan
 * embun-pagi. Terbuka tanpa masuk; angka dari GET /publik/contoh dan GET /konfigurasi, dihitung
 * fungsi src/lib (D-08, D-44).
 */
import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AjakanPenutup,
  BagianFitur,
  BagianLanding,
  BagianMasalah,
  BagianPembeli,
  BagianSiklus,
  CaraKerja,
  judulIdBagian,
  TanyaJawab,
  type Latar,
} from './landing/bagian';
import { useDataLanding, type DataLanding } from './landing/data-landing';
import { BAGIAN_LANDING, gulirKe, idBagian, type IdBagian } from './landing/gulir';
import { Hero } from './landing/hero';
import { useMunculGulir } from './landing/muncul-gulir';
import { TombolKembaliKeAtas, TombolLihatCaraKerja } from './landing/penyusur';
import { KerangkaPublik } from './statis/kerangka-publik';

const ISI: Record<IdBagian, (d: DataLanding) => ReactNode> = {
  masalah: () => <BagianMasalah />,
  siklus: (d) => <BagianSiklus d={d} />,
  caraKerja: (d) => <CaraKerja d={d} />,
  fitur: () => <BagianFitur />,
  pembeli: (d) => <BagianPembeli d={d} />,
  tanyaJawab: (d) => <TanyaJawab d={d} />,
};

const latarKe = (i: number): Latar => (i % 2 ? 'embun' : 'putih');

export function HalamanLanding() {
  const d = useDataLanding();
  const { hash } = useLocation();
  useMunculGulir();

  // Selalu mulai dari hero [AG-56]: pemulihan posisi gulir otomatis dimatikan selama di halaman ini
  // (juga sejak index.html), dan halaman dibuka di paling atas.
  useEffect(() => {
    if (!('scrollRestoration' in history)) return;
    const sebelum = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = sebelum;
    };
  }, []);

  // Datang dari halaman lain lewat /#id-bagian: gulir ke bagian itu setelah halaman tersusun, lalu
  // hapus #id dari alamat supaya muat ulang berikutnya kembali mulai dari hero. Tanpa tujuan: ke atas.
  useEffect(() => {
    const id = decodeURIComponent(hash.replace(/^#/, ''));
    if (!id) {
      window.scrollTo(0, 0);
      return;
    }
    const bingkai = requestAnimationFrame(() => {
      gulirKe(id);
      history.replaceState(history.state, '', window.location.pathname + window.location.search);
    });
    return () => cancelAnimationFrame(bingkai);
  }, [hash]);

  return (
    <KerangkaPublik>
      {/* Hero muncul saat dibuka (D-61); isinya tidak diubah [AG-54]. */}
      <div className="muncul-gulir">
        <Hero d={d} />
      </div>
      <TombolLihatCaraKerja />
      {BAGIAN_LANDING.map((k, i) => (
        <BagianLanding
          key={k}
          id={idBagian(k)}
          latar={latarKe(i)}
          urut={i}
          judulId={judulIdBagian(k)}
        >
          {ISI[k](d)}
        </BagianLanding>
      ))}
      <BagianLanding
        id="mulai"
        latar={latarKe(BAGIAN_LANDING.length)}
        urut={BAGIAN_LANDING.length}
        judulId={judulIdBagian('ajakan')}
      >
        <AjakanPenutup />
      </BagianLanding>
      <TombolKembaliKeAtas />
    </KerangkaPublik>
  );
}
