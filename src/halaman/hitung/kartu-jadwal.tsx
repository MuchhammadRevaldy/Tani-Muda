/** Pratinjau jadwal dari resep (papan 13 desktop "Pratinjau jadwal", papan 16 "Jadwal yang akan dibuat"). */
import { Kartu } from '../../komponen/kartu';
import { LabelKecil } from '../../komponen/label-kecil';
import { PenggarisUmurTanam } from '../../komponen/penggaris-umur-tanam';
import { teksUmum } from '../../teks/umum';
import type { Rencana } from './use-rencana';

export function KartuJadwal({
  r,
  judul,
  keterangan,
  lebar,
}: {
  r: Rencana;
  judul: string;
  keterangan: string;
  /** Varian lebar (label di atas pin) untuk kolom isi desktop. */
  lebar?: boolean;
}) {
  if (!r.resepApi || !r.jadwal.length) return null;
  return (
    <Kartu judul={judul} keterangan={keterangan} tingkatJudul={2}>
      {r.resepApi.contoh ? (
        <LabelKecil nada="contoh" className="mb-3">
          {teksUmum.labelContoh}
        </LabelKecil>
      ) : null}
      <PenggarisUmurTanam
        varian={lebar ? 'lebar' : 'hp'}
        hariIni={0}
        hariPanen={r.resepApi.umur_panen_hari}
        jadwal={r.jadwal}
        tampilkanDaftar
      />
    </Kartu>
  );
}
