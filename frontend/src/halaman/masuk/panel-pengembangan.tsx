/**
 * Panel khusus mode pengembangan di halaman Masuk: kode uji OTP tiruan dan tautan ke pemilih akun
 * demo. Dimuat hanya bila `import.meta.env.DEV`, sehingga tidak ikut build produksi (D-36).
 */
import { Link } from 'react-router-dom';
import { useKontrolPengembangan } from '../../api/penyedia-klien';
import { LabelKecil } from '../../komponen/label-kecil';
import { teksPengembangan as t } from '../../teks/pengembangan';

export default function PanelPengembangan({ nomorHp }: { nomorHp: string | null }) {
  const kontrol = useKontrolPengembangan();
  if (!kontrol) return null;
  const kode = nomorHp ? kontrol.kodeUji(nomorHp) : null;
  return (
    <aside
      aria-label={t.penanda}
      className="flex flex-col gap-2 rounded-md border-1.5 border-dashed border-garis-kuat bg-putih p-4"
    >
      <LabelKecil nada="contoh" className="self-start">
        {t.penanda}
      </LabelKecil>
      {kode ? (
        <div className="flex flex-col gap-0.5">
          <p className="m-0 text-judul-bagian font-semibold tabular-nums">{t.kodeUji(kode)}</p>
          <p className="m-0 text-keterangan text-teks-pendukung">{t.kodeUjiKeterangan}</p>
        </div>
      ) : null}
      <Link
        to="/akun-demo"
        className="fokus-cincin -ml-1 inline-flex min-h-sentuh items-center self-start rounded-sm px-1 font-semibold text-daun-tua"
      >
        {t.bukaAkunDemo}
      </Link>
    </aside>
  );
}
