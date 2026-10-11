/**
 * Detail siklus: Jurnal (papan 28, T4.16, PRD P0-14, P0-24): foto dan catatan per minggu
 * (`kelompokkanMinggu`), foto otomatis dari tugas selesai, tambah foto bukti dan catatan.
 * Foto ditampilkan dari URL klien API (backend: URL bertanda tangan, T5.12).
 */
import { useState } from 'react';
import { adalahGalatApi } from '../../api/galat';
import { useJurnal, useTambahJurnal, useUnggahBerkas } from '../../api/kueri';
import { useHariIni } from '../../api/sesi';
import type { EntriJurnal } from '../../api/tipe';
import { AmbilFoto, type FotoKecil } from '../../komponen/ambil-foto';
import { Dialog } from '../../komponen/dialog';
import { PesanKolom } from '../../komponen/kolom-isian';
import { Tombol } from '../../komponen/tombol';
import { kelompokkanMinggu } from '../../lib/jurnal';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';
import { KerangkaSiklus, type DataSiklus } from './kerangka-siklus';

function DialogTambah({
  siklusId,
  terbuka,
  onTutup,
}: {
  siklusId: string;
  terbuka: boolean;
  onTutup: () => void;
}) {
  const hariIni = useHariIni();
  const tambah = useTambahJurnal();
  const unggah = useUnggahBerkas();
  const [foto, setFoto] = useState<FotoKecil | null>(null);
  const [catatan, setCatatan] = useState('');
  const [galat, setGalat] = useState<string | null>(null);

  async function simpan() {
    setGalat(null);
    if (!foto && !catatan.trim()) return setGalat(t.isiFotoAtauCatatan);
    try {
      const url = foto
        ? (await unggah.mutateAsync({ nama: foto.nama, jenis: foto.jenis, isi: foto.dataUrl })).url
        : null;
      await tambah.mutateAsync({
        siklusId,
        tanggal: hariIni,
        foto: url,
        catatan: catatan.trim() || null,
      });
      setFoto(null);
      setCatatan('');
      onTutup();
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  return (
    <Dialog terbuka={terbuka} onTutup={onTutup} judul={t.judulTambahJurnal}>
      <div className="flex flex-col gap-4">
        {foto ? (
          <img
            src={foto.dataUrl}
            alt={t.fotoTerpilih}
            className="aspect-foto w-full rounded-md border border-garis object-cover"
          />
        ) : null}
        <AmbilFoto
          label={foto ? t.gantiFoto : t.tambahFoto}
          labelMemuat={t.mengecilkan}
          onFoto={setFoto}
          onGagal={() => setGalat(t.fotoGagal)}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="catatan-jurnal" className="font-medium">
            {t.catatan}
          </label>
          <textarea
            id="catatan-jurnal"
            rows={3}
            value={catatan}
            placeholder={t.catatanContoh}
            onChange={(e) => setCatatan(e.target.value)}
            className="fokus-cincin min-h-24 w-full rounded-md border-1.5 border-garis-kuat bg-putih px-4 py-3 text-isi text-teks outline-none placeholder:text-teks-pendukung"
          />
        </div>
        {galat ? <PesanKolom id="galat-jurnal" galat={galat} /> : null}
        <Tombol penuh disabled={tambah.isPending || unggah.isPending} onClick={() => void simpan()}>
          {tambah.isPending || unggah.isPending ? t.menyimpan : t.simpanJurnal}
        </Tombol>
      </div>
    </Dialog>
  );
}

function Foto({ e }: { e: EntriJurnal }) {
  return (
    <figure className="m-0 flex flex-col gap-1">
      <img
        src={e.foto as string}
        alt={e.judul_tugas ? t.hariKeTugas(e.hari_ke, e.judul_tugas) : t.hariKe(e.hari_ke)}
        loading="lazy"
        className="aspect-foto w-full rounded-md border border-garis bg-daun-lembut object-cover"
      />
      <figcaption className="text-keterangan">
        {e.judul_tugas ? t.hariKeTugas(e.hari_ke, e.judul_tugas) : t.hariKe(e.hari_ke)}
      </figcaption>
    </figure>
  );
}

function Isi({ d }: { d: DataSiklus }) {
  const jurnalQ = useJurnal(d.siklus.id);
  const [tambah, setTambah] = useState(false);
  const minggu = kelompokkanMinggu((jurnalQ.data ?? []).map((e) => ({ ...e, hariKe: e.hari_ke })));
  return (
    <>
      {jurnalQ.isPending ? (
        <p role="status" className="m-0 text-teks-pendukung">
          {teksUmum.memuat}
        </p>
      ) : minggu.length === 0 ? (
        <p className="m-0 rounded-lg border border-garis bg-putih p-4 text-teks-pendukung">
          {t.jurnalKosong}
        </p>
      ) : (
        minggu.map((m) => (
          <section
            key={m.minggu}
            aria-labelledby={`minggu-${m.minggu}`}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-0.5">
              <h2 id={`minggu-${m.minggu}`} className="m-0 text-judul-bagian font-semibold">
                {t.minggu(m.minggu)}
              </h2>
              <p className="m-0 text-keterangan text-teks-pendukung">
                {t.mingguKet(m.hariAwal, m.hariAkhir, m.jumlahFoto, m.jumlahCatatan)}
              </p>
            </div>
            {m.entri.some((e) => e.foto) ? (
              <div className="grid grid-cols-3 gap-2 lg:grid-cols-4">
                {m.entri
                  .filter((e) => e.foto)
                  .map((e) => (
                    <Foto key={e.id} e={e} />
                  ))}
              </div>
            ) : null}
            {m.entri
              .filter((e) => e.catatan)
              .map((e) => (
                <div
                  key={`${e.id}-catatan`}
                  className="flex flex-col gap-1 rounded-lg border border-garis bg-putih p-4"
                >
                  <span className="text-keterangan text-teks-pendukung">
                    {t.hariKeCatatan(e.hari_ke)}
                  </span>
                  <p className="m-0">{e.catatan}</p>
                </div>
              ))}
          </section>
        ))
      )}
      {d.siklus.status !== 'selesai' ? (
        <Tombol ikon="kamera" penuh onClick={() => setTambah(true)}>
          {t.tambahFotoBukti}
        </Tombol>
      ) : null}
      <DialogTambah siklusId={d.siklus.id} terbuka={tambah} onTutup={() => setTambah(false)} />
    </>
  );
}

export function HalamanJurnal() {
  return <KerangkaSiklus>{(d) => <Isi d={d} />}</KerangkaSiklus>;
}
