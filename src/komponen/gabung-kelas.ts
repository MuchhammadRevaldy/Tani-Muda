/** Gabungkan nama kelas, abaikan nilai kosong. */
export function cx(...kelas: Array<string | false | null | undefined>): string {
  return kelas.filter(Boolean).join(' ');
}
