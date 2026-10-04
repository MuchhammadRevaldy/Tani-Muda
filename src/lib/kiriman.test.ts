import { describe, expect, it } from 'vitest';
import { CONTOH_KONFIGURASI } from './fixtures/contoh-referensi';
import { pastikan } from './hasil';
import {
  aturanGagalPanen,
  konfirmasiKiriman,
  pembatalanPembeli,
  statusOtomatis,
  validasiAlasan,
} from './kiriman';

const JAM = 3_600_000;
const kiriman = {
  jumlahDikirimKg: 5,
  hargaPerKg: 6000,
  saldoUangMuka: 6000,
  kirimanTerakhir: false,
};

describe('konfirmasiKiriman (P0-25, P0-26)', () => {
  it('bayam Rp6.000/kg, 5 kg, tolak 1 kg → dana cair Rp24.000', () => {
    expect(
      pastikan(
        konfirmasiKiriman(
          kiriman,
          { jenis: 'tolak_sebagian', jumlahDitolakKg: 1, alasan: 'layu_atau_busuk' },
          20,
        ),
      ),
    ).toEqual({
      status: 'ditolak_sebagian',
      jumlahDiterimaKg: 4,
      jumlahDitolakKg: 1,
      danaCairPetani: 24000,
      dibayarPembeli: 19200,
      dariUangMuka: 4800,
      sisaSaldoUangMuka: 1200,
      perluSengketa: true,
    });
  });
  it('terima semua: 80% dibayar pembeli, 20% dari uang muka (D-02)', () => {
    expect(pastikan(konfirmasiKiriman(kiriman, { jenis: 'terima_semua' }, 20))).toEqual({
      status: 'diterima',
      jumlahDiterimaKg: 5,
      jumlahDitolakKg: 0,
      danaCairPetani: 30000,
      dibayarPembeli: 24000,
      dariUangMuka: 6000,
      sisaSaldoUangMuka: 0,
      perluSengketa: false,
    });
  });
  it.each([
    // [dikirim, ditolak, harga, danaCair]
    [10, 2.5, 5000, 37500],
    [5, 5, 6000, 0],
    [0.3, 0.1, 5000, 1000],
  ])('kirim %s kg, tolak %s kg × %s → dana cair %s', (kirim, tolak, harga, dana) => {
    const r = pastikan(
      konfirmasiKiriman(
        { ...kiriman, jumlahDikirimKg: kirim, hargaPerKg: harga, saldoUangMuka: 100000 },
        { jenis: 'tolak_sebagian', jumlahDitolakKg: tolak, alasan: 'jumlah_kurang' },
        20,
      ),
    );
    expect(r.danaCairPetani).toBe(dana);
  });
  it('"Lainnya" wajib keterangan (D-14)', () => {
    const tolak = {
      jenis: 'tolak_sebagian' as const,
      jumlahDitolakKg: 1,
      alasan: 'lainnya' as const,
    };
    expect(konfirmasiKiriman(kiriman, tolak, 20)).toEqual({ ok: false, galat: 'KETERANGAN_WAJIB' });
    expect(konfirmasiKiriman(kiriman, { ...tolak, keterangan: '   ' }, 20)).toEqual({
      ok: false,
      galat: 'KETERANGAN_WAJIB',
    });
    expect(
      pastikan(konfirmasiKiriman(kiriman, { ...tolak, keterangan: 'Kemasan sobek' }, 20)).status,
    ).toBe('ditolak_sebagian');
  });
  it.each([
    [
      { jenis: 'tolak_sebagian' as const, jumlahDitolakKg: 6, alasan: 'jumlah_kurang' as const },
      'MELEBIHI_KIRIMAN',
    ],
    [
      { jenis: 'tolak_sebagian' as const, jumlahDitolakKg: 0, alasan: 'jumlah_kurang' as const },
      'TOLAK_KOSONG',
    ],
    [
      { jenis: 'tolak_sebagian' as const, jumlahDitolakKg: 1, alasan: 'busuk' as never },
      'ALASAN_TIDAK_DIKENAL',
    ],
  ])('galat %#', (k, galat) => {
    expect(konfirmasiKiriman(kiriman, k, 20)).toEqual({ ok: false, galat });
  });
  it('jumlah atau harga kosong ditolak', () => {
    expect(
      konfirmasiKiriman({ ...kiriman, jumlahDikirimKg: 0 }, { jenis: 'terima_semua' }, 20),
    ).toEqual({ ok: false, galat: 'JUMLAH_KOSONG' });
    expect(konfirmasiKiriman({ ...kiriman, hargaPerKg: 0 }, { jenis: 'terima_semua' }, 20)).toEqual(
      { ok: false, galat: 'HARGA_KOSONG' },
    );
    expect(
      konfirmasiKiriman({ ...kiriman, saldoUangMuka: -1 }, { jenis: 'terima_semua' }, 20),
    ).toEqual({ ok: false, galat: 'JUMLAH_NEGATIF' });
  });
});

