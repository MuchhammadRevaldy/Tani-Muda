/**
 * Pusat notifikasi /profil/notifikasi ([AG-19]): status izin notifikasi browser (diizinkan, diblokir
 * dengan petunjuk menyalakannya, atau belum ditanya), lalu daftar siklus atau kelompok petak aktif
 * dengan jam pengingat pagi dan pengingat sore, masing-masing menuju /kebun/:id/pengingat.
 */
import { useState } from 'react';
import { Banner } from '../komponen/banner';
import { Kartu } from '../komponen/kartu';
import { LabelKecil } from '../komponen/label-kecil';
import { HeaderHalaman } from '../komponen/navigasi';
import { DaftarLangkah } from '../komponen/pelengkap';
import { Tombol } from '../komponen/tombol';
import { teksNotifikasi as t } from '../teks/notifikasi';
import { KartuPengingat } from './profil';

type Izin = NotificationPermission | 'tidak-didukung';

const bacaIzin = (): Izin =>
  typeof Notification === 'undefined' ? 'tidak-didukung' : Notification.permission;

function KartuIzin() {
  const [izin, setIzin] = useState<Izin>(bacaIzin);
  const [meminta, setMeminta] = useState(false);
  async function minta() {
    setMeminta(true);
    try {
      setIzin(await Notification.requestPermission());
    } finally {
      setMeminta(false);
    }
  }
  return (
    <Kartu
      judul={t.izinJudul}
      tingkatJudul={2}
      kanan={
        izin === 'granted' ? (
          <LabelKecil nada="hijau" ikon="centang">
            {t.status.granted}
          </LabelKecil>
        ) : izin === 'denied' ? (
          <LabelKecil nada="garis" ikon="peringatan">
            {t.status.denied}
          </LabelKecil>
        ) : (
          <LabelKecil nada="segera">{t.status[izin]}</LabelKecil>
        )
      }
    >
      <div className="flex flex-col gap-4">
        {izin === 'denied' ? (
          <Banner jenis="bahaya" judul={t.status.denied}>
            {t.isi.denied}
          </Banner>
        ) : (
          <p className="m-0 text-teks-pendukung">{t.isi[izin]}</p>
        )}
        {izin === 'denied' ? <DaftarLangkah butir={[...t.cara]} /> : null}
        {izin === 'default' ? (
          <Tombol
            ikon="lonceng"
            className="self-start"
            disabled={meminta}
            onClick={() => void minta()}
          >
            {meminta ? t.memintaIzin : t.izinkan}
          </Tombol>
        ) : null}
      </div>
    </Kartu>
  );
}

export function HalamanNotifikasi() {
  return (
    <>
      <HeaderHalaman
        kembaliKe="/profil"
        labelKembali={t.kembali}
        judul={t.judul}
        keterangan={t.keterangan}
      />
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <KartuIzin />
        <KartuPengingat />
      </div>
    </>
  );
}
