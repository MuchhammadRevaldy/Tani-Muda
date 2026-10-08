/**
 * Hook kueri dan mutasi per fitur (T3.04). Kunci kueri: [fitur, sumber, ...parameter] lewat
 * kunciKueri; setiap mutasi membatalkan cache fitur yang datanya berubah.
 */
import { kunciKueri as kk } from '../../lib/kunci-kueri';
import type * as T from '../tipe';
import { useKueriApi as q, useKueriBanyak as qBanyak, useMutasiApi as m } from './bantu';

export { kunciIdempotenBaru } from './bantu';

// ---------------------------------------------------------------- akun dan wilayah
export const useAkun = () => q(kk('akun', 'saya'), (k) => k.akun.ambil());
export const useCatatanSaya = (aktif = true) =>
  q(kk('akun', 'catatan'), (k) => k.akun.catatanSaya(), aktif);
export const useKirimOtp = () => m((k, x: T.KirimOtpMasukan) => k.akun.kirimOtp(x), []);
export const useVerifikasiOtp = () =>
  m((k, x: T.VerifikasiOtpMasukan) => k.akun.verifikasiOtp(x), ['akun']);
export const usePilihPeran = () => m((k, x: T.PilihPeranMasukan) => k.akun.pilihPeran(x), ['akun']);
export const useUbahProfil = () =>
  m((k, x: T.UbahProfilMasukan) => k.akun.ubahProfil(x), ['akun', 'pesanan', 'referensi']);
export const useSimpanProfilPembeli = () =>
  m((k, x: T.ProfilPembeliMasukan) => k.akun.simpanProfilPembeli(x), ['akun']);
export const useKirimOtpNomorBaru = () =>
  m((k, x: T.KirimOtpMasukan) => k.akun.kirimOtpNomorBaru(x), []);
export const useGantiNomorHp = () =>
  m((k, x: T.GantiNomorHpMasukan) => k.akun.gantiNomorHp(x), ['akun']);
export const useKeluar = () => m((k, _x: void) => k.akun.keluar(), ['akun']);
export const useWilayah = (p: T.ParamWilayah & T.ParamHalaman = {}) =>
  q(kk('wilayah', 'daftar', { ...p }), (k) => k.wilayah.daftar(p));
export const useWilayahSatu = (id: string | null) =>
  q(kk('wilayah', 'satu', id), (k) => k.wilayah.ambil(id as string), !!id);

// ---------------------------------------------------------------- referensi dan resep
export const useKonfigurasi = () =>
  q(kk('referensi', 'konfigurasi'), (k) => k.referensi.konfigurasi());
export const useKomoditas = (p: T.ParamKomoditas = {}) =>
  q(kk('referensi', 'komoditas', { ...p }), (k) => k.referensi.komoditas(p));
export const useMetode = () => q(kk('referensi', 'metode'), (k) => k.referensi.metode());
export const useSistemHidroponik = () =>
  q(kk('referensi', 'sistem-hidroponik'), (k) => k.referensi.sistemHidroponik());
export const useKonversiSatuan = (wilayahId: string | null) =>
  q(
    kk('referensi', 'konversi', wilayahId),
    (k) => k.referensi.konversiSatuan(wilayahId as string),
    !!wilayahId,
  );
export const useMerek = (inputId: string | null) =>
  q(kk('referensi', 'merek', inputId), (k) => k.referensi.merek(inputId as string), !!inputId);
export const useHargaSekitar = (inputId: string | null) =>
  q(
    kk('referensi', 'harga-sekitar', inputId),
    (k) => k.referensi.hargaSekitar(inputId as string),
    !!inputId,
  );
/** Harga rata-rata sekitar untuk banyak input sekaligus (kalkulator). */
export const useHargaSekitarBanyak = (inputIds: string[]) =>
  qBanyak(
    inputIds,
    (id) => kk('referensi', 'harga-sekitar', id),
    (k, id) => k.referensi.hargaSekitar(id),
  );
export const useLaporHarga = () =>
  m((k, x: T.LaporHargaMasukan) => k.referensi.laporHarga(x), ['referensi']);
