/**
 * Zona waktu (D-31): semua waktu disimpan dalam UTC; "hari ini" dan jam pengingat dihitung menurut
 * zona waktu pengguna (bawaan Asia/Jakarta). Waktu selalu dikirim sebagai argumen (milidetik epoch).
 */
import type { TanggalISO } from './format';

/** Zona waktu bawaan pengguna (D-31). */
export const ZONA_BAWAAN = 'Asia/Jakarta';

function bagian(ms: number, zona: string): Record<string, string> {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  return Object.fromEntries(f.formatToParts(new Date(ms)).map((p) => [p.type, p.value]));
}

/** Tanggal kalender di zona pengguna, mis. 2026-10-04T18:00Z di Asia/Jakarta → "2026-10-05". */
export function tanggalLokal(ms: number, zona: string = ZONA_BAWAAN): TanggalISO {
  const b = bagian(ms, zona);
  return `${b.year}-${b.month}-${b.day}`;
}

/** Jam dan menit di zona pengguna. */
export function jamLokal(ms: number, zona: string = ZONA_BAWAAN): { jam: number; menit: number } {
  const b = bagian(ms, zona);
  return { jam: Number(b.hour), menit: Number(b.minute) };
}

/** Selisih zona terhadap UTC (menit) pada saat itu, mis. Asia/Jakarta → 420. */
export function selisihZonaMenit(ms: number, zona: string = ZONA_BAWAAN): number {
  const b = bagian(ms, zona);
  const lokalSebagaiUtc = Date.UTC(
    Number(b.year),
    Number(b.month) - 1,
    Number(b.day),
    Number(b.hour),
    Number(b.minute),
  );
  const utcDibulatkan = Math.floor(ms / 60_000) * 60_000;
  return Math.round((lokalSebagaiUtc - utcDibulatkan) / 60_000);
}

/** Waktu UTC (ISO 8601 dengan "Z") untuk tanggal dan jam lokal di zona pengguna. */
export function utcDariLokal(
  tanggal: TanggalISO,
  jam: number,
  menit: number,
  zona: string = ZONA_BAWAAN,
): string {
  const [th, bl, tg] = tanggal.split('-').map(Number) as [number, number, number];
  const tebakan = Date.UTC(th, bl - 1, tg, jam, menit);
  const selisih = selisihZonaMenit(tebakan, zona);
  return new Date(tebakan - selisih * 60_000).toISOString();
}

/** Benar bila nama zona waktu dikenal (IANA), mis. "Asia/Makassar". */
export function zonaSah(zona: string): boolean {
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: zona });
    return true;
  } catch {
    return false;
  }
}
