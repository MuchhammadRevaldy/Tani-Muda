/**
 * Permintaan resep (turunan, T4.38, PRD P0-04, US-31): tanaman yang diminta petani lewat "Minta
 * resep ini", dijumlah per tanaman, cara tanam, dan kecamatan, terbanyak di atas. Desktop saja (D-07).
 */
import { useKomoditas, useMetode, useRingkasanPermintaan } from '../../api/kueri';
import { Kepala, Sel, Tabel } from '../../komponen/tabel';
import { teksPanel } from '../../teks/panel';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { KerangkaPanelSesi } from '../panel/kerangka-panel-sesi';

const t = teksPanel.mentor;

export function HalamanPermintaanResep() {
  const q = useRingkasanPermintaan();
  const komoditasQ = useKomoditas();
  const metodeQ = useMetode();
  const daftar = [...(q.data ?? [])].sort((a, b) => b.jumlah - a.jumlah);
  return (
    <KerangkaPanelSesi judul={t.permintaanJudul} keterangan={t.permintaanKet}>
      {q.isPending ? (
        <Memuat />
      ) : q.isError ? (
        <p className="m-0 text-teks-pendukung">{teksUmum.galatIsi}</p>
      ) : !daftar.length ? (
        <p className="m-0 rounded-lg border border-garis bg-putih p-6 text-teks-pendukung">
          {teksPanel.kosong}
        </p>
      ) : (
        <Tabel
          label={t.permintaanJudul}
          kepala={
            <>
              <Kepala>{t.kolomTanaman}</Kepala>
              <Kepala>{t.kolomCara}</Kepala>
              <Kepala>{t.kolomKecamatan}</Kepala>
              <Kepala className="text-right">{t.kolomJumlah}</Kepala>
            </>
          }
        >
          {daftar.map((x) => (
            <tr key={`${x.komoditas_id}|${x.metode_id}|${x.kecamatan}`}>
              <Sel className="font-semibold">
                {komoditasQ.data?.find((k) => k.id === x.komoditas_id)?.nama ?? x.komoditas_id}
              </Sel>
              <Sel>
                {x.metode_id
                  ? (metodeQ.data?.find((m) => m.id === x.metode_id)?.nama ?? x.metode_id)
                  : t.semuaCara}
              </Sel>
              <Sel>{x.kecamatan || '–'}</Sel>
              <Sel className="text-right font-semibold tabular-nums">{x.jumlah}</Sel>
            </tr>
          ))}
        </Tabel>
      )}
    </KerangkaPanelSesi>
  );
}
