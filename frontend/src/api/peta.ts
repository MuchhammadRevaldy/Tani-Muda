/**
 * Pemetaan bentuk API (snake_case, docs/kontrak-api.md) ↔ tipe domain (camelCase, src/tipe) supaya
 * rumus src/lib bisa dipakai pada data API tanpa mengubah nama kolom kontrak (T3.03).
 * Diletakkan di src/api karena src/lib tidak boleh bergantung pada lapisan API.
 */
import type * as D from '../tipe';
import type * as A from './tipe';

export function resepKeDomain(r: A.ResepTanam): D.ResepTanam {
  return {
    id: r.id,
    komoditasId: r.komoditas_id,
    metodeId: r.metode_id,
    versi: r.versi,
    status: r.status,
    contoh: r.contoh,
    asalAngkaContoh: r.asal_angka_contoh,
    validator: r.validator,
    tanggalValidasi: r.tanggal_validasi,
    hasilPerSatuan: r.hasil_per_satuan,
    umurPanenHari: r.umur_panen_hari,
    ...(r.jumlah_pengisian_larutan !== null
      ? { jumlahPengisianLarutan: r.jumlah_pengisian_larutan }
      : {}),
    ...(r.persen_panen_jelek !== null ? { persenPanenJelek: r.persen_panen_jelek } : {}),
    ...(r.alasan_panen_jelek !== null ? { alasanPanenJelek: r.alasan_panen_jelek } : {}),
    standarKualitas: [...r.standar_kualitas],
    input: r.input.map((i) => ({
      id: i.id,
      ...(i.input_id !== null ? { inputId: i.input_id } : {}),
      nama: i.nama,
      grup: i.grup,
      dosis: i.dosis,
      satuanDosis: i.satuan_dosis,
      dasarDosis: i.dasar_dosis,
      satuanBeli: i.satuan_beli,
      ...(i.isi_satuan_beli !== null ? { isiSatuanBeli: i.isi_satuan_beli } : {}),
      ukuranKemasan: i.ukuran_kemasan,
      alatSekaliBeli: i.alat_sekali_beli,
      hargaContoh: i.harga_contoh,
      ...(i.opsional ? { opsional: true } : {}),
      ...(i.keterangan_opsional ? { keteranganOpsional: i.keterangan_opsional } : {}),
    })),
    tugas: r.tugas.map(resepTugasKeDomain),
  };
}

export function besaranKeDomain(b: A.BesaranUkur): D.BesaranUkur {
  return {
    nama: b.nama,
    satuan: b.satuan,
    batasBawah: b.batas_bawah,
    batasAtas: b.batas_atas,
    skalaMin: b.skala_min,
    skalaMaks: b.skala_maks,
    saranTerlaluRendah: b.saran_terlalu_rendah,
    saranTerlaluTinggi: b.saran_terlalu_tinggi,
  };
}

function besaranDariDomain(b: D.BesaranUkur): A.BesaranUkur {
  return {
    nama: b.nama,
    satuan: b.satuan,
    batas_bawah: b.batasBawah,
    batas_atas: b.batasAtas,
    skala_min: b.skalaMin,
    skala_maks: b.skalaMaks,
    saran_terlalu_rendah: b.saranTerlaluRendah,
    saran_terlalu_tinggi: b.saranTerlaluTinggi,
  };
}

function resepTugasKeDomain(t: A.ResepTugas): D.ResepTugas {
  return {
    id: t.id,
    tipe: t.tipe,
    judul: t.judul,
    hstMulai: t.hst_mulai,
    ...(t.hst_selesai !== null ? { hstSelesai: t.hst_selesai } : {}),
    ...(t.interval !== null ? { interval: t.interval } : {}),
    ...(t.ukur ? { ukur: t.ukur.map(besaranKeDomain) } : {}),
    bolehDigeser: t.boleh_digeser,
    ...(t.saran_terlambat !== null ? { saranTerlambat: t.saran_terlambat } : {}),
    ...(t.cara_mengerjakan ? { caraMengerjakan: [...t.cara_mengerjakan] } : {}),
  };
}

