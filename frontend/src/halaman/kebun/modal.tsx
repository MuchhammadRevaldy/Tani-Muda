/**
 * Detail siklus: Modal (papan 27, T4.15, PRD P0-18): rencana dan realisasi, perkiraan modal akhir
 * dan untung, per item sesuai/hemat/lebih/belum dibeli (`hitungRealisasi`), catat pengeluaran.
 */
import { useState } from 'react';
import { usePengeluaran } from '../../api/kueri';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { LabelKecil } from '../../komponen/label-kecil';
import { Tombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { cx } from '../../komponen/gabung-kelas';
import { formatRupiah } from '../../lib/format';
import { hitungRealisasi, type ItemRealisasi } from '../../lib/realisasi';
import { hitungRingkasan } from '../../lib/ringkasan';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';
import { angkaUkur } from '../beranda/kartu-samping';
import { DialogCatatPengeluaran } from './catat-pengeluaran';
import { KerangkaSiklus, type DataSiklus } from './kerangka-siklus';

function KetStatus({ i }: { i: ItemRealisasi }) {
  if (i.status === 'hemat')
    return (
      <span className="font-medium text-daun-tua">
        {t.statusItem.hemat(formatRupiah(i.selisih))}
      </span>
    );
  if (i.status === 'lebih')
    return (
      <span className="inline-flex items-start gap-1.5 font-medium text-tomat-teks">
        <Ikon nama="peringatan" ukuran={18} className="mt-0.5" />
        {t.statusItem.lebih(formatRupiah(i.selisih))}
      </span>
    );
  return <span className="text-teks-pendukung">{t.statusItem[i.status]}</span>;
}

function Isi({ d }: { d: DataSiklus }) {
  const s = d.siklus;
  const pengeluaranQ = usePengeluaran(s.id);
  const [catat, setCatat] = useState(false);
  const [info, setInfo] = useState(false);
  const r = hitungRealisasi(
    s.rencana_item.map((i) => ({
      id: i.id,
      nama: i.nama,
      jumlah: i.jumlah,
      hargaSatuan: i.harga_satuan,
      alatSekaliBeli: i.alat_sekali_beli,
      jumlahSiklusPembagian: i.jumlah_siklus_pembagian,
    })),
    (pengeluaranQ.data ?? []).map((p) => ({
      rencanaItemId: p.rencana_item_id,
      nama: p.nama,
      nominal: p.nominal,
    })),
  );
  const untung = hitungRingkasan({
    totalModal: r.perkiraanModalAkhir,
    perkiraanPanenKg: s.perkiraan_panen_kg,
    hargaJual: s.harga_jual,
  });
  const satuan = d.komoditas?.satuan_panen ?? 'kg';

  return (
    <>
      <Kartu
        judul={t.rencanaRealisasi}
        keterangan={t.sudahKeluarPersen(r.persen)}
        tingkatJudul={2}
        nadaKaki="uang"
        kaki={
          <div className="flex w-full flex-col gap-3">
            <Uang
              label={t.modalAkhir}
              nilai={r.perkiraanModalAkhir}
              besar
              keterangan={t.modalAkhirKet}
            />
            {untung.ok ? (
              <Uang
                label={t.perkiraanUntung}
                nilai={untung.nilai.untung}
                besar
                keterangan={t.kalauPanen(angkaUkur(s.perkiraan_panen_kg), satuan)}
              />
            ) : null}
            {untung.ok && untung.nilai.rugi ? (
              <p className="m-0 flex items-start gap-2 text-keterangan font-medium text-tomat-teks">
                <Ikon nama="peringatan" ukuran={20} className="mt-px" />
                {t.rugi}
              </p>
            ) : null}
          </div>
        }
      >
        <div className="flex flex-col gap-2.5">
          {s.resep_contoh ? (
            <LabelKecil nada="contoh" className="self-start">
              {teksUmum.labelContoh}
            </LabelKecil>
          ) : null}
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <Uang label={t.sudahKeluar} nilai={r.sudahKeluar} besar />
            <span className="text-keterangan text-teks-pendukung">
              {t.dariRencana(formatRupiah(r.totalRencana))}
            </span>
          </div>
          <div
            role="img"
            aria-label={t.persenAria(r.persen)}
            className="h-3 overflow-hidden rounded-full bg-garis"
          >
            <div
              className="h-full rounded-full bg-tanah"
              style={{ width: `${Math.min(r.persen, 100)}%` }}
            />
          </div>
        </div>
      </Kartu>

      <section aria-labelledby="judul-per-item" className="flex flex-col gap-3">
        <h2 id="judul-per-item" className="m-0 text-judul-bagian font-semibold">
          {t.perItem}
        </h2>
        <div className="overflow-hidden rounded-lg border border-garis bg-putih px-4">
          {r.item.map((i) => (
            <div
              key={i.id}
              className="flex items-start justify-between gap-3 border-b border-garis py-3 last:border-b-0"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-semibold">{i.nama}</span>
                <span className="text-keterangan text-teks-pendukung">
                  {i.rencana !== null ? t.rencanaRp(formatRupiah(i.rencana)) : t.rencanaBelumHarga}
                </span>
                <span className="text-keterangan">
                  <KetStatus i={i} />
                </span>
              </span>
              <span className={cx('flex-none', i.status === 'belum' && 'text-teks-pendukung')}>
                {i.status === 'belum' ? t.belum : <Uang nilai={i.keluar} />}
              </span>
            </div>
          ))}
          {r.tanpaRencana.map((p, n) => (
            <div
              key={`lain-${n}`}
              className="flex items-start justify-between gap-3 border-b border-garis py-3 last:border-b-0"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-semibold">{p.nama}</span>
                <span className="text-keterangan text-teks-pendukung">{t.tanpaRencana}</span>
              </span>
              <Uang nilai={p.nominal} />
            </div>
          ))}
        </div>
      </section>
      {info ? (
        <p role="status" className="m-0 flex items-center gap-2 font-medium text-daun-tua">
          <Ikon nama="centang" ukuran={20} />
          {t.pengeluaranTersimpan}
        </p>
      ) : null}
      {s.status !== 'selesai' ? (
        <Tombol penuh onClick={() => setCatat(true)}>
          {t.catatPengeluaran}
        </Tombol>
      ) : null}
      <DialogCatatPengeluaran
        siklusId={s.id}
        item={s.rencana_item}
        terbuka={catat}
        onTutup={() => setCatat(false)}
        onTersimpan={() => {
          setCatat(false);
          setInfo(true);
        }}
      />
    </>
  );
}

export function HalamanModalSiklus() {
  return <KerangkaSiklus>{(d) => <Isi d={d} />}</KerangkaSiklus>;
}
