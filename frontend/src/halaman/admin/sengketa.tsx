/**
 * Antrean sengketa (turunan, T4.29, PRD P0-25, US-21): bagian kiriman yang ditolak pembeli dengan
 * foto kualitas dari petani, foto penolakan, alasan, dan nilai bagian itu. Keputusan admin
 * menentukan pencairan sisa bagian: dicairkan ke petani atau dikembalikan ke pembeli (D-14).
 */
import { useState } from 'react';
import { adalahGalatApi } from '../../api/galat';
import { usePutuskanSengketa, useSengketa } from '../../api/kueri';
import type { KeputusanSengketa, SengketaUntukAdmin, StatusSengketa } from '../../api/tipe';
import { Dialog } from '../../komponen/dialog';
import { Ikon } from '../../komponen/ikon';
import { KolomTeks, PesanKolom } from '../../komponen/kolom-isian';
import { PilPilihan } from '../../komponen/pilihan';
import { Kepala, Sel, Tabel } from '../../komponen/tabel';
import { Tombol } from '../../komponen/tombol';
import { formatTanggalPendek } from '../../lib/format';
import { teksPanel } from '../../teks/panel';
import { teksPembeli } from '../../teks/pembeli';
import { teksUmum } from '../../teks/umum';
import { teksGagalMuat } from '../../teks/galat-api';
import { Memuat } from '../memuat';
import { KerangkaPanelSesi } from '../panel/kerangka-panel-sesi';

const t = teksPanel.admin;
const PILIHAN: Record<KeputusanSengketa, string> = {
  cairkan_ke_petani: t.cairkan,
  kembalikan_ke_pembeli: t.kembalikan,
};

function DialogPutuskan({
  sengketa,
  keputusan,
  onTutup,
  onSelesai,
}: {
  sengketa: SengketaUntukAdmin | null;
  keputusan: KeputusanSengketa;
  onTutup: () => void;
  onSelesai: () => void;
}) {
  const putuskan = usePutuskanSengketa();
  const [catatan, setCatatan] = useState('');
  const [galat, setGalat] = useState<string | null>(null);

  function tutup() {
    setCatatan('');
    setGalat(null);
    onTutup();
  }

  async function kirim() {
    if (!sengketa) return;
    try {
      await putuskan.mutateAsync({ id: sengketa.id, keputusan, catatan: catatan.trim() || null });
      tutup();
      onSelesai();
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  return (
    <Dialog
      terbuka={!!sengketa}
      onTutup={tutup}
      judul={t.putuskanJudul(PILIHAN[keputusan])}
      keterangan={t.putuskanKet[keputusan]}
    >
      <div className="flex flex-col gap-4">
        <KolomTeks
          label={t.catatanKeputusan}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
        />
        {galat ? <PesanKolom id="galat-putuskan" galat={galat} /> : null}
        <Tombol penuh disabled={putuskan.isPending} onClick={() => void kirim()}>
          {putuskan.isPending ? teksPanel.menyimpan : t.putuskan}
        </Tombol>
      </div>
    </Dialog>
  );
}

function Foto({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return null;
  return (
    <a href={src} target="_blank" rel="noreferrer" className="fokus-cincin block rounded-sm">
      <img src={src} alt={alt} className="block h-20 w-24 rounded-sm object-cover" />
    </a>
  );
}

export function HalamanSengketa() {
  const [status, setStatus] = useState<StatusSengketa>('terbuka');
  const daftarQ = useSengketa({ status });
  const [dipilih, setDipilih] = useState<{
    sengketa: SengketaUntukAdmin;
    keputusan: KeputusanSengketa;
  } | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const daftar = daftarQ.data ?? [];

  return (
    <KerangkaPanelSesi judul={t.sengketaJudul} keterangan={t.sengketaKet}>
      <PilPilihan
        label={t.filterStatus}
        nilai={status}
        onPilih={(s) => {
          setStatus(s);
          setInfo(null);
        }}
        opsi={[
          { nilai: 'terbuka', label: t.terbuka },
          { nilai: 'diputuskan', label: t.diputuskan },
        ]}
      />
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
          {t.sengketaKosong}
        </p>
      ) : (
        <Tabel
          label={t.sengketaJudul}
          kepala={
            <>
              <Kepala>{t.kolomKiriman}</Kepala>
              <Kepala>{t.kolomAlasan}</Kepala>
              <Kepala>{t.kolomNilai}</Kepala>
              <Kepala>{t.kolomKeputusan}</Kepala>
            </>
          }
        >
          {daftar.map((s) => {
            const k = s.pengiriman;
            return (
              <tr key={s.id}>
                <Sel>
                  <p className="m-0 font-semibold">{t.pihak(s.nama_petani, s.nama_pembeli)}</p>
                  <p className="m-0 text-teks-pendukung">
                    {t.kirimanKe(k.ke, formatTanggalPendek(k.tanggal_jadwal))}
                  </p>
                </Sel>
                <Sel>
                  <p className="m-0 font-medium">
                    {k.alasan_penolakan ? teksPembeli.alasan(k.alasan_penolakan) : '–'}
                  </p>
                  {k.keterangan_penolakan ? (
                    <p className="m-0 max-w-pilihan-kotak text-teks-pendukung">
                      {k.keterangan_penolakan}
                    </p>
                  ) : null}
                  <div className="mt-2 flex gap-2">
                    <Foto src={k.foto_kualitas} alt={t.fotoKualitas} />
                    <Foto src={k.foto_penolakan} alt={t.fotoTolak} />
                  </div>
                </Sel>
                <Sel className="whitespace-nowrap tabular-nums">
                  {t.ditolakKg(
                    k.jumlah_ditolak_kg,
                    k.jumlah_kg,
                    k.jumlah_ditolak_kg * k.harga_per_kg,
                  )}
                </Sel>
                <Sel>
                  {s.status === 'terbuka' ? (
                    <div className="flex flex-col gap-2">
                      <Tombol
                        onClick={() => {
                          setInfo(null);
                          setDipilih({ sengketa: s, keputusan: 'cairkan_ke_petani' });
                        }}
                      >
                        {t.cairkan}
                      </Tombol>
                      <Tombol
                        varian="sekunder"
                        onClick={() => {
                          setInfo(null);
                          setDipilih({ sengketa: s, keputusan: 'kembalikan_ke_pembeli' });
                        }}
                      >
                        {t.kembalikan}
                      </Tombol>
                    </div>
                  ) : (
                    <>
                      <p className="m-0 font-semibold">
                        {s.keputusan ? t.keputusan[s.keputusan] : '–'}
                      </p>
                      {s.catatan ? <p className="m-0 text-teks-pendukung">{s.catatan}</p> : null}
                    </>
                  )}
                </Sel>
              </tr>
            );
          })}
        </Tabel>
      )}
      <DialogPutuskan
        sengketa={dipilih?.sengketa ?? null}
        keputusan={dipilih?.keputusan ?? 'cairkan_ke_petani'}
        onTutup={() => setDipilih(null)}
        onSelesai={() => setInfo(t.tersimpan)}
      />
    </KerangkaPanelSesi>
  );
}
