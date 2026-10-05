/** Klien tiruan: referensi (komoditas, metode, merek, harga, subsidi, promo, konfigurasi) dan resep. */
import { rataRataSekitar, urutkanMerek, validasiMerekLain } from '../../../lib/harga-item';
import { selisihHari } from '../../../lib/tanggal';
import type { KlienReferensi, KlienResep } from '../../klien';
import { laporanKeDomain, merekKeDomain } from '../../peta';
import type { Pengguna, ResepTanam } from '../../tipe';
import type { Konteks } from '../konteks';
import { jarakPesananKm, pesananTerbuka } from './bantu';

function kecamatanPengguna(k: Konteks, p: Pengguna): string {
  return k.wilayah(p.wilayah_id)?.kecamatan ?? '';
}

/** Versi terbaru per komoditas + metode di antara resep yang terlihat. */
export function resepTerbaru(daftar: ResepTanam[]): ResepTanam[] {
  const peta = new Map<string, ResepTanam>();
  for (const r of daftar) {
    const kunci = `${r.komoditas_id}|${r.metode_id}`;
    const lama = peta.get(kunci);
    if (!lama || r.versi > lama.versi) peta.set(kunci, r);
  }
  return [...peta.values()];
}

export function buatKlienReferensi(k: Konteks): KlienReferensi {
  return {
    async komoditas(p = {}) {
      const pengguna = k.penggunaMasuk();
      const terlihat = k.db.resep.filter((r) => k.resepTerlihat(r));
      return k.db.referensi.komoditas
        .filter((x) => !p.jenis_lahan || x.jenis_lahan_cocok.includes(p.jenis_lahan))
        .map((x) => ({
          ...k.salin(x),
          status_resep: terlihat.some((r) => r.komoditas_id === x.id)
            ? ('tersedia' as const)
            : ('segera_hadir' as const),
          jumlah_pesanan_sekitar:
            pengguna.peran !== 'petani'
              ? 0
              : k.db.pesanan.pesanan.filter((ps) => {
                  if (ps.komoditas_id !== x.id || !pesananTerbuka(k, ps)) return false;
                  const j = jarakPesananKm(k, pengguna, ps);
                  return j !== null && j <= k.db.konfigurasi.radius_km;
                }).length,
        }));
    },
    async metode() {
      k.penggunaMasuk();
      return k.salin(k.db.referensi.metode);
    },
    async sistemHidroponik() {
      k.penggunaMasuk();
      return k.salin(k.db.referensi.sistem_hidroponik);
    },
    async konversiSatuan(wilayahId) {
      k.penggunaMasuk();
      if (!k.wilayah(wilayahId)) k.galat('TIDAK_DITEMUKAN');
      return k.salin(k.db.referensi.konversi_satuan.filter((x) => x.wilayah_id === wilayahId));
    },
    async konfigurasi() {
      return k.salin(k.db.konfigurasi);
    },
    async merek(inputId) {
      const p = k.penggunaMasuk();
      const merek = k.db.referensi.merek_input.filter((m) => m.input_id === inputId);
      if (!k.db.referensi.input_pertanian.some((i) => i.id === inputId)) k.galat('TIDAK_DITEMUKAN');
      const urut = urutkanMerek(
        merek.map(merekKeDomain),
        k.db.referensi.laporan_harga.map(laporanKeDomain),
        kecamatanPengguna(k, p),
        k.hariIni(p),
      );
      return urut.map((r) => ({
        merek: k.salin(merek.find((m) => m.id === r.merek.id)!),
        harga_kemasan: r.hargaKemasan,
        harga_per_satuan: r.hargaPerSatuan,
        jumlah_pelapor: r.jumlahPelapor,
        hari_lalu: r.hariLalu,
      }));
    },
    async laporHarga(m) {
      const p = k.penggunaMasuk();
      if (!(m.harga_kemasan >= 0)) k.validasi({ harga_kemasan: 'HARGA_NEGATIF' });
      let merekId: string;
      if ('merek_id' in m) {
        if (!k.db.referensi.merek_input.some((x) => x.id === m.merek_id))
          k.validasi({ merek_id: 'TIDAK_DITEMUKAN' });
        merekId = m.merek_id;
      } else {
        if (!k.db.referensi.input_pertanian.some((i) => i.id === m.merek_baru.input_id))
          k.validasi({ input_id: 'TIDAK_DITEMUKAN' });
        const v = k.dariHasil(
          validasiMerekLain({
            namaMerek: m.merek_baru.nama,
            isiKemasan: m.merek_baru.isi_kemasan,
            hargaKemasan: m.harga_kemasan,
          }),
          'merek_baru',
        );
        merekId = k.idBaru('merek');
        k.db.referensi.merek_input.push({
          id: merekId,
          input_id: m.merek_baru.input_id,
          nama: v.namaMerek,
          produsen: null,
          isi_kemasan: v.isiKemasan,
          teks_kemasan: m.merek_baru.teks_kemasan || `${v.isiKemasan}`,
          nomor_pendaftaran: null,
        });
      }
      const laporan = {
        id: k.idBaru('laporan'),
        merek_id: merekId,
        pelapor_id: p.id,
        harga_kemasan: m.harga_kemasan,
        kecamatan: kecamatanPengguna(k, p),
        tanggal: k.hariIni(p),
      };
      k.db.referensi.laporan_harga.push(laporan);
      k.simpan();
      return k.salin(laporan);
    },
    async promo() {
      const p = k.penggunaMasuk();
      const hariIni = k.hariIni(p);
      const kecamatan = kecamatanPengguna(k, p);
      return k.salin(
        k.db.referensi.promo.filter(
          (x) =>
            k.wilayah(x.wilayah_id)?.kecamatan === kecamatan &&
            selisihHari(x.berlaku_mulai, hariIni) >= 0 &&
            selisihHari(hariIni, x.berlaku_sampai) >= 0,
        ),
      );
    },
    async kelayakanSubsidi(komoditasId) {
      k.penggunaMasuk();
      return k.salin(
        k.db.referensi.kelayakan_subsidi.filter((x) => x.komoditas_id === komoditasId),
      );
    },
    async hargaSekitar(inputId) {
      const p = k.penggunaMasuk();
      const merek = k.db.referensi.merek_input
        .filter((m) => m.input_id === inputId)
        .map(merekKeDomain);
      const ids = new Set(merek.map((m) => m.id));
      const laporan = k.db.referensi.laporan_harga
        .filter((l) => ids.has(l.merek_id))
        .map(laporanKeDomain);
      const kecamatan = kecamatanPengguna(k, p);
      const hariIni = k.hariIni(p);
      const rentang = k.db.konfigurasi.laporan_harga_rentang_hari;
      const harga = rataRataSekitar(laporan, merek, kecamatan, hariIni, {
        rentangHari: rentang,
        minimalLaporan: k.db.konfigurasi.laporan_harga_minimal,
      });
      const jumlah = laporan.filter(
        (l) =>
          l.kecamatan === kecamatan &&
          selisihHari(l.tanggal, hariIni) >= 0 &&
          selisihHari(l.tanggal, hariIni) <= rentang,
      ).length;
      return { input_id: inputId, harga_per_satuan: harga, jumlah_laporan: jumlah };
    },
  };
}

