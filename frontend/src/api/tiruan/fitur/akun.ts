/** Klien tiruan: akun (OTP, peran, profil), wilayah, notifikasi, berkas. */
import { normalisasiNomorHp } from '../../../lib/nomor-hp';
import { zonaSah, ZONA_BAWAAN } from '../../../lib/zona-waktu';
import type { KlienAkun, KlienBerkas, KlienNotifikasi, KlienWilayah } from '../../klien';
import type { Akun, Pengguna } from '../../tipe';
import type { Konteks } from '../konteks';

/** Batas ukuran foto setelah dikecilkan di HP (arsitektur-backend.md bagian 13). */
export const BATAS_FOTO_BYTE = 2 * 1024 * 1024;
const JENIS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];

export function akunDari(k: Konteks, p: Pengguna): Akun {
  return k.salin({
    pengguna: p,
    profil_pembeli: k.db.pengguna.profil_pembeli.find((x) => x.pengguna_id === p.id) ?? null,
  });
}

export function buatKlienAkun(k: Konteks): KlienAkun {
  const nomor = (masukan: string) => k.dariHasil(normalisasiNomorHp(masukan), 'nomor_hp');
  return {
    async kirimOtp(m) {
      const nomorHp = nomor(m.nomor_hp);
      const r = await k.otp.kirimKode(nomorHp);
      if (!r.ok)
        k.galat(
          r.galat,
          r.cobaLagiDalamDetik !== undefined ? { cobaLagiDalam: r.cobaLagiDalamDetik } : {},
        );
      return {
        nomor_hp: nomorHp,
        kirim_ulang_dalam_detik: r.nilai.kirimUlangDalamDetik,
        kedaluwarsa_dalam_detik: r.nilai.kedaluwarsaDalamDetik,
      };
    },

    async verifikasiOtp(m) {
      const nomorHp = nomor(m.nomor_hp);
      let p = k.db.pengguna.pengguna.find((x) => x.nomor_hp === nomorHp) ?? null;
      // Pengguna baru wajib menyetujui kebijakan privasi (D-30); dicek sebelum kode dipakai.
      if (!p && m.setuju_privasi !== true) k.validasi({ setuju_privasi: 'PRIVASI_WAJIB' });
      if (!/^\d{6}$/.test(m.kode)) k.validasi({ kode: 'OTP_SALAH' });
      const r = await k.otp.verifikasi(nomorHp, m.kode);
      if (!r.ok) k.galat(r.galat);
      const baru = !p;
      if (!p) {
        p = {
          id: k.idBaru('pengguna'),
          nomor_hp: nomorHp,
          nama: null,
          peran: null,
          wilayah_id: null,
          foto_profil: null,
          status_akun: 'aktif',
          zona_waktu: ZONA_BAWAAN,
          terdaftar_kelompok_tani: false,
          setuju_privasi_pada: k.sekarangIso(),
          versi_privasi: k.db.konfigurasi.versi_privasi,
          dibuat_pada: k.sekarangIso(),
        };
        k.db.pengguna.pengguna.push(p);
      }
      k.db.sesi.pengguna_id = p.id;
      k.simpan();
      return { akun: akunDari(k, p), pengguna_baru: baru || p.peran === null };
    },

    async keluar() {
      k.db.sesi.pengguna_id = null;
      k.simpan();
    },

    async ambil() {
      const p = k.penggunaSesi();
      return p ? akunDari(k, p) : null;
    },

    async pilihPeran(m) {
      const p = k.penggunaMasuk();
      if (p.peran !== null) k.galat('STATUS_TIDAK_SESUAI');
      if (!['petani', 'pembeli', 'mentor'].includes(m.peran)) k.validasi({ peran: 'VALIDASI' });
      if (!m.nama?.trim()) k.validasi({ nama: 'VALIDASI' });
      if (m.peran === 'petani' && !k.wilayah(m.wilayah_id))
        k.validasi({ wilayah_id: 'WILAYAH_WAJIB' });
      if (m.wilayah_id && !k.wilayah(m.wilayah_id)) k.validasi({ wilayah_id: 'TIDAK_DITEMUKAN' });
      if (m.peran === 'petani' && !k.wilayahTersedia(m.wilayah_id))
        k.validasi({ wilayah_id: 'WILAYAH_BELUM_TERSEDIA' });
      p.peran = m.peran;
      p.nama = m.nama.trim();
      p.wilayah_id = m.wilayah_id ?? null;
      k.simpan();
      return akunDari(k, p);
    },

    async ubahProfil(m) {
      const p = k.penggunaMasuk();
      if (m.nama !== undefined && !m.nama.trim()) k.validasi({ nama: 'VALIDASI' });
      if (m.wilayah_id !== undefined && !k.wilayah(m.wilayah_id))
        k.validasi({ wilayah_id: 'TIDAK_DITEMUKAN' });
      if (m.wilayah_id !== undefined && p.peran === 'petani' && !k.wilayahTersedia(m.wilayah_id))
        k.validasi({ wilayah_id: 'WILAYAH_BELUM_TERSEDIA' });
      if (m.zona_waktu !== undefined && !zonaSah(m.zona_waktu))
        k.validasi({ zona_waktu: 'VALIDASI' });
      if (m.nama !== undefined) p.nama = m.nama.trim();
      if (m.wilayah_id !== undefined) p.wilayah_id = m.wilayah_id;
      if (m.zona_waktu !== undefined) p.zona_waktu = m.zona_waktu;
      if (m.terdaftar_kelompok_tani !== undefined)
        p.terdaftar_kelompok_tani = m.terdaftar_kelompok_tani === true;
      if (m.foto_profil !== undefined) p.foto_profil = m.foto_profil;
      k.simpan();
      return akunDari(k, p);
    },

    async kirimOtpNomorBaru(m) {
      const p = k.penggunaMasuk();
      const nomorHp = nomor(m.nomor_hp);
      if (nomorHp === p.nomor_hp) k.validasi({ nomor_hp: 'NOMOR_SAMA' });
      if (k.db.pengguna.pengguna.some((x) => x.nomor_hp === nomorHp))
        k.galat('NOMOR_SUDAH_DIPAKAI');
      const r = await k.otp.kirimKode(nomorHp);
      if (!r.ok)
        k.galat(
          r.galat,
          r.cobaLagiDalamDetik !== undefined ? { cobaLagiDalam: r.cobaLagiDalamDetik } : {},
        );
      return {
        nomor_hp: nomorHp,
        kirim_ulang_dalam_detik: r.nilai.kirimUlangDalamDetik,
        kedaluwarsa_dalam_detik: r.nilai.kedaluwarsaDalamDetik,
      };
    },

    async gantiNomorHp(m) {
      const p = k.penggunaMasuk();
      const nomorHp = nomor(m.nomor_hp);
      if (nomorHp === p.nomor_hp) k.validasi({ nomor_hp: 'NOMOR_SAMA' });
      if (!/^\d{6}$/.test(m.kode)) k.validasi({ kode: 'OTP_SALAH' });
      // Dicek lagi saat verifikasi: nomor bisa saja dipakai orang lain setelah kode dikirim.
      if (k.db.pengguna.pengguna.some((x) => x.nomor_hp === nomorHp))
        k.galat('NOMOR_SUDAH_DIPAKAI');
      const r = await k.otp.verifikasi(nomorHp, m.kode);
      if (!r.ok) k.galat(r.galat);
      p.nomor_hp = nomorHp;
      k.simpan();
      return akunDari(k, p);
    },

    async catatanSaya() {
      const p = k.wajibPeran('petani');
      return k.salin(k.db.pengguna.catatan_petani.filter((c) => c.petani_id === p.id));
    },

    async simpanProfilPembeli(m) {
      const p = k.wajibPeran('pembeli');
      const salah: Record<string, 'VALIDASI' | 'TIDAK_DITEMUKAN'> = {};
      if (!m.nama_usaha?.trim()) salah.nama_usaha = 'VALIDASI';
      if (!m.alamat?.trim()) salah.alamat = 'VALIDASI';
      if (!k.wilayah(m.wilayah_id)) salah.wilayah_id = 'TIDAK_DITEMUKAN';
      if (Object.keys(salah).length) k.validasi(salah);
      const daftar = k.db.pengguna.profil_pembeli;
      const lama = daftar.find((x) => x.pengguna_id === p.id);
      const baru = {
        pengguna_id: p.id,
        nama_usaha: m.nama_usaha.trim(),
        jenis_usaha: m.jenis_usaha,
        alamat: m.alamat.trim(),
        wilayah_id: m.wilayah_id,
        foto_tempat_usaha: m.foto_tempat_usaha ?? null,
        // Data usaha berubah → perlu diverifikasi ulang, kecuali sudah terverifikasi.
        status_verifikasi:
          lama?.status_verifikasi === 'terverifikasi'
            ? ('terverifikasi' as const)
            : ('menunggu' as const),
        alasan_ditolak: null,
      };
      if (lama) Object.assign(lama, baru);
      else daftar.push(baru);
      k.simpan();
      return k.salin(baru);
    },
  };
}

