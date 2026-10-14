/**
 * Satu item kalkulator (papan 16–19, T4.05, T4.06): nama · jumlah satuan, sumber harga, subtotal,
 * pilihan Subsidi/Nonsubsidi untuk item yang layak, "Pilih merek". Desktop: baris tabel dengan isian
 * jumlah dan harga. HP: baris ringkas dengan panel "Ubah jumlah".
 */
import { useState } from 'react';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { InputRupiah } from '../../komponen/input-rupiah';
import { KolomIsian } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { PilPilihan } from '../../komponen/pilihan';
import { Uang } from '../../komponen/uang';
import { formatDesimal, formatRupiah, titikRibuan } from '../../lib/format';
import type { HargaItem, ItemRencana } from '../../lib/rencana';
import { teksHitung as t } from '../../teks/hitung';
import { angkaIsian } from './pilihan';

export const angkaJumlah = (n: number) =>
  Number.isInteger(n) ? titikRibuan(n) : formatDesimal(n, 2);

function teksSumber(item: ItemRencana, h: HargaItem, jumlahLaporan: number): string {
  if (h.harga === null || h.sumber === 'belum_ada') return t.hargaBelum;
  const rp = formatRupiah(h.harga);
  if (h.sumber === 'merek') return t.sumberHarga.merek(rp, item.satuan, item.merek?.nama ?? '');
  if (h.sumber === 'rata_sekitar')
    return t.sumberHarga.rata_sekitar(rp, item.satuan, jumlahLaporan);
  return t.sumberHarga[h.sumber](rp, item.satuan);
}

const tautanAksi =
  'fokus-cincin -ml-2 inline-flex min-h-sentuh cursor-pointer items-center gap-1.5 rounded-ikon border-0 bg-transparent px-2 text-isi font-semibold text-daun-tua';

function PilihanSubsidi({
  item,
  onUbah,
}: {
  item: ItemRencana;
  onUbah: (ubah: Partial<ItemRencana>) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <PilPilihan<'ya' | 'tidak'>
        gaya="kotak"
        label={`${t.jenisPupuk} ${item.nama}`}
        opsi={[
          { nilai: 'ya', label: t.subsidi },
          { nilai: 'tidak', label: t.nonsubsidi },
        ]}
        nilai={item.pilihSubsidi ? 'ya' : 'tidak'}
        onPilih={(v) => onUbah({ pilihSubsidi: v === 'ya' })}
      />
      <span className="text-keterangan text-teks-pendukung">{t.catatanSubsidi}</span>
    </div>
  );
}

/** Isian jumlah dengan teks bebas ("1,5"); angka disimpan saat valid. */
function IsianJumlah({
  item,
  onUbah,
  ringkas,
}: {
  item: ItemRencana;
  onUbah: (ubah: Partial<ItemRencana>) => void;
  ringkas?: boolean;
}) {
  const [teks, setTeks] = useState(angkaJumlah(item.jumlah));
  const nilai = angkaIsian(teks);
  return (
    <KolomIsian
      label={ringkas ? t.jumlahItem(item.nama || t.itemBaru) : t.jumlah}
      labelTersembunyi={ringkas}
      inputMode="decimal"
      value={teks}
      onChange={(e) => {
        setTeks(e.target.value);
        const n = angkaIsian(e.target.value);
        if (n !== null && n >= 0) onUbah({ jumlah: n });
      }}
      akhiran={item.satuan}
      galat={teks && (nilai === null || nilai < 0) ? t.isiUkuranDulu : undefined}
      className={ringkas ? 'w-full' : undefined}
    />
  );
}

