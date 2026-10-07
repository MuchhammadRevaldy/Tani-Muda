/**
 * Klien tiruan: pesanan di sekitar dan ambil pesanan (petani), kiriman dan konfirmasi, pembeli
 * (buat pesanan, bayar uang muka, batalkan, riwayat pembayaran). Angka uang selalu dari
 * pesanan-nilai.ts dan kiriman.ts, tidak dari masukan klien (D-02, D-08).
 */
import { pastikan } from '../../../lib/hasil';
import { hitungKebutuhanResep } from '../../../lib/kebutuhan';
import {
  aturanGagalPanen,
  konfirmasiKiriman,
  pembatalanPembeli,
  statusOtomatis,
  validasiAlasan,
  type KeputusanKiriman,
} from '../../../lib/kiriman';
import { bulatkanRupiah } from '../../../lib/format';
import {
  batasAlokasi,
  jadwalKirimPesanan,
  kebutuhanLahanPesanan,
  kirimanTerkejar,
} from '../../../lib/pesanan-lahan';
import {
  hitungNilaiPesanan,
  hitungPembayaranKiriman,
  jumlahKirimanRutin,
} from '../../../lib/pesanan-nilai';
import { metodeUntukLahan } from '../../../lib/pesanan-tampil';
import { bandingTanggal, selisihHari, tambahHari } from '../../../lib/tanggal';
import { perkiraanPanen, saranVolumeTandon } from '../../../lib/ukuran-metode';
import type { KlienKiriman, KlienPembeli, KlienPesanan } from '../../klien';
import { konfigurasiKeDomain, resepKeDomain } from '../../peta';
import type {
  AlokasiPesanan,
  KonfirmasiKirimanHasil,
  Pembayaran,
  Pengguna,
  Pengiriman,
  Pesanan,
  PesananDenganKebun,
  PesananUntukPetani,
  RingkasanRating,
  Sengketa,
} from '../../tipe';
import type { Konteks } from '../konteks';
import { alokasiAktif, jarakPesananKm, namaPengguna, pesananTerbuka, sisaPesananKg } from './bantu';
import { buatTugas, periksaKapasitas, resepSiklus } from './kebun';
import { resepTerbaru } from './referensi';

// ---------------------------------------------------------------- bantu

function catatBayar(
  k: Konteks,
  b: Omit<Pembayaran, 'id' | 'mode_uji_coba' | 'dibuat_pada'>,
): Pembayaran {
  const baris: Pembayaran = {
    id: k.idBaru('pembayaran'),
    mode_uji_coba: k.bayar.modeUjiCoba,
    dibuat_pada: k.sekarangIso(),
    ...b,
  };
  k.db.pesanan.pembayaran.push(baris);
  return baris;
}

function refUangMuka(k: Konteks, pesananId: string): string | null {
  return (
    k.db.pesanan.pembayaran.find((b) => b.pesanan_id === pesananId && b.jenis === 'uang_muka')
      ?.referensi ?? null
  );
}

async function dariGerbang<T>(
  k: Konteks,
  janji: Promise<
    | { ok: true; nilai: T }
    | { ok: false; galat: 'MELEBIHI_SALDO' | 'TIDAK_DITEMUKAN' | 'JUMLAH_NEGATIF' }
  >,
): Promise<T> {
  const r = await janji;
  if (!r.ok)
    k.galat(
      r.galat === 'JUMLAH_NEGATIF'
        ? 'JUMLAH_NEGATIF'
        : r.galat === 'TIDAK_DITEMUKAN'
          ? 'GALAT_SERVER'
          : 'MELEBIHI_SALDO',
    );
  return r.nilai;
}

const pesananDari = (k: Konteks, id: string) =>
  k.db.pesanan.pesanan.find((p) => p.id === id) as Pesanan;
const alokasiDari = (k: Konteks, id: string) =>
  k.db.pesanan.alokasi.find((a) => a.id === id) as AlokasiPesanan;

function ringkasanRating(k: Konteks, penggunaId: string): RingkasanRating {
  const nilai = k.db.pesanan.rating.filter((r) => r.penerima_id === penggunaId).map((r) => r.nilai);
  return {
    pengguna_id: penggunaId,
    rata_rata: nilai.length
      ? Math.round((nilai.reduce((a, b) => a + b, 0) / nilai.length) * 10) / 10
      : null,
    jumlah: nilai.length,
  };
}

/** Kiriman yang masih terbuka di pesanan ini (belum diterima, belum gagal). */
function kirimanTerbuka(k: Konteks, pesananId: string, kecuali?: string): Pengiriman[] {
  return k.db.pesanan.pengiriman.filter(
    (x) =>
      x.pesanan_id === pesananId &&
      x.id !== kecuali &&
      (x.status === 'terjadwal' || x.status === 'dikirim'),
  );
}