export function buatKlienWilayah(k: Konteks): KlienWilayah {
  return {
    async daftar(p = {}) {
      k.penggunaMasuk();
      const cari = p.cari?.trim().toLowerCase();
      // Desa yang tersedia di pilot lebih dulu (D-57); di dalamnya desa yang namanya cocok dengan
      // kata cari (sama persis, diawali, memuat) sebelum yang hanya cocok kecamatannya (D-58).
      const cocok = (desa: string) => {
        const d = desa.toLowerCase();
        if (!cari) return 0;
        return d === cari ? 0 : d.startsWith(cari) ? 1 : d.includes(cari) ? 2 : 3;
      };
      const hasil = k.db.wilayah
        .filter(
          (w) =>
            !cari ||
            w.desa.toLowerCase().includes(cari) ||
            w.kecamatan.toLowerCase().includes(cari),
        )
        .map((w) => k.wilayahKeluar(w))
        .sort(
          (a, b) =>
            Number(b.tersedia_pilot) - Number(a.tersedia_pilot) ||
            cocok(a.desa) - cocok(b.desa) ||
            a.desa.localeCompare(b.desa, 'id'),
        );
      return k.halaman(hasil, p);
    },
    async ambil(id) {
      k.penggunaMasuk();
      return k.wilayahKeluar(k.milik(k.db.wilayah, (x) => x.id === id));
    },
  };
}

