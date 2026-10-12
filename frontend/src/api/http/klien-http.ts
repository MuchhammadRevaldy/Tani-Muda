/**
 * Klien API HTTP ke backend Laravel (T6.01, D-20). Satu metode per endpoint di
 * docs/kontrak-api.md bagian 3, dengan antarmuka yang sama dengan klien tiruan, sehingga halaman
 * tidak berubah. Sesi memakai cookie Sanctum (D-21): permintaan yang mengubah data membawa header
 * `X-XSRF-TOKEN` dari cookie `XSRF-TOKEN`, yang diminta lewat `GET /sanctum/csrf-cookie` bila belum
 * ada; 419 `SESI_KEDALUWARSA` diulang sekali setelah meminta cookie baru (D-51).
 *
 * Di pengembangan, Vite meneruskan `/api` dan `/sanctum` ke Laravel (arsitektur-backend.md 5a),
 * jadi alamatnya relatif terhadap halaman.
 */
import { teksUntukGalat } from '../../teks/galat-api';
import { GalatApi, type KodeGalatApi } from '../galat';
import type { KlienApi, KontrolPengembangan } from '../klien';
import type { Akun, Halaman, KirimOtpHasil, ResponsGalat } from '../tipe';

export interface OpsiKlienHttp {
  /** Asal backend, mis. "http://localhost:5173"; kosong = asal halaman (bawaan). */
  asal?: string;
  /** Pengganti `fetch` (tes di Node memakai fetch dengan wadah cookie). */
  fetch?: typeof fetch;
  /** Baca nilai cookie; bawaan dari `document.cookie`. */
  bacaCookie?: (nama: string) => string | null;
  /**
   * Mode pengembangan atau demo: setelah kirim OTP, kode uji diambil dari `/demo/kode-otp` supaya
   * panel "Kode uji" bisa membacanya (kontrak 3.13). Tidak pernah aktif di build produksi.
   */
  demo?: boolean;
}

type Kueri = Record<string, string | number | boolean | null | undefined>;
type Metode = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const DASAR = '/api/v1';

function cookieDokumen(nama: string): string | null {
  if (typeof document === 'undefined') return null;
  const cocok = document.cookie.split('; ').find((c) => c.startsWith(`${nama}=`));
  return cocok ? decodeURIComponent(cocok.slice(nama.length + 1)) : null;
}

function denganKueri(jalur: string, kueri?: Kueri): string {
  if (!kueri) return jalur;
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(kueri))
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  const s = p.toString();
  return s ? `${jalur}?${s}` : jalur;
}

const e = encodeURIComponent;

/** Pembungkus permintaan: membuka `{ data }`, menerjemahkan galat kontrak menjadi `GalatApi`. */
export class PeminjamHttp {
  private readonly asal: string;
  private readonly ambilFetch: typeof fetch;
  private readonly bacaCookie: (nama: string) => string | null;

  constructor(o: OpsiKlienHttp = {}) {
    this.asal = o.asal ?? '';
    this.ambilFetch = o.fetch ?? ((...a) => globalThis.fetch(...a));
    this.bacaCookie = o.bacaCookie ?? cookieDokumen;
  }

