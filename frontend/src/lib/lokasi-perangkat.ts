/**
 * Deteksi lokasi perangkat dengan cadangan jaringan (Wi-Fi / ISP) untuk laptop atau perangkat tanpa GPS.
 *
 * Di laptop, peramban sering tidak memiliki sinyal GPS fisik atau izin lokasi ditolak/tidak aktif.
 * Modul ini mencoba sinyal GPS peramban terlebih dahulu, lalu otomatis beralih ke deteksi berbasis
 * jaringan IP publik / ISP secara mulus (fallback).
 */

import { bulatkanLokasi } from './jarak';

export interface InfoLokasiPerangkat {
  lintang: number;
  bujur: number;
  sumber: 'gps' | 'jaringan' | 'bawaan';
  namaTempat?: string;
  penyedia?: string;
  keterangan: string;
}

/** Koordinat cadangan default (Kecamatan Delanggu, Kabupaten Klaten, Jawa Tengah). */
export const KOORDINAT_BAWAAN = {
  lintang: -7.628,
  bujur: 110.702,
  namaTempat: 'Delanggu, Klaten',
  keterangan: 'Lokasi desa terdaftar (Delanggu, Klaten)',
};

interface ResponFreeIpApi {
  latitude?: number;
  longitude?: number;
  cityName?: string;
  regionName?: string;
}

interface ResponIpApiCo {
  latitude?: number;
  longitude?: number;
  city?: string;
  region?: string;
  org?: string;
}

/**
 * Mengambil perkiraan koordinat berdasarkan alamat IP jaringan peramban (Wi-Fi / ISP).
 * Mencoba freeipapi.com lalu ipapi.co bila yang pertama gagal.
 */
export async function ambilLokasiJaringan(
  fetcher: typeof fetch = fetch,
): Promise<InfoLokasiPerangkat> {
  // Percobaan 1: freeipapi.com
  try {
    const respon = await fetcher('https://freeipapi.com/api/json', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (respon.ok) {
      const data = (await respon.json()) as ResponFreeIpApi;
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const tempat = [data.cityName, data.regionName].filter(Boolean).join(', ');
        return {
          lintang: bulatkanLokasi(data.latitude),
          bujur: bulatkanLokasi(data.longitude),
          sumber: 'jaringan',
          namaTempat: tempat || undefined,
          keterangan: tempat ? `Terdeteksi dari Wi-Fi/ISP (${tempat})` : 'Terdeteksi dari jaringan Wi-Fi/ISP',
        };
      }
    }
  } catch {
    // Lanjut ke percobaan kedua bila percobaan pertama gagal atau timeout
  }

  // Percobaan 2: ipapi.co
  try {
    const respon = await fetcher('https://ipapi.co/json/', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (respon.ok) {
      const data = (await respon.json()) as ResponIpApiCo;
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const tempat = [data.city, data.region].filter(Boolean).join(', ');
        return {
          lintang: bulatkanLokasi(data.latitude),
          bujur: bulatkanLokasi(data.longitude),
          sumber: 'jaringan',
          namaTempat: tempat || undefined,
          penyedia: data.org,
          keterangan: tempat ? `Terdeteksi dari Wi-Fi/ISP (${tempat})` : 'Terdeteksi dari jaringan Wi-Fi/ISP',
        };
      }
    }
  } catch {
    // Offline atau kedua layanan tidak dapat diakses
  }

  return {
    lintang: KOORDINAT_BAWAAN.lintang,
    bujur: KOORDINAT_BAWAAN.bujur,
    sumber: 'bawaan',
    namaTempat: KOORDINAT_BAWAAN.namaTempat,
    keterangan: KOORDINAT_BAWAAN.keterangan,
  };
}

export interface OpsiAmbilLokasi {
  /** Prioritas sumber deteksi lokasi ('otomatis' mencoba GPS lalu jaringan; 'jaringan' langsung IP/Wi-Fi). */
  mode?: 'otomatis' | 'jaringan' | 'gps';
  /** Batas waktu pembacaan GPS sebelum beralih ke jaringan (milidetik). */
  batasWaktuGpsMs?: number;
  /** Injeksi pemanggil HTTP untuk pengujian. */
  fetcher?: typeof fetch;
}

/**
 * Mengambil lokasi perangkat saat ini.
 * Jika di laptop tanpa GPS atau izin ditolak, otomatis mendeteksi via jaringan Wi-Fi/ISP.
 */
export async function ambilLokasiPerangkat(
  opsi: OpsiAmbilLokasi = {},
): Promise<InfoLokasiPerangkat> {
  const mode = opsi.mode ?? 'otomatis';
  const fetcher = opsi.fetcher ?? fetch;

  if (mode === 'jaringan') {
    return ambilLokasiJaringan(fetcher);
  }

  // Coba GPS browser jika didukung
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: opsi.batasWaktuGpsMs ?? 4000,
          enableHighAccuracy: false,
        });
      });

      return {
        lintang: bulatkanLokasi(pos.coords.latitude),
        bujur: bulatkanLokasi(pos.coords.longitude),
        sumber: 'gps',
        keterangan: 'Terdeteksi dari sinyal GPS perangkat',
      };
    } catch {
      // Jika mode hanya 'gps', lemparkan galat atau kembalikan bawaan
      if (mode === 'gps') {
        throw new Error('Gagal membaca sinyal GPS');
      }
    }
  }

  // Fallback: deteksi lewat jaringan Wi-Fi / ISP
  return ambilLokasiJaringan(fetcher);
}
