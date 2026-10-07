/**
 * Menu Kebun (D-26, D-38, D-40): satu siklus aktif tanpa rencana → langsung membuka jadwalnya; selain
 * itu daftar siklus: sedang ditanam, rencana belum dijadwalkan ("Nanti saja"), dan sudah selesai.
 * Petak satu pesanan rutin tampil sebagai satu kartu kelompok yang bisa dibuka, di bagian menurut
 * keadaannya: ada petak aktif → sedang ditanam; menunggu kesepakatan → rencana; semua dipanen →
 * selesai. Belum ada siklus → "Mulai siklus tanam pertamamu".
 */
import { useEffect, useRef } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDaftarSiklus, useSiklus } from '../../api/kueri';
import { useHariIni } from '../../api/sesi';
import type { SiklusTanam } from '../../api/tipe';
import { HeaderHalaman } from '../../komponen/navigasi';
import { Ikon } from '../../komponen/ikon';
import { kelasTombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { kelompokkanSiklus, ringkasKelompok, type UnitSiklus } from '../../lib/kelompok-siklus';
import { selisihHari } from '../../lib/tanggal';
import { teksBeranda } from '../../teks/beranda';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';
import { BerandaKosong } from '../beranda/beranda-kosong';
import { GambarKomoditas } from '../hitung/gambar';
import { keKelompok, useNamaSiklus, type SiklusTampil } from './nama-siklus';

const tujuan = (s: SiklusTanam) =>
  `/kebun/${encodeURIComponent(s.id)}/${s.status === 'rencana' ? 'tanggal-tanam' : s.status === 'selesai' ? 'akhir' : 'jadwal'}`;

/** Keterangan satu siklus: hari ke-n dan panen, rencana, atau selesai. */
function useKeterangan(s: SiklusTanam): string {
  const hariIni = useHariIni();
  const detail = useSiklus(s.status === 'aktif' ? s.id : null);
  const panen = detail.data?.perkiraan_tanggal_panen;
  const hariPanen = s.tanggal_tanam && panen ? selisihHari(s.tanggal_tanam, panen) : null;
  if (s.status === 'aktif' && s.tanggal_tanam && s.tanggal_tanam > hariIni)
    return t.petakBelumTanam(s.tanggal_tanam);
  if (s.status === 'aktif' && detail.data && detail.data.hari_ke !== null && hariPanen && panen)
    return `${t.hariKeDari(detail.data.hari_ke, hariPanen)} · ${t.panenTanggal(panen)}`;
  if (s.status === 'rencana') return t.rencanaKet;
  if (s.status === 'selesai')
    return s.tanggal_tanam ? t.selesaiKet(s.tanggal_tanam) : t.petakSelesai;
  return '';
}

function KartuSiklusRingkas({ s, nama }: { s: SiklusTanam; nama: string }) {
  const keterangan = useKeterangan(s);
  return (
    <Link
      to={tujuan(s)}
      className="fokus-cincin flex min-h-baris-tugas items-center gap-3 rounded-lg border border-garis bg-putih p-4 text-teks no-underline hover:border-daun-tua hover:text-teks"
    >
      <GambarKomoditas id={s.komoditas_id} segera={s.status !== 'aktif'} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold">{nama}</span>
        <span className="text-keterangan text-teks-pendukung">{keterangan}</span>
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

function BarisPetak({ s, nama }: { s: SiklusTanam; nama: string }) {
  const keterangan = useKeterangan(s);
  return (
    <li>
      <Link
        to={tujuan(s)}
        className="fokus-cincin flex min-h-sentuh items-center gap-3 rounded-md px-2 py-2 text-teks no-underline hover:bg-embun-pagi hover:text-teks"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium">{nama}</span>
          <span className="text-keterangan text-teks-pendukung">{keterangan}</span>
        </span>
        <Ikon nama="panah-kanan" className="text-teks-pendukung" />
      </Link>
    </li>
  );
}

function KartuKelompok({ u, terbuka }: { u: UnitSiklus<SiklusTampil>; terbuka: boolean }) {
  const hariIni = useHariIni();
  const nama = useNamaSiklus();
  const pertama = u.anggota[0] as SiklusTampil;
  const kp = pertama.kelompok_pesanan;
  const r = ringkasKelompok(u.anggota, hariIni);
  const menunggu = kp?.status_alokasi === 'menunggu_kesepakatan';
  return (
    <details
      id={kp ? `kelompok-${kp.alokasi_id}` : undefined}
      open={terbuka || undefined}
      className="group rounded-lg border border-garis bg-putih md:col-span-2"
    >
      <summary className="fokus-cincin flex min-h-baris-tugas cursor-pointer list-none items-center gap-3 rounded-lg p-4">
        <GambarKomoditas id={pertama.komoditas_id} segera={menunggu} />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-semibold">{nama.kelompok(pertama)}</span>
          <span className="text-keterangan text-teks-pendukung">
            {menunggu
              ? t.menungguKesepakatan
              : t.ringkasKelompok(r.total, r.tumbuh, r.selesai, r.tanamBerikutnya)}
          </span>
        </span>
        <span className="flex flex-none items-center gap-1 font-semibold text-daun-tua">
          <span className="hidden md:inline">{t.lihatPetak(r.total)}</span>
          <Ikon nama="panah-kanan" className="transition-transform group-open:rotate-90" />
        </span>
      </summary>
      <div className="flex flex-col gap-2 border-t border-garis px-2 pb-2 pt-2">
        {menunggu && kp ? (
          <Link
            to={`/pesanan/${encodeURIComponent(kp.pesanan_id)}/kesepakatan`}
            className={kelasTombol('sekunder') + ' mx-2 my-1 self-start'}
          >
            {t.periksaKesepakatan}
          </Link>
        ) : null}
        <ul className="m-0 flex list-none flex-col p-0">
          {u.anggota.map((s) => (
            <BarisPetak key={s.id} s={s} nama={nama.petak(s) ?? nama.siklus(s)} />
          ))}
        </ul>
      </div>
    </details>
  );
}

type Bagian = 'aktif' | 'rencana' | 'selesai';

/** Bagian sebuah unit: kelompok petak menurut keadaan petaknya. */
function bagianUnit(u: UnitSiklus<SiklusTampil>): Bagian {
  const st = u.anggota.map((s) => s.status);
  if (st.includes('aktif')) return 'aktif';
  if (st.includes('rencana')) return 'rencana';
  return 'selesai';
}

export function HalamanKebun() {
  const [param] = useSearchParams();
  const lokasi = useLocation();
  const semuaQ = useDaftarSiklus({});
  const nama = useNamaSiklus();
  const sudahGulir = useRef(false);
  const unit = kelompokkanSiklus((semuaQ.data ?? []).map(keKelompok));
  const hashKelompok = lokasi.hash.startsWith('#kelompok-')
    ? decodeURIComponent(lokasi.hash.slice('#kelompok-'.length))
    : null;
  useEffect(() => {
    // Tautan dari kesepakatan (#kelompok-…) membuka dan menggulir ke kelompoknya.
    if (!hashKelompok || !semuaQ.data || sudahGulir.current) return;
    sudahGulir.current = true;
    document.getElementById(`kelompok-${hashKelompok}`)?.scrollIntoView?.({ block: 'start' });
  }, [hashKelompok, semuaQ.data]);
  if (semuaQ.isPending) {
    return (
      <p role="status" className="m-0 text-teks-pendukung">
        {teksUmum.memuat}
      </p>
    );
  }
  const per: Record<Bagian, UnitSiklus<SiklusTampil>[]> = { aktif: [], rencana: [], selesai: [] };
  for (const u of unit) per[bagianUnit(u)].push(u);
  // D-26: satu siklus aktif (tanpa rencana dan bukan kelompok petak) langsung membuka siklus itu.
  const tunggal = per.aktif[0];
  if (
    per.aktif.length === 1 &&
    tunggal &&
    !tunggal.kelompok &&
    per.rencana.length === 0 &&
    !param.has('daftar')
  )
    return <Navigate to={`/kebun/${encodeURIComponent(tunggal.anggota[0]!.id)}/jadwal`} replace />;
  if (unit.length === 0) {
    return (
      <>
        <HeaderHalaman judul={t.judul} />
        <BerandaKosong />
      </>
    );
  }
  const bagian: [Bagian, string][] = [
    ['aktif', t.sedangDitanam],
    ['rencana', t.rencana],
    ['selesai', t.selesai],
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
        .filter(([id]) => per[id].length)
        .map(([id, judul]) => (
          <section key={id} id={id} aria-labelledby={`judul-${id}`} className="flex flex-col gap-3">
            <h2 id={`judul-${id}`} className="m-0 text-judul-bagian font-semibold">
              {judul}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {per[id].map((u) =>
                u.kelompok ? (
                  <KartuKelompok
                    key={u.id}
                    u={u}
                    terbuka={u.anggota[0]?.kelompok_pesanan?.alokasi_id === hashKelompok}
                  />
                ) : (
                  <KartuSiklusRingkas key={u.id} s={u.anggota[0]!} nama={nama.unit(u)} />
                ),
              )}
            </div>
          </section>
        ))}
    </>
  );
}
