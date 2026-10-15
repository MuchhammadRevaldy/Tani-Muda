/**
 * Klien tiruan untuk F-09: Chat Petani & Pembeli.
 * Menyimpan data percakapan dan pesan di konteks db tiruan.
 */
import { normalisasiNomorHp } from '../../../lib/nomor-hp';
import { GalatApi } from '../../galat';
import type {
  DaftarPermintaanKontakHasil,
  HasilKirimPermintaanKontak,
  LencanaChat,
  Percakapan,
  PercakapanBukaHasil,
  PermintaanBukaPercakapan,
  PermintaanKirimKontak,
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

interface DbPermintaanKontak {
  id: string;
  pemohon_id: string;
  target_id: string;
  nomor_hp: string;
  pesan: string | null;
  status: 'menunggu' | 'diterima' | 'ditolak';
  dibuat_pada: string;
}

function pastikanDb(k: Konteks): {
  percakapan: DbPercakapan[];
  pesan: Pesan[];
  permintaan: DbPermintaanKontak[];
} {
  const dbAny = k.db as unknown as {
    chat_percakapan?: DbPercakapan[];
    chat_pesan?: Pesan[];
    chat_permintaan?: DbPermintaanKontak[];
    chat?: { percakapan?: DbPercakapan[]; pesan?: Pesan[] };
  };
  if (!dbAny.chat_percakapan) {
    dbAny.chat_percakapan = dbAny.chat?.percakapan ? structuredClone(dbAny.chat.percakapan) : [];
  }
  if (!dbAny.chat_pesan) {
    dbAny.chat_pesan = dbAny.chat?.pesan ? structuredClone(dbAny.chat.pesan) : [];
  }
  if (!dbAny.chat_permintaan) {
    dbAny.chat_permintaan = [];
  }
  return {
    percakapan: dbAny.chat_percakapan,
    pesan: dbAny.chat_pesan,
    permintaan: dbAny.chat_permintaan,
  };
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

      const { permintaan } = pastikanDb(k);
      const permintaanMasuk = permintaan.filter(
        (x) => x.target_id === u.id && x.status === 'menunggu',
      ).length;

      return {
        belum_dibaca: count,
        permintaan_masuk: permintaanMasuk,
        total: count + permintaanMasuk,
      };
    },

    async daftarPermintaan(): Promise<DaftarPermintaanKontakHasil> {
      const u = k.penggunaMasuk();
      const { permintaan } = pastikanDb(k);

      const masuk = permintaan
        .filter((x) => x.target_id === u.id && x.status === 'menunggu')
        .sort((a, b) => new Date(b.dibuat_pada).getTime() - new Date(a.dibuat_pada).getTime())
        .map((x) => {
          const pemohon = k.db.pengguna.pengguna.find((p) => p.id === x.pemohon_id);
          return {
            id: x.id,
            pemohon: {
              id: x.pemohon_id,
              nama: pemohon?.nama ?? 'Pengguna Tani Muda',
              peran: pemohon?.peran ?? undefined,
              foto_profil: pemohon?.foto_profil ?? null,
            },
            nomor_hp: x.nomor_hp,
            pesan: x.pesan,
            status: x.status,
            dibuat_pada: x.dibuat_pada,
          };
        });

      const keluar = permintaan
        .filter((x) => x.pemohon_id === u.id)
        .sort((a, b) => new Date(b.dibuat_pada).getTime() - new Date(a.dibuat_pada).getTime())
        .slice(0, 20)
        .map((x) => {
          const target = k.db.pengguna.pengguna.find((p) => p.id === x.target_id);
          return {
            id: x.id,
            target: {
              id: x.target_id,
              nama: target?.nama ?? 'Pengguna Tani Muda',
              peran: target?.peran ?? undefined,
              foto_profil: target?.foto_profil ?? null,
            },
            nomor_hp: x.nomor_hp,
            pesan: x.pesan,
            status: x.status,
            dibuat_pada: x.dibuat_pada,
          };
        });

      return { masuk, keluar };
    },

    async kirimPermintaan(m: PermintaanKirimKontak): Promise<HasilKirimPermintaanKontak> {
      const u = k.penggunaMasuk();
      const norm = normalisasiNomorHp(m.nomor_hp);
      if (!norm.ok) {
        throw new GalatApi('VALIDASI', 'Nomor ini belum bisa dihubungi lewat Tani Muda');
      }

      const lawan = k.db.pengguna.pengguna.find((p) => p.nomor_hp === norm.nilai);
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

      const { percakapan, permintaan } = pastikanDb(k);
      const pAda = percakapan.find(
        (x) => x.petani_id === petaniId && x.pembeli_id === pembeliId && x.jenis === 'kontak',
      );
      if (pAda) {
        return {
          status: 'sudah_terhubung',
          id: pAda.id,
          percakapan_id: pAda.id,
          pesan: 'Kontak ini sudah terhubung.',
          target: {
            id: lawan.id,
            nama: lawan.nama ?? 'Pengguna Tani Muda',
            peran: lawan.peran,
            foto_profil: lawan.foto_profil ?? null,
          },
        };
      }

      // Jika ada permintaan kebalikan yang menunggu -> langsung terima
      const balik = permintaan.find(
        (x) => x.pemohon_id === lawan.id && x.target_id === u.id && x.status === 'menunggu',
      );
      if (balik) {
        balik.status = 'diterima';
        k.db.urut += 1;
        const baruP: DbPercakapan = {
          id: `percakapan-${k.db.urut}`,
          petani_id: petaniId,
          pembeli_id: pembeliId,
          jenis: 'kontak',
          rujukan_id: null,
          dibuat_pada: k.sekarangIso(),
        };
        percakapan.unshift(baruP);
        k.simpan();
        return {
          status: 'diterima',
          id: balik.id,
          percakapan_id: baruP.id,
          pesan: 'Kontak langsung terhubung.',
          target: {
            id: lawan.id,
            nama: lawan.nama ?? 'Pengguna Tani Muda',
            peran: lawan.peran,
            foto_profil: lawan.foto_profil ?? null,
          },
        };
      }

      // Cek apakah sudah ada pending
      const ada = permintaan.find(
        (x) => x.pemohon_id === u.id && x.target_id === lawan.id && x.status === 'menunggu',
      );
      if (ada) {
        return {
          status: 'menunggu',
          id: ada.id,
          pesan: 'Permintaan kontak sedang menunggu respon penerima.',
          target: {
            id: lawan.id,
            nama: lawan.nama ?? 'Pengguna Tani Muda',
            peran: lawan.peran,
            foto_profil: lawan.foto_profil ?? null,
          },
          dibuat_pada: ada.dibuat_pada,
        };
      }

      k.db.urut += 1;
      const baruReq: DbPermintaanKontak = {
        id: `permintaan-${k.db.urut}`,
        pemohon_id: u.id,
        target_id: lawan.id,
        nomor_hp: norm.nilai,
        pesan: m.pesan?.trim() || null,
        status: 'menunggu',
        dibuat_pada: k.sekarangIso(),
      };
      permintaan.unshift(baruReq);
      k.simpan();

      return {
        status: 'menunggu',
        id: baruReq.id,
        pesan: 'Permintaan kontak berhasil dikirim.',
        target: {
          id: lawan.id,
          nama: lawan.nama ?? 'Pengguna Tani Muda',
          peran: lawan.peran,
          foto_profil: lawan.foto_profil ?? null,
        },
        dibuat_pada: baruReq.dibuat_pada,
      };
    },

    async terimaPermintaan(id: string): Promise<PercakapanBukaHasil> {
      const u = k.penggunaMasuk();
      const { percakapan, pesan, permintaan } = pastikanDb(k);
      const req = permintaan.find((x) => x.id === id);
      if (!req || req.target_id !== u.id) {
        throw new GalatApi('TIDAK_DITEMUKAN', 'Permintaan tidak ditemukan');
      }

      req.status = 'diterima';
      const pemohon = k.db.pengguna.pengguna.find((p) => p.id === req.pemohon_id);
      if (!pemohon) {
        throw new GalatApi('TIDAK_DITEMUKAN', 'Pengguna tidak ditemukan');
      }

      const petaniId = u.peran === 'petani' ? u.id : pemohon.id;
      const pembeliId = u.peran === 'pembeli' ? u.id : pemohon.id;

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
      }

      if (req.pesan && !pesan.some((x) => x.percakapan_id === p!.id)) {
        k.db.urut += 1;
        pesan.push({
          id: `pesan-${k.db.urut}`,
          percakapan_id: p.id,
          pengirim_id: pemohon.id,
          isi: req.pesan,
          dibaca_pada: null,
          dibuat_pada: k.sekarangIso(),
        });
      }

      k.simpan();

      return {
        id: p.id,
        jenis: p.jenis,
        rujukan_id: p.rujukan_id,
        lawan_bicara: {
          id: pemohon.id,
          nama: pemohon.nama ?? 'Pengguna Tani Muda',
          peran: pemohon.peran ?? undefined,
          foto_profil: pemohon.foto_profil ?? null,
        },
        dibuat_pada: p.dibuat_pada,
      };
    },

    async tolakPermintaan(id: string): Promise<{ status: string }> {
      const u = k.penggunaMasuk();
      const { permintaan } = pastikanDb(k);
      const req = permintaan.find((x) => x.id === id);
      if (!req || req.target_id !== u.id) {
        throw new GalatApi('TIDAK_DITEMUKAN', 'Permintaan tidak ditemukan');
      }

      req.status = 'ditolak';
      k.simpan();
      return { status: 'ok' };
    },
  };
}
