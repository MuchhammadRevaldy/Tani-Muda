/**
 * Profil pembeli /pembeli/profil ([AG-23]): kartu Akun (foto, nama, nomor HP tersamar, Ubah profil),
 * kartu Data usaha (nama usaha, jenis, alamat, desa, status verifikasi dengan ikon dan kata, menuju
 * /pembeli/daftar), penilaian dari petani (GET /pengguna/{id}/rating), dan Keluar. Sapaan "Anda".
 */
import { Link, useLocation } from 'react-router-dom';
import { useRingkasanRating, useWilayahSatu } from '../../api/kueri';
import { useSesi } from '../../api/sesi';
import type { ProfilPembeli } from '../../api/tipe';
import { Avatar } from '../../komponen/avatar';
import { Ikon, type NamaIkon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { HeaderHalaman } from '../../komponen/navigasi';
import { kelasTombol } from '../../komponen/tombol';
import { tampilNomorHp } from '../../lib/nomor-hp';
import { teksPembeli } from '../../teks/pembeli';
import { teksProfilPembeli as t } from '../../teks/profil';
import { Baris, KartuDaftar, TombolKeluar } from '../profil';
import { namaDesa } from '../profil/nama-desa';

const IKON_STATUS: Record<ProfilPembeli['status_verifikasi'], { ikon: NamaIkon; kelas: string }> = {
  menunggu: { ikon: 'jam-pasir', kelas: 'text-matahari-teks' },
  terverifikasi: { ikon: 'centang', kelas: 'text-daun-tua' },
  ditolak: { ikon: 'peringatan', kelas: 'text-tomat-teks' },
};

function StatusUsaha({ status }: { status: ProfilPembeli['status_verifikasi'] }) {
  const g = IKON_STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold ${g.kelas}`}>
      <Ikon nama={g.ikon} ukuran={20} />
      {teksPembeli.statusVerifikasi(status)}
    </span>
  );
}

export function HalamanProfilPembeli() {
  const { akun } = useSesi();
  const lokasi = useLocation();
  const info = (lokasi.state as { info?: string } | null)?.info ?? null;
  const p = akun?.pengguna;
  const u = akun?.profil_pembeli ?? null;
  const wilayahQ = useWilayahSatu(u?.wilayah_id ?? null);
  const ratingQ = useRingkasanRating(p?.id ?? null);
  if (!p) return null;
  const r = ratingQ.data;

  return (
    <>
      <HeaderHalaman judul={t.judul} keterangan={t.sub} />
      {info ? (
        <p role="status" className="m-0 flex items-center gap-2 font-medium text-daun-tua">
          <Ikon nama="centang" ukuran={20} />
          {info}
        </p>
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Kartu judul={t.akun} tingkatJudul={2}>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar nama={p.nama ?? ''} foto={p.foto_profil} ukuran={64} />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-judul-bagian font-semibold">{p.nama}</span>
                  <span className="text-teks-pendukung tabular-nums">
                    {tampilNomorHp(p.nomor_hp)}
                  </span>
                </div>
              </div>
              <Link to="/pembeli/profil/ubah" className={kelasTombol('sekunder') + ' self-start'}>
                {t.ubahProfil}
              </Link>
            </div>
          </Kartu>
          <Kartu judul={t.rating} tingkatJudul={2}>
            {r && r.rata_rata !== null ? (
              <p className="m-0 flex items-baseline gap-2">
                <Ikon
                  nama="bintang"
                  ukuran={20}
                  className="self-center fill-matahari text-matahari"
                />
                <span className="text-uang font-semibold">
                  {t.ratingNilai(r.rata_rata, r.jumlah).angka}
                </span>
                <span className="text-teks-pendukung">
                  {t.ratingNilai(r.rata_rata, r.jumlah).ket}
                </span>
              </p>
            ) : (
              <p className="m-0 text-teks-pendukung">{t.belumAdaRating}</p>
            )}
          </Kartu>
        </div>
        <div className="flex flex-col gap-6">
          {u ? (
            <KartuDaftar judul={t.dataUsaha}>
              <Baris label={t.namaUsaha} nilai={u.nama_usaha} />
              <Baris label={t.jenisUsaha} nilai={teksPembeli.jenisUsaha(u.jenis_usaha)} />
              <Baris label={t.alamat} nilai={u.alamat} bertumpuk />
              <Baris label={t.desa} nilai={namaDesa(wilayahQ.data)} />
              <Baris
                label={t.statusVerifikasi}
                nilai={<StatusUsaha status={u.status_verifikasi} />}
                akhir
              />
              <li className="list-none pb-2 pt-3">
                <Link to="/pembeli/daftar" className={kelasTombol('sekunder')}>
                  {t.ubahDataUsaha}
                </Link>
              </li>
            </KartuDaftar>
          ) : null}
          <TombolKeluar />
        </div>
      </div>
    </>
  );
}
