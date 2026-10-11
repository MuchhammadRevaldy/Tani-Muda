/**
 * Isian ukuran sesuai cara tanam (papan 13–15, T4.04, PRD P0-32, P0-33): luas dengan satuan
 * m²/ru-bata/hektare, jumlah polybag, atau sistem hidroponik + lubang + tandon + vertikultur.
 * Teks bantuan konversi dari `teksBantuanLuas`; galat dari kode `validasiUkuran`.
 */
import type { MetodeTanam } from '../../api/tipe';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { KolomIsian } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { PilPilihan } from '../../komponen/pilihan';
import { Saklar } from '../../komponen/pilihan';
import { formatDesimal, titikRibuan } from '../../lib/format';
import { teksGalat } from '../../teks/galat';
import { teksHitung as t } from '../../teks/hitung';
import { teksUmum } from '../../teks/umum';
import type { PilihanHitung, SatuanPilihan } from './pilihan';
import type { Rencana } from './use-rencana';

const angka = (n: number) => (Number.isInteger(n) ? titikRibuan(n) : formatDesimal(n, 2));

export function FormUkuran({
  pilihan,
  ubah,
  rencana: r,
  metode,
  tampilGalat,
}: {
  pilihan: PilihanHitung;
  ubah: (x: Partial<PilihanHitung>) => void;
  rencana: Rencana;
  metode: MetodeTanam;
  tampilGalat: boolean;
}) {
  const galat =
    tampilGalat && r.ukuranValid && !r.ukuranValid.ok ? teksGalat[r.ukuranValid.galat] : undefined;
  const dasar = r.resepApi?.dasar_ukuran ?? metode.dasar_ukuran;

  if (dasar === 'luas') {
    const opsi: { nilai: SatuanPilihan; label: string }[] = [
      { nilai: 'm2', label: t.namaSatuan.m2 },
      ...(r.konversi.ru ? [{ nilai: 'ru' as const, label: t.namaSatuan.ru }] : []),
      { nilai: 'hektare', label: t.namaSatuan.hektare },
    ];
    return (
      <Kartu judul={t.judulLuas(metode.nama)} tingkatJudul={2}>
        <div className="flex flex-col gap-4">
          <PilPilihan<SatuanPilihan>
            gaya="segmen"
            label={t.satuanLuas}
            opsi={opsi}
            nilai={pilihan.satuan}
            onPilih={(satuan) => ubah({ satuan })}
          />
          <KolomIsian
            label={t.luasLahan}
            inputMode="decimal"
            value={pilihan.nilai}
            onChange={(e) => ubah({ nilai: e.target.value })}
            akhiran={t.akhiranSatuan[pilihan.satuan]}
            galat={galat}
            bantuan={r.bantuanLuas ? t.kiraKira(r.bantuanLuas) : undefined}
          />
        </div>
      </Kartu>
    );
  }

  if (dasar === 'polybag') {
    return (
      <Kartu judul={t.judulPolybag} tingkatJudul={2}>
        <KolomIsian
          label={t.jumlahPolybag}
          inputMode="numeric"
          value={pilihan.nilai}
          onChange={(e) => ubah({ nilai: e.target.value })}
          akhiran={t.polybag}
          galat={galat}
        />
      </Kartu>
    );
  }

  const sistem = r.sistem;
  return (
    <Kartu judul={t.judulHidroponik} tingkatJudul={2}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-medium">{t.sistem}</span>
          <PilPilihan
            gaya="segmen"
            label={t.sistem}
            opsi={r.daftarSistem.map((s) => ({ nilai: s.id, label: s.nama }))}
            nilai={sistem?.id ?? ''}
            onPilih={(id) => ubah({ sistem: id, tandon: '' })}
          />
          {sistem ? (
            <p className="m-0 text-keterangan text-teks-pendukung">{sistem.keterangan}</p>
          ) : null}
        </div>
        <KolomIsian
          label={t.jumlahLubang}
          inputMode="numeric"
          value={pilihan.nilai}
          onChange={(e) => ubah({ nilai: e.target.value })}
          akhiran={t.lubang}
          galat={galat}
        />
        <KolomIsian
          label={t.volumeTandon}
          inputMode="decimal"
          value={pilihan.tandon}
          placeholder={r.saranTandon !== null ? angka(r.saranTandon) : undefined}
          onChange={(e) => ubah({ tandon: e.target.value })}
          akhiran={t.liter}
          bantuan={
            sistem && r.jumlahUnit && r.saranTandon !== null
              ? t.saranTandon(angka(r.jumlahUnit), sistem.nama, angka(r.saranTandon))
              : undefined
          }
        />
        {metode.bisa_vertikultur ? (
          <div className="flex items-center justify-between gap-3 border-t border-garis pt-4">
            <span className="flex flex-col">
              <span className="font-medium">{t.vertikultur}</span>
              <span className="text-keterangan text-teks-pendukung">{t.vertikulturKet}</span>
            </span>
            <Saklar
              label={t.vertikultur}
              aktif={pilihan.vertikultur}
              onUbah={(v) => ubah({ vertikultur: v })}
            />
          </div>
        ) : null}
        {r.butuhTempatM2 ? (
          <div className="flex items-center justify-between gap-3 rounded-md bg-embun-pagi px-3 py-2.5">
            <span className="text-teks-pendukung">{t.butuhTempat}</span>
            <span className="font-semibold">{`${angka(r.butuhTempatM2)} m²`}</span>
          </div>
        ) : null}
      </div>
    </Kartu>
  );
}

/** Kartu perkiraan panen (latar tanah lembut, ikon panen) dengan label contoh (D-36). */
export function KartuPerkiraanPanen({ r, ringkas }: { r: Rencana; ringkas: string }) {
  if (r.perkiraanKg === null || !r.komoditas) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg bg-tanah-lembut p-4">
      <Ikon nama="panen" className="flex-none text-tanah" />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-semibold">
          {t.perkiraanPanen(angka(r.perkiraanKg), r.komoditas.satuan_panen)}
        </span>
        <span className="text-keterangan text-teks-pendukung">{ringkas}</span>
        {r.resepApi?.contoh ? (
          <LabelKecil nada="contoh" className="mt-1 self-start">
            {teksUmum.labelContoh}
          </LabelKecil>
        ) : null}
      </div>
    </div>
  );
}
