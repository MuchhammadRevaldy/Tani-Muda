/**
 * Hitung langkah 3: kalkulator modal (papan 16–19, T4.05–T4.07, PRD P0-07–P0-10, P0-34–P0-36).
 * Daftar item per grup dengan subtotal, ubah jumlah dan harga, subsidi, pilih merek, tambah dan hapus
 * item, alat sekali beli dengan saklar pembagian, promo terpisah, jadwal yang akan dibuat, ringkasan.
 */
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Banner } from '../../komponen/banner';
import { Ikon } from '../../komponen/ikon';
import { LabelKecil } from '../../komponen/label-kecil';
import { Saklar } from '../../komponen/pilihan';
import { Tombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { formatRupiah, titikRibuan } from '../../lib/format';
import { dariM2 } from '../../lib/konversi-satuan';
import {
  itemTambahan,
  keBarisRencana,
  SIKLUS_PEMBAGIAN_ALAT,
  type ItemRencana,
} from '../../lib/rencana';
import { teksBeranda } from '../../teks/beranda';
import { teksGalat } from '../../teks/galat';
import { teksHitung as t } from '../../teks/hitung';
import { teksUmum } from '../../teks/umum';
import { BagianPromo } from './bagian-promo';
import { BarisItem } from './baris-item';
import { KartuJadwal } from './kartu-jadwal';
import { KerangkaHitung } from './kerangka-hitung';
import { LembarMerek } from './lembar-merek';
import { ringkasPilihan } from './pilih-metode';
import { alamatLangkah, usePilihanHitung } from './pilihan';
import { KartuRingkasan, RingkasBawah } from './ringkasan-hasil';
import { WidgetHargaBerita } from '../../komponen/WidgetHargaBerita';
import { useRencana, type Rencana } from './use-rencana';

/** "Sawi hijau bedengan"; nama komoditas yang sudah memuat cara tanam tidak diulang ("Padi sawah"). */
function namaJadwal(r: Rencana): string {
  const k = r.komoditas?.nama ?? '';
  const m = r.metode?.nama.toLowerCase() ?? '';
  return k.toLowerCase().includes(m) ? k : `${k} ${m}`;
}

function KepalaGrup({ nama, subtotal }: { nama: string; subtotal: number | null }) {
  return (
    <div className="flex items-baseline justify-between gap-3 bg-embun-pagi px-4 py-2.5 lg:-mx-4">
      <h3 className="m-0 text-isi font-semibold">{nama}</h3>
      {subtotal !== null ? <Uang nilai={subtotal} /> : null}
    </div>
  );
}

function DaftarItem({
  r,
  items,
  lebar,
  baru,
  onPilihMerek,
}: {
  r: Rencana;
  items: ItemRencana[];
  lebar: boolean;
  baru: string | null;
  onPilihMerek: (it: ItemRencana) => void;
}) {
  const sub = new Map(r.modal?.ok ? r.modal.nilai.item.map((i) => [i.id, i.subtotal]) : []);
  return (
    <div className={lebar ? 'px-4' : ''}>
      {items.map((it) => (
        <BarisItem
          key={it.id}
          item={it}
          harga={r.harga.get(it.id) ?? { harga: null, sumber: 'belum_ada', layakSubsidi: false }}
          subtotal={sub.get(it.id) ?? null}
          lebar={lebar}
          terbukaAwal={it.id === baru}
          onUbah={(u) => r.ubahItem(it.id, u)}
          onHapus={it.asal === 'tambahan' ? () => r.hapusItem(it.id) : undefined}
          onPilihMerek={it.inputId ? () => onPilihMerek(it) : undefined}
          jumlahLaporan={it.inputId ? (r.laporanSekitar.get(it.inputId) ?? 0) : 0}
        />
      ))}
    </div>
  );
}

export function HalamanKalkulator() {
  const [pilihan] = usePilihanHitung();
  const r = useRencana(pilihan);
  const lebar = useLayarLebar();
  const navigate = useNavigate();
  const [merekUntuk, setMerekUntuk] = useState<ItemRencana | null>(null);
  const [baru, setBaru] = useState<string | null>(null);
  const [galatSimpan, setGalatSimpan] = useState<string | null>(null);

  if (!pilihan.komoditas || !pilihan.metode)
    return <Navigate to={alamatLangkah('metode', pilihan)} replace />;
  if (r.memuat) {
    return (
      <p role="status" className="m-0 text-teks-pendukung">
        {teksUmum.memuat}
      </p>
    );
  }
  if (!r.resepApi || !r.ukuranValid?.ok)
    return <Navigate to={alamatLangkah('metode', pilihan)} replace />;

  const m = r.modal?.ok ? r.modal.nilai : null;
  const bahan = r.items.filter((i) => !i.alatSekaliBeli);
  const alat = r.items.filter((i) => i.alatSekaliBeli);
  const grupNama = [...new Set(bahan.map((i) => i.grup))];
  const subGrup = new Map(m?.grup.map((g) => [g.nama, g.subtotal]) ?? []);
  const adaInputToko = bahan.some((i) => i.inputId);

  function tambah() {
    const id = `tambahan-${Date.now()}`;
    r.tambahItem(itemTambahan(id, t.grupTambahan));
    setBaru(id);
  }

  function simpan() {
    setGalatSimpan(null);
    const baris = keBarisRencana(r.items, r.harga);
    if (!baris.ok) return setGalatSimpan(teksGalat[baris.galat]);
    if (r.hargaJual === null) return setGalatSimpan(teksGalat.HARGA_JUAL_KOSONG);
    navigate(alamatLangkah('simpan', pilihan));
  }

  const tombolSimpan = (
    <Tombol penuh onClick={simpan}>
      {t.simpanRencana}
    </Tombol>
  );
  const pesanSimpan = galatSimpan ? <Banner jenis="bahaya">{galatSimpan}</Banner> : null;
  const ru = r.luasM2 !== null && r.konversi.ru ? dariM2(r.luasM2, 'ru', r.konversi) : null;
  const rincian =
    ru?.ok && pilihan.satuan === 'm2'
      ? `${ringkasPilihan(r)} ${t.sekitarRu(titikRibuan(Math.round(ru.nilai)))}`
      : ringkasPilihan(r);

  return (
    <KerangkaHitung
      langkah={3}
      kembaliKe={alamatLangkah('metode', pilihan)}
      labelKembali={t.langkah2}
      judul={t.judulModal}
      sub={t.subModal(rincian)}
      samping={
        lebar ? (
          <>
            <KartuRingkasan r={r} />
            <WidgetHargaBerita
              komoditasId={pilihan.komoditas ?? undefined}
              namaKomoditas={r.komoditas?.nama}
              onGunakanHarga={(h) => r.setHargaJual(h)}
            />
            {pesanSimpan}
            {tombolSimpan}
            <p className="m-0 text-keterangan text-teks-pendukung">{t.langkahBerikut}</p>
          </>
        ) : null
      }
      bilahBawah={
        <>
          <RingkasBawah r={r} />
          {pesanSimpan}
          {tombolSimpan}
        </>
      }
    >
      <p className="m-0 text-keterangan text-teks-pendukung">{t.rekomendasi}</p>
      {r.resepApi.contoh ? (
        <LabelKecil nada="contoh" className="self-start">
          {teksUmum.labelContoh}
        </LabelKecil>
      ) : null}

      <section
        aria-label={t.kolom.rekomendasi}
        className="flex flex-col gap-4 lg:gap-0 lg:overflow-hidden lg:rounded-lg lg:border lg:border-garis lg:bg-putih"
      >
        {lebar ? (
          <div
            className="grid grid-cols-12 gap-3 border-b border-garis px-4 py-3 text-keterangan text-teks-pendukung"
            aria-hidden="true"
          >
            <span className="col-span-4">{t.kolom.rekomendasi}</span>
            <span className="col-span-3">{t.kolom.jumlah}</span>
            <span className="col-span-3">{t.kolom.harga}</span>
            <span className="col-span-2 text-right">{t.kolom.subtotal}</span>
          </div>
        ) : null}
        {grupNama.map((g) => (
          <div key={g} className="flex flex-col gap-2 lg:gap-0">
            {lebar ? (
              <div className="px-4">
                <KepalaGrup nama={g} subtotal={subGrup.get(g) ?? null} />
              </div>
            ) : (
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="m-0 text-judul-bagian font-semibold">{g}</h3>
                {subGrup.has(g) ? <Uang nilai={subGrup.get(g) as number} /> : null}
              </div>
            )}
            <div className="overflow-hidden rounded-lg border border-garis bg-putih lg:rounded-none lg:border-0">
              <DaftarItem
                r={r}
                items={bahan.filter((i) => i.grup === g)}
                lebar={lebar}
                baru={baru}
                onPilihMerek={setMerekUntuk}
              />
            </div>
          </div>
        ))}
        {adaInputToko ? (
          <p className="m-0 flex items-start gap-2 rounded-md bg-daun-lembut px-3 py-2.5 lg:mx-4 lg:mb-4">
            <Ikon nama="info" ukuran={20} className="mt-0.5 flex-none text-daun-tua" />
            <span>{t.kiosResmi}</span>
          </p>
        ) : null}
        <div className="lg:border-t lg:border-garis lg:p-4">
          <Tombol varian="sekunder" ikon="tambah" penuh={!lebar} onClick={tambah}>
            {t.tambahItem}
          </Tombol>
        </div>
      </section>

      {alat.length && m ? (
        <section aria-labelledby="judul-alat" className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="judul-alat" className="m-0 text-judul-bagian font-semibold">
              {t.alatSekaliBeli}
            </h2>
            <Uang nilai={m.totalAlat} />
          </div>
          <div className="overflow-hidden rounded-lg border border-garis bg-putih">
            <DaftarItem r={r} items={alat} lebar={lebar} baru={baru} onPilihMerek={setMerekUntuk} />
            <div className="flex items-center justify-between gap-3 border-t border-garis bg-embun-pagi px-4 py-3">
              <span className="flex flex-col">
                <span className="font-semibold">{t.bagiAlat(SIKLUS_PEMBAGIAN_ALAT)}</span>
                <span className="text-keterangan text-teks-pendukung">
                  {r.bagiAlat
                    ? t.bagiAlatKet(SIKLUS_PEMBAGIAN_ALAT, formatRupiah(m.biayaAlatPerSiklus))
                    : t.tanpaBagiKet}
                </span>
              </span>
              <Saklar
                label={t.bagiAlat(SIKLUS_PEMBAGIAN_ALAT)}
                aktif={r.bagiAlat}
                onUbah={r.setBagiAlat}
              />
            </div>
          </div>
        </section>
      ) : null}

      {lebar ? null : (
        <>
          <KartuRingkasan r={r} />
          <WidgetHargaBerita
            komoditasId={pilihan.komoditas ?? undefined}
            namaKomoditas={r.komoditas?.nama}
            onGunakanHarga={(h) => r.setHargaJual(h)}
          />
        </>
      )}
      <BagianPromo />
      <KartuJadwal
        r={r}
        lebar={lebar}
        judul={t.jadwalDibuat}
        keterangan={t.jadwalKet(namaJadwal(r), r.resepApi.umur_panen_hari)}
      />
      <p className="m-0 text-keterangan text-teks-pendukung">{teksBeranda.catatanHarga}</p>

      {merekUntuk ? (
        <LembarMerek
          item={merekUntuk}
          onTutup={() => setMerekUntuk(null)}
          onPakai={(merek) => {
            r.ubahItem(merekUntuk.id, { merek, hargaIsiSendiri: null });
            setMerekUntuk(null);
          }}
        />
      ) : null}
    </KerangkaHitung>
  );
}
