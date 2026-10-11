/**
 * Keadaan rencana Hitung (T4.04–T4.08). Semua angka dihitung fungsi `src/lib` (D-08):
 * konversi luas, kebutuhan input, harga efektif, modal, ringkasan, dan pratinjau jadwal.
 * Suntingan item (jumlah, harga, merek, subsidi, item tambahan) disimpan di penyedia yang membungkus
 * semua langkah Hitung, sehingga tetap ada saat pindah dari kalkulator ke langkah simpan.
 */
import {
  useDaftarResep,
  useHargaSekitarBanyak,
  useKelayakanSubsidi,
  useKomoditas,
  useKonversiSatuan,
  useMetode,
  usePesananSekitar,
  usePesananUntukPetani,
  useSistemHidroponik,
} from '../../api/kueri';
import { kelayakanKeDomain, resepKeDomain } from '../../api/peta';
import { useHariIni, useSesi } from '../../api/sesi';
import type { Komoditas, MetodeTanam, ResepTanam, SistemHidroponik } from '../../api/tipe';
import { pinPenggaris } from '../../lib/beranda';
import type { Hasil } from '../../lib/hasil';
import { buatJadwal } from '../../lib/jadwal-buat';
import { hitungKebutuhanResep, validasiUkuran, type UkuranTanam } from '../../lib/kebutuhan';
import { keM2, teksBantuanLuas, type KonversiLuas } from '../../lib/konversi-satuan';
import type { RingkasanModal } from '../../lib/modal';
import {
  hargaItemRencana,
  itemDariKebutuhan,
  panenJelekKg,
  pilihHargaJual,
  ringkasRencana,
  type HargaItem,
  type ItemRencana,
  type SumberHargaJual,
} from '../../lib/rencana';
import { hitungRingkasan, type Ringkasan } from '../../lib/ringkasan';
import type { JadwalPin } from '../../lib/tata-letak-penggaris';
import { kebutuhanTempatM2, perkiraanPanen, saranVolumeTandon } from '../../lib/ukuran-metode';
import { useSuntingan } from './konteks-rencana';
import { angkaIsian, type PilihanHitung } from './pilihan';

export interface Rencana {
  memuat: boolean;
  komoditas: Komoditas | null;
  metode: MetodeTanam | null;
  semuaMetode: MetodeTanam[];
  /** Resep versi terbaru yang terlihat untuk komoditas dan cara tanam ini. */
  resepApi: ResepTanam | null;
  /** Semua resep komoditas ini (untuk status "Resep tersedia" per cara tanam). */
  resepKomoditas: ResepTanam[];
  sistem: SistemHidroponik | null;
  daftarSistem: SistemHidroponik[];
  konversi: KonversiLuas;
  luasM2: number | null;
  jumlahUnit: number | null;
  volumeTandon: number | null;
  saranTandon: number | null;
  butuhTempatM2: number | null;
  bantuanLuas: string | null;
  ukuranValid: Hasil<number> | null;
  perkiraanKg: number | null;
  items: ItemRencana[];
  harga: Map<string, HargaItem>;
  modal: Hasil<RingkasanModal> | null;
  bagiAlat: boolean;
  hargaJual: number | null;
  /** Asal harga jual (D-38): isian, kesepakatan, pesanan terdekat, atau contoh. */
  sumberHargaJual: SumberHargaJual;
  /** Nama pembeli bila harga jual dari pesanan (kesepakatan atau terdekat). */
  hargaJualDari: string | null;
  /** Jumlah laporan harga per input untuk keterangan "Rata-rata n laporan" (D-38). */
  laporanSekitar: Map<string, number>;
  /** Hasil saat panen jelek (persen dari resep, D-38). */
  panenJelek: { kg: number; persen: number; alasan: string | null } | null;
  ringkasan: Hasil<Ringkasan> | null;
  jadwal: JadwalPin[];
  ubahItem: (id: string, ubah: Partial<ItemRencana>) => void;
  tambahItem: (item: ItemRencana) => void;
  hapusItem: (id: string) => void;
  setBagiAlat: (v: boolean) => void;
  setHargaJual: (v: number | null) => void;
}

