/**
 * Hitungan tanggal kalender tanpa jam ("YYYY-MM-DD"), bebas zona waktu. Semua jadwal memakai ini.
 * Waktu "sekarang" tidak pernah dibaca di sini; selalu dikirim sebagai argumen.
 */
import type { TanggalISO } from './format';

const MS_HARI = 86_400_000;

function keHariUtc(tanggal: TanggalISO): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tanggal);
  if (!m) throw new Error('Tanggal harus berformat YYYY-MM-DD: ' + tanggal);
  const th = Number(m[1]);
  const bl = Number(m[2]);
  const tg = Number(m[3]);
  const ms = Date.UTC(th, bl - 1, tg);
  const d = new Date(ms);
  if (d.getUTCMonth() !== bl - 1 || d.getUTCDate() !== tg) {
    throw new Error('Tanggal tidak ada: ' + tanggal);
  }
  return ms / MS_HARI;
}

function dariHariUtc(hari: number): TanggalISO {
  return new Date(hari * MS_HARI).toISOString().slice(0, 10);
}

/** Tanggal + n hari (n boleh negatif). */
export function tambahHari(tanggal: TanggalISO, n: number): TanggalISO {
  return dariHariUtc(keHariUtc(tanggal) + n);
}

/** Jumlah hari dari `dari` ke `ke` (positif bila `ke` lebih akhir). */
export function selisihHari(dari: TanggalISO, ke: TanggalISO): number {
  return keHariUtc(ke) - keHariUtc(dari);
}

/** Pembanding untuk sort: tanggal lebih awal di depan. */
export function bandingTanggal(a: TanggalISO, b: TanggalISO): number {
  return selisihHari(b, a);
}
