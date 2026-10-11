/**
 * Teks jam yang sadar hari (D-48): satu pemformat untuk semua batas periksa dan jam kiriman.
 * "pukul 13.00" (hari ini), "besok pukul 04.00", "kemarin pukul 22.00", atau
 * "Senin, 12 Oktober pukul 04.00" untuk hari lain.
 */
import { formatJam, formatTanggal } from '../lib/format';
import type { WaktuRelatif } from '../lib/waktu-relatif';

export function teksPukul(w: WaktuRelatif): string {
  const jam = `pukul ${formatJam(w.jam, w.menit)}`;
  switch (w.hari) {
    case 'hari_ini':
      return jam;
    case 'besok':
      return `besok ${jam}`;
    case 'kemarin':
      return `kemarin ${jam}`;
    case 'lain':
      return `${formatTanggal(w.tanggal)} ${jam}`;
  }
}
