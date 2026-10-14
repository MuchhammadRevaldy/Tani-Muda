/**
 * Implementasi tiruan untuk AI (F-04 deteksi, F-05 chatbot) dan Cuaca (F-06).
 */
import contohAi from '../../../../../shared/data-contoh/ai/contoh-jawaban.json';
import { GalatApi } from '../../galat';
import { teksUntukGalat } from '../../../teks/galat-api';
import type {
  KlienChatbot,
  KlienCuaca,
  KlienDeteksi,
} from '../../klien';
import type {
  CuacaSiklusRingkasan,
  DataCuaca,
  DeteksiTanaman,
  HasilDeteksi,
  JawabanChatbot,
  PesanObrolanBot,
} from '../../tipe';
import { kecocokanSuhu } from '../../../lib/suhu';
import type { Konteks } from '../konteks';

export function buatKlienDeteksi(k: Konteks): KlienDeteksi {
  const riwayat: DeteksiTanaman[] = [];

  return {
    async deteksi(m) {
      const p = k.penggunaMasuk();
      if (!p.setuju_ai_pada) {
        throw new GalatApi('PERSETUJUAN_AI_WAJIB', teksUntukGalat('PERSETUJUAN_AI_WAJIB'));
      }

      const hasil: HasilDeteksi = {
        dugaan: contohAi.gambar.dugaan.map((d) => ({
          nama: d.nama,
          keyakinan: d.keyakinan as 'rendah' | 'sedang' | 'tinggi',
          alasan: d.alasan,
        })),
        gejala_terlihat: contohAi.gambar.gejala_terlihat,
        langkah_aman: contohAi.gambar.langkah_aman,
        perlu_penyuluh: contohAi.gambar.perlu_penyuluh,
        catatan: contohAi.gambar.catatan,
      };

      const item: DeteksiTanaman = {
        id: `deteksi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        pengguna_id: p.id,
        siklus_id: m.siklus_id ?? null,
        tugas_id: m.tugas_id ?? null,
        berkas_id: 'berkas-foto-tiruan',
        hasil,
        model: 'tiruan',
        dibuat_pada: k.sekarangIso(),
      };

      riwayat.unshift(item);
      return k.salin(item);
    },

    async riwayat(siklusId) {
      const p = k.penggunaMasuk();
      const hasil = riwayat.filter(
        (r) => r.pengguna_id === p.id && (!siklusId || r.siklus_id === siklusId),
      );
      return k.salin(hasil);
    },
  };
}

export function buatKlienChatbot(k: Konteks): KlienChatbot {
  const sesiObrolan: Record<string, PesanObrolanBot[]> = {};

  return {
    async tanya(pesan, percakapanId) {
      const p = k.penggunaMasuk();
      if (!p.setuju_ai_pada) {
        throw new GalatApi('PERSETUJUAN_AI_WAJIB', teksUntukGalat('PERSETUJUAN_AI_WAJIB'));
      }

      const idSesi = percakapanId ?? `sesi-${Date.now()}`;
      if (!sesiObrolan[idSesi]) {
        sesiObrolan[idSesi] = [];
      }

      const pesanUser: PesanObrolanBot = {
        id: `pesan-${Date.now()}-u`,
        percakapan_bot_id: idSesi,
        peran: 'user',
        isi: pesan,
        sumber: null,
        dibuat_pada: k.sekarangIso(),
      };
      sesiObrolan[idSesi].push(pesanUser);

      const sumber = [
        {
          judul: 'Resep Tanam Sawi Pakcoy Ramah Lingkungan',
          potongan: 'Penyiraman dilakukan rutin pagi dan sore hari menjaga kelembapan tanah.',
        },
      ];

      const teksJawaban = `Terkait "${pesan}": pastikan kelembapan tanah terjaga dengan baik dan cek sirkulasi udara di sekitar bedengan. (Contoh jawaban, mode tanpa internet)`;

      const pesanBot: PesanObrolanBot = {
        id: `pesan-${Date.now()}-a`,
        percakapan_bot_id: idSesi,
        peran: 'assistant',
        isi: teksJawaban,
        sumber,
        dibuat_pada: k.sekarangIso(),
      };
      sesiObrolan[idSesi].push(pesanBot);

      const hasil: JawabanChatbot = {
        jawaban: teksJawaban,
        sumber,
        percakapan_id: idSesi,
        metode_pencarian: 'kata_kunci',
      };

      return k.salin(hasil);
    },

    async riwayat(percakapanId) {
      k.penggunaMasuk();
      if (!percakapanId) {
        const semua = Object.values(sesiObrolan).flat();
        return k.salin(semua);
      }
      return k.salin(sesiObrolan[percakapanId] ?? []);
    },
  };
}

export function buatKlienCuaca(k: Konteks): KlienCuaca {
  return {
    async ambil() {
      const p = k.penggunaMasuk();
      const desa = k.wilayah(p.wilayah_id ?? '')?.desa ?? 'Desa Sukamaju';
      const suhuSekarang = 24.5;
      const suhuMaks = 28.0;
      const suhuMin = 19.0;

      const siklusAktif = k.db.kebun.siklus.filter(
        (s) => s.petani_id === p.id && (s.status === 'rencana' || s.status === 'aktif'),
      );

      const siklusCuaca: CuacaSiklusRingkasan[] = siklusAktif.map((s) => {
        const resep = k.db.resep.find((r) => r.id === s.resep_id);
        const komoditas = k.db.referensi.komoditas.find((c) => c.id === s.komoditas_id);
        const namaTanaman = komoditas ? komoditas.nama : 'Tanaman';

        const rentang = resep
          ? {
              suhu_ideal_min: resep.suhu_ideal_min ?? 15.0,
              suhu_ideal_maks: resep.suhu_ideal_maks ?? 25.0,
              suhu_batas_min: resep.suhu_batas_min ?? 10.0,
              suhu_batas_maks: resep.suhu_batas_maks ?? 32.0,
              saran_suhu_tinggi: resep.saran_suhu_tinggi ?? null,
              saran_suhu_rendah: resep.saran_suhu_rendah ?? null,
            }
          : null;

        const hasilKecocokan = kecocokanSuhu(suhuSekarang, rentang);

        return {
          siklus_id: s.id,
          nama_tanaman: namaTanaman,
          status: hasilKecocokan.status,
          label: hasilKecocokan.label,
          cocok: hasilKecocokan.cocok,
          saran: hasilKecocokan.saran,
        };
      });

      const data: DataCuaca = {
        desa,
        suhu_sekarang: suhuSekarang,
        suhu_maks: suhuMaks,
        suhu_min: suhuMin,
        diperbarui_pada: k.sekarangIso(),
        sumber: 'Open-Meteo (tiruan)',
        siklus: siklusCuaca,
      };

      return k.salin(data);
    },
  };
}
