/**
 * Hitung langkah 2: Pilih cara tanam dan ukuran (papan 13, 14, 15, T4.04, PRD P0-32, P0-33).
 * Hidroponik hanya untuk komoditas yang punya resepnya (D-05); cara tanpa resep membuka
 * "Segera hadir" dengan "Minta resep ini".
 */
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import type { MetodeTanam, TingkatModal } from '../../api/tipe';
import { cx } from '../../komponen/gabung-kelas';
import { LabelKecil } from '../../komponen/label-kecil';
import { GrupRadio, KartuPilihan } from '../../komponen/pilihan';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { formatDesimal, titikRibuan } from '../../lib/format';
import { teksHitung as t } from '../../teks/hitung';
import { teksUmum } from '../../teks/umum';
import { FormUkuran, KartuPerkiraanPanen } from './form-ukuran';
import { GambarKomoditas, GambarMetode } from './gambar';
import { KartuJadwal } from './kartu-jadwal';
import { KerangkaHitung } from './kerangka-hitung';
import { alamatLangkah, metodeUntuk, usePilihanHitung } from './pilihan';
import { SegeraHadir } from './segera-hadir';
import { useRencana, type Rencana } from './use-rencana';

const TINGKAT: Record<TingkatModal, number> = { rendah: 1, sedang: 2, tinggi: 3 };
const angka = (n: number) => (Number.isInteger(n) ? titikRibuan(n) : formatDesimal(n, 2));

function MeterModal({ tingkat }: { tingkat: TingkatModal }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="inline-flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cx('h-4 w-2 rounded-xs', i <= TINGKAT[tingkat] ? 'bg-tanah' : 'bg-garis')}
          />
        ))}
      </span>
      {t.tingkatModal[tingkat]}
    </span>
  );
}

function KartuMetode({
  m,
  ada,
  dipilih,
  onPilih,
}: {
  m: MetodeTanam;
  ada: boolean;
  dipilih: boolean;
  onPilih: () => void;
}) {
  const baris: [string, React.ReactNode][] = [
    [t.modalAwal, <MeterModal key="m" tingkat={m.modal_awal} />],
    [t.lahan, m.kebutuhan_lahan],
    [t.perawatan, m.frekuensi_perawatan],
  ];
  return (
    <KartuPilihan
      dipilih={dipilih}
      onPilih={onPilih}
      segera={!ada}
      labelAksesibel={ada ? t.pilihMetode(m.nama) : `${m.nama}, ${t.segeraHadir.toLowerCase()}`}
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <GambarMetode id={m.id} segera={!ada} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span
              className={cx(
                'text-judul-bagian',
                ada ? 'font-semibold' : 'font-medium text-teks-pendukung',
              )}
            >
              {m.nama}
            </span>
            <span className="text-keterangan text-teks-pendukung">
              {t.keteranganMetode[m.id] ?? m.kebutuhan_lahan}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {ada && m.modal_awal === 'rendah' ? (
                <LabelKecil nada="hijau">{t.pemula}</LabelKecil>
              ) : null}
              {ada ? (
                <LabelKecil nada="polos" ikon="centang">
                  {t.resepTersedia}
                </LabelKecil>
              ) : (
                <LabelKecil nada="segera">{t.segeraHadir}</LabelKecil>
              )}
            </span>
          </div>
          <span
            aria-hidden="true"
            className={cx(
              'grid h-6 w-6 flex-none place-items-center rounded-full border-2',
              dipilih ? 'border-daun-tua' : 'border-garis-kuat',
            )}
          >
            {dipilih ? <span className="h-3 w-3 rounded-full bg-daun-tua" /> : null}
          </span>
        </div>
        <dl className="m-0 grid gap-2 border-t border-garis pt-3 md:grid-cols-3 md:gap-4">
          {baris.map(([dt, dd]) => (
            <div
              key={dt}
              className="flex justify-between gap-3 md:flex-col md:justify-start md:gap-0.5"
            >
              <dt className="text-teks-pendukung">{dt}</dt>
              <dd className="m-0 text-right md:text-left">{dd}</dd>
            </div>
          ))}
        </dl>
      </div>
    </KartuPilihan>
  );
}

/** "Sawi hijau · Bedengan · 100 m²" / "Sawi hijau · Hidroponik NFT · 200 lubang". */
export function ringkasPilihan(r: Rencana): string {
  if (!r.komoditas || !r.metode) return '';
  const metode =
    r.sistem && r.metode.id === 'hidroponik' ? `${r.metode.nama} ${r.sistem.nama}` : r.metode.nama;
  const ukuran =
    r.luasM2 !== null
      ? `${angka(r.luasM2)} m²`
      : r.jumlahUnit !== null
        ? `${angka(r.jumlahUnit)} ${r.metode.dasar_ukuran === 'lubang' ? t.lubang : t.polybag}`
        : '';
  return t.ringkasMetode(r.komoditas.nama, metode, ukuran);
}

/** Keterangan di bawah perkiraan panen. */
export function asalPerkiraan(r: Rencana): string {
  if (!r.komoditas || !r.metode || !r.resepApi) return '';
  if (r.metode.dasar_ukuran === 'lubang' && r.jumlahUnit !== null)
    return t.dariLubang(angka(r.jumlahUnit), r.sistem?.nama ?? '', r.resepApi.umur_panen_hari);
  const ukuran =
    r.luasM2 !== null ? `${angka(r.luasM2)} m²` : `${angka(r.jumlahUnit ?? 0)} ${t.polybag}`;
  return t.dariUkuran(ukuran, r.metode.nama, r.komoditas.nama);
}

