/**
 * "Tugas hari ini" di Beranda (papan 03, 04, 06): terlambat lebih dulu, tugas ukur dengan tombol
 * "Isi angka", centang menandai selesai lewat klien API.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { kunciIdempotenBaru, useSelesaikanTugas } from '../../api/kueri';
import type { Tugas } from '../../api/tipe';
import { Banner } from '../../komponen/banner';
import { BarisTugas } from '../../komponen/baris-tugas';
import { Ikon } from '../../komponen/ikon';
import { LabelKecil } from '../../komponen/label-kecil';
import { jumlahTerlambat } from '../../lib/beranda';
import type { TanggalISO } from '../../lib/format';
import { statusTugas } from '../../lib/jadwal-ubah';
import { tugasKeDomain } from '../../api/peta';
import { teksBeranda as t } from '../../teks/beranda';
import { teksFrekuensi, teksStatusWaktu } from '../../teks/jadwal';
import { teksUmum } from '../../teks/umum';

export interface KelompokTugas {
  siklusId: string;
  /** Nama siklus; ditampilkan bila ada lebih dari satu kelompok. */
  nama: string;
  tugas: Tugas[];
}

const hrefTugas = (id: string) => `/tugas/${encodeURIComponent(id)}`;

export function DaftarTugasHariIni({
  kelompok,
  hariIni,
  hasilUkur,
  ukurUtama,
  contoh,
}: {
  kelompok: KelompokTugas[];
  hariIni: TanggalISO;
  /** Pil hasil ukur terakhir per siklus, mis. "pH 6,1 · normal". */
  hasilUkur: Record<string, string | undefined>;
  /** "Isi angka" sebagai tombol utama (bila tidak ada tombol utama lain di layar). */
  ukurUtama: boolean;
  /** Ada tugas dari resep contoh → label contoh (D-36). */
  contoh: boolean;
}) {
  const navigate = useNavigate();
  const selesaikan = useSelesaikanTugas();
  const [sedangSelesai, setSedangSelesai] = useState<Set<string>>(new Set());
  const [gagal, setGagal] = useState(false);
  const semua = kelompok.flatMap((k) => k.tugas);
  const terlambat = jumlahTerlambat(semua.map(tugasKeDomain), hariIni);
  let utamaTerpakai = !ukurUtama;

  async function centang(tugas: Tugas) {
    setGagal(false);
    setSedangSelesai((s) => new Set(s).add(tugas.id));
    try {
      await selesaikan.mutateAsync({ id: tugas.id, kunci_idempoten: kunciIdempotenBaru() });
    } catch {
      setGagal(true);
    } finally {
      setSedangSelesai((s) => {
        const baru = new Set(s);
        baru.delete(tugas.id);
        return baru;
      });
    }
  }

  function baris(tugas: Tugas) {
    const s = statusTugas(tugas, hariIni);
    const selesai = tugas.status === 'selesai' || sedangSelesai.has(tugas.id);
    const keterangan =
      tugas.tipe === 'sekali'
        ? [t.hariKe(tugas.hst), s.jenis === 'terlambat' ? t.seharusnya(tugas.tanggal) : null]
            .filter(Boolean)
            .join(' · ')
        : teksFrekuensi(tugas.interval ?? 1);
    const ukur = tugas.tipe === 'ukur';
    const utama = ukur && !utamaTerpakai;
    if (utama) utamaTerpakai = true;
    return (
      <BarisTugas
        key={tugas.id}
        judul={tugas.judul}
        tipe={tugas.tipe}
        keterangan={keterangan}
        waktu={s.jenis === 'terlambat' ? 'terlambat' : 'hari-ini'}
        teksWaktu={s.jenis === 'terlambat' ? teksStatusWaktu(s) : undefined}
        hasil={ukur ? hasilUkur[tugas.siklus_id] : undefined}
        selesai={selesai}
        onCentang={(jadi) => {
          if (ukur) navigate(`${hrefTugas(tugas.id)}/ukur`);
          else if (jadi && tugas.status !== 'selesai') void centang(tugas);
        }}
        href={hrefTugas(tugas.id)}
        hrefUkur={ukur ? `${hrefTugas(tugas.id)}/ukur` : undefined}
        ukurUtama={utama}
        jumlahFoto={tugas.foto ? 1 : 0}
        onKamera={() => navigate(hrefTugas(tugas.id))}
        tanpaKamera={ukur}
      />
    );
  }

  return (
    <section className="flex flex-col gap-3" aria-labelledby="judul-tugas-hari-ini">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="judul-tugas-hari-ini" className="m-0 text-judul-bagian font-semibold">
          {t.tugasHariIni}
        </h2>
        {terlambat ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-tomat">
            <Ikon nama="peringatan" ukuran={18} />
            {t.jumlahTerlambat(terlambat)}
          </span>
        ) : (
          <span className="text-teks-pendukung">{t.jumlahTugas(semua.length)}</span>
        )}
      </div>
      {contoh && semua.length ? (
        <LabelKecil nada="contoh" className="self-start">
          {teksUmum.labelContoh}
        </LabelKecil>
      ) : null}
      {gagal ? <Banner jenis="bahaya">{t.gagalCentang}</Banner> : null}
      {semua.length === 0 ? (
        <p className="m-0 rounded-lg border border-garis bg-putih p-4 text-teks-pendukung">
          {t.tidakAdaTugas}
        </p>
      ) : (
        kelompok
          .filter((k) => k.tugas.length)
          .map((k) => (
            <div key={k.siklusId} className="flex flex-col gap-2">
              {kelompok.filter((x) => x.tugas.length).length > 1 ? (
                <h3 className="m-0 text-isi font-medium text-teks-pendukung">{k.nama}</h3>
              ) : null}
              <div className="overflow-hidden rounded-lg border border-garis bg-putih">
                {k.tugas.map(baris)}
              </div>
            </div>
          ))
      )}
    </section>
  );
}