/** Terapkan konfirmasi pembeli atau konfirmasi otomatis (D-01, D-02, P0-25, P0-26). */
async function terapkanKonfirmasi(
  k: Konteks,
  kiriman: Pengiriman,
  keputusan: KeputusanKiriman,
  foto: string | null,
  otomatis: boolean,
): Promise<KonfirmasiKirimanHasil> {
  const pesanan = pesananDari(k, kiriman.pesanan_id);
  const terakhir = kirimanTerbuka(k, pesanan.id, kiriman.id).length === 0;
  const r = k.dariHasil(
    konfirmasiKiriman(
      {
        jumlahDikirimKg: kiriman.jumlah_kg,
        hargaPerKg: kiriman.harga_per_kg,
        saldoUangMuka: pesanan.saldo_uang_muka,
        kirimanTerakhir: terakhir,
      },
      keputusan,
      k.db.konfigurasi.persen_uang_muka,
    ),
    keputusan.jenis === 'tolak_sebagian' ? 'jumlah_ditolak_kg' : undefined,
  );
  const barisKiriman = k.db.pesanan.pembayaran.find(
    (b) => b.pengiriman_id === kiriman.id && b.jenis === 'kiriman',
  );
  const baru: Pembayaran[] = [];
  if (barisKiriman && r.dibayarPembeli > 0) {
    await dariGerbang(k, k.bayar.cairkan(barisKiriman.referensi, r.dibayarPembeli));
    baru.push(
      catatBayar(k, {
        pesanan_id: pesanan.id,
        pengiriman_id: kiriman.id,
        jenis: 'pencairan',
        nominal: r.dibayarPembeli,
        status: 'cair',
        referensi: barisKiriman.referensi,
      }),
    );
  }
  const um = refUangMuka(k, pesanan.id);
  if (um && r.dariUangMuka > 0) {
    await dariGerbang(k, k.bayar.cairkan(um, r.dariUangMuka));
    baru.push(
      catatBayar(k, {
        pesanan_id: pesanan.id,
        pengiriman_id: kiriman.id,
        jenis: 'pencairan',
        nominal: r.dariUangMuka,
        status: 'cair',
        referensi: um,
      }),
    );
  }
  let sengketa: Sengketa | null = null;
  if (barisKiriman) {
    const sisa = barisKiriman.nominal - r.dibayarPembeli;
    if (sisa > 0 && !r.perluSengketa) {
      await dariGerbang(k, k.bayar.kembalikan(barisKiriman.referensi, sisa));
      baru.push(
        catatBayar(k, {
          pesanan_id: pesanan.id,
          pengiriman_id: kiriman.id,
          jenis: 'pengembalian',
          nominal: sisa,
          status: 'dikembalikan',
          referensi: barisKiriman.referensi,
        }),
      );
    }
    // Bagian yang ditolak tetap ditahan sampai admin memutus sengketa.
    barisKiriman.status = r.perluSengketa && sisa > 0 ? 'ditahan' : 'cair';
  }
  if (r.perluSengketa) {
    sengketa = {
      id: k.idBaru('sengketa'),
      pengiriman_id: kiriman.id,
      status: 'terbuka',
      keputusan: null,
      catatan: null,
      dibuat_pada: k.sekarangIso(),
      diputuskan_pada: null,
    };
    k.db.pesanan.sengketa.push(sengketa);
  }
  Object.assign(kiriman, {
    status: r.status,
    dikonfirmasi_pada: k.sekarangIso(),
    dianggap_diterima: otomatis,
    jumlah_ditolak_kg: r.jumlahDitolakKg,
    alasan_penolakan: keputusan.jenis === 'tolak_sebagian' ? keputusan.alasan : null,
    keterangan_penolakan:
      keputusan.jenis === 'tolak_sebagian' ? keputusan.keterangan?.trim() || null : null,
    foto_penolakan: foto,
    nilai_diterima: r.danaCairPetani,
  });
  pesanan.saldo_uang_muka = r.sisaSaldoUangMuka;
  if (kirimanTerbuka(k, pesanan.id).length === 0 && pesanan.status === 'berjalan') {
    pesanan.status = 'selesai';
    for (const a of k.db.pesanan.alokasi)
      if (a.pesanan_id === pesanan.id && alokasiAktif(a)) a.status = 'selesai';
  }
  return {
    pengiriman: k.salin(kiriman),
    pembayaran: k.salin(baru),
    sengketa: sengketa ? k.salin(sengketa) : null,
  };
}

/** Konfirmasi otomatis kiriman yang lewat batas periksa (D-01). Dijalankan sebelum data kiriman dibaca. */
export async function prosesOtomatis(k: Konteks): Promise<void> {
  const sekarang = k.jam();
  let berubah = false;
  for (const x of k.db.pesanan.pengiriman) {
    if (x.status !== 'dikirim' || !x.dikirim_pada) continue;
    const jenis = pesananDari(k, x.pesanan_id).jenis;
    const s = statusOtomatis(
      { jenisPesanan: jenis, dikirimPadaMs: Date.parse(x.dikirim_pada) },
      sekarang,
      konfigurasiKeDomain(k.db.konfigurasi).jamPeriksa,
    );
    if (s.dianggapDiterima) {
      await terapkanKonfirmasi(k, x, { jenis: 'terima_semua' }, null, true);
      berubah = true;
    }
  }
  if (berubah) k.simpan();
}

