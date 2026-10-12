/** Ilustrasi komoditas dan cara tanam untuk alur Hitung; data baru tanpa gambar memakai ikon kebun/bedengan. */
import {
  IlustrasiKomoditas,
  IlustrasiMetode,
  daftarIlustrasiMetode,
  type NamaIlustrasiMetode,
} from '../../komponen/ilustrasi';

/** Nama komoditas selalu tertulis di sebelah gambar, jadi gambar dekoratif (alt kosong). */
export function GambarKomoditas({ id, segera }: { id: string; segera?: boolean }) {
  return <IlustrasiKomoditas nama={id} segera={segera} alt="" />;
}

export function GambarMetode({ id, segera }: { id: string; segera?: boolean }) {
  const nama = daftarIlustrasiMetode.includes(id as NamaIlustrasiMetode)
    ? (id as NamaIlustrasiMetode)
    : 'bedengan';
  return <IlustrasiMetode nama={nama} segera={segera} />;
}
