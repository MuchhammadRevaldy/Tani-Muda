/**
 * Status verifikasi pembeli (T4.28, PRD P0-02, US-21): "Menunggu verifikasi / Terverifikasi /
 * Ditolak" dengan ikon dan kata. Pembeli yang belum terverifikasi bisa melihat aplikasi, tetapi
 * tidak bisa memasang pesanan.
 */
import { Link } from 'react-router-dom';
import type { ProfilPembeli } from '../../api/tipe';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon, type NamaIkon } from '../../komponen/ikon';
import { kelasTombol } from '../../komponen/tombol';
import { teksPembeli as t } from '../../teks/pembeli';

const GAYA: Record<ProfilPembeli['status_verifikasi'], { ikon: NamaIkon; kelas: string }> = {
  menunggu: { ikon: 'jam-pasir', kelas: 'border-matahari bg-matahari-lembut' },
  terverifikasi: { ikon: 'centang', kelas: 'border-daun-tua bg-daun-lembut' },
  ditolak: { ikon: 'peringatan', kelas: 'border-tomat bg-tomat-lembut' },
};

/** Kartu status; disembunyikan untuk pembeli terverifikasi kecuali `selalu`. */
export function StatusVerifikasi({
  profil,
  selalu,
}: {
  profil: ProfilPembeli;
  selalu?: boolean;
}) {
  const s = profil.status_verifikasi;
  if (s === 'terverifikasi' && !selalu) return null;
  const g = GAYA[s];
  return (
    <section
      aria-label={t.statusVerifikasi(s)}
      className={cx('flex items-start gap-3 rounded-md border-1.5 px-4 py-3', g.kelas)}
    >
      <Ikon nama={g.ikon} className="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="m-0 font-semibold">{t.statusVerifikasi(s)}</p>
        <p className="m-0 text-keterangan">{t.statusVerifikasiKet[s]}</p>
        {s === 'ditolak' && profil.alasan_ditolak ? (
          <p className="m-0 text-keterangan">{t.alasanDitolak(profil.alasan_ditolak)}</p>
        ) : null}
        {s === 'ditolak' ? (
          <Link to="/pembeli/daftar" className={kelasTombol('sekunder') + ' mt-2 self-start'}>
            {t.perbaikiData}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
