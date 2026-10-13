/**
 * Halaman depan (papan 01, T4.32): hero dengan contoh siklus, tiga pilar, cara kerja Pesan Sebelum
 * Tanam, bagian pembeli, tanya jawab, dan kaki. Terbuka tanpa masuk; angka dari GET /publik/contoh
 * dan GET /konfigurasi, dihitung fungsi src/lib (D-08, D-44).
 */
import { BagianPembeli, CaraKerja, Pilar, TanyaJawab } from './landing/bagian';
import { useDataLanding } from './landing/data-landing';
import { Hero } from './landing/hero';
import { useMunculGulir } from './landing/muncul-gulir';
import { KerangkaPublik } from './statis/kerangka-publik';

export function HalamanLanding() {
  const d = useDataLanding();
  useMunculGulir();
  // Setiap bagian muncul saat digulir (D-61); hero ikut, karena langsung berada di layar.
  return (
    <KerangkaPublik>
      <div className="muncul-gulir">
        <Hero d={d} />
      </div>
      <div className="muncul-gulir">
        <Pilar d={d} />
      </div>
      <div className="muncul-gulir">
        <CaraKerja d={d} />
      </div>
      <div className="muncul-gulir">
        <BagianPembeli d={d} />
      </div>
      <div className="muncul-gulir">
        <TanyaJawab d={d} />
      </div>
    </KerangkaPublik>
  );
}
