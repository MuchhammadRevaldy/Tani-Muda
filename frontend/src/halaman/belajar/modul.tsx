/**
 * Pemutar modul (halaman turunan 42; T4.31, PRD P0-05): video ≤ 3 menit dengan kontrol ≥ 48px
 * berteks Indonesia, ringkasan teks, tandai selesai, "Modul berikutnya", kualitas rendah (360p,
 * D-29). Menonton sampai habis menandai `progres_modul`; posisi tonton disimpan di perangkat
 * supaya bisa dilanjutkan (D-43). Modul tanpa video menampilkan keterangan dan tetap bisa ditandai.
 * Desktop: video dan ringkasan di kiri, tindakan dan daftar modul di panel kanan.
 */
import { Link, useParams } from 'react-router-dom';
import { useModul, useModulSatu, useTandaiModul } from '../../api/kueri';
import { usePosisiModul } from '../../api/posisi-modul';
import type { Modul } from '../../api/tipe';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { LabelKecil } from '../../komponen/label-kecil';
import { PemutarVideo } from '../../komponen/pemutar-video';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { teksBelajar as t } from '../../teks/belajar';
import { teksGagalMuat } from '../../teks/galat-api';
import { Memuat } from '../memuat';

function Isi({ m, semua }: { m: Modul; semua: Modul[] }) {
  const lebar = useLayarLebar();
  const tandai = useTandaiModul();
  const posisi = usePosisiModul();
  const urut = [...semua].sort((a, b) => a.urutan - b.urutan);
  const berikutnya = urut.find((x) => x.urutan > m.urutan) ?? null;
  const pos = posisi.posisi(m.id);
  const daftar = `/belajar?komoditas=${encodeURIComponent(m.komoditas_id)}&metode=${encodeURIComponent(m.metode_id)}`;

  function selesai() {
    posisi.hapus(m.id);
    if (!m.selesai) tandai.mutate(m.id);
  }

  const kepala = (
    <div className="flex flex-col gap-3">
      <Link
        to={daftar}
        className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
      >
        <Ikon nama="panah-kiri" ukuran={20} />
        <span>{t.kembali}</span>
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-judul-halaman font-semibold">{m.judul}</h1>
        <p className="m-0 text-keterangan text-teks-pendukung">
          {t.meta(m.urutan, urut.length, m.menit)}
        </p>
      </div>
    </div>
  );

  const video = m.video_url ? (
    <div className="flex flex-col gap-2">
      <PemutarVideo
        src={m.video_url}
        judul={m.judul}
        mulaiDari={pos?.detik ?? 0}
        onWaktu={(detik, durasi) => posisi.simpan(m.id, detik, durasi)}
        onSelesai={selesai}
      />
      <p className="m-0 text-keterangan text-teks-pendukung">{t.kualitas}</p>
    </div>
  ) : (
    <div className="grid aspect-video place-items-center rounded-lg bg-daun-lembut p-6 text-center">
      <p className="m-0 max-w-dialog font-medium text-daun-tua">{t.videoBelumAda}</p>
    </div>
  );

  const ringkasan = (
    <Kartu judul={t.ringkasan} tingkatJudul={2}>
      <div className="flex flex-col gap-3">
        <LabelKecil nada="contoh" className="self-start">
          {t.labelContoh}
        </LabelKecil>
        <p className="m-0">{m.ringkasan}</p>
      </div>
    </Kartu>
  );

  const tindakan = (
    <div className="flex flex-col gap-3">
      {m.selesai ? (
        <p className="m-0 flex items-center gap-2 font-semibold text-daun-tua">
          <Ikon nama="centang" tebal={2.5} />
          {t.sudahSelesai}
        </p>
      ) : (
        <Tombol
          varian={berikutnya ? 'sekunder' : 'utama'}
          penuh
          disabled={tandai.isPending}
          onClick={selesai}
        >
          {tandai.isPending ? t.menyimpan : t.tandaiSelesai}
        </Tombol>
      )}
      {berikutnya ? (
        <Link
          to={`/belajar/${encodeURIComponent(berikutnya.id)}`}
          className={kelasTombol('utama', true)}
        >
          {t.modulBerikutnya(berikutnya.judul)}
        </Link>
      ) : (
        <Link to={daftar} className={kelasTombol('sekunder', true)}>
          {t.kembaliKeDaftar}
        </Link>
      )}
    </div>
  );

  const daftarModul = (
    <Kartu tanpaIsi>
      <ol className="m-0 list-none p-0">
        {urut.map((x) => (
          <li key={x.id}>
            <Link
              to={`/belajar/${encodeURIComponent(x.id)}`}
              aria-current={x.id === m.id ? 'page' : undefined}
              className={cx(
                'fokus-cincin flex min-h-sentuh items-center gap-3 px-4 py-2 no-underline',
                x.id === m.id ? 'bg-daun-lembut font-semibold text-daun-tua' : 'text-teks',
              )}
            >
              <span className="w-6 flex-none text-center">
                {x.selesai ? <Ikon nama="centang" ukuran={18} tebal={2.5} /> : x.urutan}
              </span>
              <span className="min-w-0 flex-1">{x.judul}</span>
              <span className="text-keterangan text-teks-pendukung">{t.menit(x.menit)}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Kartu>
  );

  if (!lebar)
    return (
      <>
        {kepala}
        {video}
        {tindakan}
        {ringkasan}
      </>
    );
  return (
    <>
      {kepala}
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {video}
          {ringkasan}
        </div>
        <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4">
          {tindakan}
          {daftarModul}
        </aside>
      </div>
    </>
  );
}

export function HalamanModul() {
  const { id } = useParams();
  const modulQ = useModulSatu(id ?? null);
  const m = modulQ.data;
  const semuaQ = useModul(m ? { komoditas_id: m.komoditas_id, metode_id: m.metode_id } : null);
  if (modulQ.isError)
    return <p className="m-0 text-teks-pendukung">{teksGagalMuat(modulQ.error)}</p>;
  if (!m || !semuaQ.data) return <Memuat />;
  return <Isi key={m.id} m={m} semua={semuaQ.data} />;
}