describe('validasiAlasan (D-14)', () => {
  it.each(['layu_atau_busuk', 'jumlah_kurang', 'tidak_sesuai_standar'])(
    '%s sah tanpa keterangan',
    (a) => {
      expect(validasiAlasan(a)).toEqual({ ok: true, nilai: a });
    },
  );
  it('lainnya dengan keterangan sah', () => {
    expect(validasiAlasan('lainnya', 'Ada batu di karung')).toEqual({ ok: true, nilai: 'lainnya' });
  });
});

describe('statusOtomatis (D-01: rutin 6 jam, sekali panen 24 jam)', () => {
  const kirim = Date.UTC(2026, 9, 5, 0, 0);
  it.each([
    ['rutin', 6 * JAM - 1, false],
    ['rutin', 6 * JAM, true],
    ['rutin', 6 * JAM + 1, true],
    ['sekali_panen', 6 * JAM, false],
    ['sekali_panen', 24 * JAM - 1, false],
    ['sekali_panen', 24 * JAM, true],
    ['sekali_panen', 30 * JAM, true],
  ] as const)('%s setelah %s ms → dianggap diterima %s', (jenis, lewat, hasil) => {
    expect(
      statusOtomatis(
        { jenisPesanan: jenis, dikirimPadaMs: kirim },
        kirim + lewat,
        CONTOH_KONFIGURASI.jamPeriksa,
      ).dianggapDiterima,
    ).toBe(hasil);
  });
  it('batas dan sisa waktu dari konfigurasi', () => {
    const r = statusOtomatis({ jenisPesanan: 'rutin', dikirimPadaMs: kirim }, kirim + 2 * JAM, {
      rutin: 3,
      sekali_panen: 12,
    });
    expect(r).toEqual({ dianggapDiterima: false, batasMs: kirim + 3 * JAM, sisaMs: JAM });
  });
});

describe('aturanGagalPanen (D-03, tanpa denda)', () => {
  const dasar = {
    jadwalKirim: '2026-11-10',
    batasHari: 3,
    adaPengganti: false,
    sisaUangMukaBagian: 30000,
  };
  it.each([
    ['2026-11-07', true],
    ['2026-11-01', true],
    ['2026-11-08', false],
    ['2026-11-10', false],
  ])('kabar %s untuk kirim 10 Nov → tepat waktu %s', (kabar, tepat) => {
    const r = aturanGagalPanen({ ...dasar, tanggalKabar: kabar });
    expect(r.tepatWaktu).toBe(tepat);
    expect(r.catatanProfil).toBe(!tepat);
    expect(r.tawarkanUlang).toBe(true);
  });
  it('tanpa pengganti → sisa uang muka bagian itu saja yang dikembalikan', () => {
    expect(aturanGagalPanen({ ...dasar, tanggalKabar: '2026-11-05' })).toEqual({
      tepatWaktu: true,
      tawarkanUlang: true,
      dikembalikan: 30000,
      catatanProfil: false,
    });
  });
  it('ada pengganti → tidak ada pengembalian', () => {
    expect(
      aturanGagalPanen({ ...dasar, tanggalKabar: '2026-11-05', adaPengganti: true }).dikembalikan,
    ).toBe(0);
  });
  it('tidak memberi kabar → catatan profil, tetap ditawarkan ulang', () => {
    expect(aturanGagalPanen({ ...dasar, tanggalKabar: null })).toEqual({
      tepatWaktu: false,
      tawarkanUlang: true,
      dikembalikan: 30000,
      catatanProfil: true,
    });
  });
  it('tidak ada kolom denda', () => {
    expect(Object.keys(aturanGagalPanen({ ...dasar, tanggalKabar: null }))).not.toContain('denda');
  });
});

describe('pembatalanPembeli (P0-27)', () => {
  it('setelah petani menanam, uang muka menjadi kompensasi petani', () => {
    expect(pembatalanPembeli({ petaniSudahMenanam: true, saldoUangMuka: 120000 })).toEqual({
      kompensasiPetani: 120000,
      dikembalikanKePembeli: 0,
    });
  });
  it('sebelum menanam, uang muka kembali ke pembeli', () => {
    expect(pembatalanPembeli({ petaniSudahMenanam: false, saldoUangMuka: 120000 })).toEqual({
      kompensasiPetani: 0,
      dikembalikanKePembeli: 120000,
    });
    expect(pembatalanPembeli({ petaniSudahMenanam: false, saldoUangMuka: -5 })).toEqual({
      kompensasiPetani: 0,
      dikembalikanKePembeli: 0,
    });
  });
});
