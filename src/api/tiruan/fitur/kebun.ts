/** Klien tiruan: lahan, kebun (siklus, tugas, pengukuran, pengeluaran, jurnal, pengingat), belajar. */
import { buatJadwal } from '../../../lib/jadwal-buat';
import {
  tundaTugas as tundaDomain,
  ubahTanggalTanam as ubahTanggalDomain,
} from '../../../lib/jadwal-ubah';
import { muatSiklusBaru } from '../../../lib/kapasitas-lahan';
import { validasiUkuran } from '../../../lib/kebutuhan';
import { keM2, type KonversiLuas } from '../../../lib/konversi-satuan';
import { hitungModal } from '../../../lib/modal';
import { nilaiPengukuran, perluUkurUlang, validasiNilaiUkur } from '../../../lib/pengukuran';
import { hitungRingkasan } from '../../../lib/ringkasan';
import { bandingTanggal, selisihHari, tambahHari } from '../../../lib/tanggal';
import { perkiraanPanen } from '../../../lib/ukuran-metode';
import { judulUkurUlang } from '../../../teks/jadwal';
import type { KlienBelajar, KlienKebun, KlienLahan } from '../../klien';
import {
  lahanKeDomain,
  resepKeDomain,
  siklusKeDomain,
  tugasDariDomain,
  tugasKeDomain,
} from '../../peta';
import type { Pengguna, ResepTanam, SiklusDetail, SiklusTanam, Tugas } from '../../tipe';
import type { Konteks } from '../konteks';
import { denganKapasitas } from './bantu';

type SiklusMentah = Omit<SiklusTanam, 'resep_contoh'>;

const tanggalSah = (t: unknown): t is string => {
  if (typeof t !== 'string') return false;
  try {
    tambahHari(t, 0);
    return true;
  } catch {
    return false;
  }
};

export function konversiWilayah(k: Konteks, wilayahId: string | null): KonversiLuas {
  const hasil: KonversiLuas = {};
  for (const x of k.db.referensi.konversi_satuan)
    if (x.wilayah_id === wilayahId) hasil[x.satuan] = x.nilai_m2;
  return hasil;
}

export function resepSiklus(k: Konteks, s: SiklusMentah): ResepTanam {
  return k.db.resep.find((r) => r.id === s.resep_id) as ResepTanam;
}

export function detailSiklus(k: Konteks, s: SiklusMentah, p: Pengguna): SiklusDetail {
  const resep = resepSiklus(k, s);
  const rencana = k.db.kebun.rencana_item.filter((r) => r.siklus_id === s.id);
  const alat = rencana.filter((r) => r.alat_sekali_beli);
  const pembagian = Math.max(1, ...alat.map((r) => r.jumlah_siklus_pembagian));
  const modal = k.dariHasil(
    hitungModal(
      rencana.map((r) => ({
        id: r.id,
        grup: r.grup,
        jumlah: r.jumlah,
        hargaSatuan: r.harga_satuan,
        alatSekaliBeli: r.alat_sekali_beli,
      })),
      { bagiAlat: pembagian > 1, jumlahSiklusPembagian: pembagian },
    ),
  );
  const hariIni = k.hariIni(p);
  return k.salin({
    ...s,
    resep_contoh: resep.contoh,
    rencana_item: rencana,
    modal: {
      total_bahan: modal.totalBahan,
      total_alat: modal.totalAlat,
      biaya_alat_per_siklus: modal.biayaAlatPerSiklus,
      total_modal: modal.totalModal,
      lengkap: modal.lengkap,
      sudah_keluar: k.db.kebun.pengeluaran
        .filter((x) => x.siklus_id === s.id)
        .reduce((a, x) => a + x.nominal, 0),
    },
    hari_ke: s.tanggal_tanam ? selisihHari(s.tanggal_tanam, hariIni) : null,
    perkiraan_tanggal_panen: s.tanggal_tanam
      ? tambahHari(s.tanggal_tanam, resep.umur_panen_hari)
      : null,
  });
}