function untukPetani(k: Konteks, petani: Pengguna, p: Pesanan): PesananUntukPetani {
  const saya = alokasiPetani(k, petani.id, p.id);
  const profil = k.db.pengguna.profil_pembeli.find((x) => x.pengguna_id === p.pembeli_id);
  const w = k.wilayah(p.wilayah_id);
  return k.salin({
    id: p.id,
    jenis: p.jenis,
    komoditas_id: p.komoditas_id,
    nama_pembeli: profil?.nama_usaha ?? namaPengguna(k, p.pembeli_id),
    jenis_usaha: profil?.jenis_usaha ?? 'lainnya',
    desa_antar: w?.desa ?? '',
    kecamatan_antar: w?.kecamatan ?? '',
    titik_desa_antar: w ? { lintang: w.lintang, bujur: w.bujur } : null,
    alamat_antar: saya ? p.alamat_antar : null,
    patokan: saya ? p.patokan : null,
    jarak_km: jarakPesananKm(k, petani, p) ?? 0,
    jumlah_per_kiriman_kg: p.jumlah_per_kiriman_kg,
    frekuensi_hari: p.frekuensi_hari,
    jumlah_kiriman: p.jumlah_kiriman,
    jumlah_total_kg: p.jumlah_total_kg,
    sisa_kg: sisaPesananKg(k, p),
    tanggal_mulai: p.tanggal_mulai,
    perkiraan_bulan_panen: p.perkiraan_bulan_panen,
    harga_per_kg: p.harga_per_kg,
    standar_kualitas: p.standar_kualitas,
    boleh_ambil_sebagian: true,
    uang_muka_diterima: p.status !== 'menunggu_pembayaran',
    rating_pembeli: (({ rata_rata, jumlah }) => ({ rata_rata, jumlah }))(
      ringkasanRating(k, p.pembeli_id),
    ),
    alokasi_saya: saya ?? null,
    dibuat_pada: p.dibuat_pada,
  });
}

/** Alokasi aktif seorang petani di satu pesanan (satu petani satu alokasi, D-39). */
const alokasiPetani = (k: Konteks, petaniId: string, pesananId: string) =>
  k.db.pesanan.alokasi.find(
    (a) => a.pesanan_id === pesananId && a.petani_id === petaniId && alokasiAktif(a),
  );

/** Kiriman pesanan yang masih terkejar bila mulai tanam hari ini (D-39). */
function jadwalTerkejar(k: Konteks, petani: Pengguna, p: Pesanan, umurPanenHari: number) {
  return kirimanTerkejar(
    jadwalKirimPesanan({
      jenis: p.jenis,
      tanggalMulai: p.tanggal_mulai,
      frekuensiHari: p.frekuensi_hari,
      jumlahKiriman: p.jumlah_kiriman,
      perkiraanBulanPanen: p.perkiraan_bulan_panen,
    }),
    k.hariIni(petani),
    umurPanenHari,
  );
}


// ---------------------------------------------------------------- petani

