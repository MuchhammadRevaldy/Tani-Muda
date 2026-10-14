/**
 * Komponen Level dan Lencana Pengguna (PRD Tambahan F-03, D-64).
 * Menampilkan kartu level, bilah progres poin, dan koleksi lencana 3D.
 * Mengikuti aturan desain Tani Muda (D-59, aturan-proyek.md).
 */
import { useState } from 'react';
import { useLevelPengguna } from '../api/kueri';
import { cx } from './gabung-kelas';
import { Kartu } from './kartu';
import { LabelKecil } from './label-kecil';
import { fiturAktif } from '../lib/fitur';

export function KartuLevelLencana() {
  const aktif = fiturAktif('LEVEL');
  const { data, isLoading, isError } = useLevelPengguna(aktif);
  const [tabAktif, setTabAktif] = useState<'diraih' | 'terkunci'>('diraih');
  const [lencanaDipilih, setLencanaDipilih] = useState<{
    kode: string;
    nama: string;
    syarat?: string;
    kemajuan?: string;
    diraih_pada?: string;
    diraih: boolean;
  } | null>(null);

  if (!aktif) {
    return null;
  }

  if (isLoading) {
    return (
      <Kartu judul="Level dan Lencana">
        <div className="py-6 text-center text-teks-pendukung">
          Memuat data tingkat dan lencana...
        </div>
      </Kartu>
    );
  }

  if (isError || !data) {
    return null;
  }

  const jumlahDiraih = data.lencana.length;
  const totalLencana = jumlahDiraih + data.lencana_terkunci.length;

  return (
    <Kartu
      judul="Peringkat Pengguna"
      keterangan={`${jumlahDiraih} dari ${totalLencana} lencana diraih`}
      kanan={
        <LabelKecil nada="hijau">
          {data.poin} Poin
        </LabelKecil>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Kepala Level */}
        <div className="flex flex-col gap-4 border-b border-garis pb-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 flex-none items-center justify-center rounded-kartu border border-garis bg-daun-lembut p-2 shadow-ikon">
            <img
              src={`/lencana/${data.ikon}.svg`}
              alt={data.level}
              className="h-16 w-16"
            />
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-judul-bagian font-semibold text-teks">
                Tingkat {data.level}
              </span>
            </div>

            {/* Bilah Progres */}
            {data.level_berikutnya ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-teks-pendukung">
                  <span>Menuju tingkat {data.level_berikutnya}</span>
                  <span className="font-medium text-daun-tua">{data.poin_ke_berikutnya} poin lagi</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full border border-garis bg-embun-pagi">
                  <div
                    className="h-full rounded-full bg-limau transition-all"
                    style={{ width: `${Math.max(5, data.persen_kemajuan)}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="m-0 font-medium text-daun-tua">
                Kamu telah mencapai tingkat tertinggi Panen Raya.
              </p>
            )}
          </div>
        </div>

        {/* Tab Navigasi Lencana */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-teks">Koleksi Lencana</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTabAktif('diraih')}
              className={cx(
                'min-h-sentuh rounded-full px-4 font-semibold transition',
                tabAktif === 'diraih'
                  ? 'bg-daun-tua text-putih shadow-cahaya-limau'
                  : 'border border-garis bg-putih text-teks hover:bg-embun-pagi',
              )}
            >
              Diraih ({jumlahDiraih})
            </button>
            <button
              type="button"
              onClick={() => setTabAktif('terkunci')}
              className={cx(
                'min-h-sentuh rounded-full px-4 font-semibold transition',
                tabAktif === 'terkunci'
                  ? 'bg-daun-tua text-putih shadow-cahaya-limau'
                  : 'border border-garis bg-putih text-teks hover:bg-embun-pagi',
              )}
            >
              Terkunci ({data.lencana_terkunci.length})
            </button>
          </div>
        </div>

        {/* Daftar Lencana */}
        {tabAktif === 'diraih' ? (
          data.lencana.length === 0 ? (
            <div className="rounded-kartu border border-dashed border-garis py-8 text-center text-teks-pendukung">
              Belum ada lencana yang diraih. Kerjakan tugas kebun dan catat pengukuran untuk meraih lencana pertama.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {data.lencana.map((l) => (
                <button
                  key={l.kode}
                  type="button"
                  onClick={() =>
                    setLencanaDipilih({
                      kode: l.kode,
                      nama: l.nama,
                      diraih_pada: l.diraih_pada,
                      diraih: true,
                    })
                  }
                  className="flex min-h-sentuh flex-col items-center gap-2 rounded-kartu border border-garis bg-putih p-4 text-center transition hover:border-daun-tua hover:shadow-kartu"
                >
                  <img
                    src={`/lencana/${l.kode}.svg`}
                    alt={l.nama}
                    className="h-16 w-16"
                  />
                  <span className="font-semibold text-teks">{l.nama}</span>
                  <LabelKecil nada="hijau">Tercapai</LabelKecil>
                </button>
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.lencana_terkunci.map((l) => (
              <button
                key={l.kode}
                type="button"
                onClick={() =>
                  setLencanaDipilih({
                    kode: l.kode,
                    nama: l.nama,
                    syarat: l.syarat,
                    kemajuan: l.kemajuan,
                    diraih: false,
                  })
                }
                className="flex min-h-sentuh items-center gap-3 rounded-kartu border border-garis bg-embun-pagi p-3 text-left transition hover:bg-putih"
              >
                <div className="flex h-14 w-14 flex-none items-center justify-center rounded-kartu border border-garis bg-putih p-1 opacity-50">
                  <img
                    src={`/lencana/${l.kode}.svg`}
                    alt={l.nama}
                    className="h-12 w-12"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-semibold text-teks">{l.nama}</span>
                  <span className="truncate text-teks-pendukung">{l.syarat}</span>
                  <span className="font-medium text-tanah">Kemajuan: {l.kemajuan}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog Lencana */}
      {lencanaDipilih ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-teks/50 p-4"
          onClick={() => setLencanaDipilih(null)}
        >
          <div
            className="flex w-full max-w-sm flex-col items-center gap-4 rounded-kartu border border-garis bg-putih p-6 text-center shadow-kartu"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`/lencana/${lencanaDipilih.kode}.svg`}
              alt={lencanaDipilih.nama}
              className={cx('h-24 w-24', !lencanaDipilih.diraih && 'opacity-50')}
            />
            <h4 className="m-0 text-judul-bagian font-semibold text-teks">
              {lencanaDipilih.nama}
            </h4>

            <div>
              {lencanaDipilih.diraih ? (
                <LabelKecil nada="hijau">Berhasil diraih</LabelKecil>
              ) : (
                <LabelKecil nada="garis">Masih terkunci</LabelKecil>
              )}
            </div>

            {lencanaDipilih.syarat ? (
              <div className="w-full rounded-kartu border border-garis bg-embun-pagi p-3 text-left">
                <span className="block font-medium text-teks-pendukung">Syarat pencapaian:</span>
                <p className="mb-0 mt-1 text-teks">{lencanaDipilih.syarat}</p>
                {lencanaDipilih.kemajuan ? (
                  <p className="mb-0 mt-2 font-medium text-tanah">
                    Kemajuan saat ini: {lencanaDipilih.kemajuan}
                  </p>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setLencanaDipilih(null)}
              className="min-h-sentuh w-full rounded-full border border-garis bg-embun-pagi px-4 font-semibold text-teks hover:bg-putih"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </Kartu>
  );
}

/** Lencana kecil untuk ditampilkan di samping nama pengguna di sidebar / header */
export function LencanaPeringkatKecil() {
  const aktif = fiturAktif('LEVEL');
  const { data } = useLevelPengguna(aktif);

  if (!aktif || !data) {
    return null;
  }

  return (
    <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-garis bg-daun-lembut px-2 font-medium text-daun-tua">
      <img src={`/lencana/${data.ikon}.svg`} alt="" className="h-4 w-4" />
      <span>{data.level}</span>
    </span>
  );
}
