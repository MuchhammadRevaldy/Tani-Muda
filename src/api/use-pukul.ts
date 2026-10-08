/**
 * Format jam yang sadar hari di zona pengguna (D-48): `pukul(iso)` → "pukul 13.00",
 * "besok pukul 04.00", "kemarin pukul 22.00", atau "Senin, 12 Oktober pukul 04.00".
 * Dipakai semua teks batas periksa dan jam kiriman.
 */
import { useEffect, useState } from 'react';
import { waktuRelatif } from '../lib/waktu-relatif';
import { ZONA_BAWAAN } from '../lib/zona-waktu';
import { teksPukul } from '../teks/waktu';
import { useSesi } from './sesi';

export function usePukul(): (iso: string | null) => string {
  const { akun } = useSesi();
  const zona = akun?.pengguna.zona_waktu ?? ZONA_BAWAAN;
  const [sekarang, setSekarang] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setSekarang(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return (iso) => (iso ? teksPukul(waktuRelatif(Date.parse(iso), sekarang, zona)) : '');
}