export function buatKlienPesanan(k: Konteks): KlienPesanan {
  return {
    async sekitar(p = {}) {
      const petani = k.wajibPeran('petani');
      const radius = p.radius_km ?? k.db.konfigurasi.radius_km;
      if (!(radius > 0) || radius > k.db.konfigurasi.radius_maks_km)
        k.validasi({ radius_km: 'VALIDASI' });
      const terlihat = new Set(
        k.db.resep.filter((r) => k.resepTerlihat(r)).map((r) => r.komoditas_id),
      );
      const daftar = k.db.pesanan.pesanan
        .filter(
          (x) =>
            pesananTerbuka(k, x) &&
            terlihat.has(x.komoditas_id) &&
            (!p.jenis || x.jenis === p.jenis),
        )
        .map((x, i) => ({ x, i, jarak: jarakPesananKm(k, petani, x) }))
        .filter((x) => x.jarak !== null && x.jarak <= radius)
        .sort((a, b) => (a.jarak as number) - (b.jarak as number) || a.i - b.i)
        .map(({ x }) => untukPetani(k, petani, x));
      return k.halaman(daftar, p);
    },

    async ambil(id) {
      const petani = k.wajibPeran('petani');
      return untukPetani(
        k,
        petani,
        k.milik(
          k.db.pesanan.pesanan,
          (x) => x.id === id,
          (x) => x.status !== 'menunggu_pembayaran',
        ),
      );
    },

    ambilPesanan(id, m) {
      return k.idempoten(`ambil-pesanan:${id}`, m.kunci_idempoten, () => {
        const petani = k.wajibPeran('petani');
        if (petani.status_akun !== 'aktif') k.galat('AKUN_NONAKTIF');
        const pesanan = k.milik(
          k.db.pesanan.pesanan,
          (x) => x.id === id,
          (x) => x.status !== 'menunggu_pembayaran',
        );
        if (!pesananTerbuka(k, pesanan) || alokasiPetani(k, petani.id, id))
          k.galat('STATUS_TIDAK_SESUAI');
        const lahan = k.milik(
          k.db.kebun.lahan,
          (l) => l.id === m.lahan_id,
          (l) => l.petani_id === petani.id,
        );
        if (!(m.jumlah_kg > 0)) k.validasi({ jumlah_kg: 'JUMLAH_KOSONG' });
        const aktif = k.db.pesanan.alokasi
          .filter((a) => a.pesanan_id === id && alokasiAktif(a))
          .map((a) => a.jumlah_kg);
        k.dariHasil(
          batasAlokasi(
            pesanan.jumlah_per_kiriman_kg ?? pesanan.jumlah_total_kg,
            aktif,
            m.jumlah_kg,
          ),
          'jumlah_kg',
        );
        const metode = metodeUntukLahan(lahan.jenis_lahan);
        const resep = resepTerbaru(
          k.db.resep.filter(
            (r) =>
              k.resepTerlihat(r) &&
              r.komoditas_id === pesanan.komoditas_id &&
              r.metode_id === metode,
          ),
        )[0];
        if (!resep) k.validasi({ lahan_id: 'STATUS_TIDAK_SESUAI' });
        if (!jadwalTerkejar(k, petani, pesanan, resep.umur_panen_hari).length)
          k.galat('JADWAL_TERLALU_DEKAT');
        const butuh = k.dariHasil(
          kebutuhanLahanPesanan({
            jenis: pesanan.jenis,
            jumlahKg: m.jumlah_kg,
            hasilPerSatuan: resep.hasil_per_satuan,
            ...(pesanan.frekuensi_hari ? { frekuensiHari: pesanan.frekuensi_hari } : {}),
            umurPanenHari: resep.umur_panen_hari,
          }),
          'jumlah_kg',
        );
        const hidro = lahan.jenis_lahan === 'hidroponik';
        const ukuran = hidro ? Math.ceil(butuh.luasTotal) : Math.ceil(butuh.luasTotal * 100) / 100;
        const siklusId = k.idBaru('siklus');
        periksaKapasitas(k, {
          id: siklusId,
          lahan_id: lahan.id,
          luas_m2: hidro ? null : ukuran,
          jumlah_lubang: hidro ? ukuran : null,
        });
        const nft = k.db.referensi.sistem_hidroponik.find((s) => s.id === 'nft');
        const volume = hidro && nft ? saranVolumeTandon(ukuran, nft.liter_tandon_per_lubang) : null;
        const alokasi: AlokasiPesanan = {
          id: k.idBaru('alokasi'),
          pesanan_id: id,
          petani_id: petani.id,
          siklus_id: siklusId,
          jumlah_kg: m.jumlah_kg,
          status: 'menunggu_kesepakatan',
          disetujui_pada: null,
          dibuat_pada: k.sekarangIso(),
        };
        k.db.kebun.siklus.push({
          id: siklusId,
          petani_id: petani.id,
          lahan_id: lahan.id,
          resep_id: resep.id,
          resep_versi: resep.versi,
          komoditas_id: resep.komoditas_id,
          metode_id: resep.metode_id,
          status: 'rencana',
          luas_m2: hidro ? null : ukuran,
          jumlah_lubang: hidro ? ukuran : null,
          jumlah_polybag: null,
          volume_tandon_liter: volume,
          sistem_hidroponik: hidro ? 'nft' : null,
          vertikultur: false,
          satuan_asli: hidro ? 'lubang' : 'm2',
          nilai_asli: ukuran,
          tanggal_tanam: null,
          dapat_subsidi: false,
          // P0-21: siklus dari pesanan memakai harga kesepakatan.
          harga_jual: pesanan.harga_per_kg,
          perkiraan_panen_kg: pastikan(
            perkiraanPanen(resep.dasar_ukuran, ukuran, resep.hasil_per_satuan),
          ),
          alokasi_pesanan_id: alokasi.id,
          pendapatan_nyata: null,
          dibuat_pada: k.sekarangIso(),
        });
        const kebutuhan = k.dariHasil(
          hitungKebutuhanResep(resepKeDomain(resep), resep.dasar_ukuran, {
            luasM2: hidro ? null : ukuran,
            jumlahTanaman: hidro ? ukuran : null,
            volumeLarutanLiter: volume,
          }),
        );
        for (const kb of kebutuhan) {
          const input = resep.input.find((i) => i.id === kb.inputId);
          k.db.kebun.rencana_item.push({
            id: `${siklusId}:${kb.inputId}`,
            siklus_id: siklusId,
            resep_input_id: kb.inputId,
            input_id: input?.input_id ?? null,
            merek_id: null,
            nama: kb.nama,
            grup: kb.grup,
            jumlah: kb.jumlahBeli,
            satuan: kb.satuanBeli,
            harga_satuan: kb.hargaContoh,
            asal: 'resep',
            alat_sekali_beli: kb.alatSekaliBeli,
            jumlah_siklus_pembagian: kb.alatSekaliBeli ? 10 : 1,
          });
        }
        k.db.kebun.pengaturan_pengingat.push({
          siklus_id: siklusId,
          jam_pagi: '06:00',
          pengingat_sore: true,
          tipe_aktif: { sekali: true, berulang: true, ukur: true },
        });
        k.db.pesanan.alokasi.push(alokasi);
        pesanan.terambil_kg = Math.round((pesanan.terambil_kg + m.jumlah_kg) * 100) / 100;
        k.simpan();
        return { alokasi: k.salin(alokasi), siklus_id: siklusId };
      });
    },

    async setujuiKesepakatan(alokasiId) {
      const petani = k.wajibPeran('petani');
      const a = k.milik(
        k.db.pesanan.alokasi,
        (x) => x.id === alokasiId,
        (x) => x.petani_id === petani.id,
      );
      if (a.status !== 'menunggu_kesepakatan') k.galat('STATUS_TIDAK_SESUAI');
      const p = pesananDari(k, a.pesanan_id);
      const siklus = k.db.kebun.siklus.find((s) => s.id === a.siklus_id);
      const umur = siklus ? resepSiklus(k, siklus).umur_panen_hari : 0;
      const jadwal = jadwalTerkejar(k, petani, p, umur);
      if (!jadwal.length) k.galat('JADWAL_TERLALU_DEKAT');
      a.status = 'disepakati';
      a.disetujui_pada = k.sekarangIso();
      // Jadwal tanam masuk ke kebun: petak pertama ditanam umur panen sebelum kiriman pertama.
      if (siklus && siklus.status === 'rencana') {
        const tanggalTanam = tambahHari((jadwal[0] as { tanggal: string }).tanggal, -umur);
        siklus.status = 'aktif';
        siklus.tanggal_tanam = tanggalTanam;
        buatTugas(k, siklus, tanggalTanam);
      }
      jadwal.forEach(({ ke, tanggal }) =>
        k.db.pesanan.pengiriman.push({
          id: k.idBaru('kiriman'),
          alokasi_id: a.id,
          pesanan_id: p.id,
          ke,
          tanggal_jadwal: tanggal,
          jumlah_kg: a.jumlah_kg,
          harga_per_kg: p.harga_per_kg,
          foto_kualitas: null,
          status: 'terjadwal',
          dikirim_pada: null,
          batas_periksa_pada: null,
          dikonfirmasi_pada: null,
          dianggap_diterima: false,
          jumlah_ditolak_kg: 0,
          alasan_penolakan: null,
          keterangan_penolakan: null,
          foto_penolakan: null,
          nilai_diterima: null,
        }),
      );
      if (p.status === 'mencari_petani') p.status = 'berjalan';
      k.simpan();
      return k.salin(a);
    },

    async alokasiSaya() {
      const petani = k.wajibPeran('petani');
      await prosesOtomatis(k);
      return k.salin(k.db.pesanan.alokasi.filter((a) => a.petani_id === petani.id));
    },

    async laporGagalPanen(alokasiId, m) {
      const petani = k.wajibPeran('petani');
      const a = k.milik(
        k.db.pesanan.alokasi,
        (x) => x.id === alokasiId,
        (x) => x.petani_id === petani.id,
      );
      const kiriman = k.milik(
        k.db.pesanan.pengiriman,
        (x) => x.id === m.pengiriman_id,
        (x) => x.alokasi_id === a.id,
      );
      if (kiriman.status !== 'terjadwal') k.galat('STATUS_TIDAK_SESUAI');
      if (!m.alasan?.trim()) k.validasi({ alasan: 'VALIDASI' });
      const p = pesananDari(k, a.pesanan_id);
      const nilaiBagian = bulatkanRupiah(kiriman.jumlah_kg * kiriman.harga_per_kg);
      const bagianUangMuka = Math.min(
        p.saldo_uang_muka,
        bulatkanRupiah((nilaiBagian * k.db.konfigurasi.persen_uang_muka) / 100),
      );
      const r = aturanGagalPanen({
        jadwalKirim: kiriman.tanggal_jadwal,
        tanggalKabar: k.hariIni(petani),
        batasHari: k.db.konfigurasi.hari_kabar_gagal_panen,
        adaPengganti: false,
        sisaUangMukaBagian: bagianUangMuka,
      });
      const um = refUangMuka(k, p.id);
      if (um && r.dikembalikan > 0) {
        await dariGerbang(k, k.bayar.kembalikan(um, r.dikembalikan));
        catatBayar(k, {
          pesanan_id: p.id,
          pengiriman_id: kiriman.id,
          jenis: 'pengembalian',
          nominal: r.dikembalikan,
          status: 'dikembalikan',
          referensi: um,
        });
        p.saldo_uang_muka -= r.dikembalikan;
      }
      if (r.catatanProfil) {
        k.db.pengguna.catatan_petani.push({
          id: k.idBaru('catatan'),
          petani_id: petani.id,
          jenis: 'tidak_memberi_kabar',
          pengiriman_id: kiriman.id,
          isi: `Kabar gagal panen kurang dari ${k.db.konfigurasi.hari_kabar_gagal_panen} hari sebelum jadwal kirim.`,
          dibuat_pada: k.sekarangIso(),
        });
      }
      kiriman.status = 'gagal';
      if (!kirimanTerbuka(k, p.id).some((x) => x.alokasi_id === a.id)) a.status = 'gagal';
      k.simpan();
      return {
        tepat_waktu: r.tepatWaktu,
        dikembalikan: r.dikembalikan,
        catatan_profil: r.catatanProfil,
        alokasi: k.salin(a),
      };
    },
  };
}

