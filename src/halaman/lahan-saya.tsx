/**
 * Lahan saya (turunan, papan 40, T4.36a): daftar lahan dengan kapasitas terpakai dan sisa (dihitung
 * server dengan rumus `kapasitas-lahan.ts`, D-15, D-34), tambah, ubah, hapus. HP: daftar lalu
 * formulir; desktop: dua kolom (daftar dan formulir).
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHapusLahan, useLahan } from '../api/kueri';
import type { Lahan } from '../api/tipe';
import { Dialog } from '../komponen/dialog';
import { Ikon } from '../komponen/ikon';
import { Kartu } from '../komponen/kartu';
import { HeaderHalaman } from '../komponen/navigasi';
import { Tombol } from '../komponen/tombol';
import { persenTerpakai } from '../lib/beranda';
import { formatDesimal, titikRibuan } from '../lib/format';
import { teksHitung } from '../teks/hitung';
import { teksLahan as t } from '../teks/lahan';
import { teksUmum } from '../teks/umum';
import { FormLahan } from './lahan/form-lahan';

const angka = (n: number) => (Number.isInteger(n) ? titikRibuan(n) : formatDesimal(n, 2));

function KartuLahan({ l, onUbah, onHapus }: { l: Lahan; onUbah: () => void; onHapus: () => void }) {
  const s = l.kapasitas.satuan === 'lubang' ? teksHitung.lubang : 'm²';
  const persen = persenTerpakai(l.kapasitas.dipakai, l.kapasitas.total);
  return (
    <Kartu
      judul={l.nama}
      keterangan={[
        teksHitung.namaJenisLahan[l.jenis_lahan],
        l.satuan_asli !== 'm2' && l.kapasitas.satuan === 'm2'
          ? t.asli(angka(l.nilai_asli), l.satuan_asli)
          : null,
      ]
        .filter(Boolean)
        .join(' · ')}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span>{t.dipakai(angka(l.kapasitas.dipakai), angka(l.kapasitas.total), s)}</span>
          <span className="font-semibold">
            {l.kapasitas.sisa > 0 ? t.sisa(angka(l.kapasitas.sisa), s) : t.penuh}
          </span>
        </div>
        <div
          role="img"
          aria-label={t.persenAria(persen)}
          className="h-3 overflow-hidden rounded-full bg-garis"
        >
          <div
            className="h-full rounded-full bg-daun-tua"
            style={{ width: `${Math.min(persen, 100)}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-x-4">
          <button
            type="button"
            onClick={onUbah}
            aria-label={t.ubah(l.nama)}
            className="fokus-cincin -ml-2 inline-flex min-h-sentuh cursor-pointer items-center gap-1.5 rounded-ikon border-0 bg-transparent px-2 text-isi font-semibold text-daun-tua"
          >
            <Ikon nama="pensil" ukuran={20} />
            {t.tombolUbah}
          </button>
          <button
            type="button"
            onClick={onHapus}
            aria-label={t.hapus(l.nama)}
            className="fokus-cincin inline-flex min-h-sentuh cursor-pointer items-center gap-1.5 rounded-ikon border-0 bg-transparent px-2 text-isi font-semibold text-tomat"
          >
            <Ikon nama="hapus" ukuran={20} />
            {t.tombolHapus}
          </button>
        </div>
      </div>
    </Kartu>
  );
}

export function HalamanLahanSaya() {
  const lahanQ = useLahan();
  const hapus = useHapusLahan();
  const navigate = useNavigate();
  const [param] = useSearchParams();
  const kembali = param.get('kembali');
  const [form, setForm] = useState<Lahan | 'baru' | null>(null);
  const [akanHapus, setAkanHapus] = useState<Lahan | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const daftar = lahanQ.data ?? [];
  const formTerbuka = form !== null || (lahanQ.isSuccess && daftar.length === 0);

  return (
    <>
      <HeaderHalaman
        judul={t.judul}
        keterangan={t.sub}
        kanan={
          formTerbuka ? null : (
            <Tombol varian="sekunder" ikon="tambah" onClick={() => setForm('baru')}>
              {t.tambah}
            </Tombol>
          )
        }
      />
      {info ? (
        <p role="status" className="m-0 flex items-center gap-2 font-medium text-daun-tua">
          <Ikon nama="centang" ukuran={20} />
          {info}
        </p>
      ) : null}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <section aria-label={t.judul} className="flex min-w-0 flex-1 flex-col gap-3">
          {lahanQ.isPending ? (
            <p role="status" className="m-0 text-teks-pendukung">
              {teksUmum.memuat}
            </p>
          ) : daftar.length === 0 ? (
            <p className="m-0 text-teks-pendukung">{t.kosong}</p>
          ) : (
            daftar.map((l) => (
              <KartuLahan
                key={l.id}
                l={l}
                onUbah={() => setForm(l)}
                onHapus={() => setAkanHapus(l)}
              />
            ))
          )}
        </section>
        {formTerbuka ? (
          <section
            aria-labelledby="judul-form-lahan"
            className="flex flex-col gap-4 rounded-lg border border-garis bg-putih p-4 lg:w-dialog lg:flex-none"
          >
            <h2 id="judul-form-lahan" className="m-0 text-judul-bagian font-semibold">
              {form && form !== 'baru' ? t.judulUbah : t.judulTambah}
            </h2>
            <FormLahan
              key={form && form !== 'baru' ? form.id : 'baru'}
              lahan={form && form !== 'baru' ? form : null}
              onBatal={daftar.length ? () => setForm(null) : undefined}
              onSelesai={() => {
                setForm(null);
                setInfo(t.tersimpan);
                if (kembali) navigate(kembali);
              }}
            />
          </section>
        ) : null}
      </div>
      <Dialog
        terbuka={!!akanHapus}
        onTutup={() => setAkanHapus(null)}
        judul={t.hapusJudul}
        keterangan={akanHapus?.nama}
      >
        <div className="flex flex-col gap-3">
          <p className="m-0 text-teks-pendukung">{t.hapusIsi}</p>
          {hapus.isError ? (
            <p role="alert" className="m-0 text-tomat">
              {hapus.error.message}
            </p>
          ) : null}
          <Tombol
            penuh
            disabled={hapus.isPending}
            onClick={() =>
              akanHapus &&
              hapus.mutate(akanHapus.id, {
                onSuccess: () => {
                  setAkanHapus(null);
                  setInfo(t.terhapus);
                },
              })
            }
          >
            {t.hapusYa}
          </Tombol>
          <Tombol varian="sekunder" penuh onClick={() => setAkanHapus(null)}>
            {t.batal}
          </Tombol>
        </div>
      </Dialog>
    </>
  );
}