/** Ukuran siklus dalam satuan kapasitas lahannya (m² atau lubang), atau 0 bila tidak berlaku. */
function ukuranKapasitas(
  k: Konteks,
  s: Pick<SiklusMentah, 'lahan_id' | 'luas_m2' | 'jumlah_lubang'>,
): number {
  const lahan = k.db.kebun.lahan.find((l) => l.id === s.lahan_id);
  return (lahan?.jenis_lahan === 'hidroponik' ? s.jumlah_lubang : s.luas_m2) ?? 0;
}

/** Siklus mulai memakai lahan: periksa kapasitas tanpa menghitung siklus itu sendiri (D-15, D-34). */
export function periksaKapasitas(
  k: Konteks,
  s: Pick<SiklusMentah, 'id' | 'lahan_id' | 'luas_m2' | 'jumlah_lubang'>,
): void {
  const ukuran = ukuranKapasitas(k, s);
  if (ukuran <= 0) return;
  const lahan = k.db.kebun.lahan.find((l) => l.id === s.lahan_id)!;
  const lain = k.db.kebun.siklus.filter((x) => x.id !== s.id).map(siklusKeDomain);
  k.dariHasil(muatSiklusBaru(lahanKeDomain(lahan), lain, ukuran));
}

function buatTugas(k: Konteks, s: SiklusMentah, tanggalTanam: string): void {
  const resep = resepKeDomain(resepSiklus(k, s));
  for (const t of k.dariHasil(buatJadwal(resep.tugas, tanggalTanam)))
    k.db.kebun.tugas.push(tugasDariDomain(t, s.id));
}

function siklusMilik(k: Konteks, p: Pengguna, id: string): SiklusMentah {
  return k.milik(
    k.db.kebun.siklus,
    (s) => s.id === id,
    (s) => s.petani_id === p.id,
  );
}

function tugasMilik(k: Konteks, p: Pengguna, id: string): { tugas: Tugas; siklus: SiklusMentah } {
  const tugas = k.milik(
    k.db.kebun.tugas,
    (t) => t.id === id,
    (t) => k.db.kebun.siklus.some((s) => s.id === t.siklus_id && s.petani_id === p.id),
  );
  return { tugas, siklus: k.db.kebun.siklus.find((s) => s.id === tugas.siklus_id)! };
}

const urutTugas = (a: Tugas, b: Tugas) =>
  bandingTanggal(a.tanggal, b.tanggal) || a.judul.localeCompare(b.judul, 'id');

export function buatKlienLahan(k: Konteks): KlienLahan {
  const validasi = (m: Partial<import('../../tipe').LahanMasukan>, lengkap: boolean) => {
    const salah: Record<string, 'VALIDASI' | 'UKURAN_KOSONG' | 'TIDAK_DITEMUKAN'> = {};
    if ((lengkap || m.nama !== undefined) && !m.nama?.trim()) salah.nama = 'VALIDASI';
    if ((lengkap || m.wilayah_id !== undefined) && !k.wilayah(m.wilayah_id))
      salah.wilayah_id = 'TIDAK_DITEMUKAN';
    if (m.jenis_lahan === 'hidroponik' && !(Number(m.kapasitas_lubang) > 0))
      salah.kapasitas_lubang = 'UKURAN_KOSONG';
    if (Object.keys(salah).length) k.validasi(salah);
  };
  return {
    async daftar() {
      const p = k.wajibPeran('petani');
      return k.db.kebun.lahan.filter((l) => l.petani_id === p.id).map((l) => denganKapasitas(k, l));
    },
    async buat(m) {
      const p = k.wajibPeran('petani');
      validasi(m, true);
      const luas = k.dariHasil(
        keM2(m.nilai_asli, m.satuan_asli, konversiWilayah(k, m.wilayah_id)),
        'nilai_asli',
      );
      const lahan = {
        id: k.idBaru('lahan'),
        petani_id: p.id,
        nama: m.nama.trim(),
        jenis_lahan: m.jenis_lahan,
        luas_m2: luas,
        satuan_asli: m.satuan_asli,
        nilai_asli: m.nilai_asli,
        wilayah_id: m.wilayah_id,
        lintang: m.lintang ?? null,
        bujur: m.bujur ?? null,
        kapasitas_lubang: m.jenis_lahan === 'hidroponik' ? (m.kapasitas_lubang as number) : null,
      };
      k.db.kebun.lahan.push(lahan);
      k.simpan();
      return denganKapasitas(k, lahan);
    },
    async ubah(id, m) {
      const p = k.wajibPeran('petani');
      const lahan = k.milik(
        k.db.kebun.lahan,
        (l) => l.id === id,
        (l) => l.petani_id === p.id,
      );
      const gabung = { ...lahan, ...m };
      validasi(
        { ...m, jenis_lahan: gabung.jenis_lahan, kapasitas_lubang: gabung.kapasitas_lubang },
        false,
      );
      if (m.nilai_asli !== undefined || m.satuan_asli !== undefined) {
        gabung.luas_m2 = k.dariHasil(
          keM2(
            gabung.nilai_asli,
            gabung.satuan_asli as 'm2',
            konversiWilayah(k, gabung.wilayah_id),
          ),
          'nilai_asli',
        );
      }
      Object.assign(lahan, gabung, { id: lahan.id, petani_id: lahan.petani_id });
      k.simpan();
      return denganKapasitas(k, lahan);
    },
    async hapus(id) {
      const p = k.wajibPeran('petani');
      k.milik(
        k.db.kebun.lahan,
        (l) => l.id === id,
        (l) => l.petani_id === p.id,
      );
      if (k.db.kebun.siklus.some((s) => s.lahan_id === id && s.status !== 'selesai'))
        k.galat('STATUS_TIDAK_SESUAI');
      k.db.kebun.lahan = k.db.kebun.lahan.filter((l) => l.id !== id);
      k.simpan();
    },
  };
}

