/**
 * Ringkasan hasil kalkulator (papan 16, 18, 19, T4.07, PRD P0-10, P0-36): harga jual, modal (atau
 * "Modal siklus ini" bila ada alat), bahan dan bagian alat, modal per m², titik impas, perkiraan
 * untung; rugi tampil merah dengan ikon dan kalimat PRD. Semua angka dari `hitungRingkasan`.
 */
import { Banner } from '../../komponen/banner';
import { Ikon } from '../../komponen/ikon';
import { InputRupiah } from '../../komponen/input-rupiah';
import { Kartu } from '../../komponen/kartu';
import { LabelKecil } from '../../komponen/label-kecil';
import { Uang } from '../../komponen/uang';
import { formatRupiah } from '../../lib/format';
import { teksHitung as t } from '../../teks/hitung';
import { teksUmum } from '../../teks/umum';
import { angkaJumlah } from './baris-item';
import type { Rencana } from './use-rencana';

const satuanPanen = (r: Rencana) => r.komoditas?.satuan_panen ?? 'kg';

/** Isian harga jual per satuan panen; bawaan dari pesanan terdekat untuk komoditas ini. */
export function IsianHargaJual({ r }: { r: Rencana }) {
  return (
    <InputRupiah
      label={t.hargaJual(satuanPanen(r))}
      nilai={r.hargaJual}
      onUbah={(v) => r.setHargaJual(v)}
      tanpaTerbilang
      bantuan={r.hargaJualDari ? t.hargaJualDariPesanan(r.hargaJualDari) : t.hargaJualBantuan}
    />
  );
}

export function KartuRingkasan({ r }: { r: Rencana }) {
  const m = r.modal?.ok ? r.modal.nilai : null;
  const ring = r.ringkasan?.ok ? r.ringkasan.nilai : null;
  const adaAlat = (m?.totalAlat ?? 0) > 0;
  const s = satuanPanen(r);
  return (
    <Kartu
      judul={t.ringkasan}
      keterangan={
        r.perkiraanKg !== null ? t.ringkasanKet(angkaJumlah(r.perkiraanKg), s) : undefined
      }
      tingkatJudul={2}
      nadaKaki="uang"
      kaki={
        m ? (
          <div className="flex w-full flex-col gap-2">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Uang label={adaAlat ? t.modalSiklusIni : t.totalModal} nilai={m.totalModal} besar />
              {ring ? (
                <Uang
                  label={t.perkiraanUntung}
                  nilai={ring.untung}
                  besar
                  keterangan={t.kalauPanen(angkaJumlah(ring.panenKg), s)}
                />
              ) : null}
            </div>
            {ring?.rugi ? (
              <p className="m-0 flex items-start gap-2 text-keterangan font-medium text-tomat">
                <Ikon nama="peringatan" ukuran={20} className="mt-px" />
                <span>{t.rugi}</span>
              </p>
            ) : null}
          </div>
        ) : null
      }
    >
      <div className="flex flex-col gap-3">
        {r.resepApi?.contoh ? (
          <LabelKecil nada="contoh" className="self-start">
            {teksUmum.labelContoh}
          </LabelKecil>
        ) : null}
        <IsianHargaJual r={r} />
        {m && adaAlat ? (
          <dl className="m-0 flex flex-col gap-1 border-t border-garis pt-3">
            <div className="flex justify-between gap-3">
              <dt className="text-teks-pendukung">{t.bahanPerSiklus}</dt>
              <dd className="m-0 font-medium tabular-nums">{formatRupiah(m.totalBahan)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-teks-pendukung">{t.bagianAlat}</dt>
              <dd className="m-0 font-medium tabular-nums">{formatRupiah(m.biayaAlatPerSiklus)}</dd>
            </div>
          </dl>
        ) : null}
        {ring ? (
          <dl className="m-0 flex flex-col gap-3 border-t border-garis pt-3">
            <div className="flex items-start justify-between gap-3">
              <dt className="flex flex-col">
                <span>{t.titikImpas}</span>
                <span className="text-keterangan text-teks-pendukung">
                  {t.titikImpasKet(angkaJumlah(ring.titikImpasKg), s)}
                </span>
              </dt>
              <dd className="m-0 text-uang font-semibold tabular-nums">{`${angkaJumlah(ring.titikImpasKg)} ${s}`}</dd>
            </div>
            {ring.modalPerM2 !== null ? (
              <div className="flex justify-between gap-3">
                <dt>{t.modalPerM2}</dt>
                <dd className="m-0 font-medium tabular-nums">{formatRupiah(ring.modalPerM2)}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        {m && !m.lengkap ? (
          <Banner jenis="peringatan">{t.belumLengkap(m.itemTanpaHarga.length)}</Banner>
        ) : null}
      </div>
    </Kartu>
  );
}

/** Ringkasan ringkas di bilah bawah HP (papan 16 mobile). */
export function RingkasBawah({ r }: { r: Rencana }) {
  const m = r.modal?.ok ? r.modal.nilai : null;
  const ring = r.ringkasan?.ok ? r.ringkasan.nilai : null;
  if (!m) return null;
  const s = satuanPanen(r);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-3">
        <Uang
          label={m.totalAlat > 0 ? t.modalSiklusIni : t.totalModal}
          nilai={m.totalModal}
          besar
        />
        {ring ? (
          <Uang
            label={t.perkiraanUntung}
            nilai={ring.untung}
            besar
            className="items-end text-right"
          />
        ) : null}
      </div>
      {ring ? (
        <span className="text-keterangan text-teks-pendukung">
          {t.titikImpasPendek(angkaJumlah(ring.titikImpasKg), s)}
          {ring.rugi ? ` · ${t.rugi}` : ''}
        </span>
      ) : (
        <span className="text-keterangan text-teks-pendukung">{t.hargaJualBantuan}</span>
      )}
      {!m.lengkap ? (
        <span className="flex items-center gap-1.5 text-keterangan font-medium text-matahari-teks">
          <Ikon nama="peringatan" ukuran={18} />
          {t.belumLengkap(m.itemTanpaHarga.length)}
        </span>
      ) : null}
    </div>
  );
}
