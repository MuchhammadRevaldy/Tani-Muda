/**
 * Kartu Cuaca dan Kecocokan Suhu di Beranda Petani (PRD Tambahan F-06).
 */
import { useCuaca } from '../../api/kueri';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { fiturAktif } from '../../lib/fitur';

export function KartuCuaca() {
  const aktif = fiturAktif('CUACA');
  const { data, isPending, isError } = useCuaca();

  if (!aktif) {
    return null;
  }

  if (isPending) {
    return (
      <Kartu judul="Cuaca dan suhu hari ini">
        <div className="flex animate-pulse items-center gap-4 py-2">
          <div className="h-10 w-10 rounded-full bg-garis" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-28 rounded bg-garis" />
            <div className="h-3 w-40 rounded bg-garis" />
          </div>
        </div>
      </Kartu>
    );
  }

  if (isError || !data) {
    return (
      <Kartu judul="Cuaca dan suhu hari ini">
        <div className="flex items-start gap-2.5 py-1 text-keterangan text-teks-pendukung">
          <Ikon nama="info" ukuran={18} className="mt-0.5 flex-none" />
          <p className="m-0">
            Perkiraan cuaca desa sedang belum bisa dimuat. Halaman lain tetap berjalan normal.
          </p>
        </div>
      </Kartu>
    );
  }

  return (
    <Kartu judul="Cuaca dan suhu desa" keterangan={data.desa}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-garis pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-matahari-lembut text-matahari-teks">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-judul-halaman font-bold text-teks">{data.suhu_sekarang}°C</span>
                <span className="text-keterangan text-teks-pendukung">
                  {data.suhu_min}°C – {data.suhu_maks}°C
                </span>
              </div>
              <p className="m-0 text-keterangan text-teks-pendukung">Sumber: {data.sumber}</p>
            </div>
          </div>
        </div>

        {data.siklus && data.siklus.length > 0 ? (
          <div className="flex flex-col gap-2 pt-1">
            <p className="m-0 text-keterangan font-semibold uppercase tracking-wider text-teks-pendukung">
              Kecocokan Tanaman Aktif:
            </p>
            {data.siklus.map((s) => (
              <div
                key={s.siklus_id}
                className={`flex flex-col gap-1 rounded-lg border p-3 text-keterangan ${
                  s.cocok
                    ? 'border-garis bg-daun-lembut text-daun-tua'
                    : 'border-garis bg-matahari-lembut text-matahari-teks'
                }`}
              >
                <div className="flex items-center justify-between font-medium">
                  <span>{s.nama_tanaman}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-keterangan font-semibold ${
                      s.cocok
                        ? 'bg-putih text-daun-tua'
                        : 'bg-putih text-matahari-teks'
                    }`}
                  >
                    {s.cocok ? 'Suhu Cocok' : 'Perlu Perhatian'}
                  </span>
                </div>
                <p className="m-0 text-teks">{s.label}</p>
                {s.saran && (
                  <p className="m-0 mt-1 italic text-teks-pendukung">Saran: {s.saran}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="m-0 text-keterangan text-teks-pendukung">
            Suhu ideal untuk memulai penanaman baru hari ini.
          </p>
        )}
      </div>
    </Kartu>
  );
}
