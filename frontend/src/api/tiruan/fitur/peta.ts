/**
 * Klien tiruan untuk F-08: Peta Petani di sekitar pembeli.
 * Di mode tiruan sakelar bawaan mati / respons minimal.
 */
import type { Akun, ParameterPetaPetani, PermintaanPerbaruiLokasi, PetaniPeta } from '../../tipe';
import type { KlienPeta } from '../../klien';
import { bulatkanLokasi } from '../../../lib/jarak';
import type { Konteks } from '../konteks';

export function buatKlienPetaTiruan(k: Konteks): KlienPeta {
  return {
    async petaniSekitar(_params?: ParameterPetaPetani): Promise<PetaniPeta[]> {
      const u = k.penggunaMasuk();
      if (u.peran !== 'pembeli') {
        throw k.galat('TIDAK_DIIZINKAN');
      }

      // Cari petani aktif dengan lokasi yang diizinkan
      const petaniList = k.db.pengguna.pengguna.filter(
        (p) => p.peran === 'petani' && p.tampil_di_peta && p.lokasi_kira_lintang != null && p.lokasi_kira_bujur != null,
      );

      const stokList =
        (k.db as unknown as { stok?: { stok?: import('../../tipe').StokRingkas[] } }).stok?.stok ?? [];

      return petaniList.map((p) => {
        const stokPetani = stokList
          .filter((s) => s.petani_id === p.id && s.status === 'tersedia' && s.sisa_kg > 0)
          .map((s) => ({
            id: s.id,
            komoditas_id: s.komoditas_id,
            komoditas_nama: s.komoditas?.nama ?? s.komoditas_id,
            sisa_kg: s.sisa_kg,
            harga_per_kg: s.harga_per_kg,
            tanggal_panen: s.tanggal_panen,
            foto: s.foto ?? null,
          }));

        return {
          id: p.id,
          nama: p.nama ?? 'Petani Tani Muda',
          level: {
            level: 1,
            ikon: '🌱',
          },
          titik: {
            lintang: p.lokasi_kira_lintang ?? -6.82,
            bujur: p.lokasi_kira_bujur ?? 107.62,
          },
          jarak_km: 3.5,
          stok_tersedia: stokPetani,
        };
      });
    },
  };
}

export async function perbaruiLokasiTiruan(k: Konteks, m: PermintaanPerbaruiLokasi): Promise<Akun> {
  const u = k.penggunaMasuk();
  if (m.tampil_di_peta !== undefined) {
    u.tampil_di_peta = m.tampil_di_peta;
  }
  if (m.lintang !== undefined && m.bujur !== undefined && m.lintang !== null && m.bujur !== null) {
    u.lokasi_kira_lintang = bulatkanLokasi(m.lintang);
    u.lokasi_kira_bujur = bulatkanLokasi(m.bujur);
    u.lokasi_diperbarui_pada = k.sekarangIso();
    if (m.nama_tempat?.toLowerCase().includes('trucuk') || (u.lokasi_kira_lintang === -7.74 && u.lokasi_kira_bujur === 110.63)) {
      u.wilayah_id = '33.10.06.2003';
    }
  }
  k.simpan();

  const profil = k.db.pengguna.profil_pembeli.find((p) => p.pengguna_id === u.id) ?? null;
  return { pengguna: u, profil_pembeli: profil };
}
