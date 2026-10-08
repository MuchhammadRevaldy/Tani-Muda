/**
 * Ganti nomor HP (T4.36, D-04): nomor baru → kode SMS ke nomor baru → cocokkan → nomor diganti.
 * Lewat POST /akun/nomor-hp/otp dan PUT /akun/nomor-hp. Nomor yang sudah dipakai akun lain ditolak.
 */
import { lazy, Suspense, useState, type FormEvent } from 'react';
import { adalahGalatApi } from '../../api/galat';
import { useGantiNomorHp, useKirimOtpNomorBaru } from '../../api/kueri';
import { Dialog } from '../../komponen/dialog';
import { KolomIsian } from '../../komponen/kolom-isian';
import { KotakOtp } from '../../komponen/pelengkap';
import { Tombol } from '../../komponen/tombol';
import { normalisasiNomorHp, tampilNomorHp } from '../../lib/nomor-hp';
import { teksGalat } from '../../teks/galat';
import { teksUbahProfil as t } from '../../teks/profil';

// Kode uji OTP tiruan hanya di mode pengembangan (D-36); tidak ikut build produksi.
const PanelPengembangan = import.meta.env.DEV
  ? lazy(() => import('../masuk/panel-pengembangan'))
  : null;

interface Terkirim {
  nomor: string;
  kirimUlangDetik: number;
  putaran: number;
}

export function DialogGantiNomor({
  terbuka,
  onTutup,
  onBerhasil,
}: {
  terbuka: boolean;
  onTutup: () => void;
  onBerhasil: () => void;
}) {
  const kirim = useKirimOtpNomorBaru();
  const ganti = useGantiNomorHp();
  const [nomor, setNomor] = useState('');
  const [terkirim, setTerkirim] = useState<Terkirim | null>(null);
  const [kode, setKode] = useState<string | null>(null);
  const [galatNomor, setGalatNomor] = useState<string | null>(null);
  const [galatKode, setGalatKode] = useState<string | null>(null);

  function tutup() {
    setNomor('');
    setTerkirim(null);
    setKode(null);
    setGalatNomor(null);
    setGalatKode(null);
    onTutup();
  }

  async function kirimKode(ulang = false) {
    setGalatNomor(null);
    setGalatKode(null);
    if (!nomor.trim()) return setGalatNomor(t.isiNomorDulu);
    const n = normalisasiNomorHp(nomor);
    if (!n.ok) return setGalatNomor(teksGalat[n.galat]);
    try {
      const h = await kirim.mutateAsync({ nomor_hp: n.nilai });
      setTerkirim((l) => ({
        nomor: h.nomor_hp,
        kirimUlangDetik: h.kirim_ulang_dalam_detik,
        putaran: (l?.putaran ?? 0) + 1,
      }));
      setKode(null);
    } catch (e) {
      const pesan = adalahGalatApi(e) ? (e.rincian.nomor_hp?.[0] ?? e.message) : t.gagalUmum;
      if (ulang) setGalatKode(pesan);
      else setGalatNomor(pesan);
    }
  }

  async function simpan() {
    if (!terkirim) return;
    setGalatKode(null);
    if (!kode) return setGalatKode(t.isiKodeDulu);
    try {
      await ganti.mutateAsync({ nomor_hp: terkirim.nomor, kode });
      tutup();
      onBerhasil();
    } catch (e) {
      setGalatKode(adalahGalatApi(e) ? (e.rincian.kode?.[0] ?? e.message) : t.gagalUmum);
    }
  }

  function kirimForm(e: FormEvent) {
    e.preventDefault();
    if (terkirim) void simpan();
    else void kirimKode();
  }

  return (
    <Dialog terbuka={terbuka} onTutup={tutup} judul={t.dialogJudul} keterangan={t.dialogKet}>
      <form onSubmit={kirimForm} noValidate className="flex flex-col gap-4">
        <KolomIsian
          label={t.nomorBaru}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t.contohNomor}
          value={nomor}
          readOnly={!!terkirim}
          onChange={(e) => setNomor(e.target.value)}
          galat={galatNomor ?? undefined}
          bantuan={terkirim ? t.kodeTerkirim(tampilNomorHp(terkirim.nomor)) : undefined}
        />
        {terkirim ? (
          <>
            <button
              type="button"
              onClick={() => {
                setTerkirim(null);
                setKode(null);
                setGalatKode(null);
              }}
              className="fokus-cincin -ml-2 -mt-2 inline-flex min-h-sentuh cursor-pointer items-center self-start rounded-md border-0 bg-transparent px-2 font-semibold text-daun-tua"
            >
              {t.ubahNomorBaru}
            </button>
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
          </>
        ) : null}
        {PanelPengembangan && terkirim ? (
          <Suspense fallback={null}>
            <PanelPengembangan nomorHp={terkirim.nomor} />
          </Suspense>
        ) : null}
        <Tombol type="submit" penuh disabled={kirim.isPending || ganti.isPending}>
          {terkirim
            ? ganti.isPending
              ? t.memeriksa
              : t.simpanNomor
            : kirim.isPending
              ? t.mengirim
              : t.kirimKode}
        </Tombol>
      </form>
    </Dialog>
  );
}
