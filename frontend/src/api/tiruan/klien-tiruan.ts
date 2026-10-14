/**
 * Perakit klien API tiruan (T3.09, T3.10). Halaman tidak mengimpor berkas ini; yang memakainya hanya
 * src/api/penyedia-klien.tsx (pemilihan sumber data) dan tes.
 */
import { OtpTiruan } from '../../penyedia/otp/otp-tiruan';
import type { KlienApi, KontrolPengembangan } from '../klien';
import { buatBasisData } from './basis-data';
import { VERSI_DATA_CONTOH } from './data/muat-data';
import { buatKlienAdmin, buatKlienMentor } from './fitur/admin';
import {
  buatKlienAkun,
  buatKlienBerkas,
  buatKlienNotifikasi,
  buatKlienWilayah,
} from './fitur/akun';
import { buatKlienBelajar, buatKlienKebun, buatKlienLahan } from './fitur/kebun';
import { buatKlienKiriman, buatKlienPembeli, buatKlienPesanan } from './fitur/pesanan';
import { buatKlienReferensi, buatKlienResep } from './fitur/referensi';
import { buatKlienChatbot, buatKlienCuaca, buatKlienDeteksi } from './fitur/ai-cuaca';
import { buatKlienStokTiruan } from './fitur/stok';
import { Konteks } from './konteks';
import { bungkusLatensi, type KendaliGalatBuatan } from './latensi';
import { PenyimpananTiruan, type PenyimpananKunciNilai } from './penyimpanan';

export interface OpsiKlienTiruan {
  tampilkanResepContoh: boolean;
  /** localStorage atau null (hanya memori). */
  kv: PenyimpananKunciNilai | null;
  /** Jam yang bisa disuntikkan (tes). */
  jam?: () => number;
  latensiMs?: [number, number];
  /** Pembuat kode OTP (tes); bawaan acak. */
  buatKodeOtp?: (panjang: number) => string;
}

export interface KlienTiruan {
  klien: KlienApi;
  kontrol: KontrolPengembangan;
  galatBuatan: KendaliGalatBuatan;
  konteks: Konteks;
}

export function buatKlienTiruan(opsi: OpsiKlienTiruan): KlienTiruan {
  const jam = opsi.jam ?? (() => Date.now());
  const penyimpanan = new PenyimpananTiruan({
    buatAwal: () => buatBasisData(jam()),
    versi: VERSI_DATA_CONTOH,
    kv: opsi.kv,
  });
  const otp = new OtpTiruan(jam, opsi.buatKodeOtp);
  const k = new Konteks(penyimpanan, jam, otp, { tampilkanResepContoh: opsi.tampilkanResepContoh });

  const mentah: KlienApi = {
    akun: buatKlienAkun(k),
    wilayah: buatKlienWilayah(k),
    referensi: buatKlienReferensi(k),
    resep: buatKlienResep(k),
    lahan: buatKlienLahan(k),
    kebun: buatKlienKebun(k),
    belajar: buatKlienBelajar(k),
    pesanan: buatKlienPesanan(k),
    kiriman: buatKlienKiriman(k),
    pembeli: buatKlienPembeli(k),
    admin: buatKlienAdmin(k),
    mentor: buatKlienMentor(k),
    notifikasi: buatKlienNotifikasi(k),
    berkas: buatKlienBerkas(k),
    deteksi: buatKlienDeteksi(k),
    chatbot: buatKlienChatbot(k),
    cuaca: buatKlienCuaca(k),
    stok: buatKlienStokTiruan(k),
  };
  const { klien, kendali } = bungkusLatensi(mentah, { latensiMs: opsi.latensiMs ?? [0, 0] });

  const kontrol: KontrolPengembangan = {
    penggunaUji: () =>
      k.db.pengguna.pengguna_uji.map((u) => {
        const p = k.db.pengguna.pengguna.find((x) => x.id === u.pengguna_id)!;
        return { id: p.id, nama: p.nama ?? '', peran: p.peran ?? '', keterangan: u.keterangan };
      }),
    async masukSebagai(penggunaId) {
      k.milik(k.db.pengguna.pengguna, (x) => x.id === penggunaId);
      k.db.sesi.pengguna_id = penggunaId;
      k.simpan();
    },
    kodeUji: (nomorHp) => otp.kodeUji(nomorHp),
    async aturUlang() {
      penyimpanan.aturUlang();
    },
  };
  return { klien, kontrol, galatBuatan: kendali, konteks: k };
}
