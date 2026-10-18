import { Ikon } from './ikon';
import { Kartu } from './kartu';
import { fiturAktif } from '../lib/fitur';
import { useHargaBerita } from '../api/kueri';
import { formatRupiah, formatTanggal } from '../lib/format';

function formatTanggalAman(tgl?: string | null): string {
  if (!tgl) return '';
  try {
    const potong = tgl.slice(0, 10);
    return formatTanggal(potong, { tanpaHari: true, denganTahun: true });
  } catch {
    return tgl;
  }
}

export function WidgetHargaBerita({
  komoditasId,
  namaKomoditas,
  onGunakanHarga,
}: {
  komoditasId?: string;
  namaKomoditas?: string;
  onGunakanHarga?: (harga: number) => void;
}) {
  const aktif = fiturAktif('HARGA_BERITA');
  const beritaQ = useHargaBerita(komoditasId, aktif);

  if (!aktif) {
    return null;
  }

  const daftar = beritaQ.data ?? [];
  const beritaTerbaru = daftar[0];

  return (
    <div id="widget-harga-berita" className="fade-in">
      <Kartu
        judul="Harga di Berita Hari Ini"
        tingkatJudul={3}
        className="border-garis bg-putih shadow-kartu"
      >
        <div className="flex flex-col gap-3">
          {beritaTerbaru ? (
            <>
              {/* Baris Harga & Jenis */}
              <div className="flex items-baseline justify-between gap-2 border-b border-garis pb-2.5">
                <div className="flex flex-col">
                  <span className="text-keterangan text-teks-pendukung">
                    {namaKomoditas ? `Komoditas: ${namaKomoditas}` : 'Pantauan Pasar'}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-judul-halaman font-bold text-daun-tua">
                      {formatRupiah(beritaTerbaru.harga)}
                    </span>
                    <span className="text-isi text-teks-pendukung">/ {beritaTerbaru.satuan}</span>
                  </div>
                </div>
                <span className="rounded-full bg-embun-pagi px-2.5 py-1 text-keterangan font-medium capitalize text-teks-pendukung">
                  {beritaTerbaru.jenis_harga}
                </span>
              </div>

              {/* Rincian Lokasi, Tanggal, dan Media */}
              <div className="flex flex-col gap-2 pt-0.5 text-keterangan">
                {/* Lokasi mandiri dengan ikon pin agar tidak bertabrakan */}
                <div className="flex min-w-0 items-center gap-1.5 text-teks">
                  <Ikon nama="pin" ukuran={15} className="shrink-0 text-daun-tua" />
                  <span className="truncate font-medium">{beritaTerbaru.lokasi}</span>
                </div>

                {/* Tanggal & Sumber Media */}
                <div className="flex items-center justify-between gap-2 text-teks-pendukung">
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Ikon nama="kalender" ukuran={14} className="shrink-0" />
                    <span>{formatTanggalAman(beritaTerbaru.tanggal_berita)}</span>
                  </div>
                  <span className="max-w-40 truncate rounded bg-embun-pagi px-2 py-0.5 font-medium text-teks-pendukung">
                    {beritaTerbaru.media}
                  </span>
                </div>

                {/* Tautan Berita Portal Resmi */}
                <div className="flex items-center justify-between gap-2 border-t border-garis/60 pt-2">
                  <span className="truncate text-teks font-medium" title={beritaTerbaru.judul}>
                    {beritaTerbaru.judul}
                  </span>
                  <a
                    href={beritaTerbaru.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fokus-cincin inline-flex shrink-0 items-center gap-1 font-semibold text-daun-tua hover:underline"
                  >
                    <span>Baca berita</span>
                    <Ikon nama="panah-kanan" ukuran={14} />
                  </a>
                </div>

                {/* Tombol Terapkan ke Kalkulator (bila handler tersedia) */}
                {onGunakanHarga ? (
                  <button
                    type="button"
                    onClick={() => onGunakanHarga(beritaTerbaru.harga)}
                    className="fokus-cincin mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border border-daun-tua/20 bg-daun-lembut px-3 py-1.5 font-semibold text-daun-tua transition hover:bg-daun-lembut/80"
                  >
                    <Ikon nama="uang" ukuran={16} />
                    <span>Pakai harga ini di kalkulator</span>
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <span className="text-isi text-teks-pendukung">
                Belum ada kabar harga hari ini.
              </span>
            </div>
          )}

          <div className="rounded-lg bg-embun-pagi p-2.5 text-keterangan font-medium text-teks-pendukung">
            <span className="font-semibold text-teks">Catatan:</span> Harga pasar dari berita, bukan
            harga di tingkat petani.
          </div>
        </div>
      </Kartu>
    </div>
  );
}
