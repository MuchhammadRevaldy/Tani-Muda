/**
 * Pilih peran dan desa (turunan, papan 39, T4.34, PRD P0-01). Dibuka setelah OTP pertama. Petani
 * wajib mengisi desa lokasi lahan, yang dipakai untuk radius pesanan. Admin tidak bisa dipilih.
 */
import { useState, type FormEvent } from 'react';
import { adalahGalatApi } from '../api/galat';
import { usePilihPeran } from '../api/kueri';
import type { PilihPeranMasukan } from '../api/tipe';
import { Ikon } from '../komponen/ikon';
import { KolomIsian, PesanKolom } from '../komponen/kolom-isian';
import { Logo } from '../komponen/navigasi';
import { PilihWilayah } from '../komponen/pilih-wilayah';
import { GrupRadio, KartuPilihan } from '../komponen/pilihan';
import { Tombol } from '../komponen/tombol';
import { teksMasuk } from '../teks/masuk';
import { teksPilihPeran as t } from '../teks/sesi';
import { bacaPeranAwal } from './peran-awal';

type PeranPilihan = PilihPeranMasukan['peran'];
const PERAN: { nilai: PeranPilihan; ikon: 'kebun' | 'pesanan' | 'belajar' }[] = [
  { nilai: 'petani', ikon: 'kebun' },
  { nilai: 'pembeli', ikon: 'pesanan' },
  { nilai: 'mentor', ikon: 'belajar' },
];

interface Galat {
  peran?: string;
  nama?: string;
  desa?: string;
  umum?: string;
}

export function HalamanPilihPeran() {
  const simpan = usePilihPeran();
  const [peran, setPeran] = useState<PeranPilihan | null>(() => bacaPeranAwal());
  const [nama, setNama] = useState('');
  const [desaId, setDesaId] = useState<string | null>(null);
  const [galat, setGalat] = useState<Galat>({});

  async function kirim(e: FormEvent) {
    e.preventDefault();
    const g: Galat = {};
    if (!peran) g.peran = t.pilihPeranDulu;
    if (!nama.trim()) g.nama = t.isiNamaDulu;
    if (peran === 'petani' && !desaId) g.desa = t.isiDesaDulu;
    setGalat(g);
    if (Object.keys(g).length || !peran) return;
    try {
      // Setelah tersimpan, penjaga rute mengarahkan ke halaman awal peran.
      await simpan.mutateAsync({
        peran,
        nama: nama.trim(),
        ...(peran === 'petani' ? { wilayah_id: desaId } : {}),
      });
    } catch (err) {
      if (adalahGalatApi(err)) {
        setGalat({
          nama: err.rincian.nama?.[0],
          desa: err.rincian.wilayah_id?.[0],
          umum: Object.keys(err.rincian).length ? undefined : err.message,
        });
      } else setGalat({ umum: teksMasuk.gagalUmum });
    }
  }


  return (
    <div className="min-h-layar bg-embun-pagi text-teks">
      <main className="mx-auto flex max-w-dialog flex-col gap-6 px-4 pb-12 pt-4 lg:pt-12">
        <Logo />
        <form
          onSubmit={kirim}
          noValidate
          className="flex flex-col gap-6 lg:rounded-lg lg:border lg:border-garis lg:bg-putih lg:p-6"
        >
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-judul-halaman font-semibold">{t.judul}</h1>
            <p className="m-0 text-keterangan text-teks-pendukung">{t.sub}</p>
          </div>

          <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
            <legend className="mb-2 p-0 font-medium">{t.labelPeran}</legend>
            <GrupRadio label={t.labelPeran} className="flex flex-col gap-3">
              {PERAN.map((p) => (
                <KartuPilihan
                  key={p.nilai}
                  dipilih={peran === p.nilai}
                  onPilih={() => {
                    setPeran(p.nilai);
                    setGalat((g) => ({ ...g, peran: undefined }));
                  }}
                  labelAksesibel={`${t.peran[p.nilai].nama}. ${t.peran[p.nilai].keterangan}`}
                >
                  <div className="flex items-start gap-3 p-4">
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-md bg-daun-lembut text-daun-tua">
                      <Ikon nama={p.ikon} />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold">{t.peran[p.nilai].nama}</span>
                      <span className="text-keterangan text-teks-pendukung">
                        {t.peran[p.nilai].keterangan}
                      </span>
                    </span>
                  </div>
                </KartuPilihan>
              ))}
            </GrupRadio>
            {galat.peran ? <PesanKolom id="peran" galat={galat.peran} /> : null}
          </fieldset>

          <KolomIsian
            label={t.labelNama}
            autoComplete="name"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            galat={galat.nama}
          />

          {peran === 'petani' ? (
            <PilihWilayah
              id="pilih-desa-petani"
              nilai={desaId}
              onChange={(val) => {
                setDesaId(val || null);
                setGalat((g) => ({ ...g, desa: undefined }));
              }}
              galat={galat.desa}
              bantuan={t.bantuanDesa}
            />
          ) : null}

          {galat.umum ? <PesanKolom id="umum" galat={galat.umum} /> : null}
          <Tombol type="submit" penuh disabled={simpan.isPending}>
            {simpan.isPending ? t.menyimpan : t.simpan}
          </Tombol>
        </form>
      </main>
    </div>
  );
}
