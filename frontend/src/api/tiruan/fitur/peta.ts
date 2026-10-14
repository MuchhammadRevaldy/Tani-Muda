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

      return petaniList.map((p) => ({
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
        jarak_km: 5.0,
        stok_tersedia: [],
      }));
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
  }
  k.simpan();

  const profil = k.db.pengguna.profil_pembeli.find((p) => p.pengguna_id === u.id) ?? null;
  return { pengguna: u, profil_pembeli: profil };
}
