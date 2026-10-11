/**
 * Ubah jumlah sebelum menyetujui kesepakatan (D-40). Petani memilih jumlah baru; lahan dicek seperti
 * di detail pesanan, dengan kapasitas petak alokasi ini dianggap kosong lagi. Server membuat ulang
 * petaknya (`PATCH /alokasi/{id}`) dan tetap memeriksa batas pesanan dan kapasitas.
 */
import { useState } from 'react';
import { adalahGalatApi } from '../../api/galat';
import { useDaftarResep, useLahan, useUbahAlokasi } from '../../api/kueri';
import type { AlokasiPesanan, PesananUntukPetani } from '../../api/tipe';
import { Dialog } from '../../komponen/dialog';
import { PesanKolom } from '../../komponen/kolom-isian';
import { Tombol } from '../../komponen/tombol';
import { cekAmbilSebagian, rencanaPetak, type JadwalKirim } from '../../lib/pesanan-lahan';
import { teksPesanan as t } from '../../teks/pesanan';
import { teksUmum } from '../../teks/umum';
import { cek, KotakLahan, lahanCocok, PemilihJumlah, type LahanCocok } from './detail-pesanan';

export function DialogUbahJumlah({
  p,
  a,
  lahanId,
  jadwal,
  terbuka,
  onTutup,
}: {
  p: PesananUntukPetani;
  a: AlokasiPesanan;
  lahanId: string | null;
  jadwal: JadwalKirim[];
  terbuka: boolean;
  onTutup: () => void;
}) {
  const lahanQ = useLahan();
  const resepQ = useDaftarResep({ komoditas_id: p.komoditas_id });
  const ubah = useUbahAlokasi();
  const [jumlah, setJumlah] = useState(a.jumlah_kg);
  const [galat, setGalat] = useState<string | null>(null);

  // Jumlah milik alokasi ini kembali ke sisa pesanan, dan lahan yang dipakai petaknya kosong lagi.
  const pUbah: PesananUntukPetani = { ...p, sisa_kg: p.sisa_kg + a.jumlah_kg };
  const asli = lahanCocok(lahanQ.data ?? [], resepQ.data ?? []).find((x) => x.lahan.id === lahanId);
  let c: LahanCocok | undefined;
  if (asli) {
    const r = asli.resep;
    const milik =
      p.jenis === 'rutin' && p.frekuensi_hari
        ? rencanaPetak({
            kiriman: jadwal,
            frekuensiHari: p.frekuensi_hari,
            umurPanenHari: r.umur_panen_hari,
            jumlahKg: a.jumlah_kg,
            hasilPerSatuan: r.hasil_per_satuan,
          })
        : null;
    const dipakai = milik?.ok
      ? milik.nilai.luasDibutuhkan
      : (() => {
          const s = cekAmbilSebagian({
            jenis: p.jenis,
            jumlahKg: a.jumlah_kg,
            hasilPerSatuan: r.hasil_per_satuan,
            kapasitas: 0,
          });
          return s.ok ? s.nilai.dibutuhkan : 0;
        })();
    const k = asli.lahan.kapasitas;
    c = { ...asli, lahan: { ...asli.lahan, kapasitas: { ...k, sisa: k.sisa + dipakai } } };
  }
  const r = c ? cek(pUbah, c, jumlah) : null;
  const bisa = !!r?.ok && r.nilai.cukup && jumlah > 0 && jumlah !== a.jumlah_kg;

  async function simpan() {
    setGalat(null);
    try {
      await ubah.mutateAsync({ alokasiId: a.id, jumlah_kg: jumlah });
      onTutup();
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  return (
    <Dialog
      terbuka={terbuka}
      onTutup={onTutup}
      judul={t.ubahJumlahJudul}
      keterangan={t.ubahJumlahKet}
    >
      <div className="flex flex-col gap-4">
        <PemilihJumlah p={pUbah} jumlahKg={jumlah} maks={null} onUbah={setJumlah} />
        {c ? <KotakLahan p={pUbah} c={c} jumlahKg={jumlah} /> : null}
        {galat ? <PesanKolom id="galat-ubah-jumlah" galat={galat} /> : null}
        <Tombol penuh disabled={!bisa || ubah.isPending} onClick={() => void simpan()}>
          {ubah.isPending ? t.menyetujui : t.simpanJumlah(t.jumlahSaja(jumlah, p.frekuensi_hari))}
        </Tombol>
        <Tombol varian="sekunder" penuh onClick={onTutup}>
          {t.batal}
        </Tombol>
      </div>
    </Dialog>
  );
}
