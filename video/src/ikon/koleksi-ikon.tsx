/**
 * Ikon yang digambar khusus untuk video karena tidak ada padanannya di aplikasi.
 * Ikon yang konsepnya sudah ada di aplikasi (koin, pin, keranjang, kamera, chat,
 * tunas, belajar, gembok, centang, pH, peta) memakai IkonAplikasi [AG-44].
 */
import React from 'react';
import type { IkonProps } from './tipe';
import { TEBAL_GARIS_64, WARNA_IKON } from './tipe';
import { buatPath } from './util-path';

interface PembungkusSvgProps extends IkonProps {
  children: React.ReactNode;
}

const PembungkusSvg: React.FC<PembungkusSvgProps> = ({
  size = 64,
  style,
  className,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    className={className}
  >
    {children}
  </svg>
);

// 3. Kalkulator
export const IkonKalkulator: React.FC<IkonProps> = ({
  warnaUtama = WARNA_IKON.daunTua,
  warnaAksen = WARNA_IKON.daunTerang,
  strokeWidth = TEBAL_GARIS_64,
  progress = 1,
  ...props
}) => (
  <PembungkusSvg {...props}>
    {buatPath({ d: 'M 16 8 H 48 C 50.2 8 52 9.8 52 12 V 52 C 52 54.2 50.2 56 48 56 H 16 C 13.8 56 12 54.2 12 52 V 12 C 12 9.8 13.8 8 16 8 Z', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 18 16 H 46 V 24 H 18 Z', warna: warnaAksen, tebal: strokeWidth, progres: progress, isi: `${warnaAksen}22` })}
    {buatPath({ d: 'M 20 32 H 24', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 30 32 H 34', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 40 32 H 44', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 20 40 H 24', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 30 40 H 34', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 40 40 H 44', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 20 48 H 24', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 30 48 H 44', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
  </PembungkusSvg>
);

// 4. Gembor Penyiram
export const IkonGembor: React.FC<IkonProps> = ({
  warnaUtama = WARNA_IKON.daunTua,
  warnaAksen = WARNA_IKON.daunTerang,
  strokeWidth = TEBAL_GARIS_64,
  progress = 1,
  ...props
}) => (
  <PembungkusSvg {...props}>
    {buatPath({ d: 'M 16 26 H 38 C 42 26 44 30 42 36 L 40 52 C 40 55 37 56 34 56 H 20 C 17 56 14 55 14 52 L 12 36 C 10 30 12 26 16 26 Z', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 38 34 L 52 20', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 49 15 L 57 23', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 56 14 L 60 12', warna: warnaAksen, tebal: strokeWidth - 1, progres: progress })}
    {buatPath({ d: 'M 59 19 L 63 19', warna: warnaAksen, tebal: strokeWidth - 1, progres: progress })}
    {buatPath({ d: 'M 57 25 L 61 27', warna: warnaAksen, tebal: strokeWidth - 1, progres: progress })}
    {buatPath({ d: 'M 22 26 V 16 C 22 13 25 10 29 10 C 33 10 36 13 36 16 V 26', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 12 32 C 4 32 4 48 14 50', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
  </PembungkusSvg>
);

// 6. Timbangan
export const IkonTimbangan: React.FC<IkonProps> = ({
  warnaUtama = WARNA_IKON.daunTua,
  warnaAksen = WARNA_IKON.daunTerang,
  strokeWidth = TEBAL_GARIS_64,
  progress = 1,
  ...props
}) => (
  <PembungkusSvg {...props}>
    {buatPath({ d: 'M 32 10 V 54', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 20 54 H 44', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 14 18 H 50', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 14 18 L 8 36', warna: warnaAksen, tebal: strokeWidth - 1, progres: progress })}
    {buatPath({ d: 'M 14 18 L 22 36', warna: warnaAksen, tebal: strokeWidth - 1, progres: progress })}
    {buatPath({ d: 'M 6 36 C 6 44 24 44 24 36 Z', warna: warnaUtama, tebal: strokeWidth, progres: progress, isi: `${warnaAksen}22` })}
    {buatPath({ d: 'M 50 18 L 42 36', warna: warnaAksen, tebal: strokeWidth - 1, progres: progress })}
    {buatPath({ d: 'M 50 18 L 58 36', warna: warnaAksen, tebal: strokeWidth - 1, progres: progress })}
    {buatPath({ d: 'M 40 36 C 40 44 58 44 58 36 Z', warna: warnaUtama, tebal: strokeWidth, progres: progress, isi: `${warnaAksen}22` })}
  </PembungkusSvg>
);

// 7. Grafik Harga Jatuh
export const IkonGrafikTurun: React.FC<IkonProps> = ({
  warnaUtama = WARNA_IKON.daunTua,
  warnaAksen = WARNA_IKON.tomat,
  strokeWidth = TEBAL_GARIS_64,
  progress = 1,
  ...props
}) => (
  <PembungkusSvg {...props}>
    {buatPath({ d: 'M 10 10 V 54 H 56', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 14 18 L 26 22 L 36 34 L 52 50', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 42 50 H 52 V 40', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 14 18 A 2 2 0 1 0 14.1 18', warna: WARNA_IKON.daunTerang, tebal: strokeWidth + 2, progres: progress })}
    {buatPath({ d: 'M 26 22 A 2 2 0 1 0 26.1 22', warna: WARNA_IKON.daunTerang, tebal: strokeWidth + 2, progres: progress })}
    {buatPath({ d: 'M 36 34 A 2 2 0 1 0 36.1 34', warna: WARNA_IKON.daunTerang, tebal: strokeWidth + 2, progres: progress })}
  </PembungkusSvg>
);

// 8. Daun Berlubang dengan Ulat
export const IkonDaunUlat: React.FC<IkonProps> = ({
  warnaUtama = WARNA_IKON.daunTua,
  warnaAksen = WARNA_IKON.daunTerang,
  strokeWidth = TEBAL_GARIS_64,
  progress = 1,
  ...props
}) => (
  <PembungkusSvg {...props}>
    {buatPath({ d: 'M 12 52 C 10 38 18 18 38 10 C 54 22 52 46 36 50 C 26 52 18 52 12 52 Z', warna: warnaUtama, tebal: strokeWidth, progres: progress, isi: `${warnaUtama}15` })}
    {buatPath({ d: 'M 14 50 Q 28 36 40 18', warna: warnaAksen, tebal: strokeWidth - 1, progres: progress })}
    {buatPath({ d: 'M 34 26 A 4 4 0 0 1 42 30', warna: WARNA_IKON.latarKrem, tebal: strokeWidth + 1, progres: progress })}
    {buatPath({ d: 'M 22 36 A 4 4 0 0 1 28 40', warna: WARNA_IKON.latarKrem, tebal: strokeWidth + 1, progres: progress })}
    {buatPath({ d: 'M 38 20 C 42 14 46 22 50 16 C 52 14 56 16 56 18', warna: warnaAksen, tebal: strokeWidth + 1, progres: progress })}
  </PembungkusSvg>
);

// 9. Rantai
export const IkonRantai: React.FC<IkonProps> = ({
  warnaUtama = WARNA_IKON.daunTua,
  warnaAksen = WARNA_IKON.tanah,
  strokeWidth = TEBAL_GARIS_64,
  progress = 1,
  ...props
}) => (
  <PembungkusSvg {...props}>
    {buatPath({ d: 'M 20 28 L 14 22 C 9 17 9 9 14 4 C 19 -1 27 -1 32 4 L 38 10 C 43 15 43 23 38 28', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 26 26 L 38 38', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 26 36 L 32 42 C 37 47 45 47 50 42 C 55 37 55 29 50 24 L 44 18', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
  </PembungkusSvg>
);

// 10. Truk Panen
export const IkonTruk: React.FC<IkonProps> = ({
  warnaUtama = WARNA_IKON.daunTua,
  warnaAksen = WARNA_IKON.daunTerang,
  strokeWidth = TEBAL_GARIS_64,
  progress = 1,
  ...props
}) => (
  <PembungkusSvg {...props}>
    {buatPath({ d: 'M 8 20 H 36 V 46 H 8 Z', warna: warnaUtama, tebal: strokeWidth, progres: progress, isi: `${warnaUtama}15` })}
    {buatPath({ d: 'M 36 26 H 46 L 54 36 V 46 H 36', warna: warnaUtama, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 40 30 H 45 L 50 36 H 40 Z', warna: warnaAksen, tebal: strokeWidth - 1, progres: progress, isi: `${warnaAksen}22` })}
    {buatPath({ d: 'M 16 46 A 5 5 0 1 0 24 46', warna: WARNA_IKON.tanah, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 42 46 A 5 5 0 1 0 50 46', warna: WARNA_IKON.tanah, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 12 20 Q 22 12 32 20', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
  </PembungkusSvg>
);

// 13. Cuaca (Awan, Hujan, Matahari)
export const IkonCuaca: React.FC<IkonProps> = ({
  warnaUtama = WARNA_IKON.daunTua,
  warnaAksen = WARNA_IKON.emas,
  strokeWidth = TEBAL_GARIS_64,
  progress = 1,
  ...props
}) => (
  <PembungkusSvg {...props}>
    {buatPath({ d: 'M 22 22 A 11 11 0 0 1 38 14', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 20 8 V 4', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 12 14 L 9 11', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 30 9 L 33 6', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 20 42 H 48 C 53 42 56 38 56 33 C 56 28 52 25 47 25 C 46 19 40 16 34 18 C 29 19 26 23 26 27 C 22 27 18 31 18 35 C 18 39 20 42 20 42 Z', warna: warnaUtama, tebal: strokeWidth, progres: progress, isi: `${warnaUtama}15` })}
    {buatPath({ d: 'M 24 48 L 20 56', warna: WARNA_IKON.daunTerang, tebal: strokeWidth - 1, progres: progress })}
    {buatPath({ d: 'M 34 48 L 30 56', warna: WARNA_IKON.daunTerang, tebal: strokeWidth - 1, progres: progress })}
    {buatPath({ d: 'M 44 48 L 40 56', warna: WARNA_IKON.daunTerang, tebal: strokeWidth - 1, progres: progress })}
  </PembungkusSvg>
);

// 14. Kotak Stok
export const IkonKotakStok: React.FC<IkonProps> = ({
  warnaUtama = WARNA_IKON.daunTua,
  warnaAksen = WARNA_IKON.daunTerang,
  strokeWidth = TEBAL_GARIS_64,
  progress = 1,
  ...props
}) => (
  <PembungkusSvg {...props}>
    {buatPath({ d: 'M 32 8 L 54 19 L 32 30 L 10 19 Z', warna: warnaUtama, tebal: strokeWidth, progres: progress, isi: `${warnaUtama}20` })}
    {buatPath({ d: 'M 10 19 V 43 L 32 54 V 30', warna: warnaUtama, tebal: strokeWidth, progres: progress, isi: `${warnaUtama}35` })}
    {buatPath({ d: 'M 54 19 V 43 L 32 54 V 30', warna: warnaUtama, tebal: strokeWidth, progres: progress, isi: `${warnaUtama}10` })}
    {buatPath({ d: 'M 21 14 L 43 25', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 21 38 V 49', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
  </PembungkusSvg>
);

// 15. Sosok Petani Muda
export const IkonPetaniMuda: React.FC<IkonProps> = ({
  warnaUtama = WARNA_IKON.daunTua,
  warnaAksen = WARNA_IKON.daunTerang,
  strokeWidth = TEBAL_GARIS_64,
  progress = 1,
  ...props
}) => (
  <PembungkusSvg {...props}>
    {buatPath({ d: 'M 14 54 C 18 42 26 38 32 38 C 38 38 46 42 50 54', warna: warnaUtama, tebal: strokeWidth, progres: progress, isi: `${warnaUtama}15` })}
    {buatPath({ d: 'M 27 38 L 32 46 L 37 38', warna: warnaAksen, tebal: strokeWidth, progres: progress })}
    {buatPath({ d: 'M 22 30 C 22 40 42 40 42 30', warna: warnaUtama, tebal: strokeWidth, progres: progress, isi: `${WARNA_IKON.emas}33` })}
    {buatPath({ d: 'M 28 34 Q 32 37 36 34', warna: warnaUtama, tebal: strokeWidth - 1, progres: progress })}
    {buatPath({ d: 'M 8 30 L 32 10 L 56 30 L 32 26 Z', warna: WARNA_IKON.tanah, tebal: strokeWidth, progres: progress, isi: `${WARNA_IKON.tanah}44` })}
    {buatPath({ d: 'M 32 10 C 28 6 30 2 34 4 C 36 6 34 10 32 10 Z', warna: warnaAksen, tebal: strokeWidth - 1, progres: progress, isi: warnaAksen })}
  </PembungkusSvg>
);
