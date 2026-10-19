import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { labelPenafianTampil } from '../lib/label-penafian';
import { teksDemo } from '../teks/demo';
import { GambarStok } from './gambar-stok';
import { LabelKecil } from './label-kecil';
import LabelModeDemo from './label-mode-demo';

describe('Sakelar VITE_LABEL_PENAFIAN [AG-50]', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('bawaan nyala; "mati", "false", "0" mematikan', () => {
    expect(labelPenafianTampil('')).toBe(true);
    expect(labelPenafianTampil('nyala')).toBe(true);
    expect(labelPenafianTampil('mati')).toBe(false);
    expect(labelPenafianTampil('false')).toBe(false);
    expect(labelPenafianTampil('0')).toBe(false);
  });

  it('mati: kapsul contoh dan "Foto contoh" tidak dirender, "Mode demo" dan "Segera hadir" tetap', () => {
    vi.stubEnv('VITE_LABEL_PENAFIAN', 'mati');
    const { container } = render(
      <div data-testid="wadah">
        <LabelKecil nada="contoh">CONTOH, belum divalidasi penyuluh</LabelKecil>
        <LabelKecil nada="contoh">Mode uji coba</LabelKecil>
        <LabelKecil nada="segera">Segera hadir</LabelKecil>
        <LabelKecil nada="hijau">Ada pesanan</LabelKecil>
        <GambarStok komoditasId="sawi" />
        <LabelModeDemo />
      </div>,
    );
    expect(screen.queryByText('CONTOH, belum divalidasi penyuluh')).toBeNull();
    expect(screen.queryByText('Mode uji coba')).toBeNull();
    expect(screen.queryByTestId('label-foto-contoh')).toBeNull();
    expect(screen.getByText('Segera hadir')).toBeInTheDocument();
    expect(screen.getByText('Ada pesanan')).toBeInTheDocument();
    expect(screen.getByText(teksDemo.label)).toBeInTheDocument();
    // tidak menyisakan elemen kosong bekas label
    expect(container.querySelectorAll('[data-testid="wadah"] > span')).toHaveLength(2);
  });

  it('nyala: kapsul contoh tetap dirender', () => {
    vi.stubEnv('VITE_LABEL_PENAFIAN', 'nyala');
    render(<LabelKecil nada="contoh">CONTOH, belum divalidasi penyuluh</LabelKecil>);
    expect(screen.getByText('CONTOH, belum divalidasi penyuluh')).toBeInTheDocument();
  });
});
