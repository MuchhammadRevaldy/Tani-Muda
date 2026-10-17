import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useKomoditas,
  useKirimPesananStok,
  usePesananStokSaya,
  useStokSaya,
  useTambahStok,
  useTerimaPesananStok,
  useTolakPesananStok,
  useUbahStok,
  useUnggahBerkas,
} from '../../api/kueri';
import type { PesananStok, StatusStok, StokRingkas } from '../../api/tipe';
import { AmbilFoto, type FotoKecil } from '../../komponen/ambil-foto';
import { cx } from '../../komponen/gabung-kelas';
import { GambarStok } from '../../komponen/gambar-stok';
import { Ikon } from '../../komponen/ikon';
import { formatRupiah } from '../../lib/format';
import { KerangkaPesanan } from '../pesanan/kerangka-pesanan';

export function HalamanStokPetani() {
  const [tabAktif, setTabAktif] = useState<'stok' | 'pesanan'>('stok');
  const [bukaForm, setBukaForm] = useState(false);

  // Form tambah stok
  const [komoditasId, setKomoditasId] = useState('sawi');
  const [jumlahKg, setJumlahKg] = useState('20');
  const [hargaPerKg, setHargaPerKg] = useState('12000');
  const [tanggalPanen, setTanggalPanen] = useState(new Date().toISOString().slice(0, 10));
  const [catatan, setCatatan] = useState('');
  const [fotoTambah, setFotoTambah] = useState<FotoKecil | null>(null);
  const [pesanSukses, setPesanSukses] = useState('');

  // Form ubah stok
  const [stokSedangDiubah, setStokSedangDiubah] = useState<StokRingkas | null>(null);
  const [hargaUbah, setHargaUbah] = useState('');
  const [statusUbah, setStatusUbah] = useState<StatusStok>('tersedia');
  const [fotoUbah, setFotoUbah] = useState<FotoKecil | null>(null);
  const [fotoUbahDihapus, setFotoUbahDihapus] = useState(false);

  // Kueri
  const kueriStok = useStokSaya();
  const kueriPesanan = usePesananStokSaya();
  const kueriKomoditas = useKomoditas();

  const tambahStok = useTambahStok();
  const ubahStok = useUbahStok();
  const unggahBerkas = useUnggahBerkas();
  const terimaPesanan = useTerimaPesananStok();
  const tolakPesanan = useTolakPesananStok();
  const kirimPesanan = useKirimPesananStok();

  const daftarStok: StokRingkas[] = kueriStok.data ?? [];
  const daftarPesanan: PesananStok[] = kueriPesanan.data ?? [];

  async function handleSimpanStok(e: React.FormEvent) {
    e.preventDefault();
    const j = parseFloat(jumlahKg);
    const h = parseInt(hargaPerKg, 10);
    if (isNaN(j) || j <= 0 || isNaN(h) || h <= 0) return;

    let fotoUrl: string | null = null;
    if (fotoTambah) {
      const unggahan = await unggahBerkas.mutateAsync({
        nama: fotoTambah.nama,
        jenis: fotoTambah.jenis,
        isi: fotoTambah.dataUrl,
      });
      fotoUrl = unggahan.url;
    }

    await tambahStok.mutateAsync({
      komoditas_id: komoditasId,
      jumlah_kg: j,
      harga_per_kg: h,
      tanggal_panen: tanggalPanen,
      catatan: catatan.trim() || undefined,
      foto: fotoUrl,
    });

    setBukaForm(false);
    setFotoTambah(null);
    setPesanSukses('Stok siap jual berhasil ditambahkan');
    setTimeout(() => setPesanSukses(''), 4000);
  }

  function bukaUbahStok(s: StokRingkas) {
    setStokSedangDiubah(s);
    setHargaUbah(String(s.harga_per_kg));
    setStatusUbah(s.status);
    setFotoUbah(null);
    setFotoUbahDihapus(false);
  }

  async function handleSimpanUbahStok(e: React.FormEvent) {
    e.preventDefault();
    if (!stokSedangDiubah) return;
    const h = parseInt(hargaUbah, 10);
    if (isNaN(h) || h <= 0) return;

    let fotoUrl: string | null | undefined = undefined;
    if (fotoUbah) {
      const unggahan = await unggahBerkas.mutateAsync({
        nama: fotoUbah.nama,
        jenis: fotoUbah.jenis,
        isi: fotoUbah.dataUrl,
      });
      fotoUrl = unggahan.url;
    } else if (fotoUbahDihapus) {
      fotoUrl = null;
    }

    await ubahStok.mutateAsync({
      id: stokSedangDiubah.id,
      harga_per_kg: h,
      status: statusUbah,
      foto: fotoUrl,
    });

    setStokSedangDiubah(null);
    setPesanSukses('Stok siap jual berhasil diperbarui');
    setTimeout(() => setPesanSukses(''), 4000);
  }

  async function handleTarikStok(id: string) {
    if (!confirm('Apakah kamu yakin ingin menarik stok ini dari pasar?')) return;
    await ubahStok.mutateAsync({ id, status: 'ditarik' });
  }

  async function handleAktifkanStok(id: string) {
    await ubahStok.mutateAsync({ id, status: 'tersedia' });
  }

  const pesananMenunggu = daftarPesanan.filter((p) => p.status === 'menunggu');

  return (
    <KerangkaPesanan
      keterangan={
        <span>
          Jual panen berlebih atau panen cepat siap antar ke pembeli sekitar secara langsung termasuk COD.
        </span>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Banner informasi pemisah konsep */}
        <div className="rounded-xl border border-daun/30 bg-daun-lembut p-4 text-isi text-daun-tua shadow-kartu">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-daun/20 text-daun-tua">
              <Ikon nama="panen" ukuran={20} />
            </div>
            <div>
              <p className="font-semibold text-isi">Stok siap jual (bukan pesan sebelum tanam)</p>
              <p className="mt-0.5 text-keterangan text-teks-pendukung">
                Bagian ini khusus untuk hasil panen yang sudah ada atau siap panen sekarang. Pembeli dapat langsung memesan dengan metode Bayar di Tempat (COD) atau Bayar di Aplikasi.
              </p>
            </div>
          </div>
        </div>

        {pesanSukses ? (
          <div className="rounded-lg bg-daun-lembut p-4 text-daun-tua border border-daun text-isi">
            {pesanSukses}
          </div>
        ) : null}

        {/* Tab Sub-menu Petani */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTabAktif('stok')}
              className={cx(
                'fokus-cincin rounded-full px-5 py-2 font-semibold text-isi transition-all duration-sedang ease-keluar',
                tabAktif === 'stok'
                  ? 'bg-daun-tua text-putih shadow-kartu'
                  : 'bg-putih text-teks-pendukung border border-garis hover:bg-embun-pagi hover:text-teks'
              )}
            >
              Stok saya ({daftarStok.length})
            </button>
            <button
              type="button"
              onClick={() => setTabAktif('pesanan')}
              className={cx(
                'fokus-cincin relative rounded-full px-5 py-2 font-semibold text-isi transition-all duration-sedang ease-keluar',
                tabAktif === 'pesanan'
                  ? 'bg-daun-tua text-putih shadow-kartu'
                  : 'bg-putih text-teks-pendukung border border-garis hover:bg-embun-pagi hover:text-teks'
              )}
            >
              Pesanan masuk ({daftarPesanan.length})
              {pesananMenunggu.length > 0 ? (
                <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-tanah px-1.5 text-keterangan font-semibold text-putih">
                  {pesananMenunggu.length}
                </span>
              ) : null}
            </button>
          </div>

          {tabAktif === 'stok' ? (
            <button
              id="tombol-buka-form-stok"
              type="button"
              onClick={() => setBukaForm(!bukaForm)}
              className="fokus-cincin inline-flex items-center gap-1.5 rounded-lg bg-daun-tua px-4 py-2 text-isi font-semibold text-putih hover:bg-daun-tua/90 shadow-kartu"
            >
              <span>{bukaForm ? 'Batal' : '+ Tambah stok siap jual'}</span>
            </button>
          ) : null}
        </div>

        {/* Formulir Tambah Stok */}
        {bukaForm ? (
          <form
            onSubmit={handleSimpanStok}
            className="flex flex-col gap-4 rounded-xl border border-garis bg-putih p-5 shadow-kartu"
          >
            <h2 className="text-judul-bagian font-semibold text-teks">Tambah stok siap jual</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="komoditas-stok" className="block text-keterangan font-medium text-teks-pendukung mb-1">
                  Komoditas
                </label>
                <select
                  id="komoditas-stok"
                  value={komoditasId}
                  onChange={(e) => setKomoditasId(e.target.value)}
                  className="w-full rounded-lg border border-garis bg-putih p-2.5 text-isi text-teks focus:border-daun focus:ring-1 focus:ring-daun"
                >
                  {kueriKomoditas.data?.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="panen-stok" className="block text-keterangan font-medium text-teks-pendukung mb-1">
                  Tanggal Panen
                </label>
                <input
                  id="panen-stok"
                  type="date"
                  value={tanggalPanen}
                  onChange={(e) => setTanggalPanen(e.target.value)}
                  className="w-full rounded-lg border border-garis bg-putih p-2.5 text-isi text-teks focus:border-daun focus:ring-1 focus:ring-daun"
                  required
                />
              </div>

              <div>
                <label htmlFor="jumlah-stok" className="block text-keterangan font-medium text-teks-pendukung mb-1">
                  Jumlah Stok (kg)
                </label>
                <input
                  id="jumlah-stok"
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={jumlahKg}
                  onChange={(e) => setJumlahKg(e.target.value)}
                  placeholder="Contoh: 25"
                  className="w-full rounded-lg border border-garis bg-putih p-2.5 text-isi text-teks focus:border-daun focus:ring-1 focus:ring-daun"
                  required
                />
              </div>

              <div>
                <label htmlFor="harga-stok" className="block text-keterangan font-medium text-teks-pendukung mb-1">
                  Harga per kg
                </label>
                <input
                  id="harga-stok"
                  type="number"
                  step="500"
                  min="500"
                  value={hargaPerKg}
                  onChange={(e) => setHargaPerKg(e.target.value)}
                  placeholder="Contoh: 12000"
                  className="w-full rounded-lg border border-garis bg-putih p-2.5 text-isi text-teks focus:border-daun focus:ring-1 focus:ring-daun"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="catatan-stok" className="block text-keterangan font-medium text-teks-pendukung mb-1">
                Catatan kualitas atau kemasan (opsional)
              </label>
              <textarea
                id="catatan-stok"
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Misal: Baru dipanen pagi ini, sudah dibersihkan dan dikemas per 5 kg"
                className="w-full rounded-lg border border-garis bg-putih p-2.5 text-isi text-teks focus:border-daun focus:ring-1 focus:ring-daun"
              />
            </div>

            <div>
              <span className="block text-keterangan font-medium text-teks-pendukung mb-1.5">
                Foto hasil panen (opsional)
              </span>
              {fotoTambah ? (
                <div className="relative mb-2 flex h-40 w-full max-w-xs items-center justify-center overflow-hidden rounded-xl border border-garis bg-embun-pagi">
                  <img
                    src={fotoTambah.dataUrl}
                    alt="Pratinjau foto stok"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFotoTambah(null)}
                    className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-tomat px-2.5 py-1 text-keterangan font-semibold text-putih hover:bg-tomat/90 focus:outline-none"
                    aria-label="Hapus foto"
                  >
                    <Ikon nama="silang" ukuran={14} />
                    <span>Hapus foto</span>
                  </button>
                </div>
              ) : (
                <AmbilFoto
                  label="Tambah foto hasil panen"
                  labelMemuat="Mengecilkan foto..."
                  onFoto={setFotoTambah}
                  className="max-w-xs"
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setBukaForm(false);
                  setFotoTambah(null);
                }}
                className="rounded-lg border border-garis px-4 py-2 text-isi font-medium text-teks hover:bg-embun-pagi"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={tambahStok.isPending || unggahBerkas.isPending}
                className="rounded-lg bg-daun-tua px-5 py-2 text-isi font-semibold text-putih hover:bg-daun-tekan shadow-kartu disabled:opacity-50"
              >
                {tambahStok.isPending || unggahBerkas.isPending ? 'Menyimpan...' : 'Simpan dan jual'}
              </button>
            </div>
          </form>
        ) : null}

        {/* Konten Tab Stok Saya */}
        {tabAktif === 'stok' ? (
          <div key="stok" className="flex flex-col gap-4 animate-masuk-halaman">
            {daftarStok.length === 0 ? (
              <div className="rounded-xl border border-dashed border-garis bg-putih p-8 text-center">
                <p className="text-isi font-medium text-teks">Belum ada stok siap jual yang kamu daftarkan.</p>
                <p className="mt-1 text-keterangan text-teks-pendukung">
                  Tambahkan hasil panen siap antar agar pembeli di sekitar desa dapat langsung memesan.
                </p>
                <button
                  type="button"
                  onClick={() => setBukaForm(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-daun-tua px-4 py-2 text-isi font-semibold text-putih hover:bg-daun-tekan shadow-kartu"
                >
                  + Tambah stok sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {daftarStok.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col justify-between rounded-xl border border-garis bg-putih p-4 shadow-kartu"
                  >
                    <div>
                      <GambarStok
                        foto={s.foto}
                        komoditasId={s.komoditas_id}
                        namaKomoditas={s.komoditas?.nama}
                        wadahClassName="mb-3 h-32 w-full rounded-lg"
                      />
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-judul-bagian text-teks capitalize">
                            {s.komoditas?.nama ?? s.komoditas_id}
                          </h3>
                          <p className="text-keterangan text-teks-pendukung">
                            Panen: {s.tanggal_panen}
                          </p>
                        </div>
                        <span
                          className={cx(
                            'rounded-full px-2.5 py-0.5 text-keterangan font-semibold capitalize',
                            s.status === 'tersedia'
                              ? 'bg-daun-lembut text-daun-tua'
                              : s.status === 'habis'
                              ? 'bg-garis text-teks-pendukung'
                              : 'bg-tanah-lembut text-tanah'
                          )}
                        >
                          {s.status}
                        </span>
                      </div>

                      <div className="my-3 flex items-baseline justify-between rounded-lg bg-embun-pagi p-3">
                        <div>
                          <span className="text-keterangan text-teks-pendukung block">Sisa stok</span>
                          <span className="text-judul-bagian font-bold text-daun-tua">
                            {s.sisa_kg} <span className="text-keterangan font-normal">/ {s.jumlah_kg} kg</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-keterangan text-teks-pendukung block">Harga</span>
                          <span className="text-judul-bagian font-bold text-teks">
                            {formatRupiah(s.harga_per_kg)}
                            <span className="text-keterangan font-normal text-teks-pendukung"> /kg</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-garis pt-3">
                      <button
                        type="button"
                        onClick={() => bukaUbahStok(s)}
                        className="rounded-lg border border-garis px-3 py-1.5 text-keterangan font-medium text-teks hover:bg-embun-pagi"
                      >
                        Ubah
                      </button>
                      {s.status === 'tersedia' ? (
                        <button
                          type="button"
                          onClick={() => handleTarikStok(s.id)}
                          className="rounded-lg border border-tomat/30 bg-tomat/10 px-3 py-1.5 text-keterangan font-medium text-tomat hover:bg-tomat/20"
                        >
                          Tarik dari pasar
                        </button>
                      ) : s.status === 'ditarik' ? (
                        <button
                          type="button"
                          onClick={() => handleAktifkanStok(s.id)}
                          className="rounded-lg bg-daun-lembut px-3 py-1.5 text-keterangan font-medium text-daun-tua hover:bg-daun-lembut/80"
                        >
                          Aktifkan kembali
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Modal Dialog Ubah Stok */}
        {stokSedangDiubah
          ? createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-teks/50 p-4 animate-masuk-halaman">
                <div
                  style={{ borderRadius: '24px', maxWidth: '480px' }}
                  className="w-full max-w-dialog overflow-hidden rounded-3xl bg-putih p-6 shadow-kartu-angkat animate-masuk-halaman"
                >
                  <div className="flex items-start justify-between border-b border-garis pb-3">
                    <div>
                      <h3 className="text-judul-bagian font-bold text-teks capitalize">
                        Ubah Stok {stokSedangDiubah.komoditas?.nama ?? stokSedangDiubah.komoditas_id}
                      </h3>
                      <p className="text-keterangan text-teks-pendukung mt-0.5">
                        Tersedia {stokSedangDiubah.sisa_kg} kg dari {stokSedangDiubah.jumlah_kg} kg
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStokSedangDiubah(null)}
                      aria-label="Tutup modal"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-teks-pendukung hover:bg-embun-pagi hover:text-teks transition-colors"
                    >
                      <Ikon nama="silang" ukuran={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSimpanUbahStok} className="mt-4 flex flex-col gap-4">
                    <div>
                      <label htmlFor="ubah-harga-stok" className="block text-keterangan font-medium text-teks-pendukung mb-1.5">
                        Harga per kg (Rp)
                      </label>
                      <input
                        id="ubah-harga-stok"
                        type="number"
                        step="500"
                        min="500"
                        value={hargaUbah}
                        onChange={(e) => setHargaUbah(e.target.value)}
                        className="w-full rounded-xl border border-garis bg-putih px-4 py-2.5 text-isi text-teks focus:border-daun focus:ring-1 focus:ring-daun outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="ubah-status-stok" className="block text-keterangan font-medium text-teks-pendukung mb-1.5">
                        Status stok
                      </label>
                      <select
                        id="ubah-status-stok"
                        value={statusUbah}
                        onChange={(e) => setStatusUbah(e.target.value as StatusStok)}
                        className="w-full rounded-xl border border-garis bg-putih px-4 py-2.5 text-isi text-teks focus:border-daun focus:ring-1 focus:ring-daun outline-none"
                      >
                        <option value="tersedia">Tersedia untuk dijual</option>
                        <option value="habis">Habis terjual</option>
                        <option value="ditarik">Ditarik dari pasar (sementara)</option>
                      </select>
                    </div>

                    <div>
                      <span className="block text-keterangan font-medium text-teks-pendukung mb-1.5">
                        Foto hasil panen
                      </span>
                      {fotoUbah ? (
                        <div className="relative mb-2 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-garis bg-embun-pagi">
                          <img
                            src={fotoUbah.dataUrl}
                            alt="Pratinjau foto baru"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFotoUbah(null);
                              setFotoUbahDihapus(true);
                            }}
                            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-tomat px-2.5 py-1 text-keterangan font-semibold text-putih hover:bg-tomat/90"
                            aria-label="Hapus foto"
                          >
                            <Ikon nama="silang" ukuran={14} />
                            <span>Hapus foto</span>
                          </button>
                        </div>
                      ) : stokSedangDiubah.foto && !fotoUbahDihapus ? (
                        <div className="relative mb-2 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-garis bg-embun-pagi">
                          <img
                            src={stokSedangDiubah.foto}
                            alt="Foto stok saat ini"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFotoUbahDihapus(true)}
                            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-tomat px-2.5 py-1 text-keterangan font-semibold text-putih hover:bg-tomat/90"
                            aria-label="Hapus foto"
                          >
                            <Ikon nama="silang" ukuran={14} />
                            <span>Hapus foto</span>
                          </button>
                        </div>
                      ) : (
                        <AmbilFoto
                          label="Tambah / unggah foto stok"
                          labelMemuat="Mengecilkan foto..."
                          onFoto={(f) => {
                            setFotoUbah(f);
                            setFotoUbahDihapus(false);
                          }}
                        />
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-garis">
                      <button
                        type="button"
                        onClick={() => setStokSedangDiubah(null)}
                        className="rounded-xl border border-garis px-4 py-2.5 text-isi font-medium text-teks hover:bg-embun-pagi"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={ubahStok.isPending || unggahBerkas.isPending}
                        className="rounded-xl bg-daun-tua px-5 py-2.5 text-isi font-semibold text-putih hover:bg-daun-tekan shadow-kartu disabled:opacity-50"
                      >
                        {ubahStok.isPending || unggahBerkas.isPending ? 'Menyimpan...' : 'Simpan perubahan'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body,
            )
          : null}

        {/* Konten Tab Pesanan Masuk */}
        {tabAktif === 'pesanan' ? (
          <div key="pesanan" className="flex flex-col gap-4 animate-masuk-halaman">
            {daftarPesanan.length === 0 ? (
              <div className="rounded-xl border border-dashed border-garis bg-putih p-8 text-center">
                <p className="text-isi font-medium text-teks">Belum ada pesanan masuk untuk stok siap jual.</p>
                <p className="mt-1 text-keterangan text-teks-pendukung">
                  Pesanan dari pembeli akan muncul di sini beserta pilihan metode pembayaran (COD atau bayar di aplikasi).
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {daftarPesanan.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col justify-between rounded-xl border border-garis bg-putih p-4 shadow-kartu md:flex-row md:items-center gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-teks">{p.komoditas_nama ?? 'Komoditas'}</span>
                        <span className="text-keterangan text-teks-pendukung">· ID: {p.id}</span>
                        <span
                          className={cx(
                            'rounded-full px-2.5 py-0.5 text-keterangan font-semibold uppercase',
                            p.metode_bayar === 'cod'
                              ? 'bg-tanah-lembut text-tanah border border-tanah/30'
                              : 'bg-daun-lembut text-daun-tua border border-daun/30'
                          )}
                        >
                          {p.metode_bayar === 'cod' ? 'COD (bayar di tempat)' : 'Bayar di aplikasi'}
                        </span>
                        <span
                          className={cx(
                            'rounded-full px-2.5 py-0.5 text-keterangan font-medium capitalize',
                            p.status === 'menunggu'
                              ? 'bg-tanah-lembut text-tanah'
                              : p.status === 'diterima' || p.status === 'dikirim'
                              ? 'bg-daun-lembut text-daun-tua'
                              : p.status === 'selesai'
                              ? 'bg-daun text-putih'
                              : 'bg-tomat/10 text-tomat'
                          )}
                        >
                          {p.status}
                        </span>
                      </div>

                      <div className="mt-2 text-isi text-teks">
                        <span>
                          <strong>{p.jumlah_kg} kg</strong> × {formatRupiah(p.harga_per_kg)} ={' '}
                          <span className="font-bold text-daun-tua">{formatRupiah(p.nilai)}</span>
                        </span>
                      </div>

                      <div className="mt-1 text-keterangan text-teks-pendukung">
                        <p>Pembeli: <strong>{p.nama_pembeli ?? 'Pembeli'}</strong></p>
                        <p>Alamat antar: {p.alamat_antar}</p>
                        {p.alasan_batal ? (
                          <p className="text-tomat mt-0.5">Alasan: {p.alasan_batal}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {p.status === 'menunggu' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => terimaPesanan.mutate(p.id)}
                            disabled={terimaPesanan.isPending}
                            className="rounded-lg bg-daun-tua px-4 py-2 text-isi font-semibold text-putih hover:bg-daun-tekan shadow-kartu"
                          >
                            Terima
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const alasan = prompt('Alasan menolak pesanan:', 'Stok tidak memadai');
                              if (alasan) tolakPesanan.mutate({ id: p.id, alasan });
                            }}
                            disabled={tolakPesanan.isPending}
                            className="rounded-lg border border-tomat/30 bg-tomat/10 px-4 py-2 text-isi font-medium text-tomat hover:bg-tomat/20"
                          >
                            Tolak
                          </button>
                        </>
                      ) : null}

                      {p.status === 'diterima' ? (
                        <button
                          type="button"
                          onClick={() => kirimPesanan.mutate(p.id)}
                          disabled={kirimPesanan.isPending}
                          className="rounded-lg bg-daun-tua px-4 py-2 text-isi font-semibold text-putih hover:bg-daun-tua/90 shadow-kartu"
                        >
                          Tandai dikirim
                        </button>
                      ) : null}

                      {p.status === 'dikirim' ? (
                        <span className="text-keterangan text-teks-pendukung italic">
                          Menunggu konfirmasi penerimaan oleh pembeli
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </KerangkaPesanan>
  );
}
