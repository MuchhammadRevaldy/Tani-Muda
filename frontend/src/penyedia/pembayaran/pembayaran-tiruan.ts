/**
 * Pembayaran TIRUAN untuk demo (D-10): mensimulasikan menahan, mencairkan, dan mengembalikan dana
 * seketika. Referensi diawali "TIRUAN-" dan UI menampilkan label "Mode uji coba". Keadaan disimpan di
 * objek yang diberikan pemanggil, supaya bisa ikut disimpan bersama data tiruan.
 */
import type { HasilPembayaran, PenyediaPembayaran, StatusDana } from './penyedia-pembayaran';

export interface KeadaanPembayaranTiruan {
  dana: Record<
    string,
    { ditahan: number; dicairkan: number; dikembalikan: number; keterangan: string }
  >;
  idempoten: Record<string, string>;
  nomorBerikutnya: number;
}

export const keadaanPembayaranKosong = (): KeadaanPembayaranTiruan => ({
  dana: {},
  idempoten: {},
  nomorBerikutnya: 1,
});

export class PembayaranTiruan implements PenyediaPembayaran {
  readonly modeUjiCoba = true;

  constructor(private readonly keadaan: KeadaanPembayaranTiruan) {}

  private ringkas(referensi: string): StatusDana {
    const d = this.keadaan.dana[referensi] as KeadaanPembayaranTiruan['dana'][string];
    return {
      referensi,
      ditahan: d.ditahan,
      dicairkan: d.dicairkan,
      dikembalikan: d.dikembalikan,
      sisa: d.ditahan - d.dicairkan - d.dikembalikan,
    };
  }

  async tahan(m: {
    nominal: number;
    keterangan: string;
    kunciIdempoten: string;
  }): Promise<HasilPembayaran<StatusDana>> {
    if (m.nominal < 0) return { ok: false, galat: 'JUMLAH_NEGATIF' };
    const ada = this.keadaan.idempoten[m.kunciIdempoten];
    if (ada) return { ok: true, nilai: this.ringkas(ada) };
    const referensi = `TIRUAN-${String(this.keadaan.nomorBerikutnya++).padStart(6, '0')}`;
    this.keadaan.dana[referensi] = {
      ditahan: m.nominal,
      dicairkan: 0,
      dikembalikan: 0,
      keterangan: m.keterangan,
    };
    this.keadaan.idempoten[m.kunciIdempoten] = referensi;
    return { ok: true, nilai: this.ringkas(referensi) };
  }

  private async kurangi(
    referensi: string,
    nominal: number,
    jenis: 'dicairkan' | 'dikembalikan',
  ): Promise<HasilPembayaran<StatusDana>> {
    const d = this.keadaan.dana[referensi];
    if (!d) return { ok: false, galat: 'TIDAK_DITEMUKAN' };
    if (nominal < 0) return { ok: false, galat: 'JUMLAH_NEGATIF' };
    if (nominal > this.ringkas(referensi).sisa) return { ok: false, galat: 'MELEBIHI_SALDO' };
    d[jenis] += nominal;
    return { ok: true, nilai: this.ringkas(referensi) };
  }

  cairkan(referensi: string, nominal: number) {
    return this.kurangi(referensi, nominal, 'dicairkan');
  }

  kembalikan(referensi: string, nominal: number) {
    return this.kurangi(referensi, nominal, 'dikembalikan');
  }

  async status(referensi: string): Promise<HasilPembayaran<StatusDana>> {
    return this.keadaan.dana[referensi]
      ? { ok: true, nilai: this.ringkas(referensi) }
      : { ok: false, galat: 'TIDAK_DITEMUKAN' };
  }
}
