/**
 * Segera hadir dan Minta resep (papan 11 dan 12, T4.03, PRD P0-31): lembar bawah di HP, dialog di
 * desktop. Permintaan tercatat per komoditas (dan cara tanam) lewat klien API; ketuk ulang menampilkan
 * keadaan "sudah diminta" tanpa membuat permintaan ganda.
 */
import type { ReactNode } from 'react';
import { useMintaResep, usePermintaanSaya } from '../../api/kueri';
import { Dialog } from '../../komponen/dialog';
import { Ikon } from '../../komponen/ikon';
import { LabelKecil } from '../../komponen/label-kecil';
import { PesanKolom } from '../../komponen/kolom-isian';
import { Tombol } from '../../komponen/tombol';
import { teksHitung as t } from '../../teks/hitung';

export function SegeraHadir({
  terbuka,
  onTutup,
  judul,
  keterangan,
  ilustrasi,
  komoditasId,
  metodeId = null,
  labelPilihLain = t.pilihTanamanLain,
}: {
  terbuka: boolean;
  onTutup: () => void;
  judul: string;
  keterangan: string;
  ilustrasi: ReactNode;
  komoditasId: string;
  metodeId?: string | null;
  labelPilihLain?: string;
}) {
  const minta = useMintaResep();
  const permintaanQ = usePermintaanSaya();
  const sudah =
    minta.isSuccess ||
    (permintaanQ.data ?? []).some(
      (p) => p.komoditas_id === komoditasId && (metodeId === null || p.metode_id === metodeId),
    );

  return (
    <Dialog
      terbuka={terbuka}
      onTutup={onTutup}
      judul={judul}
      keterangan={keterangan}
      kepala={ilustrasi}
    >
      <div className="flex flex-col gap-4">
        {sudah ? (
          <div role="status" className="flex items-start gap-3 rounded-md bg-daun-lembut p-4">
            <span className="grid h-7.5 w-7.5 flex-none place-items-center rounded-full bg-daun-tua text-putih">
              <Ikon nama="centang" ukuran={18} tebal={3} />
            </span>
            <span className="flex flex-col">
              <span className="font-semibold">{t.tercatatJudul}</span>
              <span>{t.tercatatIsi}</span>
            </span>
          </div>
        ) : (
          <>
            <LabelKecil nada="segera" className="self-start">
              {t.segeraHadir}
            </LabelKecil>
            <p className="m-0">{metodeId ? t.segeraIsiMetode : t.segeraIsi}</p>
            <p className="m-0 text-keterangan text-teks-pendukung">{t.segeraAjak}</p>
          </>
        )}
        {minta.isError ? <PesanKolom id="minta-resep" galat={minta.error.message} /> : null}
        <div className="flex flex-col gap-3 lg:flex-row-reverse">
          {sudah ? (
            <Tombol onClick={onTutup} className="lg:ml-auto">
              {labelPilihLain}
            </Tombol>
          ) : (
            <>
              <Tombol
                penuh
                disabled={minta.isPending}
                onClick={() =>
                  minta.mutate({
                    komoditas_id: komoditasId,
                    ...(metodeId ? { metode_id: metodeId } : {}),
                  })
                }
              >
                {minta.isPending ? t.mengirimPermintaan : t.mintaResep}
              </Tombol>
              <Tombol varian="sekunder" penuh onClick={onTutup}>
                {labelPilihLain}
              </Tombol>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