export const usePromo = () => q(kk('referensi', 'promo'), (k) => k.referensi.promo());
export const useKelayakanSubsidi = (komoditasId: string | null) =>
  q(
    kk('referensi', 'subsidi', komoditasId),
    (k) => k.referensi.kelayakanSubsidi(komoditasId as string),
    !!komoditasId,
  );
export const useDaftarResep = (p: T.ParamResep = {}) =>
  q(kk('resep', 'daftar', { ...p }), (k) => k.resep.daftar(p));
export const useResep = (id: string | null) =>
  q(kk('resep', 'satu', id), (k) => k.resep.ambil(id as string), !!id);
export const useContohPublik = () => q(kk('resep', 'publik'), (k) => k.resep.contohPublik());
export const useMintaResep = () => m((k, x: T.MintaResepMasukan) => k.resep.minta(x), ['resep']);
export const usePermintaanSaya = () =>
  q(kk('resep', 'permintaan-saya'), (k) => k.resep.permintaanSaya());

// ---------------------------------------------------------------- lahan dan kebun
export const useLahan = () => q(kk('lahan', 'daftar'), (k) => k.lahan.daftar());
export const useBuatLahan = () => m((k, x: T.LahanMasukan) => k.lahan.buat(x), ['lahan']);
export const useUbahLahan = () =>
  m((k, x: { id: string; ubah: Partial<T.LahanMasukan> }) => k.lahan.ubah(x.id, x.ubah), ['lahan']);
export const useHapusLahan = () => m((k, id: string) => k.lahan.hapus(id), ['lahan']);
export const useDaftarSiklus = (p: { status?: T.StatusSiklus } = {}) =>
  q(kk('kebun', 'siklus', { ...p }), (k) => k.kebun.daftarSiklus(p));
export const useSiklus = (id: string | null) =>
  q(kk('kebun', 'siklus-satu', id), (k) => k.kebun.ambilSiklus(id as string), !!id);
export const useBuatSiklus = () =>
  m((k, x: T.BuatSiklusMasukan) => k.kebun.buatSiklus(x), ['kebun', 'lahan']);
export const useUbahTanggalTanam = () =>
  m(
    (k, x: { id: string; tanggal: string }) => k.kebun.ubahTanggalTanam(x.id, x.tanggal),
    ['kebun', 'lahan'],
  );
export const useAkhiriSiklus = () =>
  m(
    (k, x: { id: string } & T.AkhiriSiklusMasukan) => k.kebun.akhiriSiklus(x.id, x),
    ['kebun', 'lahan'],
  );
export const useTugas = (siklusId: string | null) =>
  q(kk('kebun', 'tugas', siklusId), (k) => k.kebun.daftarTugas(siklusId as string), !!siklusId);
/** Tugas beberapa siklus sekaligus (kunci sama dengan useTugas, jadi berbagi cache). */
export const useTugasBanyakSiklus = (ids: string[]) =>
  qBanyak(
    ids,
    (id) => kk('kebun', 'tugas', id),
    (k, id) => k.kebun.daftarTugas(id),
  );
export const useTugasHariIni = () =>
  q(kk('kebun', 'tugas-hari-ini'), (k) => k.kebun.tugasHariIni());
export const useSelesaikanTugas = () =>
  m(
    (k, x: { id: string } & T.SelesaikanTugasMasukan) => k.kebun.selesaikanTugas(x.id, x),
    ['kebun'],
  );
export const useTundaTugas = () =>
  m((k, x: { id: string } & T.TundaTugasMasukan) => k.kebun.tundaTugas(x.id, x), ['kebun']);
export const useCatatPengukuran = () =>
  m((k, x: { id: string } & T.PengukuranMasukan) => k.kebun.catatPengukuran(x.id, x), ['kebun']);
export const useRiwayatPengukuran = (siklusId: string | null, besaran?: string) =>
  q(
    kk('kebun', 'pengukuran', siklusId, besaran),
    (k) => k.kebun.riwayatPengukuran(siklusId as string, besaran),
    !!siklusId,
  );
export const usePengeluaran = (siklusId: string | null) =>
  q(
    kk('kebun', 'pengeluaran', siklusId),
    (k) => k.kebun.daftarPengeluaran(siklusId as string),
    !!siklusId,
  );