  private async cookieCsrf(): Promise<void> {
    await this.ambilFetch(`${this.asal}/sanctum/csrf-cookie`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
  }

  private async kirim(
    metode: Metode,
    jalur: string,
    badan: unknown,
    bolehUlang: boolean,
  ): Promise<Response> {
    const ubah = metode !== 'GET';
    if (ubah && !this.bacaCookie('XSRF-TOKEN')) await this.cookieCsrf();
    const headers: Record<string, string> = { Accept: 'application/json' };
    const token = this.bacaCookie('XSRF-TOKEN');
    if (ubah && token) headers['X-XSRF-TOKEN'] = token;
    let body: BodyInit | undefined;
    if (badan instanceof FormData) body = badan;
    else if (badan !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(badan);
    }
    let r: Response;
    try {
      r = await this.ambilFetch(`${this.asal}${DASAR}${jalur}`, {
        method: metode,
        credentials: 'include',
        headers,
        ...(body !== undefined ? { body } : {}),
      });
    } catch {
      throw new GalatApi('SUMBER_BELUM_TERSEDIA', teksUntukGalat('SUMBER_BELUM_TERSEDIA'));
    }
    if (r.status === 419 && bolehUlang) {
      await this.cookieCsrf();
      return this.kirim(metode, jalur, badan, false);
    }
    return r;
  }

  private static async galatDari(r: Response): Promise<GalatApi> {
    const isi = (await r.json().catch(() => null)) as Partial<ResponsGalat> | null;
    const g = isi?.galat;
    if (!g) {
      const kode: KodeGalatApi = r.status >= 500 ? 'GALAT_SERVER' : 'SUMBER_BELUM_TERSEDIA';
      return new GalatApi(kode, teksUntukGalat(kode));
    }
    return new GalatApi(g.kode as KodeGalatApi, g.pesan, {
      ...(g.rincian ? { rincian: g.rincian } : {}),
      ...(g.coba_lagi_dalam !== undefined ? { cobaLagiDalam: g.coba_lagi_dalam } : {}),
    });
  }

  /** Isi `data` respons; 204 → undefined. */
  async minta<T>(metode: Metode, jalur: string, badan?: unknown): Promise<T> {
    const r = await this.kirim(metode, jalur, badan, true);
    if (!r.ok) throw await PeminjamHttp.galatDari(r);
    if (r.status === 204) return undefined as T;
    return ((await r.json()) as { data: T }).data;
  }

  /** Respons berhalaman `{ data, meta }`. */
  async halaman<T>(jalur: string): Promise<Halaman<T>> {
    const r = await this.kirim('GET', jalur, undefined, true);
    if (!r.ok) throw await PeminjamHttp.galatDari(r);
    return (await r.json()) as Halaman<T>;
  }

  get = <T>(jalur: string, kueri?: Kueri) => this.minta<T>('GET', denganKueri(jalur, kueri));
  post = <T>(jalur: string, badan?: unknown) => this.minta<T>('POST', jalur, badan ?? {});
  put = <T>(jalur: string, badan?: unknown) => this.minta<T>('PUT', jalur, badan ?? {});
  patch = <T>(jalur: string, badan?: unknown) => this.minta<T>('PATCH', jalur, badan ?? {});
  hapus = <T>(jalur: string, badan?: unknown) => this.minta<T>('DELETE', jalur, badan);
}

export function buatKlienHttp(o: OpsiKlienHttp = {}): {
  klien: KlienApi;
  kontrol: KontrolPengembangan;
  /** Muat daftar pengguna uji untuk pemilih akun demo (sebelum `kontrol.penggunaUji`). */
  muatDemo: () => Promise<void>;
} {
  const h = new PeminjamHttp(o);
  let penggunaUji: ReturnType<KontrolPengembangan['penggunaUji']> = [];
  const kodeTerakhir = new Map<string, string | null>();
  /** Mode demo: setelah kode dikirim, ambil kode uji dari /demo/kode-otp untuk panel Kode uji. */
  async function denganKodeUji(janji: Promise<KirimOtpHasil>): Promise<KirimOtpHasil> {
    const hasil = await janji;
    if (o.demo) {
      const r = await h
        .get<{ kode: string | null }>('/demo/kode-otp', { nomor_hp: hasil.nomor_hp })
        .catch(() => ({ kode: null }));
      kodeTerakhir.set(hasil.nomor_hp, r.kode);
    }
    return hasil;
  }
  const klien: KlienApi = {
    akun: {
      kirimOtp: (m) => denganKodeUji(h.post<KirimOtpHasil>('/auth/otp/kirim', m)),
      verifikasiOtp: (m) => h.post('/auth/otp/verifikasi', m),
      keluar: () => h.post('/auth/keluar'),
      async ambil() {
        try {
          return await h.get<Akun>('/akun');
        } catch (x) {
          if (x instanceof GalatApi && x.kode === 'BELUM_MASUK') return null;
          throw x;
        }
      },
      pilihPeran: (m) => h.put('/akun/peran', m),
      ubahProfil: (m) => h.patch('/akun', m),
      kirimOtpNomorBaru: (m) => denganKodeUji(h.post<KirimOtpHasil>('/akun/nomor-hp/otp', m)),
      gantiNomorHp: (m) => h.put('/akun/nomor-hp', m),
      catatanSaya: () => h.get('/akun/catatan'),
      simpanProfilPembeli: (m) => h.put('/akun/profil-pembeli', m),
    },
    wilayah: {
      daftar: (p = {}) => h.halaman(denganKueri('/wilayah', { ...p })),
      ambil: (id) => h.get(`/wilayah/${e(id)}`),
    },
    referensi: {
      komoditas: (p = {}) => h.get('/komoditas', { ...p }),
      metode: () => h.get('/metode'),
      sistemHidroponik: () => h.get('/sistem-hidroponik'),
      konversiSatuan: (wilayahId) => h.get('/konversi-satuan', { wilayah_id: wilayahId }),
      konfigurasi: () => h.get('/konfigurasi'),
      merek: (inputId) => h.get(`/input/${e(inputId)}/merek`),
      laporHarga: (m) => h.post('/laporan-harga', m),
      promo: () => h.get('/promo'),
      kelayakanSubsidi: (komoditasId) => h.get('/kelayakan-subsidi', { komoditas_id: komoditasId }),
      hargaSekitar: (inputId) => h.get('/harga-sekitar', { input_id: inputId }),
    },
    resep: {
      daftar: (p = {}) => h.get('/resep', { ...p }),
      ambil: (id) => h.get(`/resep/${e(id)}`),
      minta: (m) => h.post('/permintaan-resep', m),
      permintaanSaya: () => h.get('/permintaan-resep/saya'),
      contohPublik: () => h.get('/publik/contoh'),
    },
    lahan: {
      daftar: () => h.get('/lahan'),
      buat: (m) => h.post('/lahan', m),
      ubah: (id, m) => h.patch(`/lahan/${e(id)}`, m),
      hapus: (id) => h.hapus(`/lahan/${e(id)}`),
    },
    kebun: {
      daftarSiklus: (p = {}) => h.get('/siklus', { ...p }),
      buatSiklus: (m) => h.post('/siklus', m),
      ambilSiklus: (id) => h.get(`/siklus/${e(id)}`),
      ubahTanggalTanam: (id, tanggalTanam) =>
        h.patch(`/siklus/${e(id)}/tanggal-tanam`, { tanggal_tanam: tanggalTanam }),
      akhiriSiklus: (id, m) => h.post(`/siklus/${e(id)}/akhiri`, m),
      daftarTugas: (siklusId) => h.get(`/siklus/${e(siklusId)}/tugas`),
      tugasHariIni: () => h.get('/tugas/hari-ini'),
      selesaikanTugas: (id, m) => h.post(`/tugas/${e(id)}/selesai`, m),
      tundaTugas: (id, m) => h.post(`/tugas/${e(id)}/tunda`, m),
      catatPengukuran: (id, m) => h.post(`/tugas/${e(id)}/pengukuran`, m),
      riwayatPengukuran: (siklusId, besaran) =>
        h.get(`/siklus/${e(siklusId)}/pengukuran`, { besaran }),
      daftarPengeluaran: (siklusId) => h.get(`/siklus/${e(siklusId)}/pengeluaran`),
      catatPengeluaran: (siklusId, m) => h.post(`/siklus/${e(siklusId)}/pengeluaran`, m),
      jurnal: (siklusId) => h.get(`/siklus/${e(siklusId)}/jurnal`),
      tambahJurnal: (siklusId, m) => h.post(`/siklus/${e(siklusId)}/jurnal`, m),
      ambilPengingat: (siklusId) => h.get(`/siklus/${e(siklusId)}/pengingat`),
      ubahPengingat: (siklusId, m) => h.put(`/siklus/${e(siklusId)}/pengingat`, m),
    },
    belajar: {
      daftarModul: (p) => h.get('/modul', { ...p }),
      ambilModul: (id) => h.get(`/modul/${e(id)}`),
      tandaiSelesai: (id) => h.post(`/modul/${e(id)}/selesai`),
    },
    pesanan: {
      sekitar: (p = {}) => h.halaman(denganKueri('/pesanan/sekitar', { ...p })),
      ambil: (id) => h.get(`/pesanan/${e(id)}`),
      ambilPesanan: (id, m) => h.post(`/pesanan/${e(id)}/ambil`, m),
      ubahAlokasi: (alokasiId, m) => h.patch(`/alokasi/${e(alokasiId)}`, m),
      setujuiKesepakatan: (alokasiId) => h.post(`/alokasi/${e(alokasiId)}/setuju`),
      alokasiSaya: () => h.get('/alokasi/saya'),
      laporGagalPanen: (alokasiId, m) => h.post(`/alokasi/${e(alokasiId)}/gagal-panen`, m),
    },
    kiriman: {
      saya: () => h.get('/kiriman/saya'),
      ambil: (id) => h.get(`/kiriman/${e(id)}`),
      unggahFotoKualitas: (id, foto) => h.post(`/kiriman/${e(id)}/foto-kualitas`, { foto }),
      unggahFotoTimbangan: (id, foto) => h.post(`/kiriman/${e(id)}/foto-timbangan`, { foto }),
      tandaiDikirim: (id) => h.post(`/kiriman/${e(id)}/dikirim`),
      konfirmasi: (id, m) => h.post(`/kiriman/${e(id)}/konfirmasi`, m),
      beriRating: (id, m) => h.post(`/kiriman/${e(id)}/rating`, m),
      ringkasanRating: (penggunaId) => h.get(`/pengguna/${e(penggunaId)}/rating`),
    },
    pembeli: {
      pesananSaya: () => h.get('/pembeli/pesanan'),
      buatPesanan: (m) => h.post('/pembeli/pesanan', m),
      bayarUangMuka: (id, m) => h.post(`/pembeli/pesanan/${e(id)}/bayar-uang-muka`, m),
      batalkan: (id) => h.post(`/pembeli/pesanan/${e(id)}/batalkan`),
      pembayaran: (p = {}) => h.halaman(denganKueri('/pembeli/pembayaran', { ...p })),
    },
    admin: {
      pembeliMenunggu: () => h.get('/admin/pembeli', { status: 'menunggu' }),
      verifikasiPembeli: (penggunaId, m) => h.post(`/admin/pembeli/${e(penggunaId)}/verifikasi`, m),
      sengketa: (p = {}) => h.get('/admin/sengketa', { ...p }),
      putuskanSengketa: (id, m) => h.post(`/admin/sengketa/${e(id)}/putuskan`, m),
      daftarPetani: (p = {}) => h.halaman(denganKueri('/admin/petani', { ...p })),
      petani: (petaniId) => h.get(`/admin/petani/${e(petaniId)}`),
      tulisCatatan: (petaniId, m) => h.post(`/admin/petani/${e(petaniId)}/catatan`, m),
      ubahStatusPetani: (petaniId, m) => h.post(`/admin/petani/${e(petaniId)}/status`, m),
    },
    mentor: {
      daftarResep: () => h.get('/mentor/resep'),
      simpanResep: (m) => h.post('/mentor/resep', m),
      validasiResep: (id) => h.post(`/mentor/resep/${e(id)}/validasi`),
      ringkasanPermintaan: () => h.get('/mentor/permintaan-resep'),
    },
    notifikasi: {
      simpanLangganan: (m) => h.post('/notifikasi/langganan', m),
      hapusLangganan: (endpoint) => h.hapus('/notifikasi/langganan', { endpoint }),
    },
    berkas: {
      unggah(m) {
        const f = new FormData();
        const isi = typeof m.isi === 'string' ? dataUrlKeBlob(m.isi) : m.isi;
        f.append('berkas', isi, m.nama);
        return h.minta('POST', '/berkas', f);
      },
    },
  };

  // Pemilih akun demo, panel kode uji, dan atur ulang lewat endpoint demo lokal (kontrak 3.13).
  const kontrol: KontrolPengembangan = {
    penggunaUji: () => penggunaUji,
    async masukSebagai(penggunaId) {
      await h.post('/demo/masuk', { pengguna_id: penggunaId });
    },
    kodeUji: (nomorHp) => kodeTerakhir.get(nomorHp) ?? null,
    async aturUlang() {
      await h.post('/demo/atur-ulang');
    },
  };
  return {
    klien,
    kontrol,
    async muatDemo() {
      penggunaUji = await h.get('/demo/pengguna');
    },
  };
}

/** Data URL ("data:image/png;base64,…") menjadi Blob untuk unggahan multipart. */
function dataUrlKeBlob(dataUrl: string): Blob {
  const [kepala, isi = ''] = dataUrl.split(',');
  const jenis = /data:([^;]+)/.exec(kepala ?? '')?.[1] ?? 'application/octet-stream';
  const biner = atob(isi);
  const byte = new Uint8Array(biner.length);
  for (let i = 0; i < biner.length; i++) byte[i] = biner.charCodeAt(i);
  return new Blob([byte], { type: jenis });
}
