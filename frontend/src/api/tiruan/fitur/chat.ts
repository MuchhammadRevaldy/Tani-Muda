/**
 * Klien tiruan untuk F-09: Chat Petani & Pembeli.
 * Menyimpan data percakapan dan pesan di konteks db tiruan.
 */
import { normalisasiNomorHp } from '../../../lib/nomor-hp';
import { GalatApi } from '../../galat';
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

interface DbPercakapan {
  id: string;
  petani_id: string;
  pembeli_id: string;
  jenis: 'alokasi' | 'pesanan_stok' | 'peta' | 'kontak';
  rujukan_id: string | null;
  dibuat_pada: string;
}

function pastikanDb(k: Konteks): { percakapan: DbPercakapan[]; pesan: Pesan[] } {
  const dbAny = k.db as unknown as {
    chat_percakapan?: DbPercakapan[];
    chat_pesan?: Pesan[];
    chat?: { percakapan?: DbPercakapan[]; pesan?: Pesan[] };
  };
  if (!dbAny.chat_percakapan) {
    dbAny.chat_percakapan = dbAny.chat?.percakapan ? structuredClone(dbAny.chat.percakapan) : [];
  }
  if (!dbAny.chat_pesan) {
    dbAny.chat_pesan = dbAny.chat?.pesan ? structuredClone(dbAny.chat.pesan) : [];
  }
  return { percakapan: dbAny.chat_percakapan, pesan: dbAny.chat_pesan };
}

