/**
 * Tipe data API untuk fitur AI (PRD Tambahan F-04, F-05, D-64).
 */

export type TingkatKeyakinan = 'rendah' | 'sedang' | 'tinggi';

export interface DugaanPenyakit {
  nama: string;
  keyakinan: TingkatKeyakinan;
  alasan: string;
}

export interface HasilDeteksi {
  dugaan: DugaanPenyakit[];
  gejala_terlihat: string[];
  langkah_aman: string[];
  perlu_penyuluh: boolean;
  catatan: string;
}

export interface DeteksiTanaman {
  id: string;
  pengguna_id: string;
  siklus_id: string | null;
  tugas_id: string | null;
  berkas_id: string;
  hasil: HasilDeteksi;
  model: string;
  dibuat_pada: string;
}

export interface SumberPotongan {
  judul: string;
  potongan: string;
}

export interface JawabanChatbot {
  jawaban: string;
  sumber: SumberPotongan[];
  percakapan_id: string;
  metode_pencarian?: 'embedding' | 'kata_kunci';
}

export interface PesanObrolanBot {
  id: string;
  percakapan_bot_id: string;
  peran: 'user' | 'assistant';
  isi: string;
  sumber: SumberPotongan[] | null;
  dibuat_pada: string;
}