export function useRencana(p: PilihanHitung): Rencana {
  const [sunting, setSunting] = useSuntingan();
  const { akun } = useSesi();
  const hariIni = useHariIni();
  const komoditasQ = useKomoditas();
  const metodeQ = useMetode();
  const sistemQ = useSistemHidroponik();
  const konversiQ = useKonversiSatuan(akun?.pengguna.wilayah_id ?? null);
  const resepQ = useDaftarResep(p.komoditas ? { komoditas_id: p.komoditas } : {});
  const kelayakanQ = useKelayakanSubsidi(p.komoditas);
  const pesananQ = usePesananSekitar({});
  const kesepakatanQ = usePesananUntukPetani(p.pesanan);

  const komoditas = komoditasQ.data?.find((k) => k.id === p.komoditas) ?? null;
  const metode = metodeQ.data?.find((m) => m.id === p.metode) ?? null;
  const resepKomoditas = p.komoditas
    ? (resepQ.data ?? []).filter((r) => r.komoditas_id === p.komoditas)
    : [];
  const resepApi = resepKomoditas.find((r) => r.metode_id === p.metode) ?? null;
  const resep = resepApi ? resepKeDomain(resepApi) : null;
  const daftarSistem = sistemQ.data ?? [];
  const sistem = daftarSistem.find((s) => s.id === p.sistem) ?? null;
  const konversi: KonversiLuas = Object.fromEntries(
    (konversiQ.data ?? []).map((k) => [k.satuan, k.nilai_m2]),
  );

  const dasar = resepApi?.dasar_ukuran ?? metode?.dasar_ukuran ?? null;
  const nilai = angkaIsian(p.nilai);
  const m2 = dasar === 'luas' ? keM2(nilai, p.satuan, konversi) : null;
  const luasM2 = m2?.ok ? m2.nilai : null;
  const jumlahUnit = dasar && dasar !== 'luas' ? nilai : null;
  const saranTandon =
    dasar === 'lubang' && sistem && jumlahUnit
      ? saranVolumeTandon(jumlahUnit, sistem.liter_tandon_per_lubang)
      : null;
  const volumeTandon = dasar === 'lubang' ? (angkaIsian(p.tandon) ?? saranTandon) : null;
  const butuhTempatM2 =
    dasar === 'lubang' && sistem && jumlahUnit
      ? kebutuhanTempatM2(jumlahUnit, sistem.tempat_per_lubang_m2, null)
      : null;
  const ukuran: UkuranTanam = {
    luasM2,
    jumlahTanaman: jumlahUnit,
    volumeLarutanLiter: volumeTandon,
  };
  const ukuranValid = dasar ? validasiUkuran(dasar, ukuran) : null;
  const perkiraan =
    dasar && resep && ukuranValid?.ok
      ? perkiraanPanen(dasar, ukuranValid.nilai, resep.hasilPerSatuan)
      : null;

  const kebutuhan =
    resep && dasar && ukuranValid?.ok ? hitungKebutuhanResep(resep, dasar, ukuran) : null;
  const kunci = resep ? `${resep.id}@${resep.versi}|${luasM2}|${jumlahUnit}|${volumeTandon}` : null;
  const itemsAwal =
    kebutuhan?.ok && resep
      ? itemDariKebutuhan(kebutuhan.nilai, resep, {
          terdaftarKelompokTani: akun?.pengguna.terdaftar_kelompok_tani ?? false,
        })
      : [];
  const items = sunting.kunci === kunci && sunting.items ? sunting.items : itemsAwal;

  const inputIds = [...new Set(items.map((i) => i.inputId).filter((x): x is string => !!x))];
  const sekitarQ = useHargaSekitarBanyak(inputIds);
  const rata = new Map((sekitarQ.data ?? []).map((h) => [h.input_id, h.harga_per_satuan]));
  const laporanSekitar = new Map(
    (sekitarQ.data ?? []).map((h) => [h.input_id, h.jumlah_laporan] as const),
  );
  const kelayakan = (kelayakanQ.data ?? []).map(kelayakanKeDomain);
  const harga = new Map<string, HargaItem>();
  for (const it of items) {
    const h = hargaItemRencana(
      it,
      { komoditasId: p.komoditas ?? '', tanggal: hariIni, kelayakan },
      it.inputId ? (rata.get(it.inputId) ?? null) : null,
    );
    harga.set(it.id, h.ok ? h.nilai : { harga: null, sumber: 'belum_ada', layakSubsidi: false });
  }
  const modal = items.length ? ringkasRencana(items, harga, sunting.bagiAlat) : null;

  const pesananTerdekat = (pesananQ.data?.data ?? []).find((x) => x.komoditas_id === p.komoditas);
  const kesepakatan =
    kesepakatanQ.data && kesepakatanQ.data.komoditas_id === p.komoditas ? kesepakatanQ.data : null;
  const jual = pilihHargaJual({
    isian: sunting.hargaJual,
    kesepakatan: kesepakatan?.harga_per_kg ?? null,
    pesananTerdekat: pesananTerdekat?.harga_per_kg ?? null,
    contoh: komoditas?.harga_jual_contoh ?? null,
  });
  const hargaJualDari =
    jual.sumber === 'kesepakatan'
      ? (kesepakatan?.nama_pembeli ?? null)
      : jual.sumber === 'pesanan_terdekat'
        ? (pesananTerdekat?.nama_pembeli ?? null)
        : null;
  const kgJelek = perkiraan?.ok ? panenJelekKg(perkiraan.nilai, resep?.persenPanenJelek) : null;
  const ringkasan =
    modal?.ok && perkiraan?.ok && jual.harga !== null
      ? hitungRingkasan({
          totalModal: modal.nilai.totalModal,
          perkiraanPanenKg: perkiraan.nilai,
          hargaJual: jual.harga,
          ukuranM2: luasM2,
          panenJelekKg: kgJelek,
        })
      : null;

  const jadwalTugas = resep ? buatJadwal(resep.tugas, hariIni) : null;
  const jadwal =
    jadwalTugas?.ok && resep ? pinPenggaris(jadwalTugas.nilai, hariIni, resep.umurPanenHari) : [];

  function simpanItems(baru: (lama: ItemRencana[]) => ItemRencana[]) {
    setSunting((s) => ({
      ...s,
      kunci,
      items: baru(s.kunci === kunci && s.items ? s.items : itemsAwal),
    }));
  }

  return {
    memuat: komoditasQ.isPending || metodeQ.isPending || resepQ.isPending || sistemQ.isPending,
    komoditas,
    metode,
    semuaMetode: metodeQ.data ?? [],
    resepApi,
    resepKomoditas,
    sistem,
    daftarSistem,
    konversi,
    luasM2,
    jumlahUnit,
    volumeTandon,
    saranTandon,
    butuhTempatM2,
    bantuanLuas: dasar === 'luas' ? teksBantuanLuas(nilai, p.satuan, konversi, 'ru') : null,
    ukuranValid,
    perkiraanKg: perkiraan?.ok ? perkiraan.nilai : null,
    items,
    harga,
    modal,
    bagiAlat: sunting.bagiAlat,
    hargaJual: jual.harga,
    sumberHargaJual: jual.sumber,
    hargaJualDari,
    laporanSekitar,
    panenJelek:
      kgJelek !== null && resep?.persenPanenJelek
        ? { kg: kgJelek, persen: resep.persenPanenJelek, alasan: resep.alasanPanenJelek ?? null }
        : null,
    ringkasan,
    jadwal,
    ubahItem: (id, ubah) =>
      simpanItems((l) => l.map((it) => (it.id === id ? { ...it, ...ubah } : it))),
    tambahItem: (item) => simpanItems((l) => [...l, item]),
    hapusItem: (id) => simpanItems((l) => l.filter((it) => it.id !== id)),
    setBagiAlat: (v) => setSunting((s) => ({ ...s, bagiAlat: v })),
    setHargaJual: (v) => setSunting((s) => ({ ...s, hargaJual: v })),
  };
}