/** Potongan resep contoh halaman depan (D-45) → domain, dengan kolom yang tidak dikirim dikosongkan. */
export function contohKeDomain(c: A.ContohHitungPublik): D.ResepTanam {
  return {
    id: `contoh-${c.komoditas_id}-${c.metode_id}`,
    komoditasId: c.komoditas_id,
    metodeId: c.metode_id,
    versi: 1,
    status: c.contoh ? 'draf' : 'divalidasi',
    contoh: c.contoh,
    asalAngkaContoh: null,
    validator: null,
    tanggalValidasi: null,
    hasilPerSatuan: c.hasil_per_satuan,
    umurPanenHari: c.umur_panen_hari,
    standarKualitas: [],
    input: c.input.map((i) => ({
      id: i.id,
      nama: i.nama,
      grup: i.grup,
      dosis: i.dosis,
      satuanDosis: i.satuan_dosis,
      dasarDosis: i.dasar_dosis,
      satuanBeli: i.satuan_beli,
      ...(i.isi_satuan_beli !== null ? { isiSatuanBeli: i.isi_satuan_beli } : {}),
      ukuranKemasan: i.ukuran_kemasan,
      alatSekaliBeli: i.alat_sekali_beli,
      hargaContoh: i.harga_contoh,
    })),
    tugas: c.tugas.map((t) => ({
      id: t.id,
      tipe: t.tipe,
      judul: t.judul,
      hstMulai: t.hst_mulai,
      ...(t.hst_selesai !== null ? { hstSelesai: t.hst_selesai } : {}),
      ...(t.interval !== null ? { interval: t.interval } : {}),
      bolehDigeser: true,
      ...(t.langkah_pertama ? { caraMengerjakan: [t.langkah_pertama] } : {}),
    })),
  };
}

/** Domain → API, dipakai pembuat data contoh dari fixture T2.01. */
export function resepDariDomain(r: D.ResepTanam, dasarUkuran: A.DasarUkuran): A.ResepTanam {
  return {
    id: r.id,
    komoditas_id: r.komoditasId,
    metode_id: r.metodeId,
    versi: r.versi,
    status: r.status,
    contoh: r.contoh,
    asal_angka_contoh: r.asalAngkaContoh,
    validator: r.validator,
    tanggal_validasi: r.tanggalValidasi,
    hasil_per_satuan: r.hasilPerSatuan,
    dasar_ukuran: dasarUkuran,
    umur_panen_hari: r.umurPanenHari,
    jumlah_pengisian_larutan: r.jumlahPengisianLarutan ?? null,
    persen_panen_jelek: r.persenPanenJelek ?? null,
    alasan_panen_jelek: r.alasanPanenJelek ?? null,
    standar_kualitas: [...r.standarKualitas],
    input: r.input.map((i) => ({
      id: i.id,
      input_id: i.inputId ?? null,
      nama: i.nama,
      grup: i.grup,
      dosis: i.dosis,
      satuan_dosis: i.satuanDosis,
      dasar_dosis: i.dasarDosis,
      satuan_beli: i.satuanBeli,
      isi_satuan_beli: i.isiSatuanBeli ?? null,
      ukuran_kemasan: i.ukuranKemasan,
      alat_sekali_beli: i.alatSekaliBeli,
      harga_contoh: i.hargaContoh,
      opsional: i.opsional ?? false,
      keterangan_opsional: i.keteranganOpsional ?? null,
    })),
    tugas: r.tugas.map((t) => ({
      id: t.id,
      tipe: t.tipe,
      judul: t.judul,
      hst_mulai: t.hstMulai,
      hst_selesai: t.hstSelesai ?? null,
      interval: t.interval ?? null,
      ukur: t.ukur ? t.ukur.map(besaranDariDomain) : null,
      boleh_digeser: t.bolehDigeser,
      saran_terlambat: t.saranTerlambat ?? null,
      cara_mengerjakan: t.caraMengerjakan ? [...t.caraMengerjakan] : null,
    })),
  };
}

export function tugasKeDomain(t: A.Tugas): D.Tugas {
  return {
    id: t.id,
    resepTugasId: t.resep_tugas_id,
    tipe: t.tipe,
    judul: t.judul,
    tanggal: t.tanggal,
    hst: t.hst,
    status: t.status,
    bolehDigeser: t.boleh_digeser,
    ...(t.interval !== null ? { interval: t.interval } : {}),
    ...(t.ukur ? { ukur: t.ukur.map(besaranKeDomain) } : {}),
  };
}

/** Domain → API untuk tugas yang baru dibuat `buatJadwal`. */
export function tugasDariDomain(t: D.Tugas, siklusId: string): A.Tugas {
  return {
    id: `${siklusId}:${t.id}`,
    siklus_id: siklusId,
    resep_tugas_id: t.resepTugasId,
    tipe: t.tipe,
    judul: t.judul,
    tanggal: t.tanggal,
    hst: t.hst,
    status: t.status,
    selesai_pada: null,
    boleh_digeser: t.bolehDigeser,
    interval: t.interval ?? null,
    ukur: t.ukur ? t.ukur.map(besaranDariDomain) : null,
    foto: null,
    catatan: null,
  };
}

