import { useState } from 'react';
import {
  useKomoditas,
  useKirimPesananStok,
  usePesananStokSaya,
  useStokSaya,
  useTambahStok,
  useTerimaPesananStok,
  useTolakPesananStok,
  useUbahStok,
} from '../../api/kueri';
import type { PesananStok, StokRingkas } from '../../api/tipe';
import { cx } from '../../komponen/gabung-kelas';
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
  const [pesanSukses, setPesanSukses] = useState('');

  // Kueri
  const kueriStok = useStokSaya();
  const kueriPesanan = usePesananStokSaya();
  const kueriKomoditas = useKomoditas();

  const tambahStok = useTambahStok();
  const ubahStok = useUbahStok();
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

    await tambahStok.mutateAsync({
      komoditas_id: komoditasId,
      jumlah_kg: j,
      harga_per_kg: h,
      tanggal_panen: tanggalPanen,
      catatan: catatan.trim() || undefined,
    });

    setBukaForm(false);
    setPesanSukses('Stok siap jual berhasil ditambahkan');
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
            <span className="text-judul-bagian">📦</span>
            <div>
              <p className="font-semibold text-isi">Stok Siap Jual (Bukan Pesan Sebelum Tanam)</p>
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-garis pb-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTabAktif('stok')}
              className={cx(
                'fokus-cincin rounded-lg px-4 py-2 font-medium text-isi transition-colors',
                tabAktif === 'stok'
                  ? 'bg-daun text-putih shadow-kartu'
                  : 'bg-putih text-teks-pendukung border border-garis hover:bg-embun-pagi'
              )}
            >
              Stok Saya ({daftarStok.length})
            </button>
            <button
              type="button"
              onClick={() => setTabAktif('pesanan')}
              className={cx(
                'fokus-cincin relative rounded-lg px-4 py-2 font-medium text-isi transition-colors',
                tabAktif === 'pesanan'
                  ? 'bg-daun text-putih shadow-kartu'
                  : 'bg-putih text-teks-pendukung border border-garis hover:bg-embun-pagi'
              )}
            >
              Pesanan Masuk ({daftarPesanan.length})
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
              <span>{bukaForm ? 'Batal' : '+ Tambah Stok Siap Jual'}</span>
            </button>
          ) : null}
        </div>

        {/* Formulir Tambah Stok */}
        {bukaForm ? (
          <form
            onSubmit={handleSimpanStok}
            className="flex flex-col gap-4 rounded-xl border border-garis bg-putih p-5 shadow-kartu"
          >
            <h2 className="text-judul-bagian font-semibold text-teks">Tambah Stok Siap Jual</h2>
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
                Catatan Kualitas atau Kemasan (opsional)
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBukaForm(false)}
                className="rounded-lg border border-garis px-4 py-2 text-isi font-medium text-teks hover:bg-embun-pagi"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={tambahStok.isPending}
                className="rounded-lg bg-daun px-5 py-2 text-isi font-semibold text-putih hover:bg-daun/90 disabled:opacity-50"
              >
                {tambahStok.isPending ? 'Menyimpan...' : 'Simpan dan Jual'}
              </button>
            </div>
          </form>
        ) : null}

        {/* Konten Tab Stok Saya */}
        {tabAktif === 'stok' ? (
          <div className="flex flex-col gap-4">
            {daftarStok.length === 0 ? (
              <div className="rounded-xl border border-dashed border-garis bg-putih p-8 text-center">
                <p className="text-isi font-medium text-teks">Belum ada stok siap jual yang kamu daftarkan.</p>
                <p className="mt-1 text-keterangan text-teks-pendukung">
                  Tambahkan hasil panen siap antar agar pembeli di sekitar desa dapat langsung memesan.
                </p>
                <button
                  type="button"
                  onClick={() => setBukaForm(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-daun px-4 py-2 text-isi font-semibold text-putih hover:bg-daun/90"
                >
                  + Tambah Stok Sekarang
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
                          <span className="text-keterangan text-teks-pendukung block">Sisa Stok</span>
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
                      {s.status === 'tersedia' ? (
                        <button
                          type="button"
                          onClick={() => handleTarikStok(s.id)}
                          className="rounded-lg border border-tomat/30 bg-tomat/10 px-3 py-1.5 text-keterangan font-medium text-tomat hover:bg-tomat/20"
                        >
                          Tarik dari Pasar
                        </button>
                      ) : s.status === 'ditarik' ? (
                        <button
                          type="button"
                          onClick={() => handleAktifkanStok(s.id)}
                          className="rounded-lg bg-daun-lembut px-3 py-1.5 text-keterangan font-medium text-daun-tua hover:bg-daun-lembut/80"
                        >
                          Aktifkan Kembali
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Konten Tab Pesanan Masuk */}
        {tabAktif === 'pesanan' ? (
          <div className="flex flex-col gap-4">
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
                            className="rounded-lg bg-daun px-4 py-2 text-isi font-semibold text-putih hover:bg-daun/90 shadow-kartu"
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
                          Tandai Dikirim
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
