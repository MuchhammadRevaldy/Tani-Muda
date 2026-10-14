/**
 * Saran memperbanyak untung di lahan kecil (PRD Tambahan F-01a, D-64).
 * Fungsi murni matematis tanpa AI yang menghitung langkah optimasi saat rencana berpotensi rugi atau untung tipis.
 */
import { bulatkanRupiah } from './format';
import type { Ringkasan } from './ringkasan';

export interface ItemBiayaInput {
  id: string;
  nama: string;
  grup: string;
  subtotal: number;
  opsional?: boolean;
}

export interface PesananTersediaRingkas {
  id: string;
  namaPembeli: string;
  hargaPerKg: number;
  jumlahKg: number;
}

export interface KonteksSaranUntung {
  ambangUntungTipis?: number;
  umurPanenHari?: number;
  bisaVertikultur?: boolean;
  faktorVertikultur?: number;
  pesananSekitar?: PesananTersediaRingkas[];
  itemBiaya?: ItemBiayaInput[];
}

export interface SaranUntung {
  id: string;
  judul: string;
  deskripsi: string;
  dampakRupiah: number;
  jenis: 'tenaga' | 'pesanan' | 'opsional' | 'siklus_ulang' | 'vertikultur';
}

export function saranUntung(
  ringkasan: Ringkasan,
  konteks: KonteksSaranUntung = {},
): SaranUntung[] {
  const ambang = konteks.ambangUntungTipis ?? 50_000;
  const butuhSaran = ringkasan.rugi || ringkasan.untung < ambang;
  if (!butuhSaran) {
    return [];
  }

  const hasil: SaranUntung[] = [];

  // 1. Kerjakan sendiri biaya tenaga kerja
  const itemTenaga = konteks.itemBiaya?.find(
    (it) => it.grup.toLowerCase() === 'tenaga' && it.subtotal > 0,
  );
  if (itemTenaga) {
    hasil.push({
      id: 'tenaga-sendiri',
      judul: 'Kerjakan sendiri biaya tenaga kerja',
      deskripsi: `Lakukan perawatan sendiri di lahan sempit untuk menghemat biaya ${itemTenaga.nama}.`,
      dampakRupiah: itemTenaga.subtotal,
      jenis: 'tenaga',
    });
  }

  // 2. Jual lewat pesanan terdekat yang harganya lebih tinggi
  if (konteks.pesananSekitar && konteks.pesananSekitar.length > 0) {
    const pesananTerbaik = [...konteks.pesananSekitar]
      .filter((p) => p.hargaPerKg > ringkasan.hargaJualDipakai)
      .sort((a, b) => b.hargaPerKg - a.hargaPerKg)[0];

    if (pesananTerbaik) {
      const kenaikanHarga = pesananTerbaik.hargaPerKg - ringkasan.hargaJualDipakai;
      const dampak = bulatkanRupiah(ringkasan.panenKg * kenaikanHarga);
      if (dampak > 0) {
        hasil.push({
          id: 'pesanan-terdekat',
          judul: `Jual ke ${pesananTerbaik.namaPembeli}`,
          deskripsi: `Ambil pesanan dengan harga lebih tinggi untuk menaikkan harga jual.`,
          dampakRupiah: dampak,
          jenis: 'pesanan',
        });
      }
    }
  }

  // 3. Lepas item opsional yang masih dihitung
  const itemOpsional = konteks.itemBiaya?.filter((it) => it.opsional && it.subtotal > 0);
  if (itemOpsional && itemOpsional.length > 0) {
    const totalOpsional = itemOpsional.reduce((acc, it) => acc + it.subtotal, 0);
    const namaItem = itemOpsional.map((i) => i.nama).join(', ');
    hasil.push({
      id: 'lepas-opsional',
      judul: 'Lepas item input opsional',
      deskripsi: `Tunda pembelian atau buat sendiri (${namaItem}) untuk menurunkan modal awal.`,
      dampakRupiah: totalOpsional,
      jenis: 'opsional',
    });
  }

  // 4. Tanam berulang umur pendek dalam 3 bulan
  const umur = konteks.umurPanenHari ?? 28;
  if (umur > 0 && umur <= 35) {
    const kaliTanam = Math.floor(90 / (umur + 4));
    if (kaliTanam >= 2) {
      const estimasiUntung3Bulan = Math.max(0, ringkasan.untung) * kaliTanam;
      hasil.push({
        id: 'tanam-berulang',
        judul: `Tanam berulang ${kaliTanam} kali dalam 3 bulan`,
        deskripsi: `Komoditas umur genjah dapat dipanen ${kaliTanam} kali dalam 90 hari.`,
        dampakRupiah: estimasiUntung3Bulan,
        jenis: 'siklus_ulang',
      });
    }
  }

  // 5. Tanam bertingkat (vertikultur)
  if (konteks.bisaVertikultur) {
    const faktor = konteks.faktorVertikultur ?? 2;
    const potensiUntungBaru = bulatkanRupiah(ringkasan.pendapatan * (faktor - 1));
    hasil.push({
      id: 'vertikultur',
      judul: 'Tanam bertingkat (vertikultur)',
      deskripsi: `Gunakan rak vertikal untuk melipatgandakan populasi di lahan terbatas.`,
      dampakRupiah: potensiUntungBaru,
      jenis: 'vertikultur',
    });
  }

  // Urutkan dari dampak rupiah terbesar, ambil paling banyak 3
  return hasil.sort((a, b) => b.dampakRupiah - a.dampakRupiah).slice(0, 3);
}
