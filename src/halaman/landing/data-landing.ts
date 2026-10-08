/**
 * Data halaman depan (T4.32, D-44): contoh publik (komoditas, cara tanam, resep) dan konfigurasi,
 * diolah fungsi src/lib menjadi angka contoh dan pin penggaris (D-08). Bila resep contoh tidak
 * terlihat publik (pengaturan resep contoh mati), bagian berangka disembunyikan, teks tetap tampil.
 */
import { useContohPublik, useKonfigurasi } from '../../api/kueri';
import { resepKeDomain } from '../../api/peta';
import { useHariIni } from '../../api/sesi';
import type { Komoditas, Konfigurasi, ResepTanam as ResepApi } from '../../api/tipe';
import { angkaContoh, CONTOH_LANDING, pinContoh, type AngkaContoh } from '../../lib/contoh-landing';
import type { JadwalPin } from '../../lib/tata-letak-penggaris';
import type { ResepTanam } from '../../tipe';

export interface ContohSiklus {
  komoditas: Komoditas;
  resep: ResepTanam;
  hariKe: number;
  pin: JadwalPin[];
  /** Langkah pertama tugas besok (kartu "Besok: …"). */
  besok: { judul: string; isi: string | null } | null;
}

export interface BarisHitung {
  komoditas: Komoditas;
  luasM2: number;
  angka: AngkaContoh;
}

export interface DataLanding {
  konfigurasi: Konfigurasi | null;
  /** Nama komoditas berpanduan dan yang menyusul, untuk kalimat di bawah tombol hero. */
  siap: string[];
  menyusul: string[];
  petani: (ContohSiklus & { angka: AngkaContoh | null; luasM2: number }) | null;
  hitung: BarisHitung[];
  pembeli: ContohSiklus | null;
  namaKomoditas: (id: string) => string;
}

export function useDataLanding(): DataLanding {
  const contohQ = useContohPublik();
  const konfigurasiQ = useKonfigurasi();
  const hariIni = useHariIni();
  const c = contohQ.data;
  const komoditas = c?.komoditas ?? [];
  const cariKomoditas = (id: string) => komoditas.find((k) => k.id === id) ?? null;
  const cariResep = (komoditasId: string, metodeId: string): ResepApi | null =>
    c?.resep.find((r) => r.komoditas_id === komoditasId && r.metode_id === metodeId) ?? null;

  function siklus(komoditasId: string, metodeId: string, hariKe: number): ContohSiklus | null {
    const k = cariKomoditas(komoditasId);
    const api = cariResep(komoditasId, metodeId);
    if (!k || !api) return null;
    const resep = resepKeDomain(api);
    const pin = pinContoh(resep, hariKe, hariIni);
    const pinBesok = pin.find((p) => p.status === 'besok');
    const tugasBesok = pinBesok ? api.tugas.find((t) => t.judul === pinBesok.label) : undefined;
    return {
      komoditas: k,
      resep,
      hariKe,
      pin,
      besok: pinBesok
        ? { judul: pinBesok.label, isi: tugasBesok?.cara_mengerjakan?.[0] ?? null }
        : null,
    };
  }

  function angka(komoditasId: string, metodeId: string, luasM2: number): AngkaContoh | null {
    const k = cariKomoditas(komoditasId);
    const api = cariResep(komoditasId, metodeId);
    if (!k?.harga_jual_contoh || !api) return null;
    const h = angkaContoh(resepKeDomain(api), luasM2, k.harga_jual_contoh, hariIni);
    return h.ok ? h.nilai : null;
  }

  const p = CONTOH_LANDING.petani;
  const s = CONTOH_LANDING.sawah;
  const siklusPetani = siklus(p.komoditas, p.metode, p.hariKe);
  const hitung: BarisHitung[] = [];
  for (const x of [p, s]) {
    const k = cariKomoditas(x.komoditas);
    const a = angka(x.komoditas, x.metode, x.luasM2);
    if (k && a) hitung.push({ komoditas: k, luasM2: x.luasM2, angka: a });
  }
  const b = CONTOH_LANDING.pembeli;

  return {
    konfigurasi: konfigurasiQ.data ?? null,
    siap: komoditas.filter((k) => k.status_resep === 'tersedia').map((k) => k.nama),
    menyusul: komoditas
      .filter((k) => k.status_resep === 'segera_hadir')
      .slice(0, 3)
      .map((k) => k.nama),
    petani: siklusPetani
      ? {
          ...siklusPetani,
          luasM2: p.luasM2,
          angka: angka(p.komoditas, p.metode, p.luasM2),
        }
      : null,
    hitung,
    pembeli: siklus(b.komoditas, b.metode, b.hariKe),
    namaKomoditas: (id) => cariKomoditas(id)?.nama ?? id,
  };
}
