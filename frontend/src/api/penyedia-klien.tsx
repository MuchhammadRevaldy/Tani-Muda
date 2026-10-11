/**
 * Penyedia React untuk klien API dan TanStack Query (T3.04). Halaman memakai hook di src/api/kueri/
 * yang membaca klien dari sini; halaman tidak pernah membuat atau mengimpor implementasi klien.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { adalahGalatApi } from './galat';
import type { KlienApi, KontrolPengembangan, SumberData } from './klien';

interface NilaiKlien {
  klien: KlienApi;
  sumber: SumberData;
  kontrol: KontrolPengembangan | null;
}

const KonteksKlien = createContext<NilaiKlien | null>(null);

/** Galat 4xx tidak diulang (masukan atau akses salah); galat jaringan atau 5xx diulang dua kali. */
export function bolehUlang(jumlahGagal: number, galat: unknown): boolean {
  if (adalahGalatApi(galat) && galat.status < 500) return false;
  return jumlahGagal < 2;
}

export function buatQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: bolehUlang, staleTime: 30_000, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}

export function PenyediaKlienApi({
  klien,
  sumber = 'tiruan',
  kontrol = null,
  queryClient,
  children,
}: {
  klien: KlienApi;
  sumber?: SumberData;
  kontrol?: KontrolPengembangan | null;
  queryClient?: QueryClient;
  children: ReactNode;
}) {
  const [qc] = useState(() => queryClient ?? buatQueryClient());
  return (
    <KonteksKlien.Provider value={{ klien, sumber, kontrol }}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </KonteksKlien.Provider>
  );
}

function useNilaiKlien(): NilaiKlien {
  const v = useContext(KonteksKlien);
  if (!v) throw new Error('useKlienApi harus dipakai di dalam <PenyediaKlienApi>');
  return v;
}

export const useKlienApi = (): KlienApi => useNilaiKlien().klien;
export const useSumberData = (): SumberData => useNilaiKlien().sumber;
/** Kontrol pengembangan (pemilih akun demo, kode uji); null di produksi dan pada klien HTTP. */
export const useKontrolPengembangan = (): KontrolPengembangan | null => useNilaiKlien().kontrol;
