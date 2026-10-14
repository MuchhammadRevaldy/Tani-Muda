/** Pembungkus TanStack Query yang seragam untuk semua hook kueri. */
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { awalanKunci } from '../../lib/kunci-kueri';
import type { GalatApi } from '../galat';
import type { KlienApi } from '../klien';
import { useKlienApi } from '../penyedia-klien';

export interface OpsiKueriApi {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useKueriApi<T>(
  kunci: readonly unknown[],
  ambil: (k: KlienApi) => Promise<T>,
  opsi: boolean | OpsiKueriApi = true,
) {
  const klien = useKlienApi();
  const aktif = typeof opsi === 'boolean' ? opsi : (opsi?.enabled ?? true);
  const refetchInterval = typeof opsi === 'object' ? opsi.refetchInterval : undefined;
  return useQuery<T, GalatApi>({
    queryKey: kunci,
    queryFn: () => ambil(klien),
    enabled: aktif,
    refetchInterval,
  });
}

/** Satu kueri per parameter; hasil digabung: `data` baru ada bila semuanya selesai. */
export function useKueriBanyak<P, T>(
  daftar: P[],
  kunci: (p: P) => readonly unknown[],
  ambil: (k: KlienApi, p: P) => Promise<T>,
): { data: T[] | undefined; isPending: boolean } {
  const klien = useKlienApi();
  return useQueries({
    queries: daftar.map((p) => ({ queryKey: kunci(p), queryFn: () => ambil(klien, p) })),
    combine: (hasil) => ({
      data: hasil.every((h) => h.isSuccess) ? hasil.map((h) => h.data as T) : undefined,
      isPending: hasil.some((h) => h.isPending),
    }),
  });
}

/** Mutasi yang membatalkan cache fitur-fitur terkait setelah berhasil. */
export function useMutasiApi<M, T>(
  jalankan: (k: KlienApi, m: M) => Promise<T>,
  batalkan: (string | readonly unknown[])[],
) {
  const klien = useKlienApi();
  const qc = useQueryClient();
  return useMutation<T, GalatApi, M>({
    mutationFn: (m) => jalankan(klien, m),
    onSuccess: async () => {
      await Promise.all(
        batalkan.map((f) =>
          qc.invalidateQueries({
            queryKey: typeof f === 'string' ? awalanKunci(f) : (f as readonly unknown[]),
          }),
        ),
      );
    },
  });
}

/** Kunci idempoten baru untuk operasi uang dan antrean offline. */
export function kunciIdempotenBaru(): string {
  return globalThis.crypto.randomUUID();
}
