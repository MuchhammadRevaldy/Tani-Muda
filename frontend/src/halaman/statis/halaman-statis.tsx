/**
 * Halaman statis (T4.37): aturan pakai, kebijakan privasi, tentang, kontak, dan pusat bantuan.
 * Isi masih DRAF dan selalu berlabel "Draf, belum ditinjau ahli hukum" (Pertanyaan Terbuka 13).
 * Angka aturan dan kontak admin diambil dari GET /konfigurasi (terbuka tanpa masuk).
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useKonfigurasi } from '../../api/kueri';
import type { Konfigurasi } from '../../api/tipe';
import { Kartu } from '../../komponen/kartu';
import { LabelKecil } from '../../komponen/label-kecil';
import { FaqLipat } from '../../komponen/pelengkap';
import { kelasTombol } from '../../komponen/tombol';
import { teksPrivasi } from '../../teks/privasi';
import { teksStatis as t, type AngkaAturan, type Bagian } from '../../teks/statis';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { KerangkaPublik } from './kerangka-publik';

export type JenisStatis = 'aturanPakai' | 'privasi' | 'tentang' | 'kontak' | 'bantuan';

function angkaAturan(k: Konfigurasi): AngkaAturan {
  return {
    persenUangMuka: k.persen_uang_muka,
    persenLayanan: k.persen_layanan,
    jamPeriksaRutin: k.jam_periksa_rutin,
    jamPeriksaSekaliPanen: k.jam_periksa_sekali_panen,
    hariKabarGagalPanen: k.hari_kabar_gagal_panen,
    hariKembaliUangMuka: k.hari_kembali_uang_muka,
  };
}

/** Nomor WhatsApp "+62 812-0000-0099" → tautan wa.me dengan pesan awal. */
function tautanWhatsapp(nomor: string, pesan: string): string {
  return `https://wa.me/${nomor.replace(/\D/g, '')}?text=${encodeURIComponent(pesan)}`;
}

function Kepala({ judul, pengantar }: { judul: string; pengantar: string }) {
  return (
    <div className="flex flex-col gap-3">
      <LabelKecil nada="contoh" className="self-start">
        {t.labelDraf}
      </LabelKecil>
      <h1 className="m-0 text-tampil-2 font-semibold tracking-rapat lg:text-tampil-4">{judul}</h1>
      <p className="m-0 text-judul-bagian text-teks-pendukung">{pengantar}</p>
    </div>
  );
}

function DaftarBagian({ bagian }: { bagian: readonly Bagian[] }) {
  return (
    <>
      {bagian.map((b) => (
        <section key={b.judul} className="flex flex-col gap-3">
          <h2 className="m-0 text-judul-halaman font-semibold">{b.judul}</h2>
          <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
            {b.butir.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function Isi({ jenis, k }: { jenis: JenisStatis; k: Konfigurasi }) {
  const a = angkaAturan(k);
  switch (jenis) {
    case 'aturanPakai':
      return (
        <>
          <Kepala judul={t.aturanPakai.judul} pengantar={t.aturanPakai.pengantar} />
          <DaftarBagian bagian={t.aturanPakai.bagian(a)} />
        </>
      );
    case 'privasi':
      return (
        <>
          <Kepala judul={teksPrivasi.judul} pengantar={teksPrivasi.pengantar} />
          <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
            {teksPrivasi.butir.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="m-0 text-keterangan text-teks-pendukung">
            {teksPrivasi.versi(k.versi_privasi)}
          </p>
        </>
      );
    case 'tentang':
      return (
        <>
          <Kepala judul={t.tentang.judul} pengantar={t.tentang.pengantar} />
          <DaftarBagian bagian={t.tentang.bagian} />
        </>
      );
    case 'kontak':
      return (
        <>
          <Kepala judul={t.kontak.judul} pengantar={t.kontak.pengantar} />
          <Kartu>
            <dl className="m-0 flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <dt className="text-teks-pendukung">{t.kontak.whatsapp}</dt>
                <dd className="m-0 text-judul-bagian font-semibold tabular-nums">
                  {k.kontak_admin.whatsapp}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-teks-pendukung">{t.kontak.jamLayanan}</dt>
                <dd className="m-0 font-medium">{k.kontak_admin.jam_layanan}</dd>
              </div>
            </dl>
            <a
              href={tautanWhatsapp(k.kontak_admin.whatsapp, t.kontak.pesanAwal)}
              target="_blank"
              rel="noreferrer"
              className={`${kelasTombol('utama', true)} mt-5`}
            >
              {t.kontak.bukaWhatsapp}
            </a>
          </Kartu>
          <p className="m-0 text-keterangan text-teks-pendukung">{t.kontak.catatan}</p>
        </>
      );
    case 'bantuan':
      return (
        <>
          <Kepala judul={t.bantuan.judul} pengantar={t.bantuan.pengantar} />
          <section className="flex flex-col gap-3">
            <h2 className="m-0 text-judul-halaman font-semibold">{t.bantuan.petani}</h2>
            <FaqLipat butir={t.bantuan.faqPetani(a)} />
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="m-0 text-judul-halaman font-semibold">{t.bantuan.pembeli}</h2>
            <FaqLipat butir={t.bantuan.faqPembeli(a)} />
          </section>
          <div className="flex flex-col gap-3">
            <p className="m-0 font-semibold">{t.bantuan.masihBingung}</p>
            <Link to="/kontak" className={`${kelasTombol('sekunder')} self-start`}>
              {t.bantuan.hubungi}
            </Link>
          </div>
        </>
      );
  }
}

export function HalamanStatis({ jenis }: { jenis: JenisStatis }) {
  const k = useKonfigurasi();
  let isi: ReactNode;
  if (k.isError) isi = <p className="m-0 text-teks-pendukung">{teksUmum.galatIsi}</p>;
  else if (!k.data) isi = <Memuat />;
  else isi = <Isi jenis={jenis} k={k.data} />;
  return (
    <KerangkaPublik>
      <article className="mx-auto flex w-full max-w-teks flex-col gap-8 px-4 py-10 lg:py-14">
        {isi}
      </article>
    </KerangkaPublik>
  );
}
