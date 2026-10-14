/**
 * Tipe data API untuk fitur cuaca (PRD Tambahan F-06).
 */
import type { StatusKecocokanSuhu } from '../../lib/suhu';

export interface CuacaSiklusRingkasan {
  siklus_id: string;
  nama_tanaman: string;
  status: StatusKecocokanSuhu;
  label: string;
  cocok: boolean;
  saran: string | null;
}

export interface DataCuaca {
  desa: string;
  suhu_sekarang: number;
  suhu_maks: number;
  suhu_min: number;
  diperbarui_pada: string;
  sumber: string;
  siklus: CuacaSiklusRingkasan[];
}