export function buatKlienChatTiruan(k: Konteks): KlienChat {
  return {
    async daftar(): Promise<Percakapan[]> {
      const u = k.penggunaMasuk();
      const { percakapan, pesan } = pastikanDb(k);
      const cocok = percakapan.filter((p) => p.petani_id === u.id || p.pembeli_id === u.id);

      return cocok.map((c) => {
        const lawanId = c.petani_id === u.id ? c.pembeli_id : c.petani_id;
        const lawan = k.db.pengguna.pengguna.find((p) => p.id === lawanId);
        const pesanC = pesan
          .filter((x) => x.percakapan_id === c.id)
          .sort((a, b) => new Date(b.dibuat_pada).getTime() - new Date(a.dibuat_pada).getTime());
        const belumDibaca = pesanC.filter((x) => x.pengirim_id !== u.id && !x.dibaca_pada).length;

        return {
          id: c.id,
          jenis: c.jenis,
          rujukan_id: c.rujukan_id,
          lawan_bicara: {
            id: lawanId,
            nama: lawan?.nama ?? (u.peran === 'petani' ? 'Pembeli' : 'Petani'),
            peran: lawan?.peran ?? (u.peran === 'petani' ? 'pembeli' : 'petani'),
            foto_profil: lawan?.foto_profil ?? null,
          },
          pesan_terakhir: pesanC[0] ? k.salin(pesanC[0]) : null,
          jumlah_belum_dibaca: belumDibaca,
          dibuat_pada: c.dibuat_pada,
        };
      });
    },

    async buka(m: PermintaanBukaPercakapan): Promise<PercakapanBukaHasil> {
      const u = k.penggunaMasuk();
      const { percakapan } = pastikanDb(k);
      const lawan = k.db.pengguna.pengguna.find((p) => p.id === m.lawan_bicara_id);
      const lawanId = lawan?.id ?? m.lawan_bicara_id ?? (u.peran === 'petani' ? 'pembeli-ratna' : 'petani-arif');

      const petaniId = u.peran === 'petani' ? u.id : lawanId;
      const pembeliId = u.peran === 'pembeli' ? u.id : lawanId;

      let p = percakapan.find(
        (x) =>
          x.petani_id === petaniId &&
          x.pembeli_id === pembeliId &&
          x.jenis === (m.jenis ?? 'peta') &&
          x.rujukan_id === (m.rujukan_id ?? null),
      );

      if (!p) {
        k.db.urut += 1;
        p = {
          id: `percakapan-${k.db.urut}`,
          petani_id: petaniId,
          pembeli_id: pembeliId,
          jenis: m.jenis ?? 'peta',
          rujukan_id: m.rujukan_id ?? null,
          dibuat_pada: k.sekarangIso(),
        };
        percakapan.unshift(p);
        k.simpan();
      }

      return {
        id: p.id,
        jenis: p.jenis,
        rujukan_id: p.rujukan_id,
        lawan_bicara: {
          id: lawanId,
          nama: lawan?.nama ?? (u.peran === 'petani' ? 'Pembeli' : 'Petani'),
          peran: lawan?.peran ?? (u.peran === 'petani' ? 'pembeli' : 'petani'),
          foto_profil: lawan?.foto_profil ?? null,
        },
        dibuat_pada: p.dibuat_pada,
      };
    },

    async bukaLewatNomor(nomor_hp: string): Promise<PercakapanBukaHasil> {
      const u = k.penggunaMasuk();
      const norm = normalisasiNomorHp(nomor_hp);
      if (!norm.ok) {
        throw new GalatApi('VALIDASI', 'Nomor ini belum bisa dihubungi lewat Tani Muda');
      }

      const nomorNormal = norm.nilai;
      const lawan = k.db.pengguna.pengguna.find((p) => p.nomor_hp === nomorNormal);
      if (!lawan || lawan.id === u.id) {
        throw new GalatApi('VALIDASI', 'Nomor ini belum bisa dihubungi lewat Tani Muda');
      }

      let petaniId: string;
      let pembeliId: string;
      if (u.peran === 'petani' && lawan.peran === 'pembeli') {
        petaniId = u.id;
        pembeliId = lawan.id;
      } else if (u.peran === 'pembeli' && lawan.peran === 'petani') {
        pembeliId = u.id;
        petaniId = lawan.id;
      } else {
        throw new GalatApi('VALIDASI', 'Nomor ini belum bisa dihubungi lewat Tani Muda');
      }

      const { percakapan } = pastikanDb(k);
      let p = percakapan.find(
        (x) => x.petani_id === petaniId && x.pembeli_id === pembeliId && x.jenis === 'kontak',
      );

      if (!p) {
        k.db.urut += 1;
        p = {
          id: `percakapan-${k.db.urut}`,
          petani_id: petaniId,
          pembeli_id: pembeliId,
          jenis: 'kontak',
          rujukan_id: null,
          dibuat_pada: k.sekarangIso(),
        };
        percakapan.unshift(p);
        k.simpan();
      }

      return {
        id: p.id,
        jenis: p.jenis,
        rujukan_id: p.rujukan_id,
        lawan_bicara: {
          id: lawan.id,
          nama: lawan.nama ?? (u.peran === 'petani' ? 'Pembeli' : 'Petani'),
          peran: lawan.peran ?? (u.peran === 'petani' ? 'pembeli' : 'petani'),
          foto_profil: lawan.foto_profil ?? null,
        },
        dibuat_pada: p.dibuat_pada,
      };
    },

    async pesan(id: string, _setelah?: string): Promise<Pesan[]> {
      const { pesan } = pastikanDb(k);
      const hasil = pesan
        .filter((p) => p.percakapan_id === id)
        .sort((a, b) => new Date(a.dibuat_pada).getTime() - new Date(b.dibuat_pada).getTime());
      return k.salin(hasil);
    },

    async kirim(id: string, m: PermintaanKirimPesan): Promise<Pesan> {
      const u = k.penggunaMasuk();
      const { percakapan, pesan } = pastikanDb(k);
      const c = percakapan.find((p) => p.id === id);
      if (!c) {
        throw new GalatApi('TIDAK_DITEMUKAN', 'Percakapan tidak ditemukan');
      }

      k.db.urut += 1;
      const baru: Pesan = {
        id: `pesan-${k.db.urut}`,
        percakapan_id: id,
        pengirim_id: u.id,
        isi: m.isi.trim(),
        dibaca_pada: null,
        dibuat_pada: k.sekarangIso(),
      };
      pesan.push(baru);
      k.simpan();
      return k.salin(baru);
    },

    async tandaiDibaca(id: string): Promise<{ status: string; jumlah_dibaca: number }> {
      const u = k.penggunaMasuk();
      const { pesan } = pastikanDb(k);
      let count = 0;
      const sekarang = k.sekarangIso();
      for (const p of pesan) {
        if (p.percakapan_id === id && p.pengirim_id !== u.id && !p.dibaca_pada) {
          p.dibaca_pada = sekarang;
          count++;
        }
      }
      if (count > 0) {
        k.simpan();
      }
      return { status: 'ok', jumlah_dibaca: count };
    },

    async lencana(): Promise<LencanaChat> {
      const penggunaId = k.db.sesi.pengguna_id;
      if (!penggunaId) return { belum_dibaca: 0 };
      const u = k.db.pengguna.pengguna.find((p) => p.id === penggunaId);
      if (!u) return { belum_dibaca: 0 };

      const { percakapan, pesan } = pastikanDb(k);
      const userPercakapanIds = new Set(
        percakapan.filter((p) => p.petani_id === u.id || p.pembeli_id === u.id).map((p) => p.id),
      );

      const count = pesan.filter(
        (p) => userPercakapanIds.has(p.percakapan_id) && p.pengirim_id !== u.id && !p.dibaca_pada,
      ).length;

      return { belum_dibaca: count };
    },
  };
}
