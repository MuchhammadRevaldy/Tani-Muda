/**
 * Masuk dengan nomor HP dan kode SMS (papan 02, T4.33, PRD P0-01). Tanpa kata sandi (D-04). Semua
 * lewat klien API; di mode tiruan kode dibuat `PenyediaOtp` tiruan (D-10). Pengguna baru wajib
 * mencentang persetujuan kebijakan privasi berteks draf (D-30).
 */
import { lazy, Suspense, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adalahGalatApi } from '../api/galat';
import { useKirimOtp, useVerifikasiOtp } from '../api/kueri';
import { useGantiPengguna } from '../api/sesi';
import { Dialog } from '../komponen/dialog';
import { cx } from '../komponen/gabung-kelas';
import { Ikon } from '../komponen/ikon';
import { IlustrasiMasukHp } from '../komponen/ilustrasi-hero';
import { IlustrasiSawahPagi } from '../komponen/ilustrasi-sawah-pagi';
import { KolomIsian } from '../komponen/kolom-isian';
import { LabelKecil } from '../komponen/label-kecil';
import { Logo } from '../komponen/navigasi';
import { KotakOtp } from '../komponen/pelengkap';
import { Tombol } from '../komponen/tombol';
import { normalisasiNomorHp } from '../lib/nomor-hp';
import { teksGalat } from '../teks/galat';
import { teksMasuk as t } from '../teks/masuk';
import { teksPrivasi } from '../teks/privasi';
import { bacaPeranDariAlamat, simpanPeranAwal } from './peran-awal';

const PanelPengembangan =
  import.meta.env.DEV || import.meta.env.MODE === 'demo'
    ? lazy(() => import('./masuk/panel-pengembangan'))
    : null;

interface Terkirim {
  nomor: string;
  kirimUlangDetik: number;
  /** Ganti nilai untuk mengosongkan kotak kode (kirim ulang). */
  putaran: number;
}

/** Urutan muncul bergiliran elemen halaman Masuk (kelas `masuk-bertahap`, jeda 120 ms) [AG-57]. */
const urutan = (i: number) => ({ '--urutan': i }) as CSSProperties;

