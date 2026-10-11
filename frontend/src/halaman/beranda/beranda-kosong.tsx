/** Beranda tanpa siklus aktif (papan 05, D-26: "Mulai siklus tanam pertamamu"). */
import { Link } from 'react-router-dom';
import { Ikon } from '../../komponen/ikon';
import { IlustrasiKebunKosong } from '../../komponen/ilustrasi-hero';
import { kelasTombol } from '../../komponen/tombol';
import { teksBeranda as t } from '../../teks/beranda';

export function BerandaKosong() {
  return (
    <div className="flex flex-col gap-5 lg:max-w-dialog">
      <section className="flex flex-col items-center gap-3 rounded-lg border border-garis bg-putih px-4 py-6 text-center">
        <IlustrasiKebunKosong />
        <h2 className="m-0 text-uang font-semibold">{t.kosong.judul}</h2>
        <p className="m-0 text-teks-pendukung">{t.kosong.isi}</p>
        <Link to="/hitung/tanaman" className={kelasTombol('utama', true) + ' mt-2'}>
          {t.kosong.tombol}
        </Link>
      </section>
      <Link
        to="/belajar"
        className="fokus-cincin flex min-h-nav-item items-center gap-3 rounded-lg border border-garis bg-putih px-4 py-3 text-teks no-underline hover:text-teks"
      >
        <span className="grid h-10 w-10 flex-none place-items-center rounded-md bg-daun-lembut text-daun-tua">
          <Ikon nama="belajar" />
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="font-semibold">{t.kosong.belajarJudul}</span>
          <span className="text-keterangan text-teks-pendukung">{t.kosong.belajarIsi}</span>
        </span>
        <Ikon nama="panah-kanan" className="text-teks-pendukung" />
      </Link>
    </div>
  );
}