export function buatKlienKebun(k: Konteks): KlienKebun {
  return {
    async daftarSiklus(p = {}) {
      const u = k.wajibPeran('petani');
      return k.db.kebun.siklus
        .filter((s) => s.petani_id === u.id && (!p.status || s.status === p.status))
        .map((s) => ({ ...k.salin(s), resep_contoh: resepSiklus(k, s).contoh }));
    },

    async buatSiklus(m) {
      const p = k.wajibPeran('petani');
      const resep = k.milik(
        k.db.resep,
        (r) => r.id === m.resep_id,
        (r) => k.resepTerlihat(r),
      );
      const lahan = k.milik(
        k.db.kebun.lahan,
        (l) => l.id === m.lahan_id,
        (l) => l.petani_id === p.id,
      );
      if ((lahan.jenis_lahan === 'hidroponik') !== (resep.metode_id === 'hidroponik'))
        k.validasi({ lahan_id: 'VALIDASI' });
      const ukuranUtama =
        resep.dasar_ukuran === 'luas'
          ? m.luas_m2
          : resep.dasar_ukuran === 'lubang'
            ? m.jumlah_lubang
            : m.jumlah_polybag;
      k.dariHasil(
        validasiUkuran(
          resep.dasar_ukuran,
          resep.dasar_ukuran === 'luas'
            ? { luasM2: ukuranUtama ?? null }
            : { jumlahTanaman: ukuranUtama ?? null },
        ),
        resep.dasar_ukuran === 'luas'
          ? 'luas_m2'
          : resep.dasar_ukuran === 'lubang'
            ? 'jumlah_lubang'
            : 'jumlah_polybag',
      );
      if (!(m.harga_jual > 0)) k.validasi({ harga_jual: 'HARGA_JUAL_KOSONG' });
      if (m.tanggal_tanam !== null && !tanggalSah(m.tanggal_tanam))
        k.validasi({ tanggal_tanam: 'VALIDASI' });
      if (m.rencana_item.some((r) => !r.nama?.trim())) k.validasi({ rencana_item: 'VALIDASI' });
      k.dariHasil(
        hitungModal(
          m.rencana_item.map((r, i) => ({
            id: String(i),
            grup: r.grup,
            jumlah: r.jumlah,
            hargaSatuan: r.harga_satuan,
            alatSekaliBeli: r.alat_sekali_beli,
          })),
          { bagiAlat: m.bagi_alat, jumlahSiklusPembagian: m.jumlah_siklus_pembagian },
        ),
        'rencana_item',
      );
      const s: SiklusMentah = {
        id: k.idBaru('siklus'),
        petani_id: p.id,
        lahan_id: lahan.id,
        resep_id: resep.id,
        resep_versi: resep.versi,
        komoditas_id: resep.komoditas_id,
        metode_id: resep.metode_id,
        status: m.tanggal_tanam ? 'aktif' : 'rencana',
        luas_m2: m.luas_m2 ?? null,
        jumlah_lubang: m.jumlah_lubang ?? null,
        jumlah_polybag: m.jumlah_polybag ?? null,
        volume_tandon_liter: m.volume_tandon_liter ?? null,
        sistem_hidroponik: m.sistem_hidroponik ?? null,
        vertikultur: m.vertikultur ?? false,
        satuan_asli: m.satuan_asli,
        nilai_asli: m.nilai_asli,
        tanggal_tanam: m.tanggal_tanam,
        dapat_subsidi: m.dapat_subsidi,
        harga_jual: m.harga_jual,
        perkiraan_panen_kg: k.dariHasil(
          perkiraanPanen(resep.dasar_ukuran, ukuranUtama ?? null, resep.hasil_per_satuan),
        ),
        alokasi_pesanan_id: null,
        pendapatan_nyata: null,
        dibuat_pada: k.sekarangIso(),
      };
      if (s.status === 'aktif') periksaKapasitas(k, s);
      k.db.kebun.siklus.push(s);
      m.rencana_item.forEach((r, i) =>
        k.db.kebun.rencana_item.push({
          id: `${s.id}:${r.resep_input_id ?? `tambahan-${i + 1}`}`,
          siklus_id: s.id,
          resep_input_id: r.resep_input_id ?? null,
          input_id: r.input_id ?? null,
          merek_id: r.merek_id ?? null,
          nama: r.nama.trim(),
          grup: r.grup,
          jumlah: r.jumlah,
          satuan: r.satuan,
          harga_satuan: r.harga_satuan,
          asal: r.resep_input_id ? 'resep' : 'tambahan',
          alat_sekali_beli: r.alat_sekali_beli,
          jumlah_siklus_pembagian:
            r.alat_sekali_beli && m.bagi_alat ? m.jumlah_siklus_pembagian : 1,
        }),
      );
      if (s.tanggal_tanam) buatTugas(k, s, s.tanggal_tanam);
      k.db.kebun.pengaturan_pengingat.push({
        siklus_id: s.id,
        jam_pagi: '06:00',
        pengingat_sore: true,
        tipe_aktif: { sekali: true, berulang: true, ukur: true },
      });
      k.simpan();
      return detailSiklus(k, s, p);
    },

    async ambilSiklus(id) {
      const p = k.wajibPeran('petani');
      return detailSiklus(k, siklusMilik(k, p, id), p);
    },

    async ubahTanggalTanam(id, tanggalTanam) {
      const p = k.wajibPeran('petani');
      const s = siklusMilik(k, p, id);
      if (!tanggalSah(tanggalTanam)) k.validasi({ tanggal_tanam: 'VALIDASI' });
      if (s.status === 'selesai') k.galat('STATUS_TIDAK_SESUAI');
      if (s.status === 'rencana' || !s.tanggal_tanam) {
        periksaKapasitas(k, s);
        s.status = 'aktif';
        s.tanggal_tanam = tanggalTanam;
        buatTugas(k, s, tanggalTanam);
      } else {
        const milik = k.db.kebun.tugas.filter((t) => t.siklus_id === s.id);
        const baru = new Map(
          ubahTanggalDomain(milik.map(tugasKeDomain), s.tanggal_tanam, tanggalTanam).map((t) => [
            t.id,
            t.tanggal,
          ]),
        );
        for (const t of milik) t.tanggal = baru.get(t.id) ?? t.tanggal;
        s.tanggal_tanam = tanggalTanam;
      }
      k.simpan();
      return detailSiklus(k, s, p);
    },

    async akhiriSiklus(id, m) {
      const p = k.wajibPeran('petani');
      const s = siklusMilik(k, p, id);
      if (s.status !== 'aktif') k.galat('STATUS_TIDAK_SESUAI');
      if (!(m.pendapatan_nyata >= 0)) k.validasi({ pendapatan_nyata: 'HARGA_NEGATIF' });
      const detail = detailSiklus(k, s, p);
      const rencana = k.dariHasil(
        hitungRingkasan({
          totalModal: detail.modal.total_modal,
          perkiraanPanenKg: s.perkiraan_panen_kg,
          hargaJual: s.harga_jual,
        }),
      );
      s.status = 'selesai';
      s.pendapatan_nyata = m.pendapatan_nyata;
      k.simpan();
      return {
        siklus: detailSiklus(k, s, p),
        untung_sebenarnya: m.pendapatan_nyata - detail.modal.sudah_keluar,
        untung_rencana: rencana.untung,
      };
    },

    async daftarTugas(siklusId) {
      const p = k.wajibPeran('petani');
      siklusMilik(k, p, siklusId);
      return k.salin(k.db.kebun.tugas.filter((t) => t.siklus_id === siklusId).sort(urutTugas));
    },

    async tugasHariIni() {
      const p = k.wajibPeran('petani');
      const hariIni = k.hariIni(p);
      const aktif = new Set(
        k.db.kebun.siklus
          .filter((s) => s.petani_id === p.id && s.status === 'aktif')
          .map((s) => s.id),
      );
      return k.salin(
        k.db.kebun.tugas
          .filter(
            (t) =>
              aktif.has(t.siklus_id) &&
              ((t.status === 'belum' && bandingTanggal(t.tanggal, hariIni) <= 0) ||
                (t.status === 'selesai' && t.tanggal === hariIni)),
          )
          .sort(urutTugas),
      );
    },

    selesaikanTugas(id, m) {
      return k.idempoten(`tugas-selesai:${id}`, m.kunci_idempoten, () => {
        const p = k.wajibPeran('petani');
        const { tugas, siklus } = tugasMilik(k, p, id);
        if (tugas.tipe === 'ukur') k.galat('STATUS_TIDAK_SESUAI');
        if (tugas.status === 'selesai') return k.salin(tugas);
        tugas.status = 'selesai';
        tugas.selesai_pada = k.sekarangIso();
        tugas.foto = m.foto ?? null;
        tugas.catatan = m.catatan ?? null;
        if (tugas.foto) {
          // P0-14: foto otomatis masuk jurnal beserta tanggal dan nama tugas.
          const hariIni = k.hariIni(p);
          k.db.kebun.jurnal.push({
            id: k.idBaru('jurnal'),
            siklus_id: siklus.id,
            tanggal: hariIni,
            hari_ke: siklus.tanggal_tanam ? selisihHari(siklus.tanggal_tanam, hariIni) : 0,
            foto: tugas.foto,
            catatan: tugas.catatan,
            tugas_id: tugas.id,
            judul_tugas: tugas.judul,
          });
        }
        k.simpan();
        return k.salin(tugas);
      });
    },

    async tundaTugas(id, m) {
      const p = k.wajibPeran('petani');
      const { siklus } = tugasMilik(k, p, id);
      const milik = k.db.kebun.tugas.filter((t) => t.siklus_id === siklus.id);
      const panen = tambahHari(
        siklus.tanggal_tanam as string,
        resepSiklus(k, siklus).umur_panen_hari,
      );
      const r = k.dariHasil(
        tundaDomain(milik.map(tugasKeDomain), id, m.hari, panen, k.hariIni(p)),
        'hari',
      );
      if (r.perluKonfirmasi && !m.konfirmasi)
        return { diterapkan: false, perlu_konfirmasi: true, tugas: k.salin(milik.sort(urutTugas)) };
      const baru = new Map(r.jadwal.map((t) => [t.id, t.tanggal]));
      for (const t of milik) t.tanggal = baru.get(t.id) ?? t.tanggal;
      k.simpan();
      return {
        diterapkan: true,
        perlu_konfirmasi: r.perluKonfirmasi,
        tugas: k.salin(milik.sort(urutTugas)),
      };
    },

    catatPengukuran(id, m) {
      return k.idempoten(`pengukuran:${id}`, m.kunci_idempoten, () => {
        const p = k.wajibPeran('petani');
        const { tugas, siklus } = tugasMilik(k, p, id);
        if (tugas.tipe !== 'ukur' || !tugas.ukur) k.galat('STATUS_TIDAK_SESUAI');
        if (tugas.status === 'selesai') k.galat('STATUS_TIDAK_SESUAI');
        const salah: Record<string, 'VALIDASI' | 'NILAI_DI_LUAR_SKALA'> = {};
        const nilai = new Map(m.nilai.map((x) => [x.besaran, x.nilai]));
        for (const b of tugas.ukur) {
          const v = nilai.get(b.nama);
          if (v === undefined || v === null || Number.isNaN(v))
            salah[`nilai.${b.nama}`] = 'VALIDASI';
          else if (!validasiNilaiUkur(v, { skalaMin: b.skala_min, skalaMaks: b.skala_maks }).ok)
            salah[`nilai.${b.nama}`] = 'NILAI_DI_LUAR_SKALA';
        }
        if (Object.keys(salah).length) k.validasi(salah);
        const hariIni = k.hariIni(p);
        const hasil = tugas.ukur.map((b) => {
          const v = nilai.get(b.nama) as number;
          const h = {
            id: k.idBaru('ukur'),
            tugas_id: tugas.id,
            siklus_id: siklus.id,
            besaran: b.nama,
            nilai: v,
            status: nilaiPengukuran(v, b.batas_bawah, b.batas_atas),
            sumber: m.sumber ?? ('manual' as const),
            tanggal: hariIni,
            dicatat_pada: k.sekarangIso(),
          };
          k.db.kebun.hasil_pengukuran.push(h);
          return h;
        });
        tugas.status = 'selesai';
        tugas.selesai_pada = k.sekarangIso();
        const ulang = perluUkurUlang(
          hasil.map((x) => x.status),
          hariIni,
        );
        let tugasUlang: Tugas | null = null;
        if (ulang) {
          tugasUlang = {
            ...k.salin(tugas),
            id: `${tugas.id}-ulang-${ulang}`,
            judul: judulUkurUlang(tugas.judul),
            tanggal: ulang,
            hst: siklus.tanggal_tanam ? selisihHari(siklus.tanggal_tanam, ulang) : tugas.hst + 1,
            status: 'belum',
            selesai_pada: null,
            interval: null,
            foto: null,
            catatan: null,
          };
          k.db.kebun.tugas.push(tugasUlang);
        }
        k.simpan();
        return {
          hasil: k.salin(hasil),
          tugas_ukur_ulang: tugasUlang ? k.salin(tugasUlang) : null,
          tugas: k.salin(tugas),
        };
      });
    },

    async riwayatPengukuran(siklusId, besaran) {
      const p = k.wajibPeran('petani');
      siklusMilik(k, p, siklusId);
      return k.salin(
        k.db.kebun.hasil_pengukuran
          .filter((h) => h.siklus_id === siklusId && (!besaran || h.besaran === besaran))
          .sort(
            (a, b) =>
              bandingTanggal(a.tanggal, b.tanggal) || a.dicatat_pada.localeCompare(b.dicatat_pada),
          ),
      );
    },

    async daftarPengeluaran(siklusId) {
      const p = k.wajibPeran('petani');
      siklusMilik(k, p, siklusId);
      return k.salin(
        k.db.kebun.pengeluaran
          .filter((x) => x.siklus_id === siklusId)
          .sort((a, b) => bandingTanggal(a.tanggal, b.tanggal)),
      );
    },

    catatPengeluaran(siklusId, m) {
      return k.idempoten(`pengeluaran:${siklusId}`, m.kunci_idempoten, () => {
        const p = k.wajibPeran('petani');
        siklusMilik(k, p, siklusId);
        const salah: Record<string, 'VALIDASI' | 'HARGA_NEGATIF'> = {};
        if (!m.nama?.trim()) salah.nama = 'VALIDASI';
        if (!(m.nominal >= 0)) salah.nominal = 'HARGA_NEGATIF';
        if (!tanggalSah(m.tanggal)) salah.tanggal = 'VALIDASI';
        if (
          m.rencana_item_id &&
          !k.db.kebun.rencana_item.some(
            (r) => r.id === m.rencana_item_id && r.siklus_id === siklusId,
          )
        )
          salah.rencana_item_id = 'VALIDASI';
        if (Object.keys(salah).length) k.validasi(salah);
        const x = {
          id: k.idBaru('pengeluaran'),
          siklus_id: siklusId,
          rencana_item_id: m.rencana_item_id ?? null,
          nama: m.nama.trim(),
          nominal: m.nominal,
          tanggal: m.tanggal,
          foto_nota: m.foto_nota ?? null,
        };
        k.db.kebun.pengeluaran.push(x);
        k.simpan();
        return k.salin(x);
      });
    },

    async jurnal(siklusId) {
      const p = k.wajibPeran('petani');
      siklusMilik(k, p, siklusId);
      return k.salin(
        k.db.kebun.jurnal
          .filter((j) => j.siklus_id === siklusId)
          .sort((a, b) => bandingTanggal(b.tanggal, a.tanggal)),
      );
    },

    async tambahJurnal(siklusId, m) {
      const p = k.wajibPeran('petani');
      const s = siklusMilik(k, p, siklusId);
      if (!m.foto && !m.catatan?.trim()) k.validasi({ catatan: 'VALIDASI' });
      if (!tanggalSah(m.tanggal)) k.validasi({ tanggal: 'VALIDASI' });
      const j = {
        id: k.idBaru('jurnal'),
        siklus_id: s.id,
        tanggal: m.tanggal,
        hari_ke: s.tanggal_tanam ? selisihHari(s.tanggal_tanam, m.tanggal) : 0,
        foto: m.foto ?? null,
        catatan: m.catatan?.trim() || null,
        tugas_id: null,
        judul_tugas: null,
      };
      k.db.kebun.jurnal.push(j);
      k.simpan();
      return k.salin(j);
    },

    async ambilPengingat(siklusId) {
      const p = k.wajibPeran('petani');
      siklusMilik(k, p, siklusId);
      return k.salin(k.milik(k.db.kebun.pengaturan_pengingat, (x) => x.siklus_id === siklusId));
    },

    async ubahPengingat(siklusId, m) {
      const p = k.wajibPeran('petani');
      siklusMilik(k, p, siklusId);
      if (!/^0[5-7]:[0-5]\d$/.test(m.jam_pagi) || m.jam_pagi > '07:00')
        k.validasi({ jam_pagi: 'VALIDASI' });
      const x = k.milik(k.db.kebun.pengaturan_pengingat, (y) => y.siklus_id === siklusId);
      Object.assign(x, {
        jam_pagi: m.jam_pagi,
        pengingat_sore: m.pengingat_sore,
        tipe_aktif: { ...m.tipe_aktif },
      });
      k.simpan();
      return k.salin(x);
    },
  };
}