export function HalamanMasuk() {
  const kirim = useKirimOtp();
  const verifikasi = useVerifikasiOtp();
  const gantiPengguna = useGantiPengguna();
  const { search } = useLocation();

  // Peran dari tombol halaman depan dibawa sampai pilih peran (T4.32).
  useEffect(() => {
    const peran = bacaPeranDariAlamat(search);
    if (peran) simpanPeranAwal(peran);
  }, [search]);

  const [nomor, setNomor] = useState('');
  const [galatNomor, setGalatNomor] = useState<string | null>(null);
  const [terkirim, setTerkirim] = useState<Terkirim | null>(null);
  const [kode, setKode] = useState<string | null>(null);
  const [galatKode, setGalatKode] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [perluPrivasi, setPerluPrivasi] = useState(false);
  const [setuju, setSetuju] = useState(false);
  const [galatPrivasi, setGalatPrivasi] = useState<string | null>(null);
  const [bacaPrivasi, setBacaPrivasi] = useState(false);

  async function kirimKode(ulang = false) {
    setGalatNomor(null);
    setGalatKode(null);
    setInfo(null);
    if (!nomor.trim()) return setGalatNomor(t.isiNomorDulu);
    const n = normalisasiNomorHp(nomor);
    if (!n.ok) return setGalatNomor(teksGalat[n.galat]);
    try {
      const h = await kirim.mutateAsync({ nomor_hp: n.nilai });
      setTerkirim((lama) => ({
        nomor: h.nomor_hp,
        kirimUlangDetik: h.kirim_ulang_dalam_detik,
        putaran: (lama?.putaran ?? 0) + 1,
      }));
      setKode(null);
      if (ulang) setInfo(t.kodeBaruTerkirim);
    } catch (e) {
      const pesan = adalahGalatApi(e) ? e.message : t.gagalUmum;
      if (ulang) setGalatKode(pesan);
      else setGalatNomor(pesan);
    }
  }

  async function masuk() {
    if (!terkirim) return;
    setGalatKode(null);
    setGalatPrivasi(null);
    setInfo(null);
    if (!kode) return setGalatKode(t.isiKodeDulu);
    try {
      await verifikasi.mutateAsync({
        nomor_hp: terkirim.nomor,
        kode,
        ...(perluPrivasi ? { setuju_privasi: setuju } : {}),
      });
      // Penjaga tamu mengarahkan ke halaman awal peran atau pilih peran.
      await gantiPengguna();
    } catch (e) {
      if (adalahGalatApi(e) && e.rincian.setuju_privasi) {
        setPerluPrivasi(true);
        if (perluPrivasi) setGalatPrivasi(e.rincian.setuju_privasi[0] ?? e.message);
        return;
      }
      setGalatKode(adalahGalatApi(e) ? e.message : t.gagalUmum);
    }
  }

  function kirimForm(e: FormEvent) {
    e.preventDefault();
    if (terkirim) void masuk();
    else void kirimKode();
  }

  const formulir = (
    <form onSubmit={kirimForm} noValidate className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col gap-1 lg:gap-1.5">
        <h1
          className="masuk-bertahap m-0 text-judul-halaman font-semibold lg:text-judul-masuk lg:tracking-rapat"
          style={urutan(1)}
        >
          {t.judul}
        </h1>
        <p
          className="masuk-bertahap m-0 text-keterangan text-teks-pendukung lg:text-isi"
          style={urutan(2)}
        >
          {t.sub}
        </p>
      </div>

      <div className="masuk-bertahap flex flex-col gap-2" style={urutan(3)}>
        <KolomIsian
          label={t.labelNomor}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t.contohNomor}
          value={nomor}
          readOnly={!!terkirim}
          onChange={(e) => setNomor(e.target.value)}
          galat={galatNomor ?? undefined}
          bantuan={terkirim ? t.bantuanTerkirim : undefined}
        />
        {terkirim ? (
          <button
            type="button"
            onClick={() => {
              setTerkirim(null);
              setKode(null);
              setGalatKode(null);
              setInfo(null);
              setPerluPrivasi(false);
            }}
            className="fokus-cincin -ml-2 inline-flex min-h-sentuh cursor-pointer items-center self-start rounded-md border-0 bg-transparent px-2 text-isi font-semibold text-daun-tua"
          >
            {t.gantiNomor}
          </button>
        ) : null}
      </div>

      {terkirim ? (
        <KotakOtp
          key={terkirim.putaran}
          sisaDetikAwal={terkirim.kirimUlangDetik}
          onUbah={(k) => {
            setKode(k);
            setGalatKode(null);
          }}
          onKirimUlang={() => void kirimKode(true)}
          galat={galatKode ?? undefined}
        />
      ) : null}
      {info ? (
        <p
          role="status"
          className="m-0 -mt-2 flex items-center gap-2 text-keterangan text-daun-tua"
        >
          <Ikon nama="centang" ukuran={20} />
          {info}
        </p>
      ) : null}

      {perluPrivasi ? (
        <div className="flex flex-col gap-2 rounded-md border-1.5 border-garis bg-putih p-4">
          <p className="m-0 font-semibold">{t.privasi.judul}</p>
          <p className="m-0 text-keterangan text-teks-pendukung">{t.privasi.isi}</p>
          <label className="flex min-h-sentuh cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={setuju}
              onChange={(e) => {
                setSetuju(e.target.checked);
                setGalatPrivasi(null);
              }}
              aria-invalid={galatPrivasi ? true : undefined}
              className="fokus-cincin h-6 w-6 flex-none cursor-pointer accent-daun-tua"
            />
            <span className="font-medium">{t.privasi.centang}</span>
          </label>
          {galatPrivasi ? (
            <p
              role="alert"
              className="m-0 flex items-start gap-2 text-keterangan font-medium text-tomat-teks"
            >
              <Ikon nama="peringatan" ukuran={20} className="mt-px" />
              <span>{galatPrivasi}</span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setBacaPrivasi(true)}
            className="fokus-cincin -ml-2 inline-flex min-h-sentuh cursor-pointer items-center self-start rounded-md border-0 bg-transparent px-2 text-isi font-semibold text-daun-tua underline underline-offset-3"
          >
            {t.privasi.baca}
          </button>
        </div>
      ) : null}

      {PanelPengembangan ? (
        <div className="masuk-bertahap" style={urutan(4)}>
          <Suspense fallback={null}>
            <PanelPengembangan nomorHp={terkirim?.nomor ?? null} />
          </Suspense>
        </div>
      ) : null}

      <div className="flex-1 lg:hidden" />
      <div className="flex flex-col gap-3">
        <Tombol
          type="submit"
          penuh
          disabled={kirim.isPending || verifikasi.isPending}
          className="masuk-bertahap"
          style={urutan(5)}
        >
          {terkirim
            ? verifikasi.isPending
              ? t.memeriksa
              : t.masuk
            : kirim.isPending
              ? t.mengirim
              : t.kirimKode}
        </Tombol>
        <p
          className="masuk-bertahap m-0 text-center text-keterangan text-teks-pendukung lg:text-left"
          style={urutan(6)}
        >
          {t.aturan.awal}
          <Link to="/aturan-pakai" className="underline underline-offset-3">
            {t.aturan.tautan}
          </Link>
          {t.aturan.akhir}
        </p>
      </div>
    </form>
  );

  return (
    <div className="flex min-h-layar flex-col bg-embun-pagi text-teks lg:flex-row lg:bg-putih">
      <div className="flex min-w-0 flex-1 flex-col px-4 pb-6 pt-2 lg:px-14 lg:pb-10 lg:pt-8">
        {/* HP: tombol kembali + logo di tengah; desktop: logo di kiri atas. */}
        <div className="masuk-bertahap flex items-center justify-between gap-3 lg:hidden">
          <Link
            to="/"
            aria-label={t.kembaliKeAwal}
            className="fokus-cincin -ml-3 inline-flex h-sentuh w-sentuh items-center justify-center rounded-md text-daun-tua"
          >
            <Ikon nama="panah-kiri" />
          </Link>
          <Logo />
          <span className="w-9" />
        </div>
        <Link
          to="/"
          className="masuk-bertahap fokus-cincin hidden min-h-sentuh items-center self-start rounded-md no-underline lg:inline-flex"
        >
          <Logo besar />
        </Link>
        <div className="masuk-bertahap lg:hidden" style={urutan(1)}>
          <IlustrasiMasukHp className="mt-3" />
        </div>

        <div className="mt-4 flex flex-1 flex-col lg:mt-0 lg:justify-center lg:py-8">
          <div className={cx('mx-auto flex w-full flex-1 flex-col lg:max-w-dialog lg:flex-none')}>
            {formulir}
          </div>
        </div>
        <p className="m-0 hidden text-keterangan text-teks-pendukung lg:block">
          {t.catatanPembeli}
        </p>
      </div>

      {/* Panel kanan desktop (AG-17): ilustrasi mengisi panel di 1280 dan 1440. */}
      <div className="relative hidden min-w-0 flex-1 overflow-hidden bg-daun-lembut lg:block">
        <IlustrasiSawahPagi label={t.altIlustrasi} className="absolute inset-0" />
      </div>

      <Dialog
        terbuka={bacaPrivasi}
        onTutup={() => setBacaPrivasi(false)}
        judul={teksPrivasi.judul}
        keterangan={teksPrivasi.pengantar}
      >
        <div className="flex flex-col gap-3">
          <LabelKecil nada="contoh" className="self-start">
            {teksPrivasi.labelDraf}
          </LabelKecil>
          <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
            {teksPrivasi.butir.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </Dialog>
    </div>
  );
}
