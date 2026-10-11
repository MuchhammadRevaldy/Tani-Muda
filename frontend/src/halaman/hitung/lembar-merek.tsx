/**
 * Pilih merek (papan 17, T4.06, PRD P0-34): merek urut laporan terbaru dari server (tidak pernah
 * dipengaruhi promo, P0-35), harga per kemasan dan per satuan, jumlah pelapor, umur laporan.
 * "Merek lain, isi sendiri" menulis laporan harga baru. Tidak ada merek yang diberi label rekomendasi.
 */
import { useState } from 'react';
import { useLaporHarga, useMerek } from '../../api/kueri';
import { Dialog } from '../../komponen/dialog';
import { cx } from '../../komponen/gabung-kelas';
import { InputRupiah } from '../../komponen/input-rupiah';
import { KolomIsian, PesanKolom } from '../../komponen/kolom-isian';
import { GrupRadio } from '../../komponen/pilihan';
import { Tombol } from '../../komponen/tombol';
import { formatRupiah } from '../../lib/format';
import { validasiMerekLain } from '../../lib/harga-item';
import type { ItemRencana, MerekDipilih } from '../../lib/rencana';
import { teksGalat } from '../../teks/galat';
import { teksHitung as t } from '../../teks/hitung';
import { teksUmum } from '../../teks/umum';
import { angkaIsian } from './pilihan';

const LAIN = 'merek-lain';

function BarisPilihan({
  dipilih,
  onPilih,
  label,
  children,
}: {
  dipilih: boolean;
  onPilih: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        'relative flex items-start gap-3 px-4 py-3 [&+&]:border-t [&+&]:border-garis',
        dipilih && 'bg-daun-lembut',
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          'mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full border-2 bg-putih',
          dipilih ? 'border-daun-tua' : 'border-garis-kuat',
        )}
      >
        {dipilih ? <span className="h-3 w-3 rounded-full bg-daun-tua" /> : null}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</div>
      <button
        type="button"
        role="radio"
        aria-checked={dipilih}
        aria-label={label}
        onClick={onPilih}
        className="fokus-cincin absolute inset-0 m-0 h-full w-full cursor-pointer border-0 bg-transparent p-0"
      />
      {dipilih ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 border-2 border-daun-tua"
        />
      ) : null}
    </div>
  );
}

export function LembarMerek({
  item,
  onTutup,
  onPakai,
}: {
  item: ItemRencana;
  onTutup: () => void;
  onPakai: (merek: MerekDipilih) => void;
}) {
  const merekQ = useMerek(item.inputId);
  const lapor = useLaporHarga();
  const [pilih, setPilih] = useState<string | null>(item.merek?.id ?? null);
  const [nama, setNama] = useState('');
  const [hargaKemasan, setHargaKemasan] = useState<number | null>(null);
  const [isi, setIsi] = useState('');
  const [galat, setGalat] = useState<string | null>(null);
  const daftar = merekQ.data ?? [];

  async function pakai() {
    setGalat(null);
    if (pilih === LAIN) {
      const v = validasiMerekLain({
        namaMerek: nama,
        isiKemasan: angkaIsian(isi) ?? 0,
        hargaKemasan: hargaKemasan ?? -1,
      });
      if (!v.ok) return setGalat(teksGalat[v.galat]);
      try {
        const laporan = await lapor.mutateAsync({
          merek_baru: {
            input_id: item.inputId as string,
            nama: v.nilai.namaMerek,
            isi_kemasan: v.nilai.isiKemasan,
            teks_kemasan: `${isi} ${item.satuan}`,
          },
          harga_kemasan: v.nilai.hargaKemasan,
        });
        onPakai({
          id: laporan.merek_id,
          nama: v.nilai.namaMerek,
          hargaKemasan: v.nilai.hargaKemasan,
          isiKemasan: v.nilai.isiKemasan,
        });
      } catch (e) {
        setGalat(e instanceof Error ? e.message : teksUmum.galatIsi);
      }
      return;
    }
    const m = daftar.find((x) => x.merek.id === pilih);
    if (!m || m.harga_kemasan === null) return;
    onPakai({
      id: m.merek.id,
      nama: m.merek.nama,
      hargaKemasan: m.harga_kemasan,
      isiKemasan: m.merek.isi_kemasan,
    });
  }

  return (
    <Dialog
      terbuka
      onTutup={onTutup}
      judul={t.pilihMerekJudul(item.nama)}
      keterangan={t.pilihMerekKet}
    >
      <div className="flex flex-col gap-4">
        {merekQ.isPending ? (
          <p role="status" className="m-0 text-teks-pendukung">
            {teksUmum.memuat}
          </p>
        ) : (
          <GrupRadio
            label={t.merekGrup}
            className="overflow-hidden rounded-lg border border-garis bg-putih"
          >
            {daftar.map((m) => (
              <BarisPilihan
                key={m.merek.id}
                dipilih={pilih === m.merek.id}
                onPilih={() => setPilih(m.merek.id)}
                label={m.merek.nama}
              >
                <span className="font-semibold">{m.merek.nama}</span>
                {m.harga_kemasan !== null ? (
                  <span>
                    {t.hargaKemasan(formatRupiah(m.harga_kemasan), m.merek.teks_kemasan)}{' '}
                    {m.harga_per_satuan !== null ? (
                      <span className="font-semibold text-tanah">
                        {`${formatRupiah(m.harga_per_satuan)}/${item.satuan}`}
                      </span>
                    ) : null}
                  </span>
                ) : null}
                <span className="text-keterangan text-teks-pendukung">
                  {m.hari_lalu !== null
                    ? t.dilaporkan(m.jumlah_pelapor, m.hari_lalu)
                    : t.belumAdaLaporan}
                </span>
                {m.merek.nomor_pendaftaran ? (
                  <span className="text-keterangan text-teks-pendukung">
                    {t.nomorDaftar(m.merek.nomor_pendaftaran)}
                  </span>
                ) : null}
              </BarisPilihan>
            ))}
            <BarisPilihan
              dipilih={pilih === LAIN}
              onPilih={() => setPilih(LAIN)}
              label={t.merekLain}
            >
              <span className="font-semibold">{t.merekLain}</span>
            </BarisPilihan>
          </GrupRadio>
        )}
        {pilih === LAIN ? (
          <div className="flex flex-col gap-4">
            <KolomIsian
              label={t.namaMerek}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
            <InputRupiah
              label={t.hargaPerKemasan}
              nilai={hargaKemasan}
              onUbah={setHargaKemasan}
              tanpaTerbilang
            />
            <KolomIsian
              label={t.isiKemasan}
              inputMode="decimal"
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              akhiran={item.satuan}
            />
          </div>
        ) : null}
        {galat ? <PesanKolom id="galat-merek" galat={galat} /> : null}
        <Tombol penuh disabled={!pilih || lapor.isPending} onClick={() => void pakai()}>
          {t.pakaiMerek}
        </Tombol>
      </div>
    </Dialog>
  );
}
