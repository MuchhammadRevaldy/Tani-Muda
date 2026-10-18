/**
 * Kartu Cuaca dan Kecocokan Suhu di Beranda Petani (PRD Tambahan F-06).
 */
import { useState } from 'react';
import { useCuaca, useKomoditas, useDaftarResep } from '../../api/kueri';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { PilihanDropdown } from '../../komponen/pilihan-dropdown';
import { fiturAktif } from '../../lib/fitur';
import { kecocokanSuhu } from '../../lib/suhu';

interface ItemTanamanCuaca {
  id: string;
  nama: string;
  cocok: boolean;
  label: string;
  saran: string | null;
  aktifDiKebun: boolean;
}

export function KartuCuaca() {
  const aktif = fiturAktif('CUACA');
  const { data, isPending, isError } = useCuaca();
  const komoditasQ = useKomoditas();
  const resepQ = useDaftarResep();
  const [pilihanTanaman, setPilihanTanaman] = useState<string>('');

  if (!aktif) {
    return null;
  }

  if (isPending) {
    return (
      <Kartu id="kartu-cuaca" judul="Cuaca dan suhu hari ini">
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
      <Kartu id="kartu-cuaca" judul="Cuaca dan suhu hari ini">
        <div className="flex items-start gap-2.5 py-1 text-keterangan text-teks-pendukung">
          <Ikon nama="info" ukuran={18} className="mt-0.5 flex-none" />
          <p className="m-0">
            Perkiraan cuaca desa sedang belum bisa dimuat. Halaman lain tetap berjalan normal.
          </p>
        </div>
      </Kartu>
    );
  }

  const semuaKomoditas = komoditasQ.data ?? [];
  const semuaResep = resepQ.data ?? [];
  const siklusList = data.siklus ?? [];

  // Peta kecocokan dari siklus aktif milik petani
  const mapSiklusAktif = new Map<string, (typeof siklusList)[0]>();
  for (const s of siklusList) {
    if (!mapSiklusAktif.has(s.nama_tanaman.toLowerCase())) {
      mapSiklusAktif.set(s.nama_tanaman.toLowerCase(), s);
    }
  }

  let daftarTanaman: ItemTanamanCuaca[] = [];
  if (semuaKomoditas.length > 0) {
    const list: ItemTanamanCuaca[] = semuaKomoditas.map((k) => {
      const siklusAktif = mapSiklusAktif.get(k.nama.toLowerCase());
      if (siklusAktif) {
        return {
          id: k.id,
          nama: k.nama,
          cocok: siklusAktif.cocok,
          label: siklusAktif.label,
          saran: siklusAktif.saran,
          aktifDiKebun: true,
        };
      }

      const resep = semuaResep.find((r) => r.komoditas_id === k.id);
      const hasil = kecocokanSuhu(data.suhu_sekarang, resep ?? null);
      return {
        id: k.id,
        nama: k.nama,
        cocok: hasil.cocok,
        label: hasil.label,
        saran: hasil.saran,
        aktifDiKebun: false,
      };
    });

    list.sort((a, b) => {
      if (a.aktifDiKebun && !b.aktifDiKebun) return -1;
      if (!a.aktifDiKebun && b.aktifDiKebun) return 1;
      return a.nama.localeCompare(b.nama);
    });

    daftarTanaman = list;
  } else if (siklusList.length > 0) {
    const mapFallback = new Map<string, ItemTanamanCuaca>();
    for (const s of siklusList) {
      if (!mapFallback.has(s.nama_tanaman)) {
        mapFallback.set(s.nama_tanaman, {
          id: s.siklus_id,
          nama: s.nama_tanaman,
          cocok: s.cocok,
          label: s.label,
          saran: s.saran,
          aktifDiKebun: true,
        });
      }
    }
    daftarTanaman = Array.from(mapFallback.values());
  }

  const itemAktif =
    daftarTanaman.find((t) => t.id === pilihanTanaman || t.nama === pilihanTanaman) ??
    daftarTanaman[0];

  const opsiTanaman = daftarTanaman.map((t) => ({
    nilai: t.id,
    label: t.nama,
    keterangan: t.aktifDiKebun
      ? `Aktif di kebun · ${t.cocok ? 'Suhu Cocok' : 'Perlu Perhatian'}`
      : t.cocok
        ? 'Suhu Cocok'
        : 'Perlu Perhatian',
  }));

  return (
    <Kartu id="kartu-cuaca" judul="Cuaca dan suhu desa" keterangan={data.desa} className="overflow-visible">
      <div className="flex flex-col gap-3.5">
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
            </div>
          </div>
        </div>

        {daftarTanaman.length > 0 ? (
          <div className="flex flex-col gap-2.5 pt-0.5">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="pilih-tanaman-cuaca-tombol"
                className="text-keterangan font-medium text-teks-pendukung"
              >
                Cek Kecocokan Tanaman:
              </label>
              <PilihanDropdown
                id="pilih-tanaman-cuaca"
                label="Pilih Tanaman"
                labelTersembunyi
                nilai={itemAktif?.id ?? ''}
                onChange={(val) => setPilihanTanaman(val)}
                pilihan={opsiTanaman}
                placeholder="Pilih tanaman..."
              />
            </div>

            {itemAktif ? (
              <div
                className={`flex flex-col gap-1 rounded-lg border p-3 text-keterangan transition-colors ${
                  itemAktif.cocok
                    ? 'border-garis bg-daun-lembut text-daun-tua'
                    : 'border-garis bg-matahari-lembut text-matahari-teks'
                }`}
              >
                <div className="flex items-center justify-between font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-teks">{itemAktif.nama}</span>
                    {itemAktif.aktifDiKebun ? (
                      <span className="rounded bg-daun-tua/10 px-1.5 py-0.5 text-keterangan font-semibold text-daun-tua">
                        Aktif di Kebun
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-keterangan font-semibold ${
                      itemAktif.cocok
                        ? 'bg-putih text-daun-tua'
                        : 'bg-putih text-matahari-teks'
                    }`}
                  >
                    {itemAktif.cocok ? 'Suhu Cocok' : 'Perlu Perhatian'}
                  </span>
                </div>
                <p className="m-0 text-teks">{itemAktif.label}</p>
                {itemAktif.saran && (
                  <p className="m-0 mt-1 italic text-teks-pendukung">Saran: {itemAktif.saran}</p>
                )}
              </div>
            ) : null}
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