export function buatKlienBelajar(k: Konteks): KlienBelajar {
  const lengkap = (p: Pengguna, m: (typeof k.db.modul)[number]) => {
    const progres = k.db.kebun.progres_modul.find(
      (x) => x.pengguna_id === p.id && x.modul_id === m.id,
    );
    return { ...k.salin(m), selesai: !!progres, selesai_pada: progres?.selesai_pada ?? null };
  };
  return {
    async daftarModul(p) {
      const u = k.penggunaMasuk();
      return k.db.modul
        .filter((m) => m.komoditas_id === p.komoditas_id && m.metode_id === p.metode_id)
        .sort((a, b) => a.urutan - b.urutan)
        .map((m) => lengkap(u, m));
    },
    async ambilModul(id) {
      const u = k.penggunaMasuk();
      return lengkap(
        u,
        k.milik(k.db.modul, (m) => m.id === id),
      );
    },
    async tandaiSelesai(id) {
      const u = k.penggunaMasuk();
      const m = k.milik(k.db.modul, (x) => x.id === id);
      if (!k.db.kebun.progres_modul.some((x) => x.pengguna_id === u.id && x.modul_id === id)) {
        k.db.kebun.progres_modul.push({
          pengguna_id: u.id,
          modul_id: id,
          selesai_pada: k.sekarangIso(),
        });
        k.simpan();
      }
      return lengkap(u, m);
    },
  };
}
