/**
 * Implementasi tiruan untuk Marketplace stok siap jual + COD (F-07).
 */
import { GalatApi } from '../../galat';
import type { KlienStok } from '../../klien';
import type {
  PayloadBeliStok,
  PayloadBuatStok,
  PayloadUbahStok,
  Pengguna,
  PesananStok,
  ProfilPembeli,
  StokRingkas,
} from '../../tipe';
import type { Konteks } from '../konteks';

export function buatKlienStokTiruan(k: Konteks): KlienStok {
  function pastikanArray(): { stok: StokRingkas[]; pesananStok: PesananStok[] } {
    const dbAny = k.db as unknown as {
      stok_daftar?: StokRingkas[];
      stok?: { stok?: StokRingkas[] } | StokRingkas[];
      pesanan_stok?: PesananStok[];
    };
    if (!dbAny.stok_daftar) {
      if (Array.isArray(dbAny.stok)) {
        dbAny.stok_daftar = dbAny.stok;
      } else if (dbAny.stok && Array.isArray(dbAny.stok.stok)) {
        dbAny.stok_daftar = structuredClone(dbAny.stok.stok);
      } else {
        dbAny.stok_daftar = [];
      }
    }
    dbAny.pesanan_stok ??= [];
    return { stok: dbAny.stok_daftar, pesananStok: dbAny.pesanan_stok };
  }

  function penggunaAktif(): Pengguna {
    const penggunaId = k.db.sesi.pengguna_id;
    if (!penggunaId) {
      throw new GalatApi('BELUM_MASUK', 'Silakan masuk terlebih dahulu');
    }
    const pengguna = k.db.pengguna.pengguna.find((p: Pengguna) => p.id === penggunaId);
    if (!pengguna) {
      throw new GalatApi('TIDAK_DITEMUKAN', 'Pengguna tidak ditemukan');
    }
    return pengguna;
  }

  return {
    async daftar(): Promise<StokRingkas[]> {
      const p = penggunaAktif();
      if (p.peran !== 'petani') {
        throw new GalatApi('TIDAK_DIIZINKAN', 'Hanya petani yang dapat melihat daftar stok miliknya');
      }
      const { stok } = pastikanArray();
      const milikPetani = stok.filter((s) => s.petani_id === p.id);
      return k.salin(milikPetani);
    },

    async buat(m: PayloadBuatStok): Promise<StokRingkas> {
      const p = penggunaAktif();
      if (p.peran !== 'petani') {
        throw new GalatApi('TIDAK_DIIZINKAN', 'Hanya petani yang dapat menambah stok');
      }
      if (m.jumlah_kg <= 0 || m.harga_per_kg <= 0) {
        throw new GalatApi('VALIDASI', 'Jumlah dan harga per kg harus lebih besar dari 0');
      }

      const komoditas = k.db.referensi.komoditas.find((c) => c.id === m.komoditas_id);
      const baru: StokRingkas = {
        id: `stok-${++k.db.urut}`,
        petani_id: p.id,
        komoditas_id: m.komoditas_id,
        komoditas: komoditas ? { id: komoditas.id, nama: komoditas.nama } : null,
        lahan_id: m.lahan_id ?? null,
        jumlah_kg: m.jumlah_kg,
        sisa_kg: m.jumlah_kg,
        harga_per_kg: m.harga_per_kg,
        tanggal_panen: m.tanggal_panen,
        foto: m.foto ?? null,
        status: 'tersedia',
        dibuat_pada: new Date(k.jam()).toISOString(),
      };

      const { stok } = pastikanArray();
      stok.unshift(baru);
      k.simpan();
      return k.salin(baru);
    },

    async ubah(id: string, m: PayloadUbahStok): Promise<StokRingkas> {
      const p = penggunaAktif();
      if (p.peran !== 'petani') {
        throw new GalatApi('TIDAK_DIIZINKAN', 'Hanya petani yang dapat mengubah stok');
      }
      const { stok } = pastikanArray();
      const s = stok.find((item) => item.id === id);
      if (!s) {
        throw new GalatApi('TIDAK_DITEMUKAN', 'Stok tidak ditemukan');
      }
      if (s.petani_id !== p.id) {
        throw new GalatApi('TIDAK_DIIZINKAN', 'Bukan pemilik stok');
      }

      if (m.harga_per_kg !== undefined) {
        if (m.harga_per_kg <= 0) {
          throw new GalatApi('VALIDASI', 'Harga per kg harus lebih dari 0');
        }
        s.harga_per_kg = m.harga_per_kg;
      }
      if (m.status !== undefined) {
        s.status = m.status;
      }
      if (m.foto !== undefined) {
        s.foto = m.foto;
      }

      k.simpan();
      return k.salin(s);
    },

    async sekitar(komoditas?: string, radiusKm = 15): Promise<StokRingkas[]> {
      const p = penggunaAktif();
      if (p.peran !== 'pembeli') {
        throw new GalatApi('TIDAK_DIIZINKAN', 'Hanya pembeli yang dapat melihat stok sekitar');
      }
      const profil = k.db.pengguna.profil_pembeli.find((pr: ProfilPembeli) => pr.pengguna_id === p.id);
      if (!profil || profil.status_verifikasi !== 'terverifikasi') {
        throw new GalatApi('BELUM_TERVERIFIKASI', 'Akun pembeli belum terverifikasi');
      }

      const { stok } = pastikanArray();
      const hasil: StokRingkas[] = [];

      for (const s of stok) {
        if (s.status !== 'tersedia' || s.sisa_kg <= 0) continue;
        if (komoditas && s.komoditas_id !== komoditas) continue;

        const petani = k.db.pengguna.pengguna.find((u: Pengguna) => u.id === s.petani_id);
        const wilayah = k.db.wilayah.find((w) => w.id === petani?.wilayah_id);
        const jarak = wilayah?.id === p.wilayah_id ? 1.5 : 4.2;

        if (jarak <= radiusKm) {
          hasil.push({
            ...s,
            nama_petani: petani?.nama ?? 'Petani',
            desa: wilayah?.desa ?? 'Bowan',
            kecamatan: wilayah?.kecamatan ?? 'Delanggu',
            jarak_km: jarak,
          });
        }
      }

      return k.salin(hasil);
    },

    async beli(id: string, m: PayloadBeliStok): Promise<PesananStok> {
      const p = penggunaAktif();
      if (p.peran !== 'pembeli') {
        throw new GalatApi('TIDAK_DIIZINKAN', 'Hanya pembeli yang dapat membeli stok');
      }
      const profil = k.db.pengguna.profil_pembeli.find((pr: ProfilPembeli) => pr.pengguna_id === p.id);
      if (!profil || profil.status_verifikasi !== 'terverifikasi') {
        throw new GalatApi('BELUM_TERVERIFIKASI', 'Akun pembeli belum terverifikasi');
      }
      if (m.jumlah_kg <= 0 || !m.alamat_antar.trim()) {
        throw new GalatApi('VALIDASI', 'Jumlah kg dan alamat antar harus valid');
      }

      const { stok, pesananStok } = pastikanArray();
      const s = stok.find((item) => item.id === id);
      if (!s || s.status !== 'tersedia') {
        throw new GalatApi('STOK_TIDAK_CUKUP', 'Stok tidak tersedia');
      }
      if (s.sisa_kg < m.jumlah_kg) {
        throw new GalatApi('STOK_TIDAK_CUKUP', `Sisa stok tidak cukup (tersisa ${s.sisa_kg} kg)`);
      }

      // Kurangi sisa_kg
      s.sisa_kg = Math.round((s.sisa_kg - m.jumlah_kg) * 100) / 100;
      if (s.sisa_kg <= 0) {
        s.sisa_kg = 0;
        s.status = 'habis';
      }

      const sekarangIso = new Date(k.jam()).toISOString();
      const petani = k.db.pengguna.pengguna.find((u: Pengguna) => u.id === s.petani_id);
      const nilai = Math.round(m.jumlah_kg * s.harga_per_kg);

      const pesanan: PesananStok = {
        id: `pesanan-stok-${++k.db.urut}`,
        pembeli_id: p.id,
        stok_id: s.id,
        petani_id: s.petani_id,
        nama_petani: petani?.nama ?? 'Petani',
        nama_pembeli: p.nama,
        komoditas_nama: s.komoditas?.nama ?? 'Komoditas',
        jumlah_kg: m.jumlah_kg,
        harga_per_kg: s.harga_per_kg,
        nilai,
        metode_bayar: m.metode_bayar,
        alamat_antar: m.alamat_antar.trim(),
        status: 'menunggu',
        waktu_menunggu: sekarangIso,
        dibuat_pada: sekarangIso,
      };

      // Bayar di aplikasi membuat baris pembayaran ditahan (idempoten)
      if (m.metode_bayar === 'bayar_di_aplikasi') {
        k.db.pesanan.pembayaran.push({
          id: `bayar-stok-${++k.db.urut}`,
          pesanan_id: null as unknown as string,
          pesanan_stok_id: pesanan.id,
          jenis: 'kiriman',
          nominal: nilai,
          status: 'ditahan',
          referensi: `TIRUAN-STOK-${k.db.urut}`,
          tenggat_waktu: null,
          dibuat_pada: sekarangIso,
          diperbarui_pada: null,
        } as unknown as import('../../tipe').Pembayaran);
      }
      // COD TIDAK PERNAH membuat baris pembayaran!

      pesananStok.unshift(pesanan);
      k.simpan();
      return k.salin(pesanan);
    },

    async pesananSaya(): Promise<PesananStok[]> {
      const p = penggunaAktif();
      const { pesananStok } = pastikanArray();
      if (p.peran === 'petani') {
        return k.salin(pesananStok.filter((ps) => ps.petani_id === p.id));
      }
      if (p.peran === 'pembeli') {
        return k.salin(pesananStok.filter((ps) => ps.pembeli_id === p.id));
      }
      return [];
    },

    async terimaPesanan(id: string): Promise<PesananStok> {
      const p = penggunaAktif();
      const { pesananStok } = pastikanArray();
      const ps = pesananStok.find((item) => item.id === id);
      if (!ps) throw new GalatApi('TIDAK_DITEMUKAN', 'Pesanan stok tidak ditemukan');
      if (ps.petani_id !== p.id) throw new GalatApi('TIDAK_DIIZINKAN', 'Bukan pemilik stok');
      if (ps.status !== 'menunggu') throw new GalatApi('VALIDASI', 'Status pesanan bukan menunggu');

      ps.status = 'diterima';
      ps.waktu_diterima = new Date(k.jam()).toISOString();
      k.simpan();
      return k.salin(ps);
    },

    async tolakPesanan(id: string, alasan?: string): Promise<PesananStok> {
      const p = penggunaAktif();
      const { stok, pesananStok } = pastikanArray();
      const ps = pesananStok.find((item) => item.id === id);
      if (!ps) throw new GalatApi('TIDAK_DITEMUKAN', 'Pesanan stok tidak ditemukan');
      if (ps.petani_id !== p.id) throw new GalatApi('TIDAK_DIIZINKAN', 'Bukan pemilik stok');
      if (ps.status !== 'menunggu') throw new GalatApi('VALIDASI', 'Pesanan tidak bisa ditolak pada tahap ini');

      ps.status = 'ditolak';
      ps.alasan_batal = alasan ?? 'Stok rusak';
      ps.waktu_ditolak = new Date(k.jam()).toISOString();

      // Kembalikan sisa_kg
      const s = stok.find((item) => item.id === ps.stok_id);
      if (s) {
        s.sisa_kg = Math.round((s.sisa_kg + ps.jumlah_kg) * 100) / 100;
        if (s.status === 'habis' && s.sisa_kg > 0) {
          s.status = 'tersedia';
        }
      }

      k.simpan();
      return k.salin(ps);
    },

    async kirimPesanan(id: string): Promise<PesananStok> {
      const p = penggunaAktif();
      const { pesananStok } = pastikanArray();
      const ps = pesananStok.find((item) => item.id === id);
      if (!ps) throw new GalatApi('TIDAK_DITEMUKAN', 'Pesanan stok tidak ditemukan');
      if (ps.petani_id !== p.id) throw new GalatApi('TIDAK_DIIZINKAN', 'Bukan pemilik stok');
      if (ps.status !== 'diterima') throw new GalatApi('VALIDASI', 'Pesanan harus diterima sebelum dikirim');

      ps.status = 'dikirim';
      ps.waktu_dikirim = new Date(k.jam()).toISOString();
      k.simpan();
      return k.salin(ps);
    },

    async selesaiPesanan(id: string): Promise<PesananStok> {
      const p = penggunaAktif();
      const { pesananStok } = pastikanArray();
      const ps = pesananStok.find((item) => item.id === id);
      if (!ps) throw new GalatApi('TIDAK_DITEMUKAN', 'Pesanan stok tidak ditemukan');
      if (ps.pembeli_id !== p.id && ps.petani_id !== p.id) {
        throw new GalatApi('TIDAK_DIIZINKAN', 'Bukan pihak dalam pesanan');
      }
      if (ps.status !== 'dikirim') throw new GalatApi('VALIDASI', 'Pesanan harus dikirim sebelum diselesaikan');

      ps.status = 'selesai';
      ps.waktu_selesai = new Date(k.jam()).toISOString();

      // Bila bayar di aplikasi, cairkan pembayaran
      if (ps.metode_bayar === 'bayar_di_aplikasi') {
        const bayar = k.db.pesanan.pembayaran.find(
          (b) => (b as unknown as { pesanan_stok_id?: string }).pesanan_stok_id === ps.id,
        );
        if (bayar) {
          bayar.status = 'cair';
        }
      }

      k.simpan();
      return k.salin(ps);
    },

    async batalkanPesanan(id: string, alasan?: string): Promise<PesananStok> {
      const p = penggunaAktif();
      const { stok, pesananStok } = pastikanArray();
      const ps = pesananStok.find((item) => item.id === id);
      if (!ps) throw new GalatApi('TIDAK_DITEMUKAN', 'Pesanan stok tidak ditemukan');
      if (ps.pembeli_id !== p.id) throw new GalatApi('TIDAK_DIIZINKAN', 'Bukan pembeli pesanan ini');
      if (ps.status !== 'menunggu') throw new GalatApi('VALIDASI', 'Pesanan hanya dapat dibatalkan saat masih menunggu');

      ps.status = 'dibatalkan';
      ps.alasan_batal = alasan ?? 'Dibatalkan oleh pembeli';
      ps.waktu_dibatalkan = new Date(k.jam()).toISOString();

      // Kembalikan sisa_kg
      const s = stok.find((item) => item.id === ps.stok_id);
      if (s) {
        s.sisa_kg = Math.round((s.sisa_kg + ps.jumlah_kg) * 100) / 100;
        if (s.status === 'habis' && s.sisa_kg > 0) {
          s.status = 'tersedia';
        }
      }

      k.simpan();
      return k.salin(ps);
    },
  };
}
