/**
 * Halaman depan (papan 01, T4.32): hero dengan contoh siklus, tiga pilar, cara kerja Pesan Sebelum
 * Tanam, bagian pembeli, tanya jawab, dan kaki. Terbuka tanpa masuk; angka dari GET /publik/contoh
 * dan GET /konfigurasi, dihitung fungsi src/lib (D-08, D-44).
 */
import { BagianPembeli, CaraKerja, Pilar, TanyaJawab } from './landing/bagian';
import { useDataLanding } from './landing/data-landing';
import { Hero } from './landing/hero';
import { KerangkaPublik } from './statis/kerangka-publik';

export function HalamanLanding() {
  const d = useDataLanding();
  return (
    <KerangkaPublik>
      <Hero d={d} />
      <Pilar d={d} />
      <CaraKerja d={d} />
      <BagianPembeli d={d} />
      <TanyaJawab d={d} />
    </KerangkaPublik>
  );
}
