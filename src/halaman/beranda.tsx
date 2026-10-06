/**
 * Beranda petani (papan 03–07, T4.09, PRD P0-06, P0-13, P0-16, P0-29). Data hanya lewat klien API.
 * Siklus yang ditampilkan di kartu dipilih lewat `?siklus=` bila ada lebih dari satu siklus aktif.
 */
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  useDaftarSiklus,
  useKomoditas,
  useLahan,
  usePesananSekitar,
  useRiwayatPengukuran,
  useSiklus,
  useResep,
  useTugas,
  useTugasBanyakSiklus,
  useTugasHariIni,
} from '../api/kueri';
import { tugasKeDomain } from '../api/peta';
import { useSesi, useWaktuLokal } from '../api/sesi';
import type { SiklusTanam, Tugas } from '../api/tipe';
import { Avatar } from '../komponen/avatar';
import { Banner } from '../komponen/banner';
import { Ikon } from '../komponen/ikon';
import { Dialog } from '../komponen/dialog';
import { useDesaSaya } from '../komponen/kerangka-sesi';
import { DaftarLangkah } from '../komponen/pelengkap';
import { PilPilihan } from '../komponen/pilihan';
import { kelasTombol, Tombol } from '../komponen/tombol';
import {
  hasilUkurTerakhir,
  siklusPalingMendesak,
  tugasBesok,
  tugasHariIni,
  waktuSalam,
  type WaktuSalam,
} from '../lib/beranda';
import { statusTugas } from '../lib/jadwal-ubah';
import { teksBeranda as t } from '../teks/beranda';
import { teksKebun } from '../teks/kebun';
import { teksSesi } from '../teks/sesi';
import { teksUmum } from '../teks/umum';
import { hasilPengukuranKeDomain } from '../api/peta';
import { BerandaKosong } from './beranda/beranda-kosong';
import { DaftarTugasHariIni, type KelompokTugas } from './beranda/daftar-tugas';
import { KartuSiklus } from './beranda/kartu-siklus';
import { angkaUkur, KartuHasilUkur, KartuModal, KartuTawaran } from './beranda/kartu-samping';
import { useDaring, useIzinNotifikasi } from './beranda/keadaan-perangkat';

function Kepala({
  nama,
  waktu,
  tanggal,
  desa,
  tombolBaru = true,
}: {
  nama: string;
  waktu: WaktuSalam;
  tanggal: string;
  desa: string | null;
  tombolBaru?: boolean;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 pt-1 lg:items-end lg:gap-4 lg:pt-2">
      <div className="flex flex-col gap-0.5">
        <p className="m-0 text-keterangan text-teks-pendukung">{t.tanggalDesa(tanggal, desa)}</p>
        <h1 className="m-0 text-judul-halaman font-semibold">{t.salam(waktu, nama)}</h1>
      </div>
      <Link
        to="/profil"
        aria-label={t.bukaProfil}
        className="fokus-cincin grid h-sentuh w-sentuh flex-none place-items-center rounded-full lg:hidden"
      >
        <Avatar nama={nama} ukuran={44} className="border-2 border-putih shadow-garis" />
      </Link>
      {tombolBaru ? (
        <Link to="/hitung/tanaman" className={kelasTombol('sekunder') + ' hidden lg:inline-flex'}>
          {t.buatSiklusBaru}
        </Link>
      ) : null}
    </header>
  );
}

