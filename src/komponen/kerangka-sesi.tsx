/** Kerangka halaman yang mengisi nama dan keterangan akun dari sesi (T4.01). */
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWilayahSatu } from '../api/kueri';
import { useKeluarSesi, useSesi } from '../api/sesi';
import { keteranganAkun } from '../teks/sesi';
import { KerangkaPembeli, KerangkaPetani } from './kerangka';
import type { MenuPetani } from './navigasi';

/** Nama desa pengguna yang sedang masuk (null bila belum ada atau masih dimuat). */
export function useDesaSaya(): string | null {
  const { akun } = useSesi();
  const w = useWilayahSatu(akun?.pengguna.wilayah_id ?? null);
  return w.data?.desa ?? null;
}

export function KerangkaPetaniSesi({
  children,
  tanpaNav,
  menuAktif,
}: {
  children: ReactNode;
  tanpaNav?: boolean;
  menuAktif?: MenuPetani;
}) {
  const { akun } = useSesi();
  const desa = useDesaSaya();
  const { keluar } = useKeluarSesi();
  const navigate = useNavigate();
  const p = akun?.pengguna;
  return (
    <KerangkaPetani
      akun={{ nama: p?.nama ?? '', keterangan: keteranganAkun(p?.peran ?? null, desa) }}
      tanpaNav={tanpaNav}
      menuAktif={menuAktif}
      onKeluar={() => void keluar().then(() => navigate('/masuk', { replace: true }))}
    >
      {children}
    </KerangkaPetani>
  );
}

export function KerangkaPembeliSesi({ children }: { children: ReactNode }) {
  const { akun } = useSesi();
  return (
    <KerangkaPembeli namaUsaha={akun?.profil_pembeli?.nama_usaha ?? akun?.pengguna.nama ?? ''}>
      {children}
    </KerangkaPembeli>
  );
}
