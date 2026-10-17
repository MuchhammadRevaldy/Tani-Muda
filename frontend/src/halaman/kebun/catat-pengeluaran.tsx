/**
 * Catat pengeluaran (turunan, T4.15, PRD P0-18): item rencana atau "di luar rencana", nominal,
 * tanggal, foto nota (dikecilkan lalu diunggah). Angka modal langsung diperbarui lewat cache kueri.
 */
import { useState } from 'react';
import { adalahGalatApi } from '../../api/galat';
import { kunciIdempotenBaru, useCatatPengeluaran, useUnggahBerkas } from '../../api/kueri';
import { useHariIni } from '../../api/sesi';
import type { RencanaItem } from '../../api/tipe';
import { AmbilFoto, type FotoKecil } from '../../komponen/ambil-foto';
import { Dialog } from '../../komponen/dialog';
import { InputRupiah } from '../../komponen/input-rupiah';
import { KolomIsian, PesanKolom } from '../../komponen/kolom-isian';
import { PilihTanggal } from '../../komponen/pilih-tanggal';
import { PilihanDropdown } from '../../komponen/pilihan-dropdown';
import { Tombol } from '../../komponen/tombol';
import { teksKebun as t } from '../../teks/kebun';
import { teksUmum } from '../../teks/umum';

const LAIN = '';

export function DialogCatatPengeluaran({
  siklusId,
  item,
  terbuka,
  onTutup,
  onTersimpan,
}: {
  siklusId: string;
  item: RencanaItem[];
  terbuka: boolean;
  onTutup: () => void;
  onTersimpan: () => void;
}) {
  const hariIni = useHariIni();
  const catat = useCatatPengeluaran();
  const unggah = useUnggahBerkas();
  const [itemId, setItemId] = useState<string>(item[0]?.id ?? LAIN);
  const [nama, setNama] = useState('');
  const [nominal, setNominal] = useState<number | null>(null);
  const [tanggal, setTanggal] = useState(hariIni);
  const [foto, setFoto] = useState<FotoKecil | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  async function simpan() {
    setGalat(null);
    const terpilih = item.find((i) => i.id === itemId);
    const namaAkhir = terpilih ? terpilih.nama : nama.trim();
    if (!namaAkhir) return setGalat(t.isiNama);
    if (!nominal || nominal <= 0) return setGalat(t.isiNominal);
    try {
      const url = foto
        ? (await unggah.mutateAsync({ nama: foto.nama, jenis: foto.jenis, isi: foto.dataUrl })).url
        : null;
      await catat.mutateAsync({
        siklusId,
        rencana_item_id: terpilih?.id ?? null,
        nama: namaAkhir,
        nominal,
        tanggal,
        foto_nota: url,
        kunci_idempoten: kunciIdempotenBaru(),
      });
      setNama('');
      setNominal(null);
      setFoto(null);
      onTersimpan();
    } catch (e) {
      setGalat(
        adalahGalatApi(e) ? (Object.values(e.rincian)[0]?.[0] ?? e.message) : teksUmum.galatIsi,
      );
    }
  }

  return (
    <Dialog terbuka={terbuka} onTutup={onTutup} judul={t.judulCatat}>
      <div className="flex flex-col gap-4">
        <PilihanDropdown
          id="item-pengeluaran"
          label={t.itemRencana}
          nilai={itemId}
          onChange={setItemId}
          pilihan={[
            ...item.map((i) => ({ nilai: i.id, label: i.nama })),
            { nilai: LAIN, label: t.diLuarRencana },
          ]}
        />
        {itemId === LAIN ? (
          <KolomIsian
            label={t.namaPengeluaran}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
        ) : null}
        <InputRupiah label={t.nominal} nilai={nominal} onUbah={setNominal} />
        <PilihTanggal
          label={t.tanggal}
          nilai={tanggal}
          onChange={setTanggal}
        />
        <div className="flex flex-col gap-2">
          <span className="font-medium">{t.fotoNota}</span>
          {foto ? (
            <img
              src={foto.dataUrl}
              alt={t.fotoNota}
              className="aspect-foto w-40 rounded-md border border-garis object-cover"
            />
          ) : null}
          <AmbilFoto
            label={foto ? t.gantiFoto : t.tambahFoto}
            labelMemuat={t.mengecilkan}
            onFoto={setFoto}
            onGagal={() => setGalat(t.fotoGagal)}
            className="self-start"
          />
        </div>
        {galat ? <PesanKolom id="galat-pengeluaran" galat={galat} /> : null}
        <Tombol penuh disabled={catat.isPending || unggah.isPending} onClick={() => void simpan()}>
          {catat.isPending || unggah.isPending ? t.menyimpan : t.simpanPengeluaran}
        </Tombol>
      </div>
    </Dialog>
  );
}
