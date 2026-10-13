import { useRouteError } from 'react-router-dom';
import { Tombol } from '../komponen/tombol';
import { teksGagalMuat } from '../teks/galat-api';
import { teksUmum } from '../teks/umum';

export function Galat() {
  const galat = useRouteError();
  return (
    <main className="mx-auto flex max-w-dialog flex-col gap-4 p-4">
      <h1 className="m-0 text-judul-halaman font-semibold">{teksUmum.galatJudul}</h1>
      <p className="m-0 text-teks-pendukung">{teksGagalMuat(galat)}</p>
      <Tombol onClick={() => window.location.reload()}>{teksUmum.muatUlang}</Tombol>
    </main>
  );
}
