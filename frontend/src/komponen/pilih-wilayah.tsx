import { useState, type ReactNode } from 'react';
import { useKabupaten, useKecamatan, useDesa } from '../api/kueri';
import type { Wilayah } from '../api/tipe';
import { PilihanDropdown } from './pilihan-dropdown';

export interface PilihWilayahProps {
  id?: string;
  nilai: string | null;
  onChange: (wilayahId: string, desa?: Wilayah | null) => void;
  galat?: string;
  bantuan?: ReactNode;
  disabled?: boolean;
  className?: string;
  labelKabupaten?: string;
  labelKecamatan?: string;
  labelDesa?: string;
}

/**
 * Pemilih wilayah bertingkat 3 langkah (AG-41, D-67):
 * Kabupaten/Kota → Kecamatan → Desa/Kelurahan.
 * Menggunakan PilihanDropdown (AG-39) sehingga di HP otomatis tampil sebagai lembar bawah (bottom sheet).
 * Kecamatan hanya aktif jika kabupaten dipilih.
 * Desa hanya aktif jika kecamatan dipilih.
 * Mengganti kabupaten akan mengosongkan kecamatan & desa; mengganti kecamatan mengosongkan desa.
 */
export function PilihWilayah({
  id = 'wilayah',
  nilai,
  onChange,
  galat,
  bantuan,
  disabled = false,
  className = '',
  labelKabupaten = 'Kabupaten / Kota',
  labelKecamatan = 'Kecamatan',
  labelDesa = 'Desa / Kelurahan',
}: PilihWilayahProps) {
  const [prevNilai, setPrevNilai] = useState<string | null>(nilai);
  const [kabupatenId, setKabupatenId] = useState<string>(() => {
    if (!nilai) return '';
    const parts = nilai.split('.');
    return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : '';
  });

  const [kecamatanId, setKecamatanId] = useState<string>(() => {
    if (!nilai) return '';
    const parts = nilai.split('.');
    return parts.length >= 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : '';
  });

  const [desaId, setDesaId] = useState<string>(nilai ?? '');

  if (nilai !== prevNilai) {
    setPrevNilai(nilai);
    if (nilai) {
      const parts = nilai.split('.');
      setKabupatenId(parts.length >= 2 ? `${parts[0]}.${parts[1]}` : '');
      setKecamatanId(parts.length >= 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : '');
      setDesaId(nilai);
    } else {
      setDesaId('');
    }
  }

  // Query data bertingkat
  const { data: daftarKabupaten = [], isLoading: memuatKabupaten } = useKabupaten();
  const { data: daftarKecamatan = [], isLoading: memuatKecamatan } = useKecamatan(
    kabupatenId || null,
  );
  const { data: daftarDesa = [], isLoading: memuatDesa } = useDesa(kecamatanId || null);

  const handleKabupatenChange = (val: string) => {
    setKabupatenId(val);
    setKecamatanId('');
    setDesaId('');
    onChange('', null);
  };

  const handleKecamatanChange = (val: string) => {
    setKecamatanId(val);
    setDesaId('');
    onChange('', null);
  };

  const handleDesaChange = (val: string) => {
    setDesaId(val);
    const terpilih = daftarDesa.find((d) => d.id === val) ?? null;
    onChange(val, terpilih);
  };

  const opsiKabupaten = daftarKabupaten.map((k) => ({
    nilai: k.id,
    label: k.nama,
  }));

  const opsiKecamatan = daftarKecamatan.map((k) => ({
    nilai: k.id,
    label: k.nama,
  }));

  const opsiDesa = daftarDesa.map((d) => ({
    nilai: d.id,
    label: d.desa,
    keterangan: d.tersedia_pilot ? undefined : 'Belum tersedia titik',
  }));

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* 1. Kabupaten / Kota */}
      <PilihanDropdown
        id={`${id}-kabupaten`}
        label={labelKabupaten}
        nilai={kabupatenId}
        onChange={handleKabupatenChange}
        pilihan={opsiKabupaten}
        placeholder={memuatKabupaten ? 'Memuat kabupaten...' : 'Pilih Kabupaten / Kota...'}
        disabled={disabled || memuatKabupaten}
        denganPencarian={true}
      />

      {/* 2. Kecamatan */}
      <PilihanDropdown
        id={`${id}-kecamatan`}
        label={labelKecamatan}
        nilai={kecamatanId}
        onChange={handleKecamatanChange}
        pilihan={opsiKecamatan}
        placeholder={
          !kabupatenId
            ? 'Pilih kabupaten terlebih dahulu'
            : memuatKecamatan
              ? 'Memuat kecamatan...'
              : 'Pilih Kecamatan...'
        }
        disabled={disabled || !kabupatenId || memuatKecamatan}
        denganPencarian={true}
      />

      {/* 3. Desa / Kelurahan */}
      <PilihanDropdown
        id={`${id}-desa`}
        label={labelDesa}
        nilai={desaId}
        onChange={handleDesaChange}
        pilihan={opsiDesa}
        placeholder={
          !kecamatanId
            ? 'Pilih kecamatan terlebih dahulu'
            : memuatDesa
              ? 'Memuat desa...'
              : 'Pilih Desa / Kelurahan...'
        }
        disabled={disabled || !kecamatanId || memuatDesa}
        denganPencarian={true}
        galat={galat}
        bantuan={bantuan}
      />
    </div>
  );
}
