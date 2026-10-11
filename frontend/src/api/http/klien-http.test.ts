import { describe, expect, it } from 'vitest';
import { GalatApi } from '../galat';
import { buatKlienHttp } from './klien-http';

interface Panggilan {
  url: string;
  metode: string;
  header: Record<string, string>;
  badan: unknown;
}

/** fetch palsu: jawaban per "METODE jalur" (urutan dipakai bergiliran), cookie diatur manual. */
function fetchPalsu(jawaban: Record<string, Array<[number, unknown]>>) {
  const panggilan: Panggilan[] = [];
  const cookie = new Map<string, string>();
  const f = (async (url: string, init: RequestInit = {}) => {
    const metode = init.method ?? 'GET';
    const jalur = url.replace(/^https?:\/\/[^/]+/, '').split('?')[0]!;
    panggilan.push({
      url,
      metode,
      header: (init.headers ?? {}) as Record<string, string>,
      badan: typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
    });
    if (jalur === '/sanctum/csrf-cookie') {
      cookie.set('XSRF-TOKEN', `token-${panggilan.length}`);
      return new Response(null, { status: 204 });
    }
    const daftar = jawaban[`${metode} ${jalur}`];
    const [status, isi] = daftar?.shift() ?? [
      404,
      { galat: { kode: 'TIDAK_DITEMUKAN', pesan: 'x' } },
    ];
    return new Response(status === 204 ? null : JSON.stringify(isi), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
  return { f, panggilan, cookie };
}

describe('klien HTTP (T6.01)', () => {
  it('GET membuka { data } dan memakai alamat /api/v1 relatif terhadap asal', async () => {
    const p = fetchPalsu({ 'GET /api/v1/lahan': [[200, { data: [{ id: 'lahan-1' }] }]] });
    const { klien } = buatKlienHttp({
      asal: 'http://x',
      fetch: p.f,
      bacaCookie: (n) => p.cookie.get(n) ?? null,
    });
    expect(await klien.lahan.daftar()).toEqual([{ id: 'lahan-1' }]);
    expect(p.panggilan[0]).toMatchObject({ url: 'http://x/api/v1/lahan', metode: 'GET' });
  });

  it('permintaan pengubah meminta cookie CSRF dulu lalu mengirim X-XSRF-TOKEN dan JSON', async () => {
    const p = fetchPalsu({
      'PUT /api/v1/akun/peran': [[200, { data: { pengguna: { id: 'a' } } }]],
    });
    const { klien } = buatKlienHttp({ fetch: p.f, bacaCookie: (n) => p.cookie.get(n) ?? null });
    await klien.akun.pilihPeran({ peran: 'pembeli', nama: 'Ratna' });
    expect(p.panggilan.map((x) => `${x.metode} ${x.url}`)).toEqual([
      'GET /sanctum/csrf-cookie',
      'PUT /api/v1/akun/peran',
    ]);
    expect(p.panggilan[1]?.header).toMatchObject({
      'X-XSRF-TOKEN': 'token-1',
      'Content-Type': 'application/json',
    });
    expect(p.panggilan[1]?.badan).toEqual({ peran: 'pembeli', nama: 'Ratna' });
  });

  it('galat kontrak menjadi GalatApi dengan kode, pesan, rincian, dan coba lagi', async () => {
    const p = fetchPalsu({
      'POST /api/v1/auth/otp/kirim': [
        [429, { galat: { kode: 'TERLALU_SERING', pesan: 'Tunggu', coba_lagi_dalam: 42 } }],
        [422, { galat: { kode: 'VALIDASI', pesan: 'Salah', rincian: { nomor_hp: ['x'] } } }],
      ],
    });
    const { klien } = buatKlienHttp({ fetch: p.f, bacaCookie: (n) => p.cookie.get(n) ?? null });
    const g1 = await klien.akun.kirimOtp({ nomor_hp: '0812' }).catch((x: unknown) => x);
    expect(g1).toBeInstanceOf(GalatApi);
    expect(g1).toMatchObject({
      kode: 'TERLALU_SERING',
      status: 429,
      cobaLagiDalam: 42,
      message: 'Tunggu',
    });
    const g2 = await klien.akun.kirimOtp({ nomor_hp: '0812' }).catch((x: unknown) => x);
    expect(g2).toMatchObject({ kode: 'VALIDASI', rincian: { nomor_hp: ['x'] } });
  });

  it('419 diulang sekali setelah meminta cookie CSRF baru', async () => {
    const p = fetchPalsu({
      'POST /api/v1/auth/keluar': [
        [419, { galat: { kode: 'SESI_KEDALUWARSA', pesan: 'x' } }],
        [204, null],
      ],
    });
    p.cookie.set('XSRF-TOKEN', 'lama');
    const { klien } = buatKlienHttp({ fetch: p.f, bacaCookie: (n) => p.cookie.get(n) ?? null });
    await expect(klien.akun.keluar()).resolves.toBeUndefined();
    expect(p.panggilan.map((x) => x.metode + ' ' + x.url)).toEqual([
      'POST /api/v1/auth/keluar',
      'GET /sanctum/csrf-cookie',
      'POST /api/v1/auth/keluar',
    ]);
    expect(p.panggilan[2]?.header['X-XSRF-TOKEN']).toBe('token-2');
  });

  it('GET /akun 401 menjadi null; galat lain diteruskan', async () => {
    const p = fetchPalsu({
      'GET /api/v1/akun': [
        [401, { galat: { kode: 'BELUM_MASUK', pesan: 'x' } }],
        [500, { galat: { kode: 'GALAT_SERVER', pesan: 'x' } }],
      ],
    });
    const { klien } = buatKlienHttp({ fetch: p.f, bacaCookie: () => null });
    expect(await klien.akun.ambil()).toBeNull();
    await expect(klien.akun.ambil()).rejects.toMatchObject({ kode: 'GALAT_SERVER' });
  });

  it('halaman membawa meta; parameter kosong tidak dikirim', async () => {
    const meta = { halaman: 1, per_halaman: 20, total: 1, halaman_terakhir: 1 };
    const p = fetchPalsu({ 'GET /api/v1/pesanan/sekitar': [[200, { data: [{ id: 'p' }], meta }]] });
    const { klien } = buatKlienHttp({ fetch: p.f, bacaCookie: () => null });
    expect(await klien.pesanan.sekitar({ radius_km: 25 })).toEqual({ data: [{ id: 'p' }], meta });
    expect(p.panggilan[0]?.url).toBe('/api/v1/pesanan/sekitar?radius_km=25');
  });

  it('jaringan putus atau jawaban bukan format kontrak → SUMBER_BELUM_TERSEDIA / GALAT_SERVER', async () => {
    const putus = (async () => {
      throw new TypeError('Failed to fetch');
    }) as typeof fetch;
    const a = buatKlienHttp({ fetch: putus, bacaCookie: () => null });
    await expect(a.klien.lahan.daftar()).rejects.toMatchObject({
      kode: 'SUMBER_BELUM_TERSEDIA',
      status: 503,
    });
    const html = (async () => new Response('<html>', { status: 502 })) as typeof fetch;
    const b = buatKlienHttp({ fetch: html, bacaCookie: () => null });
    await expect(b.klien.lahan.daftar()).rejects.toMatchObject({ kode: 'GALAT_SERVER' });
  });

  it('mode demo: pengguna uji dimuat dan kode uji diambil setelah kirim OTP (kontrak 3.13)', async () => {
    const p = fetchPalsu({
      'GET /api/v1/demo/pengguna': [
        [200, { data: [{ id: 'petani-arif', nama: 'Arif', peran: 'petani', keterangan: 'k' }] }],
      ],
      'POST /api/v1/auth/otp/kirim': [
        [
          200,
          {
            data: {
              nomor_hp: '+6281200000001',
              kirim_ulang_dalam_detik: 60,
              kedaluwarsa_dalam_detik: 300,
            },
          },
        ],
      ],
      'GET /api/v1/demo/kode-otp': [[200, { data: { kode: '123456' } }]],
      'POST /api/v1/demo/masuk': [[200, { data: {} }]],
      'POST /api/v1/demo/atur-ulang': [[204, null]],
    });
    const h = buatKlienHttp({ fetch: p.f, bacaCookie: (n) => p.cookie.get(n) ?? null, demo: true });
    await h.muatDemo();
    expect(h.kontrol.penggunaUji().map((u) => u.id)).toEqual(['petani-arif']);
    expect(h.kontrol.kodeUji('+6281200000001')).toBeNull();
    await h.klien.akun.kirimOtp({ nomor_hp: '081200000001' });
    expect(h.kontrol.kodeUji('+6281200000001')).toBe('123456');
    await h.kontrol.masukSebagai('petani-arif');
    expect(p.panggilan.find((x) => x.url === '/api/v1/demo/masuk')?.badan).toEqual({
      pengguna_id: 'petani-arif',
    });
    await h.kontrol.aturUlang();
  });

  it('di luar mode demo, kirim OTP tidak pernah meminta kode uji', async () => {
    const p = fetchPalsu({
      'POST /api/v1/auth/otp/kirim': [
        [
          200,
          {
            data: {
              nomor_hp: '+6281200000001',
              kirim_ulang_dalam_detik: 60,
              kedaluwarsa_dalam_detik: 300,
            },
          },
        ],
      ],
    });
    const h = buatKlienHttp({ fetch: p.f, bacaCookie: (n) => p.cookie.get(n) ?? null });
    await h.klien.akun.kirimOtp({ nomor_hp: '081200000001' });
    expect(p.panggilan.some((x) => x.url.includes('/demo/'))).toBe(false);
  });
});
