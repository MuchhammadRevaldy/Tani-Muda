/** Kerangka halaman yang mengisi nama dan keterangan akun dari sesi (T4.01). */
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLencanaChat, useWilayahSatu } from '../api/kueri';
import { useLencanaPesanan } from '../api/pesanan-dilihat';
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
  const { pathname } = useLocation();
  const p = akun?.pengguna;
  const baru = useLencanaPesanan(p?.peran === 'petani');
  const chatQ = useLencanaChat({ refetchInterval: 60_000 });
  const nChat = chatQ.data?.belum_dibaca ?? 0;
  return (
    <KerangkaPetani
      akun={{ nama: p?.nama ?? '', keterangan: keteranganAkun(p?.peran ?? null, desa) }}
      lencana={baru > 0 ? { pesanan: baru } : undefined}
      lencanaChat={nChat}
      tanpaNav={tanpaNav}
      menuAktif={menuAktif}
      kunciHalaman={pathname}
      onKeluar={() => void keluar().then(() => navigate('/masuk', { replace: true }))}
    >
      {children}
    </KerangkaPetani>
  );
}

export function KerangkaPembeliSesi({ children }: { children: ReactNode }) {
  const { akun } = useSesi();
  const { pathname } = useLocation();
  const { keluar } = useKeluarSesi();
  const navigate = useNavigate();
  const chatQ = useLencanaChat({ refetchInterval: 60_000 });
  const nChat = chatQ.data?.belum_dibaca ?? 0;
  return (
    <KerangkaPembeli
      namaUsaha={akun?.profil_pembeli?.nama_usaha ?? akun?.pengguna.nama ?? ''}
      foto={akun?.pengguna.foto_profil ?? null}
      lencanaChat={nChat}
      // Sama dengan petani: POST /auth/keluar, cache kueri dikosongkan, lalu ke /masuk.
      onKeluar={() => void keluar().then(() => navigate('/masuk', { replace: true }))}
      kunciHalaman={pathname}
    >
      {children}
    </KerangkaPembeli>
  );
}