export function HalamanPilihMetode() {
  const [pilihan, ubah] = usePilihanHitung();
  const r = useRencana(pilihan);
  const lebar = useLayarLebar();
  const [segera, setSegera] = useState<MetodeTanam | null>(null);

  const semuaMetode = r.komoditas ? metodeUntuk(r.komoditas, r.semuaMetode) : [];
  const adaResep = (id: string) => r.resepKomoditas.some((x) => x.metode_id === id);
  const pertama = semuaMetode.find((m) => adaResep(m.id));

  // Pilih otomatis cara pertama yang punya resep, dan sistem hidroponik pertama.
  useEffect(() => {
    if (r.memuat) return;
    if (!pilihan.metode && pertama) ubah({ metode: pertama.id });
    else if (pilihan.metode === 'hidroponik' && !pilihan.sistem && r.daftarSistem[0])
      ubah({ sistem: r.daftarSistem[0].id });
  });

  if (!pilihan.komoditas) return <Navigate to="/hitung/tanaman" replace />;
  if (r.memuat || !r.komoditas) {
    return (
      <p role="status" className="m-0 text-teks-pendukung">
        {teksUmum.memuat}
      </p>
    );
  }

  const siap = !!r.resepApi && !!r.ukuranValid?.ok;
  const ringkas = ringkasPilihan(r);
  const lanjut = alamatLangkah('modal', pilihan);
  const tombol = siap ? (
    <Link to={lanjut} className={kelasTombol('utama', true)}>
      {t.lanjutModal}
    </Link>
  ) : (
    <Tombol penuh disabled>
      {t.lanjutModal}
    </Tombol>
  );
  const ukuran = r.metode ? (
    <FormUkuran
      pilihan={pilihan}
      ubah={ubah}
      rencana={r}
      metode={r.metode}
      tampilGalat={!!pilihan.nilai}
    />
  ) : null;
  const perkiraan = <KartuPerkiraanPanen r={r} ringkas={asalPerkiraan(r)} />;
  const satuSaja = semuaMetode.length === 1 && semuaMetode[0];

  return (
    <KerangkaHitung
      langkah={2}
      kembaliKe={alamatLangkah('tanaman', pilihan)}
      labelKembali={t.langkah1}
      judul={t.judulMetode}
      sub={t.subMetode}
      samping={
        lebar ? (
          <>
            {ukuran}
            {perkiraan}
            {r.metode && r.resepApi ? (
              <KartuJadwal
                r={r}
                judul={t.pratinjauJadwal}
                keterangan={t.pratinjauKet(r.metode.nama, r.resepApi.umur_panen_hari)}
              />
            ) : null}
            {tombol}
            {ringkas ? (
              <p className="m-0 text-center text-keterangan text-teks-pendukung">{ringkas}</p>
            ) : null}
          </>
        ) : null
      }
      bilahBawah={
        <>
          {ringkas ? (
            <p className="m-0 text-center text-keterangan text-teks-pendukung">{ringkas}</p>
          ) : null}
          {tombol}
        </>
      }
    >
      <div className="flex min-h-baris-tugas items-center gap-3 rounded-lg border border-garis bg-putih p-4">
        <GambarKomoditas id={r.komoditas.id} />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-semibold">{r.komoditas.nama}</span>
          <span className="text-keterangan text-teks-pendukung">
            {t.panenSekitar(r.komoditas.umur_panen_hari)}
          </span>
        </span>
        <Link
          to={alamatLangkah('tanaman', pilihan)}
          aria-label={t.gantiTanaman(r.komoditas.nama)}
          className="fokus-cincin inline-flex min-h-sentuh items-center rounded-sm px-2 font-semibold text-daun-tua underline underline-offset-3"
        >
          {t.ganti}
        </Link>
      </div>

      {satuSaja ? (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-teks-pendukung">{t.satuMetode(r.komoditas.nama, satuSaja.nama)}</p>
          {r.resepApi?.contoh ? (
            <LabelKecil nada="contoh" className="self-start">
              {teksUmum.labelContoh}
            </LabelKecil>
          ) : null}
        </div>
      ) : null}

      <GrupRadio label={t.caraTanam} className="flex flex-col gap-3">
        {semuaMetode.map((m) => (
          <KartuMetode
            key={m.id}
            m={m}
            ada={adaResep(m.id)}
            dipilih={pilihan.metode === m.id && adaResep(m.id)}
            onPilih={() =>
              adaResep(m.id) ? ubah({ metode: m.id, nilai: '', tandon: '' }) : setSegera(m)
            }
          />
        ))}
      </GrupRadio>

      {lebar ? null : (
        <>
          {ukuran}
          {perkiraan}
        </>
      )}

      {segera ? (
        <SegeraHadir
          key={segera.id}
          terbuka
          onTutup={() => setSegera(null)}
          judul={`${r.komoditas.nama} · ${segera.nama}`}
          keterangan={segera.kebutuhan_lahan}
          ilustrasi={<GambarMetode id={segera.id} />}
          komoditasId={r.komoditas.id}
          metodeId={segera.id}
          labelPilihLain={t.pilihCaraLain}
        />
      ) : null}
    </KerangkaHitung>
  );
}
