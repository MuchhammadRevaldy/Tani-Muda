import { Link } from 'react-router-dom';
import { teksUmum } from '../teks/umum';

export function TidakDitemukan() {
  return (
    <main className="mx-auto flex max-w-dialog flex-col gap-4 p-4">
      <h1 className="m-0 text-judul-halaman font-semibold">{teksUmum.tidakDitemukanJudul}</h1>
      <p className="m-0 text-teks-pendukung">{teksUmum.tidakDitemukanIsi}</p>
      <Link
        to="/beranda"
        className="fokus-cincin inline-flex min-h-kontrol items-center justify-center self-start rounded-md bg-daun-tua px-5 font-semibold text-putih no-underline hover:bg-daun-tekan hover:text-putih"
      >
        {teksUmum.kembaliKeBeranda}
      </Link>
    </main>
  );
}