export function buatKlienNotifikasi(k: Konteks): KlienNotifikasi {
  return {
    async simpanLangganan(m) {
      const p = k.penggunaMasuk();
      if (!m.endpoint || !m.keys?.p256dh || !m.keys?.auth) k.validasi({ endpoint: 'VALIDASI' });
      k.db.langganan = k.db.langganan.filter((l) => l.endpoint !== m.endpoint);
      k.db.langganan.push({ ...m, pengguna_id: p.id });
      k.simpan();
    },
    async hapusLangganan(endpoint) {
      const p = k.penggunaMasuk();
      k.db.langganan = k.db.langganan.filter(
        (l) => !(l.endpoint === endpoint && l.pengguna_id === p.id),
      );
      k.simpan();
    },
  };
}

export function buatKlienBerkas(k: Konteks): KlienBerkas {
  return {
    async unggah(m) {
      k.penggunaMasuk();
      if (!JENIS_FOTO.includes(m.jenis)) k.validasi({ jenis: 'VALIDASI' });
      if (typeof m.isi !== 'string' || !m.isi.startsWith(`data:${m.jenis}`))
        k.validasi({ isi: 'VALIDASI' });
      // Perkiraan ukuran isi base64.
      const ukuran = Math.floor(
        ((m.isi as string).length - (m.isi as string).indexOf(',') - 1) * 0.75,
      );
      if (ukuran > BATAS_FOTO_BYTE) k.validasi({ isi: 'VALIDASI' });
      // Tiruan: data URL dipakai langsung sebagai URL tampilan (backend: URL bertanda tangan).
      return { id: k.idBaru('berkas'), url: m.isi as string, jenis: m.jenis, ukuran_byte: ukuran };
    },
  };
}
