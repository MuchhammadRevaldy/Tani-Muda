/** Ilustrasi komoditas dan cara tanam untuk alur Hitung; data baru tanpa gambar memakai daun/bedengan. */
import {
  IlustrasiKomoditas,
  IlustrasiMetode,
  daftarIlustrasiKomoditas,
  daftarIlustrasiMetode,
  type NamaIlustrasiKomoditas,
  type NamaIlustrasiMetode,
} from '../../komponen/ilustrasi';

const SAMARAN: Record<string, NamaIlustrasiKomoditas> = { sawi: 'daun', pakcoy: 'daun' };

export function GambarKomoditas({ id, segera }: { id: string; segera?: boolean }) {
  const nama =
    SAMARAN[id] ??
    (daftarIlustrasiKomoditas.includes(id as NamaIlustrasiKomoditas)
      ? (id as NamaIlustrasiKomoditas)
      : 'daun');
  return <IlustrasiKomoditas nama={nama} segera={segera} />;
}

export function GambarMetode({ id, segera }: { id: string; segera?: boolean }) {
  const nama = daftarIlustrasiMetode.includes(id as NamaIlustrasiMetode)
    ? (id as NamaIlustrasiMetode)
    : 'bedengan';
  return <IlustrasiMetode nama={nama} segera={segera} />;
}
