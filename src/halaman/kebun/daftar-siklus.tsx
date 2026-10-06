/**
 * Menu Kebun (D-26, D-38): satu siklus aktif tanpa rencana → langsung membuka jadwalnya; selain itu
 * daftar siklus: sedang ditanam, rencana belum dijadwalkan ("Nanti saja"), dan sudah selesai.
 * Belum ada siklus → "Mulai siklus tanam pertamamu".
 */
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useDaftarSiklus, useKomoditas, useLahan, useSiklus } from '../../api/kueri';
import type { SiklusTanam } from '../../api/tipe';
import { HeaderHalaman } from '../../komponen/navigasi';
import { Ikon } from '../../komponen/ikon';
import { kelasTombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { selisihHari } from '../../lib/tanggal';
import { teksBeranda } from '../../teks/beranda';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';
import { BerandaKosong } from '../beranda/beranda-kosong';
import { GambarKomoditas } from '../hitung/gambar';

function KartuSiklusRingkas({ s, nama }: { s: SiklusTanam; nama: string }) {
  const detail = useSiklus(s.status === 'aktif' ? s.id : null);
  const ke = `/kebun/${encodeURIComponent(s.id)}/${s.status === 'rencana' ? 'tanggal-tanam' : s.status === 'selesai' ? 'akhir' : 'jadwal'}`;
  const panen = detail.data?.perkiraan_tanggal_panen;
  const hariPanen = s.tanggal_tanam && panen ? selisihHari(s.tanggal_tanam, panen) : null;
  return (
    <Link
      to={ke}
      className="fokus-cincin flex min-h-baris-tugas items-center gap-3 rounded-lg border border-garis bg-putih p-4 text-teks no-underline hover:border-daun-tua hover:text-teks"
    >
      <GambarKomoditas id={s.komoditas_id} segera={s.status !== 'aktif'} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold">{nama}</span>
        <span className="text-keterangan text-teks-pendukung">
          {s.status === 'aktif' &&
          detail.data?.hari_ke !== null &&
          detail.data &&
          hariPanen &&
          panen
            ? `${t.hariKeDari(detail.data.hari_ke ?? 0, hariPanen)} · ${t.panenTanggal(panen)}`
            : s.status === 'rencana'
              ? t.rencanaKet
              : s.tanggal_tanam
                ? t.selesaiKet(s.tanggal_tanam)
                : ''}
        </span>
        {s.status === 'selesai' && s.pendapatan_nyata !== null ? (
          <span className="text-keterangan text-teks-pendukung">
            {t.pendapatanNyata}: <Uang nilai={s.pendapatan_nyata} />
          </span>
        ) : null}
      </span>
      <span className="flex flex-none items-center gap-1 font-semibold text-daun-tua">
        <span className="hidden md:inline">
          {s.status === 'rencana'
            ? t.pilihTanggalTanam
            : s.status === 'selesai'
              ? t.lihatRingkasan
              : t.bukaJadwal}
        </span>
        <Ikon nama="panah-kanan" />
      </span>
    </Link>
  );
}

export function HalamanKebun() {
  const [param] = useSearchParams();
  const semuaQ = useDaftarSiklus({});
  const komoditasQ = useKomoditas();
  const lahanQ = useLahan();
  if (semuaQ.isPending) {
    return (
      <p role="status" className="m-0 text-teks-pendukung">
        {teksUmum.memuat}
      </p>
    );
  }
  const semua = semuaQ.data ?? [];
  const aktif = semua.filter((s) => s.status === 'aktif');
  const rencana = semua.filter((s) => s.status === 'rencana');
  const selesai = semua.filter((s) => s.status === 'selesai');
  // D-26: satu siklus aktif (tanpa rencana) langsung membuka siklus itu.
  if (aktif.length === 1 && rencana.length === 0 && !param.has('daftar'))
    return <Navigate to={`/kebun/${encodeURIComponent(aktif[0]!.id)}/jadwal`} replace />;
  if (semua.length === 0) {
    return (
      <>
        <HeaderHalaman judul={t.judul} />
        <BerandaKosong />
      </>
    );
  }
  const nama = (s: SiklusTanam) =>
    teksBeranda.namaSiklus(
      komoditasQ.data?.find((k) => k.id === s.komoditas_id)?.nama ?? s.komoditas_id,
      lahanQ.data?.find((l) => l.id === s.lahan_id)?.nama ?? '',
    );
  const bagian: [string, string, SiklusTanam[]][] = [
    ['aktif', t.sedangDitanam, aktif],
    ['rencana', t.rencana, rencana],
    ['selesai', t.selesai, selesai],
  ];
  return (
    <>
      <HeaderHalaman
        judul={t.judul}
        keterangan={t.sub}
        kanan={
          <Link to="/hitung/tanaman" className={kelasTombol('sekunder')}>
            {teksBeranda.buatSiklusBaru}
          </Link>
        }
      />
      {bagian
        .filter(([, , isi]) => isi.length)
        .map(([id, judul, isi]) => (
          <section key={id} id={id} aria-labelledby={`judul-${id}`} className="flex flex-col gap-3">
            <h2 id={`judul-${id}`} className="m-0 text-judul-bagian font-semibold">
              {judul}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {isi.map((s) => (
                <KartuSiklusRingkas key={s.id} s={s} nama={nama(s)} />
              ))}
            </div>
          </section>
        ))}
    </>
  );
}