export function buatKlienResep(k: Konteks): KlienResep {
  return {
    async daftar(p = {}) {
      k.penggunaMasuk();
      const daftar = resepTerbaru(k.db.resep.filter((r) => k.resepTerlihat(r))).filter(
        (r) =>
          (!p.komoditas_id || r.komoditas_id === p.komoditas_id) &&
          (!p.metode_id || r.metode_id === p.metode_id),
      );
      return k.salin(daftar);
    },
    async ambil(id) {
      const p = k.penggunaMasuk();
      const r = k.milik(
        k.db.resep,
        (x) => x.id === id,
        (x) =>
          k.resepTerlihat(x) ||
          p.peran === 'mentor' ||
          p.peran === 'admin' ||
          k.db.kebun.siklus.some((s) => s.petani_id === p.id && s.resep_id === x.id),
      );
      return k.salin(r);
    },
    async minta(m) {
      const p = k.wajibPeran('petani');
      if (!k.db.referensi.komoditas.some((x) => x.id === m.komoditas_id))
        k.validasi({ komoditas_id: 'TIDAK_DITEMUKAN' });
      if (m.metode_id && !k.db.referensi.metode.some((x) => x.id === m.metode_id))
        k.validasi({ metode_id: 'TIDAK_DITEMUKAN' });
      const metode = m.metode_id ?? null;
      const lama = k.db.pesanan.permintaan_resep.find(
        (x) =>
          x.pengguna_id === p.id && x.komoditas_id === m.komoditas_id && x.metode_id === metode,
      );
      if (lama) return { permintaan: k.salin(lama), sudah_diminta: true };
      const baru = {
        id: k.idBaru('permintaan'),
        pengguna_id: p.id,
        komoditas_id: m.komoditas_id,
        metode_id: metode,
        wilayah_id: p.wilayah_id,
        dibuat_pada: k.sekarangIso(),
      };
      k.db.pesanan.permintaan_resep.push(baru);
      k.simpan();
      return { permintaan: k.salin(baru), sudah_diminta: false };
    },
    async permintaanSaya() {
      const p = k.wajibPeran('petani');
      return k.salin(k.db.pesanan.permintaan_resep.filter((x) => x.pengguna_id === p.id));
    },
  };
}