export function HalamanBeranda() {
  const navigate = useNavigate();
  const { tanggal: hariIni, jam } = useWaktuLokal();
  const waktu = waktuSalam(jam);
  const { akun } = useSesi();
  const desa = useDesaSaya();
  const daring = useDaring();
  const izin = useIzinNotifikasi();
  const [caraPengingat, setCaraPengingat] = useState(false);
  const [param, setParam] = useSearchParams();

  const siklusQ = useDaftarSiklus({ status: 'aktif' });
  const rencanaQ = useDaftarSiklus({ status: 'rencana' });
  const komoditasQ = useKomoditas();
  const lahanQ = useLahan();
  const tugasQ = useTugasHariIni();
  const pesananQ = usePesananSekitar({ per_halaman: 1 });

  const aktif = siklusQ.data ?? [];
  // Tanpa ?siklus=, pilih siklus dengan tugas paling mendesak (D-37).
  const semuaTugas = useTugasBanyakSiklus(param.get('siklus') ? [] : aktif.map((s) => s.id));
  const idMendesak = semuaTugas.data
    ? siklusPalingMendesak(
        aktif.map((s) => s.id),
        semuaTugas.data.flat().map((x) => ({ ...tugasKeDomain(x), siklusId: x.siklus_id })),
        hariIni,
      )
    : null;
  const dipilih =
    aktif.find((s) => s.id === (param.get('siklus') ?? idMendesak)) ??
    (semuaTugas.isPending ? null : (aktif[0] ?? null));
  const detailQ = useSiklus(dipilih?.id ?? null);
  const tugasSiklusQ = useTugas(dipilih?.id ?? null);
  const resepQ = useResep(dipilih?.resep_id ?? null);
  const ukurQ = useRiwayatPengukuran(dipilih?.id ?? null);

  const nama = akun?.pengguna.nama ?? '';
  const namaSiklus = (s: SiklusTanam) =>
    t.namaSiklus(
      komoditasQ.data?.find((k) => k.id === s.komoditas_id)?.nama ?? s.komoditas_id,
      lahanQ.data?.find((l) => l.id === s.lahan_id)?.nama ?? '',
    );

  const jumlahRencana = rencanaQ.data?.length ?? 0;
  const penandaRencana = jumlahRencana ? (
    <Link
      to="/kebun?daftar#rencana"
      className="fokus-cincin inline-flex min-h-sentuh items-center gap-2 self-start rounded-full border-1.5 border-garis-kuat bg-putih px-4 font-medium text-teks no-underline hover:border-daun-tua hover:text-daun-tua"
    >
      <Ikon nama="kalender" ukuran={20} />
      {teksKebun.rencanaBeranda(jumlahRencana)}
      <Ikon nama="panah-kanan" ukuran={20} />
    </Link>
  ) : null;
  const kepala = <Kepala nama={nama} waktu={waktu} tanggal={hariIni} desa={desa} />;
  const bannerOffline = daring ? null : <Banner jenis="offline">{t.offlineIsi}</Banner>;

  if (siklusQ.isPending || tugasQ.isPending || (aktif.length > 0 && !dipilih)) {
    return (
      <>
        {kepala}
        <p role="status" className="m-0 text-teks-pendukung">
          {teksUmum.memuat}
        </p>
      </>
    );
  }
  if (siklusQ.isError || tugasQ.isError) {
    return (
      <>
        {kepala}
        <Banner
          jenis="bahaya"
          judul={teksSesi.galatJudul}
          aksi={teksSesi.cobaLagi}
          onAksi={() => {
            void siklusQ.refetch();
            void tugasQ.refetch();
          }}
        >
          {(siklusQ.error ?? tugasQ.error)?.message}
        </Banner>
      </>
    );
  }

  if (!dipilih) {
    return (
      <>
        {bannerOffline}
        <Kepala nama={nama} waktu={waktu} tanggal={hariIni} desa={desa} tombolBaru={false} />
        {penandaRencana}
        <BerandaKosong />
      </>
    );
  }

  // Tugas hari ini dari semua siklus aktif, dikelompokkan per siklus (urutan siklus seperti daftar).
  const apiPerId = new Map((tugasQ.data ?? []).map((x) => [x.id, x]));
  const tampil = tugasHariIni(
    (tugasQ.data ?? []).map((x) => ({ ...tugasKeDomain(x), siklusId: x.siklus_id })),
    hariIni,
  );
  const kelompok: KelompokTugas[] = aktif.map((s) => ({
    siklusId: s.id,
    nama: namaSiklus(s),
    tugas: tampil.filter((x) => x.siklusId === s.id).map((x) => apiPerId.get(x.id) as Tugas),
  }));
  const tugasTampil = kelompok.flatMap((k) => k.tugas);

  // Hasil ukur terakhir siklus terpilih untuk pil di baris tugas ukur.
  const terakhir = hasilUkurTerakhir((ukurQ.data ?? []).map(hasilPengukuranKeDomain))[0];
  const hasilUkur: Record<string, string | undefined> = terakhir
    ? {
        [dipilih.id]: t.pilHasil(
          terakhir.besaran,
          angkaUkur(terakhir.nilai),
          t.statusUkur[terakhir.status],
        ),
      }
    : {};

  const tugasSiklus = tugasSiklusQ.data ?? [];
  const besok = tugasBesok(tugasSiklus.map(tugasKeDomain), hariIni);
  const terlambatSiklus = tugasSiklus.find(
    (x) => x.tipe === 'sekali' && statusTugas(x, hariIni).jenis === 'terlambat',
  );
  const besaranUkur = tugasSiklus.find((x) => x.ukur?.length)?.ukur ?? [];
  const tawaran = pesananQ.data?.data[0] ?? null;
  const pengingatMati = izin === 'denied';
  const adaContoh = aktif.some(
    (s) => s.resep_contoh && kelompok.some((k) => k.siklusId === s.id && k.tugas.length),
  );

  return (
    <>
      {bannerOffline}
      {kepala}
      {pengingatMati ? (
        <Banner
          judul={t.pengingatMati.judul}
          aksi={t.pengingatMati.aksi}
          onAksi={() => setCaraPengingat(true)}
        >
          {t.pengingatMati.isi(
            tugasTampil.filter((x) => x.status === 'belum').map((x) => x.judul),
            besok?.judul ?? null,
          )}
        </Banner>
      ) : null}

      <div className="flex flex-col gap-5 xl:grid xl:grid-cols-3 xl:items-start xl:gap-6">
        <div className="flex min-w-0 flex-col gap-5 xl:col-span-2">
          {aktif.length > 1 ? (
            <PilPilihan
              label={t.pilihSiklus}
              className="lg:flex-wrap"
              opsi={aktif.map((s) => ({ nilai: s.id, label: namaSiklus(s) }))}
              nilai={dipilih.id}
              onPilih={(id) => setParam({ siklus: id }, { replace: true })}
            />
          ) : null}
          {detailQ.data ? (
            <KartuSiklus
              nama={namaSiklus(dipilih)}
              siklus={detailQ.data}
              tugas={tugasSiklus}
              hariIni={hariIni}
            />
          ) : (
            <p role="status" className="m-0 text-teks-pendukung">
              {teksUmum.memuat}
            </p>
          )}
          {penandaRencana}
          {besok && !pengingatMati ? (
            <Banner
              judul={t.besok(besok.judul)}
              aksi={t.lihatCaranya}
              onAksi={() => navigate(`/tugas/${encodeURIComponent(besok.id)}`)}
            >
              {terlambatSiklus
                ? t.besokIsiTerlambat(terlambatSiklus.judul)
                : (resepQ.data?.tugas.find((rt) => rt.id === besok.resepTugasId)
                    ?.cara_mengerjakan?.[0] ?? t.besokIsi)}
            </Banner>
          ) : null}
          <DaftarTugasHariIni
            kelompok={kelompok}
            hariIni={hariIni}
            hasilUkur={hasilUkur}
            ukurUtama={!tawaran}
            contoh={adaContoh}
          />
        </div>

        <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-6">
          {tawaran ? (
            <KartuTawaran
              pesanan={tawaran}
              namaKomoditas={
                komoditasQ.data?.find((k) => k.id === tawaran.komoditas_id)?.nama ??
                tawaran.komoditas_id
              }
              utama
            />
          ) : null}
          {ukurQ.data?.length ? (
            <div className="hidden lg:block">
              <KartuHasilUkur
                siklusId={dipilih.id}
                hasil={ukurQ.data}
                besaran={besaranUkur}
                contoh={dipilih.resep_contoh}
              />
            </div>
          ) : null}
          {detailQ.data ? (
            <div className="hidden lg:block">
              <KartuModal nama={namaSiklus(dipilih)} siklus={detailQ.data} />
            </div>
          ) : null}
        </aside>
      </div>

      <Dialog
        terbuka={caraPengingat}
        onTutup={() => setCaraPengingat(false)}
        judul={t.pengingatMati.caraJudul}
      >
        <div className="flex flex-col gap-4">
          <DaftarLangkah butir={[...t.pengingatMati.cara]} />
          <Tombol penuh onClick={() => setCaraPengingat(false)}>
            {teksUmum.tutup}
          </Tombol>
        </div>
      </Dialog>
    </>
  );
}