// ---------------------------------------------------------------- kiriman

function aksesKiriman(k: Konteks, p: Pengguna, x: Pengiriman): boolean {
  const a = alokasiDari(k, x.alokasi_id);
  return a?.petani_id === p.id || pesananDari(k, x.pesanan_id)?.pembeli_id === p.id;
}

export function buatKlienKiriman(k: Konteks): KlienKiriman {
  const milikPetani = (p: Pengguna, id: string) =>
    k.milik(
      k.db.pesanan.pengiriman,
      (x) => x.id === id,
      (x) => alokasiDari(k, x.alokasi_id)?.petani_id === p.id,
    );
  return {
    async saya() {
      const p = k.wajibPeran('petani');
      await prosesOtomatis(k);
      const milik = new Set(
        k.db.pesanan.alokasi.filter((a) => a.petani_id === p.id).map((a) => a.id),
      );
      return k.salin(
        k.db.pesanan.pengiriman
          .filter((x) => milik.has(x.alokasi_id))
          .sort((a, b) => bandingTanggal(a.tanggal_jadwal, b.tanggal_jadwal)),
      );
    },

    async ambil(id) {
      const p = k.wajibPeran('petani', 'pembeli');
      await prosesOtomatis(k);
      return k.salin(
        k.milik(
          k.db.pesanan.pengiriman,
          (x) => x.id === id,
          (x) => aksesKiriman(k, p, x),
        ),
      );
    },

    async unggahFotoKualitas(id, foto) {
      const p = k.wajibPeran('petani');
      const x = milikPetani(p, id);
      if (x.status !== 'terjadwal') k.galat('STATUS_TIDAK_SESUAI');
      if (!foto) k.validasi({ foto: 'FOTO_WAJIB' });
      x.foto_kualitas = foto;
      k.simpan();
      return k.salin(x);
    },

    async tandaiDikirim(id) {
      const p = k.wajibPeran('petani');
      const x = milikPetani(p, id);
      if (x.status !== 'terjadwal') k.galat('STATUS_TIDAK_SESUAI');
      if (!x.foto_kualitas) k.galat('FOTO_WAJIB');
      const pesanan = pesananDari(k, x.pesanan_id);
      if (pesanan.status !== 'berjalan') k.galat('STATUS_TIDAK_SESUAI');
      const nilai = bulatkanRupiah(x.jumlah_kg * x.harga_per_kg);
      const terakhir = kirimanTerbuka(k, pesanan.id, x.id).length === 0;
      const bayar = pastikan(
        hitungPembayaranKiriman({
          nilaiKiriman: nilai,
          nilaiDiterima: nilai,
          saldoUangMuka: pesanan.saldo_uang_muka,
          persenUangMuka: k.db.konfigurasi.persen_uang_muka,
          kirimanTerakhir: terakhir,
        }),
      );
      // Pembeli membayar bagiannya (80% pada konfigurasi contoh) dan dananya ditahan sampai dikonfirmasi.
      const dana = await dariGerbang(
        k,
        k.bayar.tahan({
          nominal: bayar.dibayarPembeli,
          keterangan: `kiriman ${x.id}`,
          kunciIdempoten: `kiriman-${x.id}`,
        }),
      );
      catatBayar(k, {
        pesanan_id: pesanan.id,
        pengiriman_id: x.id,
        jenis: 'kiriman',
        nominal: bayar.dibayarPembeli,
        status: 'ditahan',
        referensi: dana.referensi,
      });
      const sekarang = k.jam();
      const s = statusOtomatis(
        { jenisPesanan: pesanan.jenis, dikirimPadaMs: sekarang },
        sekarang,
        konfigurasiKeDomain(k.db.konfigurasi).jamPeriksa,
      );
      x.status = 'dikirim';
      x.dikirim_pada = new Date(sekarang).toISOString();
      x.batas_periksa_pada = new Date(s.batasMs).toISOString();
      const a = alokasiDari(k, x.alokasi_id);
      if (a.status === 'disepakati') a.status = 'berjalan';
      k.simpan();
      return k.salin(x);
    },

    konfirmasi(id, m) {
      return k.idempoten(`konfirmasi:${id}`, m.kunci_idempoten, async () => {
        const p = k.wajibPeran('pembeli');
        await prosesOtomatis(k);
        const x = k.milik(
          k.db.pesanan.pengiriman,
          (y) => y.id === id,
          (y) => pesananDari(k, y.pesanan_id)?.pembeli_id === p.id,
        );
        if (x.status !== 'dikirim') k.galat('STATUS_TIDAK_SESUAI');
        let keputusan: KeputusanKiriman = { jenis: 'terima_semua' };
        if (m.keputusan === 'tolak_sebagian') {
          const alasan = k.dariHasil(
            validasiAlasan(m.alasan_penolakan, m.keterangan_penolakan),
            m.alasan_penolakan === 'lainnya' ? 'keterangan_penolakan' : 'alasan_penolakan',
          );
          keputusan = {
            jenis: 'tolak_sebagian',
            jumlahDitolakKg: m.jumlah_ditolak_kg,
            alasan,
            keterangan: m.keterangan_penolakan ?? null,
          };
        }
        const hasil = await terapkanKonfirmasi(
          k,
          x,
          keputusan,
          m.keputusan === 'tolak_sebagian' ? (m.foto_penolakan ?? null) : null,
          false,
        );
        k.simpan();
        return hasil;
      });
    },

    async beriRating(id, m) {
      const p = k.wajibPeran('petani', 'pembeli');
      const x = k.milik(
        k.db.pesanan.pengiriman,
        (y) => y.id === id,
        (y) => aksesKiriman(k, p, y),
      );
      if (x.status !== 'diterima' && x.status !== 'ditolak_sebagian')
        k.galat('STATUS_TIDAK_SESUAI');
      if (!Number.isInteger(m.nilai) || m.nilai < 1 || m.nilai > 5)
        k.validasi({ nilai: 'VALIDASI' });
      if (k.db.pesanan.rating.some((r) => r.pengiriman_id === id && r.pemberi_id === p.id))
        k.galat('SUDAH_DINILAI');
      const a = alokasiDari(k, x.alokasi_id);
      const penerima = p.id === a.petani_id ? pesananDari(k, x.pesanan_id).pembeli_id : a.petani_id;
      const r = {
        id: k.idBaru('rating'),
        pengiriman_id: id,
        pemberi_id: p.id,
        penerima_id: penerima,
        nilai: m.nilai,
        komentar: m.komentar?.trim() || null,
        dibuat_pada: k.sekarangIso(),
      };
      k.db.pesanan.rating.push(r);
      k.simpan();
      return k.salin(r);
    },

    async ringkasanRating(penggunaId) {
      k.penggunaMasuk();
      k.milik(k.db.pengguna.pengguna, (x) => x.id === penggunaId);
      return ringkasanRating(k, penggunaId);
    },
  };
}

