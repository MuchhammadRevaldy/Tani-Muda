/** Modul belajar (kontrak 2.8; D-29). */
import type { WaktuISO } from './umum';

export interface Modul {
  id: string;
  komoditas_id: string;
  metode_id: string;
  tahap: string;
  judul: string;
  ringkasan: string;
  menit: number;
  urutan: number;
  /** MP4 360p; null = video belum ada (placeholder). */
  video_url: string | null;
  ukuran_video_mb: number | null;
  /** Sudah ditonton pengguna yang sedang masuk. */
  selesai: boolean;
  selesai_pada: WaktuISO | null;
}

export interface ParamModul {
  komoditas_id: string;
  metode_id: string;
}
