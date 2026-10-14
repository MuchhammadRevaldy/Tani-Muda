/**
 * F-11: Saran setelah semua tugas hari ini selesai.
 * Fungsi murni berbasis aturan untuk menghasilkan ringkasan harian petani (PRD Tambahan F-11).
 */
import { POIN_PERISTIWA } from './level';
import { tambahHari } from './tanggal';

export interface TugasHarian {
  id: string;
  judul: string;
  tanggal: string; // YYYY-MM-DD
  selesai: boolean;
  selesai_pada?: string | null;
  berkas_foto_id?: string | null;
  fase_tanam?: string | null;
}

export interface FotoHarian {
  id: string;
  url: string;
  tugas_id?: string | null;
  dibuat_pada?: string;
}

export interface ResepHarian {
  komoditas_id?: string;
  saran_suhu_tinggi?: string | null;
  saran_suhu_rendah?: string | null;
  tahap_saran?: Array<{
    fase: string;
    saran: string[];
  }>;
}

export interface HasilRingkasanHarian {
  semuaSelesai: boolean;
  jumlahTugasHariIni: number;
  jumlahTugasSelesai: number;
  jumlahFotoBukti: number;
  poinDiperoleh: number;
  tugasBesok: Array<{ id: string; judul: string }>;
  saranTahap: string[];
  bisaCekKesehatan: boolean;
  fotoCekKesehatanUrl: string | null;
}

/**
 * Menghasilkan ringkasan dan rekomendasi harian berbasis aturan saat tugas selesai.
 */
export function ringkasanHarian(
  semuaTugas: TugasHarian[],
  fotoHariIni: FotoHarian[],
  resep: ResepHarian | null | undefined,
  hariIni: string,
): HasilRingkasanHarian {
  const tugasHariIni = semuaTugas.filter((t) => t.tanggal === hariIni);
  const jumlahTugasHariIni = tugasHariIni.length;
  const tugasSelesai = tugasHariIni.filter((t) => t.selesai);
  const jumlahTugasSelesai = tugasSelesai.length;
  const semuaSelesai = jumlahTugasHariIni > 0 && jumlahTugasSelesai === jumlahTugasHariIni;

  const jumlahFotoBukti = fotoHariIni.length;
  const poinDiperoleh =
    jumlahTugasSelesai * POIN_PERISTIWA.tugas_tepat_waktu +
    jumlahFotoBukti * POIN_PERISTIWA.foto_bukti;

  const tanggalBesok = tambahHari(hariIni, 1);
  const tugasBesok = semuaTugas
    .filter((t) => t.tanggal === tanggalBesok)
    .map((t) => ({ id: t.id, judul: t.judul }));

  // Ambil 1-2 saran dari resep atau aturan umum tahap tanam
  const saranTahap: string[] = [];
  const faseTerakhir = tugasHariIni.find((t) => t.fase_tanam)?.fase_tanam;

  if (resep?.tahap_saran && faseTerakhir) {
    const cocok = resep.tahap_saran.find((s) => s.fase.toLowerCase() === faseTerakhir.toLowerCase());
    if (cocok && cocok.saran.length > 0) {
      saranTahap.push(...cocok.saran.slice(0, 2));
    }
  }

  if (saranTahap.length === 0 && resep?.saran_suhu_tinggi) {
    saranTahap.push(resep.saran_suhu_tinggi);
  }

  if (saranTahap.length < 2) {
    const saranBawaan = [
      'Periksa kelembapan media tanam di petak pada sore hari.',
      'Bersihkan gulma dan daun kering di sekitar perakaran untuk mencegah hama.',
      'Pastikan sirkulasi udara dan intensitas cahaya matahari cukup optimal.',
    ];
    for (const s of saranBawaan) {
      if (!saranTahap.includes(s)) {
        saranTahap.push(s);
      }
      if (saranTahap.length >= 2) break;
    }
  }

  const bisaCekKesehatan = jumlahFotoBukti > 0;
  const fotoCekKesehatanUrl = bisaCekKesehatan ? fotoHariIni[0]!.url : null;

  return {
    semuaSelesai,
    jumlahTugasHariIni,
    jumlahTugasSelesai,
    jumlahFotoBukti,
    poinDiperoleh,
    tugasBesok,
    saranTahap: saranTahap.slice(0, 2),
    bisaCekKesehatan,
    fotoCekKesehatanUrl,
  };
}
