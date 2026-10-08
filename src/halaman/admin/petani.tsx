/**
 * Petani di panel admin (turunan, T4.29, D-03, D-13): daftar petani dengan status akun dan jumlah
 * catatan, lalu halaman satu petani untuk membaca dan menulis catatan serta menonaktifkan sementara
 * atau mengaktifkan kembali. Tanpa nomor HP dan titik lahan di daftar (D-06).
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import {
  useDaftarPetaniAdmin,
  usePetaniAdmin,
  useTulisCatatan,
  useUbahStatusPetani,
} from '../../api/kueri';
import type { JenisCatatanPetani, StatusAkun } from '../../api/tipe';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { KolomTeks } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { PilPilihan } from '../../komponen/pilihan';
import { Kepala, Sel, Tabel } from '../../komponen/tabel';
import { Tombol } from '../../komponen/tombol';
import { formatTanggal } from '../../lib/format';
import { teksPanel } from '../../teks/panel';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { KerangkaPanelSesi } from '../panel/kerangka-panel-sesi';

const t = teksPanel.admin;
const labelStatus = (s: StatusAkun) => (s === 'aktif' ? t.aktif : t.nonaktif);

function ChipStatusAkun({ status }: { status: StatusAkun }) {
  return status === 'aktif' ? (
    <LabelKecil nada="hijau" ikon="centang">
      {t.aktif}
    </LabelKecil>
  ) : (
    <LabelKecil nada="segera" ikon="peringatan">
      {t.nonaktif}
    </LabelKecil>
  );
}

export function HalamanDaftarPetaniAdmin() {
  const daftarQ = useDaftarPetaniAdmin();
  const daftar = daftarQ.data ?? [];
  return (
    <KerangkaPanelSesi judul={t.petaniJudul} keterangan={t.petaniKet}>
      {daftarQ.isPending ? (
        <Memuat />
      ) : daftarQ.isError ? (
        <p className="m-0 text-teks-pendukung">{teksUmum.galatIsi}</p>
      ) : (
        <Tabel
          label={t.petaniJudul}
          kepala={
            <>
              <Kepala>{t.kolomNama}</Kepala>
              <Kepala>{t.kolomDesa}</Kepala>
              <Kepala>{t.kolomStatus}</Kepala>
              <Kepala className="text-right">{t.kolomCatatan}</Kepala>
              <Kepala className="text-right">{t.kolomSiklus}</Kepala>
            </>
          }
        >
          {daftar.map((p) => (
            <tr key={p.id}>
              <Sel>
                <Link
                  to={`/admin/petani/${encodeURIComponent(p.id)}`}
                  aria-label={t.lihat(p.nama ?? p.id)}
                  className="fokus-cincin inline-flex min-h-sentuh items-center rounded-sm font-semibold text-daun-tua"
                >
                  {p.nama ?? p.id}
                </Link>
              </Sel>
              <Sel>{p.desa ?? '–'}</Sel>
              <Sel>
                <ChipStatusAkun status={p.status_akun} />
              </Sel>
              <Sel className="text-right tabular-nums">{p.jumlah_catatan}</Sel>
              <Sel className="text-right tabular-nums">{p.siklus_aktif}</Sel>
            </tr>
          ))}
        </Tabel>
      )}
    </KerangkaPanelSesi>
  );
}

export function HalamanPetaniAdmin() {
  const { id = '' } = useParams();
  const petaniQ = usePetaniAdmin(id);
  const tulis = useTulisCatatan();
  const ubahStatus = useUbahStatusPetani();
  const [jenis, setJenis] = useState<JenisCatatanPetani>('tidak_memberi_kabar');
  const [isi, setIsi] = useState('');
  const [galat, setGalat] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const p = petaniQ.data;
  const kembali = (
    <Link
      to="/admin/petani"
      className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
    >
      <Ikon nama="panah-kiri" ukuran={20} />
      <span>{t.kembaliKeDaftar}</span>
    </Link>
  );
  if (petaniQ.isError)
    return (
      <KerangkaPanelSesi judul={t.petaniJudul}>
        {kembali}
        <p className="m-0 text-teks-pendukung">{teksUmum.galatIsi}</p>
      </KerangkaPanelSesi>
    );
  if (!p)
    return (
      <KerangkaPanelSesi judul={t.petaniJudul}>
        <Memuat />
      </KerangkaPanelSesi>
    );

  async function simpanCatatan() {
    setInfo(null);
    if (!isi.trim()) return setGalat(t.isiCatatanDulu);
    try {
      await tulis.mutateAsync({ petaniId: id, jenis, isi: isi.trim() });
      setIsi('');
      setGalat(null);
    } catch (e) {
      setGalat(adalahGalatApi(e) ? (e.rincian.isi?.[0] ?? e.message) : teksUmum.galatIsi);
    }
  }

  async function gantiStatus(status: StatusAkun) {
    setInfo(null);
    await ubahStatus.mutateAsync({ petaniId: id, status_akun: status });
    setInfo(t.statusTersimpan(labelStatus(status)));
  }

  const status = p.pengguna.status_akun;
  return (
    <KerangkaPanelSesi judul={p.pengguna.nama ?? t.petaniJudul}>
      {kembali}
      {info ? (
        <p role="status" className="m-0 flex items-center gap-2 font-medium text-daun-tua">
          <Ikon nama="centang" ukuran={20} />
          {info}
        </p>
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Kartu judul={t.catatanJudul} keterangan={t.catatanKet} tingkatJudul={2}>
            {p.catatan.length ? (
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {[...p.catatan]
                  .sort((a, b) => b.dibuat_pada.localeCompare(a.dibuat_pada))
                  .map((c) => (
                    <li key={c.id} className="rounded-md bg-embun-pagi p-3">
                      <p className="m-0 font-semibold">{t.jenisCatatan[c.jenis]}</p>
                      <p className="m-0">{c.isi}</p>
                      <p className="m-0 text-keterangan text-teks-pendukung">
                        {formatTanggal(c.dibuat_pada.slice(0, 10))}
                      </p>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="m-0 text-teks-pendukung">{t.catatanKosong}</p>
            )}
          </Kartu>
          <Kartu judul={t.tulisCatatan} tingkatJudul={2}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="font-medium">{t.jenis}</span>
                <PilPilihan
                  label={t.jenis}
                  nilai={jenis}
                  onPilih={setJenis}
                  opsi={[
                    { nilai: 'tidak_memberi_kabar', label: t.jenisCatatan.tidak_memberi_kabar },
                    { nilai: 'lainnya', label: t.jenisCatatan.lainnya },
                  ]}
                />
              </div>
              <KolomTeks
                label={t.isi}
                value={isi}
                onChange={(e) => {
                  setIsi(e.target.value);
                  setGalat(null);
                }}
                galat={galat ?? undefined}
              />
              <Tombol
                className="self-start"
                disabled={tulis.isPending}
                onClick={() => void simpanCatatan()}
              >
                {tulis.isPending ? teksPanel.menyimpan : t.simpanCatatan}
              </Tombol>
            </div>
          </Kartu>
        </div>
        <Kartu judul={t.statusJudul} tingkatJudul={2}>
          <div className="flex flex-col gap-3">
            <ChipStatusAkun status={status} />
            <p className="m-0 text-teks-pendukung">{t.statusKet[status]}</p>
            <Tombol
              varian="sekunder"
              disabled={ubahStatus.isPending}
              onClick={() =>
                void gantiStatus(status === 'aktif' ? 'dinonaktifkan_sementara' : 'aktif')
              }
            >
              {status === 'aktif' ? t.nonaktifkan : t.aktifkan}
            </Tombol>
          </div>
        </Kartu>
      </div>
    </KerangkaPanelSesi>
  );
}