export const useCatatPengeluaran = () =>
  m(
    (k, x: { siklusId: string } & T.PengeluaranMasukan) => k.kebun.catatPengeluaran(x.siklusId, x),
    ['kebun'],
  );
export const useJurnal = (siklusId: string | null) =>
  q(kk('kebun', 'jurnal', siklusId), (k) => k.kebun.jurnal(siklusId as string), !!siklusId);
export const useTambahJurnal = () =>
  m(
    (k, x: { siklusId: string } & T.JurnalMasukan) => k.kebun.tambahJurnal(x.siklusId, x),
    ['kebun'],
  );
export const usePengingat = (siklusId: string | null) =>
  q(
    kk('kebun', 'pengingat', siklusId),
    (k) => k.kebun.ambilPengingat(siklusId as string),
    !!siklusId,
  );
export const useUbahPengingat = () =>
  m(
    (k, x: { siklusId: string } & T.PengaturanPengingatMasukan) =>
      k.kebun.ubahPengingat(x.siklusId, x),
    ['kebun'],
  );

// ---------------------------------------------------------------- belajar
export const useModul = (p: T.ParamModul | null) =>
  q(
    kk('belajar', 'modul', p ? { ...p } : null),
    (k) => k.belajar.daftarModul(p as T.ParamModul),
    !!p,
  );
export const useModulSatu = (id: string | null) =>
  q(kk('belajar', 'modul-satu', id), (k) => k.belajar.ambilModul(id as string), !!id);
export const useTandaiModul = () => m((k, id: string) => k.belajar.tandaiSelesai(id), ['belajar']);

// ---------------------------------------------------------------- pesanan dan kiriman (petani)
export const usePesananSekitar = (p: T.ParamPesananSekitar = {}) =>
  q(kk('pesanan', 'sekitar', { ...p }), (k) => k.pesanan.sekitar(p));
export const usePesananUntukPetani = (id: string | null) =>
  q(kk('pesanan', 'satu', id), (k) => k.pesanan.ambil(id as string), !!id);
/** Beberapa pesanan sekaligus (Kiriman saya: nama pembeli dan komoditas tiap kiriman). */
export const usePesananUntukPetaniBanyak = (ids: string[]) =>
  qBanyak(
    ids,
    (id) => kk('pesanan', 'satu', id),
    (k, id) => k.pesanan.ambil(id),
  );
export const useAmbilPesanan = () =>
  m(
    (k, x: { id: string } & T.AmbilPesananMasukan) => k.pesanan.ambilPesanan(x.id, x),
    ['pesanan', 'kebun', 'lahan'],
  );
/** Ubah jumlah sebelum menyetujui kesepakatan; petak dibuat ulang (D-40). */
export const useUbahAlokasi = () =>
  m(
    (k, x: { alokasiId: string } & T.UbahAlokasiMasukan) =>
      k.pesanan.ubahAlokasi(x.alokasiId, { jumlah_kg: x.jumlah_kg }),
    ['pesanan', 'kebun', 'lahan'],
  );
export const useSetujuiKesepakatan = () =>
  m(
    (k, alokasiId: string) => k.pesanan.setujuiKesepakatan(alokasiId),
    ['pesanan', 'kiriman', 'kebun', 'lahan'],
  );
export const useAlokasiSaya = () =>
  q(kk('pesanan', 'alokasi-saya'), (k) => k.pesanan.alokasiSaya());
export const useLaporGagalPanen = () =>
  m(
    (k, x: { alokasiId: string } & T.LaporGagalPanenMasukan) =>
      k.pesanan.laporGagalPanen(x.alokasiId, x),
    ['pesanan', 'kiriman', 'akun'],
  );
export const useKirimanSaya = () => q(kk('kiriman', 'saya'), (k) => k.kiriman.saya());
export const useKiriman = (id: string | null) =>
  q(kk('kiriman', 'satu', id), (k) => k.kiriman.ambil(id as string), !!id);
export const useUnggahFotoKualitas = () =>
  m(
    (k, x: { id: string; foto: string }) => k.kiriman.unggahFotoKualitas(x.id, x.foto),
    ['kiriman'],
  );
export const useUnggahFotoTimbangan = () =>
  m(
    (k, x: { id: string; foto: string | null }) => k.kiriman.unggahFotoTimbangan(x.id, x.foto),
    ['kiriman'],
  );
