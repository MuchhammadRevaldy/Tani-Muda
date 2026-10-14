import { useState } from 'react';
import {
  useBatalkanPesananStok,
  useBeliStok,
  useKomoditas,
  usePesananStokSaya,
  useSelesaiPesananStok,
  useStokSekitar,
} from '../../api/kueri';
import type { MetodeBayarStok, PesananStok, StokRingkas } from '../../api/tipe';
import { cx } from '../../komponen/gabung-kelas';
import { formatRupiah } from '../../lib/format';

export function HalamanStokPembeli() {
  const [tabAktif, setTabAktif] = useState<'katalog' | 'pesanan'>('katalog');
  const [komoditasPilihan, setKomoditasPilihan] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number>(15);

  // Dialog pemesanan
  const [stokDipilih, setStokDipilih] = useState<StokRingkas | null>(null);
  const [jumlahKg, setJumlahKg] = useState('5');
  const [metodeBayar, setMetodeBayar] = useState<MetodeBayarStok>('cod');
  const [alamatAntar, setAlamatAntar] = useState('Jl. Cihampelas No. 20, Bandung');
  const [pesanSukses, setPesanSukses] = useState('');
  const [galatBeli, setGalatBeli] = useState('');

  // Kueri
  const kueriKomoditas = useKomoditas();
  const kueriStok = useStokSekitar(komoditasPilihan || undefined, radiusKm);
  const kueriPesanan = usePesananStokSaya();

  const beliStok = useBeliStok();
  const selesaiPesanan = useSelesaiPesananStok();
  const batalkanPesanan = useBatalkanPesananStok();

  const daftarStok: StokRingkas[] = kueriStok.data ?? [];
  const daftarPesanan: PesananStok[] = kueriPesanan.data ?? [];

  async function handleKirimPesanan(e: React.FormEvent) {
    e.preventDefault();
    if (!stokDipilih) return;
    setGalatBeli('');

    const j = parseFloat(jumlahKg);
    if (isNaN(j) || j <= 0 || j > stokDipilih.sisa_kg) {
      setGalatBeli(`Jumlah beli harus antara 0,1 dan ${stokDipilih.sisa_kg} kg`);
      return;
    }
    if (!alamatAntar.trim()) {
      setGalatBeli('Alamat antar wajib diisi');
      return;
    }

    try {
      await beliStok.mutateAsync({
        id: stokDipilih.id,
        jumlah_kg: j,
        metode_bayar: metodeBayar,
        alamat_antar: alamatAntar.trim(),
      });

      setStokDipilih(null);
      setTabAktif('pesanan');
      setPesanSukses(
        metodeBayar === 'cod'
          ? 'Pesanan COD berhasil dibuat. Siapkan uang tunai saat petani mengantar panen.'
          : 'Pesanan berhasil dibuat. Dana pembayaran ditahan dengan aman di aplikasi.'
      );
      setTimeout(() => setPesanSukses(''), 6000);
    } catch (err: unknown) {
      const p = err instanceof Error ? err.message : 'Gagal membeli stok';
      setGalatBeli(p);
    }
  }

  const pesananAktif = daftarPesanan.filter((p) =>
    ['menunggu', 'diterima', 'dikirim'].includes(p.status)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-1">
        <h1 className="text-judul-halaman font-bold text-teks">Stok Siap Jual di Sekitar Anda</h1>
        <p className="text-keterangan text-teks-pendukung">
          Beli langsung hasil panen segar yang sudah siap dari petani terdekat. Pengiriman cepat, dukung COD (Bayar di Tempat) atau bayar aman lewat aplikasi.
        </p>
      </div>

      {pesanSukses ? (
        <div className="rounded-xl border border-daun/40 bg-daun-lembut p-4 text-daun-tua shadow-kartu text-isi">
          {pesanSukses}
        </div>
      ) : null}

      {/* Tab Navigasi */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTabAktif('katalog')}
            className={cx(
              'fokus-cincin rounded-lg px-4 py-2 text-isi font-medium transition-colors',
              tabAktif === 'katalog'
                ? 'bg-daun text-putih shadow-kartu'
                : 'bg-putih text-teks-pendukung border border-garis hover:bg-embun-pagi'
            )}
          >
            Katalog Panen ({daftarStok.length})
          </button>
          <button
            type="button"
            onClick={() => setTabAktif('pesanan')}
            className={cx(
              'fokus-cincin relative rounded-lg px-4 py-2 text-isi font-medium transition-colors',
              tabAktif === 'pesanan'
                ? 'bg-daun text-putih shadow-kartu'
                : 'bg-putih text-teks-pendukung border border-garis hover:bg-embun-pagi'
            )}
          >
            Pesanan Saya ({daftarPesanan.length})
            {pesananAktif.length > 0 ? (
              <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-tanah px-1.5 text-keterangan font-semibold text-putih">
                {pesananAktif.length}
              </span>
            ) : null}
          </button>
        </div>

        {tabAktif === 'katalog' ? (
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Pilih komoditas"
              value={komoditasPilihan}
              onChange={(e) => setKomoditasPilihan(e.target.value)}
              className="rounded-lg border border-garis bg-putih px-3 py-2 text-isi text-teks"
            >
              <option value="">Semua Komoditas</option>
              {kueriKomoditas.data?.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>

            <select
              aria-label="Radius jarak"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="rounded-lg border border-garis bg-putih px-3 py-2 text-isi text-teks"
            >
              <option value={10}>Radius 10 km</option>
              <option value={15}>Radius 15 km</option>
            </select>
          </div>
        ) : null}
      </div>

      {/* Konten Tab Katalog */}
      {tabAktif === 'katalog' ? (
        <div className="flex flex-col gap-4">
          {daftarStok.length === 0 ? (
            <div className="rounded-xl border border-dashed border-garis bg-putih p-10 text-center">
              <span className="text-judul-halaman">🌱</span>
              <p className="mt-2 text-isi font-semibold text-teks">Belum ada stok siap jual di sekitar Anda.</p>
              <p className="text-keterangan text-teks-pendukung">
                Coba perluas radius pencarian atau pilih komoditas lain.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {daftarStok.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col justify-between rounded-xl border border-garis bg-putih p-5 shadow-kartu"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-judul-bagian font-bold text-teks capitalize">
                          {s.komoditas?.nama ?? s.komoditas_id}
                        </h3>
                        <p className="text-keterangan text-teks-pendukung mt-0.5">
                          Petani: <span className="font-semibold text-teks">{s.nama_petani ?? 'Petani'}</span>
                        </p>
                        <p className="text-keterangan text-teks-pendukung">
                          Lokasi: {s.desa ?? 'Desa'}, {s.kecamatan ?? 'Kecamatan'}
                        </p>
                      </div>

                      {s.jarak_km != null ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-daun-lembut px-2.5 py-1 text-keterangan font-semibold text-daun-tua">
                          📍 {s.jarak_km} km
                        </span>
                      ) : null}
                    </div>

                    <div className="my-4 flex items-baseline justify-between rounded-lg bg-embun-pagi p-3">
                      <div>
                        <span className="text-keterangan text-teks-pendukung block">Sisa Stok Siap Antar</span>
                        <span className="text-judul-bagian font-bold text-daun-tua">{s.sisa_kg} kg</span>
                      </div>
                      <div className="text-right">
                        <span className="text-keterangan text-teks-pendukung block">Harga per kg</span>
                        <span className="text-judul-bagian font-bold text-teks">
                          {formatRupiah(s.harga_per_kg)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-garis pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStokDipilih(s);
                        setJumlahKg(String(Math.min(5, s.sisa_kg)));
                        setGalatBeli('');
                      }}
                      className="fokus-cincin w-full rounded-lg bg-daun py-2.5 text-center text-isi font-semibold text-putih hover:bg-daun/90 shadow-kartu"
                    >
                      Beli Panen Ini
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Konten Tab Pesanan Saya */}
      {tabAktif === 'pesanan' ? (
        <div className="flex flex-col gap-4">
          {daftarPesanan.length === 0 ? (
            <div className="rounded-xl border border-dashed border-garis bg-putih p-10 text-center">
              <span className="text-judul-halaman">🛒</span>
              <p className="mt-2 text-isi font-semibold text-teks">Belum ada pesanan stok siap jual.</p>
              <p className="text-keterangan text-teks-pendukung">
                Silakan jelajahi katalog panen untuk memesan hasil panen segar langsung dari petani.
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
                      <span className="font-bold text-teks">{p.komoditas_nama ?? 'Komoditas'}</span>
                      <span className="text-keterangan text-teks-pendukung">· ID: {p.id}</span>
                      <span
                        className={cx(
                          'rounded-full px-2.5 py-0.5 text-keterangan font-semibold uppercase',
                          p.metode_bayar === 'cod'
                            ? 'bg-tanah-lembut text-tanah border border-tanah/30'
                            : 'bg-daun-lembut text-daun-tua border border-daun/30'
                        )}
                      >
                        {p.metode_bayar === 'cod' ? 'COD (Bayar di Tempat)' : 'Bayar di Aplikasi'}
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
                      <p>Petani: <strong>{p.nama_petani ?? 'Petani'}</strong></p>
                      <p>Alamat antar: {p.alamat_antar}</p>
                      {p.alasan_batal ? (
                        <p className="text-tomat mt-0.5 font-medium">Alasan batal: {p.alasan_batal}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {p.status === 'menunggu' ? (
                      <button
                        type="button"
                        onClick={() => {
                          const alasan = prompt('Alasan pembatalan pesanan:', 'Berubah pikiran');
                          if (alasan) batalkanPesanan.mutate({ id: p.id, alasan });
                        }}
                        disabled={batalkanPesanan.isPending}
                        className="rounded-lg border border-tomat/30 bg-tomat/10 px-4 py-2 text-isi font-medium text-tomat hover:bg-tomat/20"
                      >
                        Batalkan Pesanan
                      </button>
                    ) : null}

                    {p.status === 'dikirim' ? (
                      <button
                        type="button"
                        onClick={() => selesaiPesanan.mutate(p.id)}
                        disabled={selesaiPesanan.isPending}
                        className="rounded-lg bg-daun px-4 py-2 text-isi font-bold text-putih hover:bg-daun/90 shadow-kartu"
                      >
                        Konfirmasi Diterima dan Selesai
                      </button>
                    ) : null}

                    {p.status === 'selesai' ? (
                      <span className="text-isi font-semibold text-daun-tua bg-daun-lembut px-3 py-1.5 rounded-lg border border-daun">
                        ✓ Transaksi Selesai
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Modal Dialog Pembelian */}
      {stokDipilih ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-teks/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-putih p-6 shadow-kartu">
            <div className="flex items-start justify-between border-b border-garis pb-3">
              <div>
                <h3 className="text-judul-bagian font-bold text-teks capitalize">
                  Beli {stokDipilih.komoditas?.nama ?? stokDipilih.komoditas_id}
                </h3>
                <p className="text-keterangan text-teks-pendukung mt-0.5">
                  Dari {stokDipilih.nama_petani ?? 'Petani'} (Tersisa {stokDipilih.sisa_kg} kg)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStokDipilih(null)}
                className="rounded-full p-2 text-teks-pendukung hover:bg-embun-pagi"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleKirimPesanan} className="mt-4 flex flex-col gap-4">
              {galatBeli ? (
                <div className="rounded-lg bg-tomat/10 p-3 text-isi text-tomat border border-tomat/30">
                  {galatBeli}
                </div>
              ) : null}

              <div>
                <label htmlFor="beli-kg" className="block text-keterangan font-medium text-teks-pendukung mb-1">
                  Jumlah yang Ingin Dibeli (kg)
                </label>
                <div className="relative">
                  <input
                    id="beli-kg"
                    type="number"
                    step="0.5"
                    min="0.1"
                    max={stokDipilih.sisa_kg}
                    value={jumlahKg}
                    onChange={(e) => setJumlahKg(e.target.value)}
                    className="w-full rounded-lg border border-garis bg-putih p-2.5 text-isi text-teks focus:border-daun focus:ring-1 focus:ring-daun"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-isi font-medium text-teks-pendukung">
                    kg
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-keterangan font-medium text-teks-pendukung mb-1">
                  Metode Pembayaran
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={cx(
                      'flex cursor-pointer flex-col rounded-xl border p-3 transition-colors',
                      metodeBayar === 'cod'
                        ? 'border-daun bg-daun-lembut'
                        : 'border-garis bg-putih hover:bg-embun-pagi'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="metode_bayar"
                        value="cod"
                        checked={metodeBayar === 'cod'}
                        onChange={() => setMetodeBayar('cod')}
                        className="text-daun focus:ring-daun"
                      />
                      <span className="font-semibold text-isi text-teks">COD</span>
                    </div>
                    <span className="mt-1 text-keterangan text-teks-pendukung">
                      Bayar tunai di tempat saat barang sampai
                    </span>
                  </label>

                  <label
                    className={cx(
                      'flex cursor-pointer flex-col rounded-xl border p-3 transition-colors',
                      metodeBayar === 'bayar_di_aplikasi'
                        ? 'border-daun bg-daun-lembut'
                        : 'border-garis bg-putih hover:bg-embun-pagi'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="metode_bayar"
                        value="bayar_di_aplikasi"
                        checked={metodeBayar === 'bayar_di_aplikasi'}
                        onChange={() => setMetodeBayar('bayar_di_aplikasi')}
                        className="text-daun focus:ring-daun"
                      />
                      <span className="font-semibold text-isi text-teks">Aplikasi</span>
                    </div>
                    <span className="mt-1 text-keterangan text-teks-pendukung">
                      Saldo ditahan aman sampai panen diterima
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="beli-alamat" className="block text-keterangan font-medium text-teks-pendukung mb-1">
                  Alamat Pengantaran
                </label>
                <textarea
                  id="beli-alamat"
                  rows={2}
                  value={alamatAntar}
                  onChange={(e) => setAlamatAntar(e.target.value)}
                  className="w-full rounded-lg border border-garis bg-putih p-2.5 text-isi text-teks focus:border-daun focus:ring-1 focus:ring-daun"
                  required
                />
              </div>

              {/* Rincian Total */}
              <div className="rounded-xl bg-embun-pagi p-4 border border-garis">
                <div className="flex items-baseline justify-between text-isi">
                  <span className="text-teks-pendukung">
                    Total Biaya ({parseFloat(jumlahKg) || 0} kg × {formatRupiah(stokDipilih.harga_per_kg)}):
                  </span>
                  <span className="text-judul-bagian font-bold text-daun-tua">
                    {formatRupiah(((parseFloat(jumlahKg) || 0) * stokDipilih.harga_per_kg))}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-garis">
                <button
                  type="button"
                  onClick={() => setStokDipilih(null)}
                  className="rounded-lg border border-garis px-4 py-2 text-isi font-medium text-teks hover:bg-embun-pagi"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={beliStok.isPending}
                  className="rounded-lg bg-daun px-5 py-2 text-isi font-bold text-putih hover:bg-daun/90 shadow-kartu disabled:opacity-50"
                >
                  {beliStok.isPending ? 'Memproses...' : 'Pasang Pesanan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
