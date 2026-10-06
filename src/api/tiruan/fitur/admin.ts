/** Klien tiruan: panel admin (verifikasi, sengketa, catatan dan status petani) dan mentor (resep). */
import { bulatkanRupiah } from '../../../lib/format';
import { validasiResepTugas } from '../../../lib/jadwal-buat';
import type { KlienAdmin, KlienMentor } from '../../klien';
import { resepKeDomain } from '../../peta';
import type { PembeliUntukAdmin, PetaniUntukAdmin, SengketaUntukAdmin } from '../../tipe';
import type { Konteks } from '../konteks';
import { namaPengguna } from './bantu';

export function buatKlienAdmin(k: Konteks): KlienAdmin {
  const pembeli = (penggunaId: string): PembeliUntukAdmin => {
    const pr = k.milik(k.db.pengguna.profil_pembeli, (x) => x.pengguna_id === penggunaId);
    const u = k.db.pengguna.pengguna.find((x) => x.id === penggunaId)!;
    return k.salin({ ...pr, nama: u.nama, nomor_hp: u.nomor_hp });
  };
  const sengketa = (id: string): SengketaUntukAdmin => {
    const s = k.milik(k.db.pesanan.sengketa, (x) => x.id === id);
    const kiriman = k.db.pesanan.pengiriman.find((x) => x.id === s.pengiriman_id)!;
    const alokasi = k.db.pesanan.alokasi.find((a) => a.id === kiriman.alokasi_id)!;
    const pesanan = k.db.pesanan.pesanan.find((p) => p.id === kiriman.pesanan_id)!;
    return k.salin({
      ...s,
      pengiriman: kiriman,
      nama_petani: namaPengguna(k, alokasi.petani_id),
      nama_pembeli: namaPengguna(k, pesanan.pembeli_id),
    });
  };
  const petani = (id: string): PetaniUntukAdmin => {
    const u = k.milik(
      k.db.pengguna.pengguna,
      (x) => x.id === id,
      (x) => x.peran === 'petani',
    );
    return k.salin({
      pengguna: u,
      catatan: k.db.pengguna.catatan_petani.filter((c) => c.petani_id === id),
    });
  };
  return {
    async pembeliMenunggu() {
      k.wajibPeran('admin');
      return k.db.pengguna.profil_pembeli
        .filter((x) => x.status_verifikasi === 'menunggu')
        .map((x) => pembeli(x.pengguna_id));
    },
    async verifikasiPembeli(penggunaId, m) {
      k.wajibPeran('admin');
      const pr = k.milik(k.db.pengguna.profil_pembeli, (x) => x.pengguna_id === penggunaId);
      if (m.keputusan === 'ditolak' && !m.alasan?.trim()) k.validasi({ alasan: 'VALIDASI' });
      pr.status_verifikasi = m.keputusan;
      pr.alasan_ditolak = m.keputusan === 'ditolak' ? (m.alasan as string).trim() : null;
      k.simpan();
      return pembeli(penggunaId);
    },
    async sengketa(p = {}) {
      k.wajibPeran('admin');
      return k.db.pesanan.sengketa
        .filter((s) => !p.status || s.status === p.status)
        .map((s) => sengketa(s.id));
    },
    async putuskanSengketa(id, m) {
      k.wajibPeran('admin');
      const s = k.milik(k.db.pesanan.sengketa, (x) => x.id === id);
      if (s.status !== 'terbuka') k.galat('STATUS_TIDAK_SESUAI');
      if (m.keputusan !== 'cairkan_ke_petani' && m.keputusan !== 'kembalikan_ke_pembeli')
        k.validasi({ keputusan: 'VALIDASI' });
      const kiriman = k.db.pesanan.pengiriman.find((x) => x.id === s.pengiriman_id)!;
      const pesanan = k.db.pesanan.pesanan.find((p) => p.id === kiriman.pesanan_id)!;
      const baris = k.db.pesanan.pembayaran.find(
        (b) => b.pengiriman_id === kiriman.id && b.jenis === 'kiriman',
      );
      const catat = (jenis: 'pencairan' | 'pengembalian', nominal: number, referensi: string) =>
        k.db.pesanan.pembayaran.push({
          id: k.idBaru('pembayaran'),
          pesanan_id: pesanan.id,
          pengiriman_id: kiriman.id,
          jenis,
          nominal,
          status: jenis === 'pencairan' ? 'cair' : 'dikembalikan',
          referensi,
          mode_uji_coba: k.bayar.modeUjiCoba,
          dibuat_pada: k.sekarangIso(),
        });
      if (baris) {
        const status = await k.bayar.status(baris.referensi);
        const sisa = status.ok ? status.nilai.sisa : 0;
        if (m.keputusan === 'cairkan_ke_petani') {
          // Bagian yang ditolak tetap dibayar penuh: sisa dana kiriman + bagian uang mukanya.
          const um = k.db.pesanan.pembayaran.find(
            (b) => b.pesanan_id === pesanan.id && b.jenis === 'uang_muka',
          );
          const bagianUm = Math.min(
            pesanan.saldo_uang_muka,
            bulatkanRupiah(
              (kiriman.jumlah_ditolak_kg *
                kiriman.harga_per_kg *
                k.db.konfigurasi.persen_uang_muka) /
                100,
            ),
          );
          if (sisa > 0) {
            await k.bayar.cairkan(baris.referensi, sisa);
            catat('pencairan', sisa, baris.referensi);
          }
          if (um && bagianUm > 0) {
            await k.bayar.cairkan(um.referensi, bagianUm);
            catat('pencairan', bagianUm, um.referensi);
            pesanan.saldo_uang_muka -= bagianUm;
          }
          kiriman.nilai_diterima = (kiriman.nilai_diterima ?? 0) + sisa + bagianUm;
        } else if (sisa > 0) {
          await k.bayar.kembalikan(baris.referensi, sisa);
          catat('pengembalian', sisa, baris.referensi);
        }
        baris.status = m.keputusan === 'cairkan_ke_petani' ? 'cair' : 'dikembalikan';
      }
      Object.assign(s, {
        status: 'diputuskan',
        keputusan: m.keputusan,
        catatan: m.catatan?.trim() || null,
        diputuskan_pada: k.sekarangIso(),
      });
      k.simpan();
      return sengketa(id);
    },
    async petani(petaniId) {
      k.wajibPeran('admin');
      return petani(petaniId);
    },
    async tulisCatatan(petaniId, m) {
      k.wajibPeran('admin');
      petani(petaniId);
      if (!m.isi?.trim()) k.validasi({ isi: 'VALIDASI' });
      const c = {
        id: k.idBaru('catatan'),
        petani_id: petaniId,
        jenis: m.jenis,
        pengiriman_id: m.pengiriman_id ?? null,
        isi: m.isi.trim(),
        dibuat_pada: k.sekarangIso(),
      };
      k.db.pengguna.catatan_petani.push(c);
      k.simpan();
      return k.salin(c);
    },
    async ubahStatusPetani(petaniId, m) {
      k.wajibPeran('admin');
      const u = k.milik(
        k.db.pengguna.pengguna,
        (x) => x.id === petaniId,
        (x) => x.peran === 'petani',
      );
      if (m.status_akun !== 'aktif' && m.status_akun !== 'dinonaktifkan_sementara')
        k.validasi({ status_akun: 'VALIDASI' });
      u.status_akun = m.status_akun;
      k.simpan();
      return petani(petaniId);
    },
  };
}