export const useTandaiDikirim = () =>
  m((k, id: string) => k.kiriman.tandaiDikirim(id), ['kiriman', 'pembeli']);
export const useKonfirmasiKiriman = () =>
  m(
    (k, x: { id: string; masukan: T.KonfirmasiKirimanMasukan }) =>
      k.kiriman.konfirmasi(x.id, x.masukan),
    ['kiriman', 'pembeli'],
  );
export const useBeriRating = () =>
  m(
    (k, x: { id: string } & T.RatingMasukan) => k.kiriman.beriRating(x.id, x),
    ['kiriman', 'rating'],
  );
export const useRingkasanRating = (penggunaId: string | null) =>
  q(
    kk('rating', 'ringkasan', penggunaId),
    (k) => k.kiriman.ringkasanRating(penggunaId as string),
    !!penggunaId,
  );

// ---------------------------------------------------------------- pembeli
export const usePesananPembeli = () => q(kk('pembeli', 'pesanan'), (k) => k.pembeli.pesananSaya());
export const useBuatPesanan = () =>
  m((k, x: T.BuatPesananMasukan) => k.pembeli.buatPesanan(x), ['pembeli']);
export const useBayarUangMuka = () =>
  m(
    (k, x: { id: string } & T.BayarUangMukaMasukan) => k.pembeli.bayarUangMuka(x.id, x),
    ['pembeli', 'pesanan'],
  );
export const useBatalkanPesanan = () =>
  m((k, id: string) => k.pembeli.batalkan(id), ['pembeli', 'pesanan']);
export const useRiwayatPembayaran = (p: T.ParamHalaman = {}) =>
  q(kk('pembeli', 'pembayaran', { ...p }), (k) => k.pembeli.pembayaran(p));

// ---------------------------------------------------------------- admin, mentor, notifikasi, berkas
export const usePembeliMenunggu = () =>
  q(kk('admin', 'pembeli-menunggu'), (k) => k.admin.pembeliMenunggu());
export const useVerifikasiPembeli = () =>
  m(
    (k, x: { penggunaId: string } & T.VerifikasiPembeliMasukan) =>
      k.admin.verifikasiPembeli(x.penggunaId, x),
    ['admin'],
  );
export const useSengketa = (p: T.ParamSengketa = {}) =>
  q(kk('admin', 'sengketa', { ...p }), (k) => k.admin.sengketa(p));
export const usePutuskanSengketa = () =>
  m(
    (k, x: { id: string } & T.PutuskanSengketaMasukan) => k.admin.putuskanSengketa(x.id, x),
    ['admin', 'kiriman'],
  );
export const usePetaniAdmin = (id: string | null) =>
  q(kk('admin', 'petani', id), (k) => k.admin.petani(id as string), !!id);
export const useTulisCatatan = () =>
  m(
    (k, x: { petaniId: string } & T.TulisCatatanMasukan) => k.admin.tulisCatatan(x.petaniId, x),
    ['admin'],
  );
export const useUbahStatusPetani = () =>
  m(
    (k, x: { petaniId: string } & T.UbahStatusPetaniMasukan) =>
      k.admin.ubahStatusPetani(x.petaniId, x),
    ['admin'],
  );
export const useResepMentor = () => q(kk('mentor', 'resep'), (k) => k.mentor.daftarResep());
export const useSimpanResep = () =>
  m((k, x: T.SimpanResepMasukan) => k.mentor.simpanResep(x), ['mentor', 'resep']);
export const useValidasiResep = () =>
  m((k, id: string) => k.mentor.validasiResep(id), ['mentor', 'resep', 'referensi']);
export const useRingkasanPermintaan = () =>
  q(kk('mentor', 'permintaan'), (k) => k.mentor.ringkasanPermintaan());
export const useSimpanLangganan = () =>
  m((k, x: T.LanggananPush) => k.notifikasi.simpanLangganan(x), []);
export const useHapusLangganan = () =>
  m((k, endpoint: string) => k.notifikasi.hapusLangganan(endpoint), []);
export const useUnggahBerkas = () => m((k, x: T.UnggahBerkasMasukan) => k.berkas.unggah(x), []);
