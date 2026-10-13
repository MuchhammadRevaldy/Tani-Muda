/**
 * Verifikasi pembeli (turunan, T4.29, PRD P0-02): pembeli baru menunggu pemeriksaan data usaha.
 * Admin menyetujui, atau menolak dengan alasan yang dikirim ke pembeli. Desktop saja, tabel
 * sederhana (D-07); di HP tabel bisa digeser di dalam wadahnya.
 */
import { useState } from 'react';
import { adalahGalatApi } from '../../api/galat';
import { usePembeliMenunggu, useVerifikasiPembeli } from '../../api/kueri';
import type { PembeliUntukAdmin } from '../../api/tipe';
import { Dialog } from '../../komponen/dialog';
import { Ikon } from '../../komponen/ikon';
import { KolomTeks } from '../../komponen/kolom-isian';
import { Kepala, Sel, Tabel } from '../../komponen/tabel';
import { Tombol } from '../../komponen/tombol';
import { tampilNomorHp } from '../../lib/nomor-hp';
import { teksPanel } from '../../teks/panel';
import { teksPembeli } from '../../teks/pembeli';
import { teksUmum } from '../../teks/umum';
import { teksGagalMuat } from '../../teks/galat-api';
import { Memuat } from '../memuat';
import { KerangkaPanelSesi } from '../panel/kerangka-panel-sesi';

const t = teksPanel.admin;

function DialogTolak({
  pembeli,
  onTutup,
  onSelesai,
}: {
  pembeli: PembeliUntukAdmin | null;
  onTutup: () => void;
  onSelesai: (nama: string) => void;
}) {
  const verifikasi = useVerifikasiPembeli();
  const [alasan, setAlasan] = useState('');
  const [galat, setGalat] = useState<string | null>(null);

  function tutup() {
    setAlasan('');
    setGalat(null);
    onTutup();
  }

  async function kirim() {
    if (!pembeli) return;
    if (!alasan.trim()) return setGalat(t.isiAlasan);
    try {
      await verifikasi.mutateAsync({
        penggunaId: pembeli.pengguna_id,
        keputusan: 'ditolak',
        alasan: alasan.trim(),
      });
      const nama = pembeli.nama_usaha;
      tutup();
      onSelesai(nama);
    } catch (e) {
      setGalat(adalahGalatApi(e) ? (e.rincian.alasan?.[0] ?? e.message) : teksUmum.galatIsi);
    }
  }

  return (
    <Dialog
      terbuka={!!pembeli}
      onTutup={tutup}
      judul={pembeli ? t.tolakJudul(pembeli.nama_usaha) : ''}
      keterangan={t.tolakKet}
    >
      <div className="flex flex-col gap-4">
        <KolomTeks
          label={t.alasan}
          value={alasan}
          onChange={(e) => {
            setAlasan(e.target.value);
            setGalat(null);
          }}
          galat={galat ?? undefined}
        />
        <Tombol penuh disabled={verifikasi.isPending} onClick={() => void kirim()}>
          {verifikasi.isPending ? teksPanel.menyimpan : t.tolakKirim}
        </Tombol>
      </div>
    </Dialog>
  );
}

export function HalamanVerifikasiPembeli() {
  const daftarQ = usePembeliMenunggu();
  const verifikasi = useVerifikasiPembeli();
  const [ditolak, setDitolak] = useState<PembeliUntukAdmin | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function setujui(p: PembeliUntukAdmin) {
    setInfo(null);
    await verifikasi.mutateAsync({ penggunaId: p.pengguna_id, keputusan: 'terverifikasi' });
    setInfo(t.disetujui(p.nama_usaha));
  }

  const daftar = daftarQ.data ?? [];
  return (
    <KerangkaPanelSesi judul={t.pembeliJudul} keterangan={t.pembeliKet}>
      {info ? (
        <p role="status" className="m-0 flex items-center gap-2 font-medium text-daun-tua">
          <Ikon nama="centang" ukuran={20} />
          {info}
        </p>
      ) : null}
      {daftarQ.isPending ? (
        <Memuat />
      ) : daftarQ.isError ? (
        <p className="m-0 text-teks-pendukung">{teksGagalMuat(daftarQ.error)}</p>
      ) : !daftar.length ? (
        <p className="m-0 rounded-lg border border-garis bg-putih p-6 text-teks-pendukung">
          {t.pembeliKosong}
        </p>
      ) : (
        <Tabel
          label={t.pembeliJudul}
          kepala={
            <>
              <Kepala>{t.kolomUsaha}</Kepala>
              <Kepala>{t.kolomAlamat}</Kepala>
              <Kepala>{t.kolomKontak}</Kepala>
              <Kepala>{t.kolomFoto}</Kepala>
              <Kepala>{t.kolomTindakan}</Kepala>
            </>
          }
        >
          {daftar.map((p) => (
            <tr key={p.pengguna_id}>
              <Sel>
                <p className="m-0 font-semibold">{p.nama_usaha}</p>
                <p className="m-0 text-teks-pendukung">{teksPembeli.jenisUsaha(p.jenis_usaha)}</p>
              </Sel>
              <Sel>
                <p className="m-0 max-w-pilihan-kotak">{p.alamat}</p>
              </Sel>
              <Sel>
                <p className="m-0">{p.nama}</p>
                <p className="m-0 tabular-nums text-teks-pendukung">{tampilNomorHp(p.nomor_hp)}</p>
              </Sel>
              <Sel>
                {p.foto_tempat_usaha ? (
                  <img
                    src={p.foto_tempat_usaha}
                    alt={t.fotoUsaha(p.nama_usaha)}
                    className="block h-20 w-24 rounded-sm object-cover"
                  />
                ) : (
                  <span className="text-teks-pendukung">{t.tanpaFoto}</span>
                )}
              </Sel>
              <Sel>
                <div className="flex gap-2">
                  <Tombol
                    aria-label={t.setujuiAria(p.nama_usaha)}
                    disabled={verifikasi.isPending}
                    onClick={() => void setujui(p)}
                  >
                    {t.setujui}
                  </Tombol>
                  <Tombol
                    varian="sekunder"
                    aria-label={t.tolakAria(p.nama_usaha)}
                    onClick={() => {
                      setInfo(null);
                      setDitolak(p);
                    }}
                  >
                    {t.tolak}
                  </Tombol>
                </div>
              </Sel>
            </tr>
          ))}
        </Tabel>
      )}
      <DialogTolak
        pembeli={ditolak}
        onTutup={() => setDitolak(null)}
        onSelesai={(nama) => setInfo(t.ditolak(nama))}
      />
    </KerangkaPanelSesi>
  );
}
