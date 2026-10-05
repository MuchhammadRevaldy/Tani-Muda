/**
 * Pilihan alur Hitung disimpan di alamat (`?komoditas=sawi&metode=bedengan&nilai=100…`), sehingga
 * tiap langkah bisa dibuka langsung, dimuat ulang, dan dibagikan tanpa kehilangan isian.
 */
import { useSearchParams } from 'react-router-dom';
import type { JenisLahan, Komoditas, MetodeTanam } from '../../api/tipe';
import type { SatuanLuas } from '../../lib/konversi-satuan';
import { parseAngka } from '../../lib/format';

/** Satuan yang bisa dipilih (ru dan bata bernilai sama di wilayah pilot; desain: "ru/bata"). */
export type SatuanPilihan = Extract<SatuanLuas, 'm2' | 'ru' | 'hektare'>;

export interface PilihanHitung {
  komoditas: string | null;
  metode: string | null;
  satuan: SatuanPilihan;
  /** Teks isian ukuran utama (luas dalam `satuan`, atau jumlah lubang/polybag). */
  nilai: string;
  sistem: string | null;
  tandon: string;
  vertikultur: boolean;
  /** Lahan dari halaman Lahan saya atau pesanan (gelombang 4). */
  lahan: string | null;
}

const SATUAN: SatuanPilihan[] = ['m2', 'ru', 'hektare'];

export function bacaPilihan(p: URLSearchParams): PilihanHitung {
  const satuan = p.get('satuan') as SatuanPilihan | null;
  return {
    komoditas: p.get('komoditas'),
    metode: p.get('metode'),
    satuan: satuan && SATUAN.includes(satuan) ? satuan : 'm2',
    nilai: p.get('nilai') ?? '',
    sistem: p.get('sistem'),
    tandon: p.get('tandon') ?? '',
    vertikultur: p.get('vertikultur') === '1',
    lahan: p.get('lahan'),
  };
}

export function tulisPilihan(x: PilihanHitung): URLSearchParams {
  const p = new URLSearchParams();
  if (x.komoditas) p.set('komoditas', x.komoditas);
  if (x.metode) p.set('metode', x.metode);
  if (x.satuan !== 'm2') p.set('satuan', x.satuan);
  if (x.nilai) p.set('nilai', x.nilai);
  if (x.sistem) p.set('sistem', x.sistem);
  if (x.tandon) p.set('tandon', x.tandon);
  if (x.vertikultur) p.set('vertikultur', '1');
  if (x.lahan) p.set('lahan', x.lahan);
  return p;
}

/** Alamat langkah dengan pilihan yang sama. */
export const alamatLangkah = (
  langkah: 'tanaman' | 'metode' | 'modal' | 'simpan',
  x: PilihanHitung,
) => {
  const q = tulisPilihan(x).toString();
  return `/hitung/${langkah}${q ? `?${q}` : ''}`;
};

export function usePilihanHitung(): [PilihanHitung, (ubah: Partial<PilihanHitung>) => void] {
  const [param, setParam] = useSearchParams();
  const pilihan = bacaPilihan(param);
  return [pilihan, (ubah) => setParam(tulisPilihan({ ...pilihan, ...ubah }), { replace: true })];
}

/** Angka dari isian ("1.000", "12,5"); null bila kosong atau bukan angka. */
export const angkaIsian = (teks: string): number | null => parseAngka(teks);

/** Jenis lahan tiap cara tanam: cara tanam ditawarkan bila komoditas cocok dengan lahannya. */
const LAHAN_METODE: Record<string, JenisLahan> = {
  bedengan: 'kebun',
  polybag: 'pekarangan',
  hidroponik: 'hidroponik',
  sawah: 'sawah',
};

export function metodeUntuk(komoditas: Komoditas, metode: MetodeTanam[]): MetodeTanam[] {
  return metode.filter((m) => {
    const j = LAHAN_METODE[m.id];
    return !j || komoditas.jenis_lahan_cocok.includes(j);
  });
}

/** Jenis lahan yang cocok untuk cara tanam (untuk memilih lahan saat simpan rencana). */
export const lahanUntukMetode = (metodeId: string): JenisLahan[] =>
  metodeId === 'hidroponik'
    ? ['hidroponik']
    : (['kebun', 'pekarangan', 'sawah'] as JenisLahan[]).filter(
        (j) => metodeId !== 'sawah' || j === 'sawah',
      );
