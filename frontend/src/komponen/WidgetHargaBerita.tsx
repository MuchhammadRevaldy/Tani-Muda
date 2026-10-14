import { Ikon } from './ikon';
import { Kartu } from './kartu';
import { fiturAktif } from '../lib/fitur';
import { useHargaBerita } from '../api/kueri';
import { formatRupiah } from '../lib/format';

export function WidgetHargaBerita({
  komoditasId,
  namaKomoditas,
}: {
  komoditasId?: string;
  namaKomoditas?: string;
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

              <div className="flex flex-col gap-1.5 text-keterangan text-teks-pendukung">
                <div className="flex items-center gap-1.5">
                  <Ikon nama="peta" ukuran={14} />
                  <span>{beritaTerbaru.lokasi}</span>
                  <span>·</span>
                  <span>{beritaTerbaru.tanggal_berita}</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="truncate font-medium text-teks">{beritaTerbaru.media}</span>
                  <a
                    href={beritaTerbaru.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fokus-cincin inline-flex items-center gap-1 font-semibold text-daun-tua hover:underline"
                  >
                    <span>Baca berita</span>
                    <Ikon nama="panah-kanan" ukuran={14} />
                  </a>
                </div>
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
