/**
 * Logika murni kecocokan suhu tanaman dengan data cuaca (PRD Tambahan F-06).
 */

export type StatusKecocokanSuhu =
  | 'cocok'
  | 'agak_panas'
  | 'terlalu_panas'
  | 'agak_dingin'
  | 'terlalu_dingin'
  | 'belum_ada_data';

export interface RentangSuhuResep {
  suhu_ideal_min?: number | null;
  suhu_ideal_maks?: number | null;
  suhu_batas_min?: number | null;
  suhu_batas_maks?: number | null;
  saran_suhu_tinggi?: string | null;
  saran_suhu_rendah?: string | null;
}

export interface HasilKecocokanSuhu {
  status: StatusKecocokanSuhu;
  label: string;
  cocok: boolean;
  saran: string | null;
}

/**
 * Menentukan status kecocokan suhu lingkungan terhadap rentang toleransi resep tanaman.
 */
export function kecocokanSuhu(
  suhu: number | null,
  rentang: RentangSuhuResep | null,
): HasilKecocokanSuhu {
  if (
    suhu === null ||
    rentang === null ||
    rentang.suhu_ideal_min === null ||
    rentang.suhu_ideal_min === undefined ||
    rentang.suhu_ideal_maks === null ||
    rentang.suhu_ideal_maks === undefined
  ) {
    return {
      status: 'belum_ada_data',
      label: 'Belum ada data suhu',
      cocok: true,
      saran: null,
    };
  }

  const {
    suhu_ideal_min: idealMin,
    suhu_ideal_maks: idealMaks,
    suhu_batas_min: batasMin = null,
    suhu_batas_maks: batasMaks = null,
    saran_suhu_tinggi: saranTinggi = null,
    saran_suhu_rendah: saranRendah = null,
  } = rentang;

  if (batasMin !== null && batasMin !== undefined && suhu < batasMin) {
    return {
      status: 'terlalu_dingin',
      label: 'Terlalu dingin',
      cocok: false,
      saran: saranRendah,
    };
  }

  if (suhu < idealMin) {
    return {
      status: 'agak_dingin',
      label: 'Agak dingin',
      cocok: false,
      saran: saranRendah,
    };
  }

  if (batasMaks !== null && batasMaks !== undefined && suhu > batasMaks) {
    return {
      status: 'terlalu_panas',
      label: 'Terlalu panas',
      cocok: false,
      saran: saranTinggi,
    };
  }

  if (suhu > idealMaks) {
    return {
      status: 'agak_panas',
      label: 'Agak panas',
      cocok: false,
      saran: saranTinggi,
    };
  }

  return {
    status: 'cocok',
    label: 'Cocok',
    cocok: true,
    saran: null,
  };
}
