/**
 * Klien tiruan untuk F-09: Chat Petani & Pembeli.
 * Di mode tiruan sakelar bawaan mati / respons minimal.
 */
import type {
  LencanaChat,
  Percakapan,
  PercakapanBukaHasil,
  PermintaanBukaPercakapan,
  PermintaanKirimPesan,
  Pesan,
} from '../../tipe';
import type { KlienChat } from '../../klien';
import type { Konteks } from '../konteks';

export function buatKlienChatTiruan(k: Konteks): KlienChat {
  const daftarPesan: Pesan[] = [];
  return {
    async daftar(): Promise<Percakapan[]> {
      return [];
    },
    async buka(m: PermintaanBukaPercakapan): Promise<PercakapanBukaHasil> {
      const u = k.penggunaMasuk();
      const lawan = k.db.pengguna.pengguna.find((p) => p.id === m.lawan_bicara_id);
      return {
        id: 'percakapan-tiruan-1',
        jenis: m.jenis ?? 'peta',
        rujukan_id: m.rujukan_id ?? null,
        lawan_bicara: {
          id: lawan?.id ?? m.lawan_bicara_id ?? 'pengguna-lawan',
          nama: lawan?.nama ?? 'Lawan Bicara',
          peran: lawan?.peran ?? (u.peran === 'petani' ? 'pembeli' : 'petani'),
          foto_profil: lawan?.foto_profil ?? null,
        },
        dibuat_pada: k.sekarangIso(),
      };
    },
    async pesan(id: string, _setelah?: string): Promise<Pesan[]> {
      return daftarPesan.filter((p) => p.percakapan_id === id);
    },
    async kirim(id: string, m: PermintaanKirimPesan): Promise<Pesan> {
      const u = k.penggunaMasuk();
      const baru: Pesan = {
        id: `pesan-tiruan-${Date.now()}`,
        percakapan_id: id,
        pengirim_id: u.id,
        isi: m.isi,
        dibaca_pada: null,
        dibuat_pada: k.sekarangIso(),
      };
      daftarPesan.push(baru);
      return baru;
    },
    async tandaiDibaca(_id: string): Promise<{ status: string; jumlah_dibaca: number }> {
      return { status: 'ok', jumlah_dibaca: 0 };
    },
    async lencana(): Promise<LencanaChat> {
      return { belum_dibaca: 0 };
    },
  };
}