// ---------------------------------------------------------------- pembeli

export function buatKlienPembeli(k: Konteks): KlienPembeli {
  const milikPembeli = (p: Pengguna, id: string) =>
    k.milik(
      k.db.pesanan.pesanan,
      (x) => x.id === id,
      (x) => x.pembeli_id === p.id,
    );
  const denganKebun = (p: Pengguna, x: Pesanan): PesananDenganKebun => {
    const kiriman = k.db.pesanan.pengiriman
      .filter((y) => y.pesanan_id === x.id)
      .sort((a, b) => bandingTanggal(a.tanggal_jadwal, b.tanggal_jadwal));
    const kebun = k.db.pesanan.alokasi
      .filter((a) => a.pesanan_id === x.id && alokasiAktif(a))
      .map((a) => {
        const petani = k.db.pengguna.pengguna.find((u) => u.id === a.petani_id) as Pengguna;
        const siklus = k.db.kebun.siklus.find((s) => s.id === a.siklus_id);
        const resep = siklus ? k.db.resep.find((r) => r.id === siklus.resep_id) : undefined;
        const foto = k.db.kebun.jurnal
          .filter((j) => j.siklus_id === a.siklus_id && j.foto)
          .sort((m, n) => bandingTanggal(n.tanggal, m.tanggal))[0];
        // D-06: hanya nama desa dan jarak dari titik tengah desa, tanpa titik lahan.
        return {
          alokasi_id: a.id,
          nama_petani: petani.nama ?? '',
          desa: k.wilayah(petani.wilayah_id)?.desa ?? '',
          jarak_km: jarakPesananKm(k, petani, x) ?? 0,
          jumlah_kg: a.jumlah_kg,
          hari_ke: siklus?.tanggal_tanam ? selisihHari(siklus.tanggal_tanam, k.hariIni(p)) : null,
          hari_panen: resep?.umur_panen_hari ?? null,
          perkiraan_tanggal_panen:
            siklus?.tanggal_tanam && resep
              ? tambahHari(siklus.tanggal_tanam, resep.umur_panen_hari)
              : null,
          foto_terbaru: foto?.foto ?? null,
        };
      });
    return k.salin({
      ...x,
      kebun,
      kiriman_berikutnya: kiriman.find((y) => y.status === 'terjadwal') ?? null,
      kiriman_menunggu: kiriman.filter((y) => y.status === 'dikirim'),
    });
  };
  return {
    async pesananSaya() {
      const p = k.wajibPeran('pembeli');
      await prosesOtomatis(k);
      return k.db.pesanan.pesanan
        .filter((x) => x.pembeli_id === p.id)
        .sort((a, b) => b.dibuat_pada.localeCompare(a.dibuat_pada))
        .map((x) => denganKebun(p, x));
    },

    async buatPesanan(m) {
      const p = k.wajibPeran('pembeli');
      const profil = k.db.pengguna.profil_pembeli.find((x) => x.pengguna_id === p.id);
      if (profil?.status_verifikasi !== 'terverifikasi') k.galat('BELUM_TERVERIFIKASI');
      const salah: Record<
        string,
        'VALIDASI' | 'TIDAK_DITEMUKAN' | 'HARGA_KOSONG' | 'JUMLAH_KOSONG'
      > = {};
      if (!k.db.resep.some((r) => r.komoditas_id === m.komoditas_id && k.resepTerlihat(r)))
        salah.komoditas_id = 'VALIDASI';
      if (!k.wilayah(m.wilayah_id)) salah.wilayah_id = 'TIDAK_DITEMUKAN';
      if (!m.alamat_antar?.trim()) salah.alamat_antar = 'VALIDASI';
      if (!(m.harga_per_kg > 0)) salah.harga_per_kg = 'HARGA_KOSONG';
      if (m.jenis === 'rutin' && !(m.jumlah_per_kiriman_kg > 0))
        salah.jumlah_per_kiriman_kg = 'JUMLAH_KOSONG';
      if (m.jenis === 'sekali_panen' && !(m.jumlah_total_kg > 0))
        salah.jumlah_total_kg = 'JUMLAH_KOSONG';
      if (m.jenis === 'sekali_panen' && !/^\d{4}-(0[1-9]|1[0-2])$/.test(m.perkiraan_bulan_panen))
        salah.perkiraan_bulan_panen = 'VALIDASI';
      if (Object.keys(salah).length) k.validasi(salah);
      const jumlahKiriman =
        m.jenis === 'rutin'
          ? k.dariHasil(
              jumlahKirimanRutin(
                m.frekuensi_hari,
                m.durasi_hari,
                k.db.konfigurasi.maks_durasi_rutin_hari,
              ),
              'durasi_hari',
            )
          : 1;
      const nilai = k.dariHasil(
        hitungNilaiPesanan(
          m.jenis === 'rutin'
            ? {
                jenis: 'rutin',
                jumlahPerKirimanKg: m.jumlah_per_kiriman_kg,
                jumlahKiriman,
                hargaPerKg: m.harga_per_kg,
              }
            : {
                jenis: 'sekali_panen',
                jumlahTotalKg: m.jumlah_total_kg,
                hargaPerKg: m.harga_per_kg,
              },
          {
            persenUangMuka: k.db.konfigurasi.persen_uang_muka,
            persenLayanan: k.db.konfigurasi.persen_layanan,
          },
        ),
      );
      const x: Pesanan = {
        id: k.idBaru('pesanan'),
        pembeli_id: p.id,
        jenis: m.jenis,
        komoditas_id: m.komoditas_id,
        jumlah_per_kiriman_kg: m.jenis === 'rutin' ? m.jumlah_per_kiriman_kg : null,
        frekuensi_hari: m.jenis === 'rutin' ? m.frekuensi_hari : null,
        jumlah_kiriman: jumlahKiriman,
        jumlah_total_kg: nilai.jumlahTotalKg,
        tanggal_mulai: m.jenis === 'rutin' ? m.tanggal_mulai : null,
        tanggal_selesai:
          m.jenis === 'rutin'
            ? tambahHari(m.tanggal_mulai, (jumlahKiriman - 1) * m.frekuensi_hari)
            : null,
        perkiraan_bulan_panen: m.jenis === 'sekali_panen' ? m.perkiraan_bulan_panen : null,
        harga_per_kg: m.harga_per_kg,
        standar_kualitas: [...m.standar_kualitas],
        wilayah_id: m.wilayah_id,
        alamat_antar: m.alamat_antar.trim(),
        patokan: m.patokan ?? null,
        status: 'menunggu_pembayaran',
        nilai_pesanan: nilai.nilaiPesanan,
        uang_muka: nilai.uangMuka,
        biaya_layanan: nilai.biayaLayanan,
        saldo_uang_muka: 0,
        terambil_kg: 0,
        dibuat_pada: k.sekarangIso(),
      };
      k.db.pesanan.pesanan.push(x);
      k.simpan();
      return k.salin(x);
    },

    bayarUangMuka(id, m) {
      return k.idempoten(`bayar-uang-muka:${id}`, m.kunci_idempoten, async () => {
        const p = k.wajibPeran('pembeli');
        const x = milikPembeli(p, id);
        if (x.status !== 'menunggu_pembayaran') k.galat('STATUS_TIDAK_SESUAI');
        const um = await dariGerbang(
          k,
          k.bayar.tahan({
            nominal: x.uang_muka,
            keterangan: `uang muka ${id}`,
            kunciIdempoten: `uang-muka-${id}`,
          }),
        );
        const layanan = await dariGerbang(
          k,
          k.bayar.tahan({
            nominal: x.biaya_layanan,
            keterangan: `biaya layanan ${id}`,
            kunciIdempoten: `layanan-${id}`,
          }),
        );
        await dariGerbang(k, k.bayar.cairkan(layanan.referensi, x.biaya_layanan));
        const baris = [
          catatBayar(k, {
            pesanan_id: id,
            pengiriman_id: null,
            jenis: 'uang_muka',
            nominal: x.uang_muka,
            status: 'ditahan',
            referensi: um.referensi,
          }),
          catatBayar(k, {
            pesanan_id: id,
            pengiriman_id: null,
            jenis: 'biaya_layanan',
            nominal: x.biaya_layanan,
            status: 'cair',
            referensi: layanan.referensi,
          }),
        ];
        x.status = 'mencari_petani';
        x.saldo_uang_muka = x.uang_muka;
        k.simpan();
        return k.salin(baris);
      });
    },

    async batalkan(id) {
      const p = k.wajibPeran('pembeli');
      const x = milikPembeli(p, id);
      if (x.status === 'selesai' || x.status === 'dibatalkan') k.galat('STATUS_TIDAK_SESUAI');
      const aktif = k.db.pesanan.alokasi.filter((a) => a.pesanan_id === id && alokasiAktif(a));
      const menanam = aktif.some(
        (a) => k.db.kebun.siklus.find((s) => s.id === a.siklus_id)?.status === 'aktif',
      );
      const r = pembatalanPembeli({
        petaniSudahMenanam: menanam,
        saldoUangMuka: x.saldo_uang_muka,
      });
      const um = refUangMuka(k, id);
      if (um && r.kompensasiPetani > 0) {
        await dariGerbang(k, k.bayar.cairkan(um, r.kompensasiPetani));
        catatBayar(k, {
          pesanan_id: id,
          pengiriman_id: null,
          jenis: 'kompensasi',
          nominal: r.kompensasiPetani,
          status: 'cair',
          referensi: um,
        });
      }
      if (um && r.dikembalikanKePembeli > 0) {
        await dariGerbang(k, k.bayar.kembalikan(um, r.dikembalikanKePembeli));
        catatBayar(k, {
          pesanan_id: id,
          pengiriman_id: null,
          jenis: 'pengembalian',
          nominal: r.dikembalikanKePembeli,
          status: 'dikembalikan',
          referensi: um,
        });
      }
      x.status = 'dibatalkan';
      x.saldo_uang_muka = 0;
      for (const a of aktif) a.status = 'dibatalkan';
      for (const y of k.db.pesanan.pengiriman)
        if (y.pesanan_id === id && y.status === 'terjadwal') y.status = 'gagal';
      k.simpan();
      return {
        pesanan: k.salin(x),
        kompensasi_petani: r.kompensasiPetani,
        dikembalikan_ke_pembeli: r.dikembalikanKePembeli,
      };
    },

    async pembayaran(param = {}) {
      const p = k.wajibPeran('pembeli');
      await prosesOtomatis(k);
      const milik = new Set(
        k.db.pesanan.pesanan.filter((x) => x.pembeli_id === p.id).map((x) => x.id),
      );
      return k.halaman(
        k.db.pesanan.pembayaran
          .filter((b) => milik.has(b.pesanan_id))
          .sort((a, b) => b.dibuat_pada.localeCompare(a.dibuat_pada)),
        param,
      );
    },
  };
}
