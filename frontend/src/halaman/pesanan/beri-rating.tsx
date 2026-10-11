/**
 * Rating dua arah (T4.26, PRD P0-28, US-18): setelah kiriman diterima, petani dan pembeli saling
 * memberi nilai 1–5 bintang dan komentar, sekali per kiriman (server menolak `SUDAH_DINILAI`).
 * Bila sudah menilai (`rating_saya`), yang tampil hanya ucapan terima kasih.
 */
import { useState } from 'react';
import { adalahGalatApi } from '../../api/galat';
import { useBeriRating } from '../../api/kueri';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { PesanKolom } from '../../komponen/kolom-isian';
import { GrupRadio } from '../../komponen/pilihan';
import { Tombol } from '../../komponen/tombol';
import { NILAI_RATING, validasiRating } from '../../lib/rating';
import { teksGalat } from '../../teks/galat';
import { teksPembeli as t } from '../../teks/pembeli';
import { teksUmum } from '../../teks/umum';

export function BeriRating({
  kirimanId,
  ratingSaya,
  keterangan,
}: {
  kirimanId: string;
  ratingSaya: number | null;
  keterangan: string;
}) {
  const beri = useBeriRating();
  const [nilai, setNilai] = useState(0);
  const [komentar, setKomentar] = useState('');
  const [galat, setGalat] = useState<string | null>(null);
  const [terkirim, setTerkirim] = useState<number | null>(ratingSaya);

  if (terkirim !== null)
    return (
      <p className="m-0 flex items-center gap-2 font-medium text-daun-tua">
        <Ikon nama="bintang" className="fill-matahari text-matahari" />
        {t.terimaKasihNilai(terkirim)}
      </p>
    );

  async function kirim() {
    setGalat(null);
    const v = validasiRating(nilai);
    if (!v.ok) return setGalat(teksGalat[v.galat]);
    try {
      await beri.mutateAsync({ id: kirimanId, nilai: v.nilai, komentar: komentar.trim() || null });
      setTerkirim(v.nilai);
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  return (
    <section className="flex flex-col gap-3" aria-label={t.ratingJudul}>
      <div className="flex flex-col gap-0.5">
        <h3 className="m-0 font-semibold">{t.ratingJudul}</h3>
        <p className="m-0 text-keterangan text-teks-pendukung">{keterangan}</p>
      </div>
      <GrupRadio label={t.ratingLabel} className="flex gap-1">
        {NILAI_RATING.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={nilai === n}
            aria-label={t.bintang(n)}
            onClick={() => setNilai(n)}
            className="fokus-cincin grid h-sentuh w-sentuh cursor-pointer place-items-center rounded-md border-0 bg-transparent"
          >
            <Ikon
              nama="bintang"
              ukuran={32}
              className={cx(n <= nilai ? 'fill-matahari text-matahari' : 'text-garis-kuat')}
            />
          </button>
        ))}
      </GrupRadio>
      <div className="flex flex-col gap-2">
        <label htmlFor={`komentar-${kirimanId}`} className="font-medium">
          {t.komentar}
        </label>
        <textarea
          id={`komentar-${kirimanId}`}
          rows={2}
          value={komentar}
          onChange={(e) => setKomentar(e.target.value)}
          className="fokus-cincin w-full rounded-md border-1.5 border-garis-kuat bg-putih px-4 py-3 text-isi text-teks outline-none"
        />
      </div>
      {galat ? <PesanKolom id={`galat-rating-${kirimanId}`} galat={galat} /> : null}
      <Tombol varian="sekunder" disabled={beri.isPending} onClick={() => void kirim()}>
        {t.kirimNilai}
      </Tombol>
    </section>
  );
}