export function lahanKeDomain(
  l: Pick<
    A.Lahan,
    | 'id'
    | 'petani_id'
    | 'nama'
    | 'jenis_lahan'
    | 'luas_m2'
    | 'satuan_asli'
    | 'nilai_asli'
    | 'wilayah_id'
    | 'kapasitas_lubang'
  >,
): D.Lahan {
  return {
    id: l.id,
    petaniId: l.petani_id,
    nama: l.nama,
    jenisLahan: l.jenis_lahan,
    luasM2: l.luas_m2,
    satuanAsli: l.satuan_asli,
    nilaiAsli: l.nilai_asli,
    wilayahId: l.wilayah_id,
    kapasitasLubang: l.kapasitas_lubang,
  };
}

export function siklusKeDomain(s: A.SiklusTersimpan): D.SiklusTanam {
  return {
    id: s.id,
    petaniId: s.petani_id,
    lahanId: s.lahan_id,
    resepId: s.resep_id,
    resepVersi: s.resep_versi,
    status: s.status,
    luasM2: s.luas_m2,
    jumlahLubang: s.jumlah_lubang,
    tanggalTanam: s.tanggal_tanam,
    dapatSubsidi: s.dapat_subsidi,
    hargaJual: s.harga_jual,
    perkiraanPanenKg: s.perkiraan_panen_kg,
    alokasiPesananId: s.alokasi_pesanan_id,
    petakKe: s.petak_ke,
  };
}

export function pengaturanKeDomain(p: A.PengaturanPengingat): D.PengaturanPengingat {
  const [jam = '6', menit = '0'] = p.jam_pagi.split(':');
  return {
    jamPagi: Number(jam),
    menitPagi: Number(menit),
    soreAktif: p.pengingat_sore,
    tipeAktif: { ...p.tipe_aktif },
  };
}

export function modulKeDomain(
  m: Pick<A.Modul, 'id' | 'komoditas_id' | 'metode_id' | 'tahap' | 'judul' | 'menit' | 'urutan'>,
): D.Modul {
  return {
    id: m.id,
    komoditasId: m.komoditas_id,
    metodeId: m.metode_id,
    tahap: m.tahap,
    judul: m.judul,
    menit: m.menit,
    urutan: m.urutan,
  };
}

export function merekKeDomain(m: A.MerekInput): D.MerekInput {
  return {
    id: m.id,
    inputId: m.input_id,
    nama: m.nama,
    isiKemasan: m.isi_kemasan,
    teksKemasan: m.teks_kemasan,
    ...(m.nomor_pendaftaran !== null ? { nomorPendaftaran: m.nomor_pendaftaran } : {}),
  };
}

export function laporanKeDomain(l: A.LaporanHarga): D.LaporanHarga {
  return {
    id: l.id,
    merekId: l.merek_id,
    hargaKemasan: l.harga_kemasan,
    kecamatan: l.kecamatan,
    tanggal: l.tanggal,
    pelaporId: l.pelapor_id,
  };
}

export function kelayakanKeDomain(k: A.KelayakanSubsidi): D.KelayakanSubsidi {
  return {
    inputId: k.input_id,
    komoditasId: k.komoditas_id,
    berlakuMulai: k.berlaku_mulai,
    berlakuSampai: k.berlaku_sampai,
    hetPerSatuan: k.het_per_satuan,
  };
}

export function konfigurasiKeDomain(k: A.Konfigurasi): D.KonfigurasiBisnis {
  return {
    persenUangMuka: k.persen_uang_muka,
    persenLayanan: k.persen_layanan,
    jamPeriksa: { rutin: k.jam_periksa_rutin, sekali_panen: k.jam_periksa_sekali_panen },
    hariKabarGagalPanen: k.hari_kabar_gagal_panen,
    radiusKm: k.radius_km,
  };
}

export function hasilPengukuranKeDomain(h: A.HasilPengukuran): D.HasilPengukuran {
  return {
    tugasId: h.tugas_id,
    besaran: h.besaran,
    nilai: h.nilai,
    status: h.status,
    sumber: h.sumber,
    tanggal: h.tanggal,
  };
}

/** ID siklus dari ID tugas berformat kontrak `siklus:pola@hst` (kontrak bagian 2.7). */
export function siklusDariIdTugas(idTugas: string): string {
  const i = idTugas.indexOf(':');
  return i > 0 ? idTugas.slice(0, i) : idTugas;
}
