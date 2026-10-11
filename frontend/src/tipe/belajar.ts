/** Tipe domain modul belajar (Model Data PRD, P0-05). */

export interface Modul {
  id: string;
  komoditasId: string;
  metodeId: string;
  tahap: string;
  judul: string;
  menit: number;
  urutan: number;
}