export function BarisItem({
  item,
  harga,
  subtotal,
  lebar,
  onUbah,
  onHapus,
  onPilihMerek,
  terbukaAwal = false,
  jumlahLaporan = 0,
}: {
  item: ItemRencana;
  harga: HargaItem;
  subtotal: number | null;
  lebar: boolean;
  onUbah: (ubah: Partial<ItemRencana>) => void;
  onHapus?: () => void;
  onPilihMerek?: () => void;
  terbukaAwal?: boolean;
  /** Jumlah laporan harga di kecamatan untuk input ini (sumber "Rata-rata n laporan"). */
  jumlahLaporan?: number;
}) {
  const [terbuka, setTerbuka] = useState(terbukaAwal);
  const nama = item.nama || t.itemBaru;
  const subsidiAktif = harga.sumber === 'subsidi';
  const dilewati = item.disertakan === false;
  const subtotalTampil = dilewati ? (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-keterangan text-teks-pendukung line-through">
      Dilewati (Rp 0)
    </span>
  ) : subtotal === null ? (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-tomat-teks">
      <Ikon nama="peringatan" ukuran={18} />
      {t.hargaBelum}
    </span>
  ) : (
    <Uang nilai={subtotal} />
  );
  const tombolMerek = onPilihMerek && !dilewati ? (
    <button type="button" onClick={onPilihMerek} className={tautanAksi}>
      <Ikon nama="label" ukuran={20} />
      {item.merek ? t.gantiMerek : t.pilihMerek}
    </button>
  ) : null;
  const tombolHapus = onHapus ? (
    <button type="button" onClick={onHapus} className={cx(tautanAksi, 'text-tomat-teks')}>
      <Ikon nama="hapus" ukuran={20} />
      {t.hapusItem(item.nama)}
    </button>
  ) : null;
  const tombolOpsional = item.opsional ? (
    <button
      type="button"
      onClick={() => onUbah({ disertakan: dilewati ? true : false })}
      className={cx(
        'fokus-cincin inline-flex min-h-sentuh items-center gap-1.5 rounded-ikon border-0 bg-transparent px-2 text-keterangan font-medium',
        dilewati ? 'text-daun-tua' : 'text-teks-pendukung hover:text-teks',
      )}
    >
      <Ikon nama={dilewati ? 'centang' : 'silang'} ukuran={16} />
      {dilewati ? 'Sertakan dalam modal' : 'Lewati item ini'}
    </button>
  ) : null;
  const isianHarga = (
    <InputRupiah
      label={lebar ? t.hargaItem(nama) : t.hargaPer(item.satuan)}
      labelTersembunyi={lebar}
      tanpaTerbilang
      nilai={harga.harga}
      disabled={subsidiAktif || dilewati}
      onUbah={(v) => onUbah({ hargaIsiSendiri: v, merek: null })}
    />
  );

  if (lebar) {
    return (
      <div className={cx("grid grid-cols-12 items-start gap-3 py-4 [&+&]:border-t [&+&]:border-garis", dilewati && "opacity-60")}>
        <div className="col-span-4 flex min-w-0 flex-col gap-1">
          {item.asal === 'tambahan' ? (
            <KolomIsian
              label={t.namaItem}
              labelTersembunyi
              value={item.nama}
              placeholder={t.namaItem}
              onChange={(e) => onUbah({ nama: e.target.value })}
            />
          ) : (
            <span className={cx("font-semibold", dilewati && "line-through")}>
              {t.namaJumlah(item.nama, angkaJumlah(item.jumlah), item.satuan)}
            </span>
          )}
          {item.opsional ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <LabelKecil nada="garis" className="text-keterangan">
                Opsional
              </LabelKecil>
              {item.keteranganOpsional ? (
                <span className="text-keterangan text-teks-pendukung italic">
                  {item.keteranganOpsional}
                </span>
              ) : null}
            </div>
          ) : null}
          <span className="text-keterangan text-teks-pendukung">
            {teksSumber(item, harga, jumlahLaporan)}
          </span>
          {harga.layakSubsidi && !dilewati ? <PilihanSubsidi item={item} onUbah={onUbah} /> : null}
          <div className="flex flex-wrap gap-x-2">
            {tombolOpsional}
            {tombolHapus}
          </div>
        </div>
        <div className="col-span-3">
          <IsianJumlah item={item} onUbah={onUbah} ringkas />
        </div>
        <div className="col-span-3 flex flex-col gap-1">
          {isianHarga}
          {tombolMerek}
        </div>
        <div className="col-span-2 flex min-h-kontrol items-center justify-end text-right">
          {subtotalTampil}
        </div>
      </div>
    );
  }

  return (
    <div className={cx("flex flex-col gap-1 px-4 py-4 [&+&]:border-t [&+&]:border-garis", dilewati && "opacity-60")}>
      <div className="flex items-start justify-between gap-3">
        <span className={cx("font-semibold", dilewati && "line-through")}>
          {t.namaJumlah(nama, angkaJumlah(item.jumlah), item.satuan)}
        </span>
        <span className="flex-none">{subtotalTampil}</span>
      </div>
      {item.opsional ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <LabelKecil nada="garis" className="text-keterangan">
            Opsional
          </LabelKecil>
          {item.keteranganOpsional ? (
            <span className="text-keterangan text-teks-pendukung italic">
              {item.keteranganOpsional}
            </span>
          ) : null}
        </div>
      ) : null}
      <span className="text-keterangan text-teks-pendukung">
        {teksSumber(item, harga, jumlahLaporan)}
      </span>
      {harga.layakSubsidi && !dilewati ? (
        <LabelKecil nada="garis" className="self-start">
          {subsidiAktif ? t.subsidi : t.nonsubsidi}
        </LabelKecil>
      ) : null}
      <div className="flex flex-wrap gap-x-4">
        {tombolOpsional}
        {tombolMerek}
        <button
          type="button"
          aria-expanded={terbuka}
          onClick={() => setTerbuka((x) => !x)}
          className={tautanAksi}
        >
          {terbuka ? null : <Ikon nama="pensil" ukuran={20} />}
          {terbuka ? t.selesaiUbah : t.ubahJumlah}
        </button>
      </div>
      {terbuka ? (
        <div className="mt-2 flex flex-col gap-4 rounded-md bg-embun-pagi p-3">
          <KolomIsian
            label={t.namaItem}
            value={item.nama}
            onChange={(e) => onUbah({ nama: e.target.value })}
          />
          <IsianJumlah item={item} onUbah={onUbah} />
          {isianHarga}
          {harga.layakSubsidi && !dilewati ? (
            <div className="flex flex-col gap-2">
              <span className="font-medium">{t.jenisPupuk}</span>
              <PilihanSubsidi item={item} onUbah={onUbah} />
            </div>
          ) : null}
          {tombolHapus}
        </div>
      ) : null}
    </div>
  );
}
