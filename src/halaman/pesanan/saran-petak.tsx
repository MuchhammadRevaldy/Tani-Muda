/**
 * Saran tanam bertahap (papan 31, D-40): satu petak per kiriman yang ditanggung, ditanam umur panen
 * sebelum kirimannya, di bedengan yang dipakai bergilir. Angka dari `rencanaPetak`.
 */
import { useState } from 'react';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { Tombol } from '../../komponen/tombol';
import { formatTanggal, formatTanggalPendek } from '../../lib/format';
import { rencanaPetak, type JadwalKirim } from '../../lib/pesanan-lahan';
import { selisihHari } from '../../lib/tanggal';
import { teksPesanan as t } from '../../teks/pesanan';

export function KartuSaranPetak({
  kiriman,
  frekuensiHari,
  umurPanenHari,
  hasilPerSatuan,
  jumlahKg,
  lubang,
}: {
  kiriman: JadwalKirim[];
  frekuensiHari: number;
  umurPanenHari: number;
  hasilPerSatuan: number;
  jumlahKg: number;
  /** Rak hidroponik: satuan lubang dan "petak", bukan m² dan "bedengan". */
  lubang: boolean;
}) {
  const [semua, setSemua] = useState(false);
  const r = rencanaPetak({ kiriman, frekuensiHari, umurPanenHari, jumlahKg, hasilPerSatuan });
  if (!r.ok || !r.nilai.petak.length) return null;
  const { petak, bersamaan } = r.nilai;
  const satuan = lubang ? t.petak : t.bedengan;
  const awal = petak[0]!.tanggalTanam;
  const akhir = petak[petak.length - 1]!.tanggalPanen;
  const rentang = Math.max(1, selisihHari(awal, akhir));
  const persen = (tanggal: string) => (selisihHari(awal, tanggal) / rentang) * 100;
  // Petak pertama sampai satu putaran penuh bedengan, sisanya bisa dibuka.
  const batas = bersamaan + 1;
  const tampil = semua ? petak : petak.slice(0, batas);
  return (
    <Kartu
      judul={t.saranJudul}
      tingkatJudul={2}
      keterangan={t.saranKet(
        petak.length,
        t.satuanLahan(r.nilai.luasPerPetak, lubang),
        bersamaan,
        t.satuanLahan(r.nilai.luasDibutuhkan, lubang),
        satuan,
      )}
    >
      <div className="flex flex-col gap-3">
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {tampil.map((x) => {
            const nama = t.petakPanen(formatTanggalPendek(x.tanggalPanen));
            return (
              <li key={x.ke} className="grid grid-cols-baris-petak items-center gap-3">
                <span className="flex flex-col">
                  <span className="font-semibold">{nama}</span>
                  <span className="text-keterangan text-teks-pendukung">
                    {t.tanamDiBedengan(formatTanggalPendek(x.tanggalTanam), satuan, x.bedengan)}
                  </span>
                </span>
                <span
                  className="relative mr-3.5 block h-7"
                  role="img"
                  aria-label={t.barisPetak(
                    nama,
                    formatTanggalPendek(x.tanggalTanam),
                    formatTanggalPendek(x.tanggalPanen),
                  )}
                >
                  <span className="absolute inset-x-0 top-3 h-1 rounded-full bg-garis" />
                  <span
                    className="absolute top-2.5 h-2 rounded-full bg-daun-tua"
                    style={{
                      left: `${persen(x.tanggalTanam)}%`,
                      width: `${persen(x.tanggalPanen) - persen(x.tanggalTanam)}%`,
                    }}
                  />
                  <span
                    className="absolute top-0 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full border-2 border-tanah bg-putih text-tanah"
                    style={{ left: `${persen(x.tanggalPanen)}%` }}
                  >
                    <Ikon nama="panen" ukuran={16} />
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        {petak.length > batas ? (
          <Tombol varian="sekunder" penuh onClick={() => setSemua(!semua)}>
            {semua ? t.tampilkanSedikit : t.tampilkanSemuaPetak(petak.length)}
          </Tombol>
        ) : null}
        <p className="m-0 text-keterangan text-teks-pendukung">
          {t.saranKaki(formatTanggal(petak[0]!.tanggalPanen), satuan)}
        </p>
      </div>
    </Kartu>
  );
}