export function buatKlienMentor(k: Konteks): KlienMentor {
  return {
    async daftarResep() {
      k.wajibPeran('mentor', 'admin');
      return k.salin(k.db.resep);
    },
    async simpanResep(m) {
      k.wajibPeran('mentor', 'admin');
      const salah: Record<string, 'VALIDASI' | 'TIDAK_DITEMUKAN' | 'HASIL_KOSONG'> = {};
      if (!k.db.referensi.komoditas.some((x) => x.id === m.komoditas_id))
        salah.komoditas_id = 'TIDAK_DITEMUKAN';
      const metode = k.db.referensi.metode.find((x) => x.id === m.metode_id);
      if (!metode) salah.metode_id = 'TIDAK_DITEMUKAN';
      if (!(m.hasil_per_satuan > 0)) salah.hasil_per_satuan = 'HASIL_KOSONG';
      if (!(m.umur_panen_hari > 0)) salah.umur_panen_hari = 'VALIDASI';
      if (
        m.persen_panen_jelek !== null &&
        !(m.persen_panen_jelek > 0 && m.persen_panen_jelek <= 100)
      )
        salah.persen_panen_jelek = 'VALIDASI';
      if (Object.keys(salah).length) k.validasi(salah);
      const sementara = {
        ...m,
        id: 'baru',
        versi: 1,
        status: 'draf' as const,
        contoh: false,
        asal_angka_contoh: null,
        validator: null,
        tanggal_validasi: null,
      };
      for (const t of resepKeDomain({ ...sementara, dasar_ukuran: metode!.dasar_ukuran }).tugas) {
        k.dariHasil(validasiResepTugas(t), 'tugas');
        if ((t.hstSelesai ?? t.hstMulai) > m.umur_panen_hari)
          k.validasi({ tugas: 'HST_TIDAK_VALID' });
        for (const b of t.ukur ?? [])
          if (b.batasBawah > b.batasAtas) k.validasi({ tugas: 'VALIDASI' });
      }
      // K3: setiap simpan adalah versi baru; siklus berjalan tetap menunjuk versi lamanya.
      const versi =
        1 +
        Math.max(
          0,
          ...k.db.resep
            .filter((r) => r.komoditas_id === m.komoditas_id && r.metode_id === m.metode_id)
            .map((r) => r.versi),
        );
      const { resep_asal_id: _asal, ...isi } = m;
      const resep = {
        ...isi,
        dasar_ukuran: metode!.dasar_ukuran,
        id: k.idBaru('resep'),
        versi,
        status: 'draf' as const,
        contoh: false,
        asal_angka_contoh: null,
        validator: null,
        tanggal_validasi: null,
      };
      k.db.resep.push(resep);
      k.simpan();
      return k.salin(resep);
    },
    async validasiResep(id) {
      const p = k.wajibPeran('mentor', 'admin');
      const r = k.milik(k.db.resep, (x) => x.id === id);
      if (r.contoh) k.galat('STATUS_TIDAK_SESUAI');
      r.status = 'divalidasi';
      r.validator = p.nama;
      r.tanggal_validasi = k.hariIni(p);
      k.simpan();
      return k.salin(r);
    },
    async ringkasanPermintaan() {
      k.wajibPeran('mentor', 'admin');
      const peta = new Map<
        string,
        { komoditas_id: string; metode_id: string | null; kecamatan: string; jumlah: number }
      >();
      for (const x of k.db.pesanan.permintaan_resep) {
        const kecamatan = k.wilayah(x.wilayah_id)?.kecamatan ?? '';
        const kunci = `${x.komoditas_id}|${x.metode_id}|${kecamatan}`;
        const g = peta.get(kunci) ?? {
          komoditas_id: x.komoditas_id,
          metode_id: x.metode_id,
          kecamatan,
          jumlah: 0,
        };
        g.jumlah += 1;
        peta.set(kunci, g);
      }
      return [...peta.values()].sort(
        (a, b) => b.jumlah - a.jumlah || a.komoditas_id.localeCompare(b.komoditas_id),
      );
    },
  };
}
