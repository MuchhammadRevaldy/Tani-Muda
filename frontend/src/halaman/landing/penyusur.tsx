/**
 * Tombol penyusur halaman depan [AG-54]: "Lihat cara kerjanya" di bawah hero (menggulir ke bagian
 * berikutnya) dan "Kembali ke atas" yang muncul setelah pengguna menggulir lebih dari satu layar.
 * Tombol kembali ke atas di pojok kiri bawah, supaya tidak menumpuk dengan label "Mode demo" di kanan.
 */
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { kelasTombol } from '../../komponen/tombol';
import { teksLanding as t } from '../../teks/landing';
import { kelasWadah } from '../statis/kerangka-publik';
import { BAGIAN_LANDING, gulirKe, gulirKeAtas, idBagian, usePosisiGulir } from './gulir';

export function TombolLihatCaraKerja() {
  const tujuan = idBagian(BAGIAN_LANDING[0] ?? 'masalah');
  return (
    <div className={cx(kelasWadah, 'flex justify-center pb-10 lg:pb-14')}>
      <a
        href={`#${tujuan}`}
        className={kelasTombol('sekunder')}
        onClick={(e) => {
          e.preventDefault();
          gulirKe(tujuan);
        }}
      >
        <span>{t.lihatCaraKerja}</span>
        <Ikon nama="panah-bawah" />
      </a>
    </div>
  );
}

export function TombolKembaliKeAtas() {
  const [, lewatSatuLayar] = usePosisiGulir();
  return (
    <button
      type="button"
      onClick={gulirKeAtas}
      aria-label={t.kembaliKeAtas}
      aria-hidden={!lewatSatuLayar}
      tabIndex={lewatSatuLayar ? 0 : -1}
      className={cx(
        'fokus-cincin fixed bottom-4 left-4 z-20 inline-flex min-h-sentuh min-w-sentuh cursor-pointer items-center justify-center gap-2 rounded-full border border-garis bg-putih px-3 font-semibold text-teks shadow-kartu lg:bottom-6 lg:left-6 lg:px-5',
        'transition-[opacity,transform] duration-sedang ease-keluar',
        lewatSatuLayar ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <Ikon nama="panah-atas" />
      <span className="hidden lg:inline">{t.kembaliKeAtas}</span>
    </button>
  );
}
