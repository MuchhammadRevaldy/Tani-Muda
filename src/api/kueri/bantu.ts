/** Pembungkus TanStack Query yang seragam untuk semua hook kueri. */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { awalanKunci } from '../../lib/kunci-kueri';
import type { GalatApi } from '../galat';
import type { KlienApi } from '../klien';
import { useKlienApi } from '../penyedia-klien';

export function useKueriApi<T>(
  kunci: readonly unknown[],
  ambil: (k: KlienApi) => Promise<T>,
  aktif = true,
) {
  const klien = useKlienApi();
  return useQuery<T, GalatApi>({ queryKey: kunci, queryFn: () => ambil(klien), enabled: aktif });
}

/** Mutasi yang membatalkan cache fitur-fitur terkait setelah berhasil. */
export function useMutasiApi<M, T>(
  jalankan: (k: KlienApi, m: M) => Promise<T>,
  batalkan: string[],
) {
  const klien = useKlienApi();
  const qc = useQueryClient();
  return useMutation<T, GalatApi, M>({
    mutationFn: (m) => jalankan(klien, m),
    onSuccess: async () => {
      await Promise.all(batalkan.map((f) => qc.invalidateQueries({ queryKey: awalanKunci(f) })));
    },
  });
}

/** Kunci idempoten baru untuk operasi uang dan antrean offline. */
export function kunciIdempotenBaru(): string {
  return globalThis.crypto.randomUUID();
}
