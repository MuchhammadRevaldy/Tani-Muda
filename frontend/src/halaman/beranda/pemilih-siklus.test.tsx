import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { PemilihSiklus, type OpsiKartuSiklus } from './pemilih-siklus';

const opsi: OpsiKartuSiklus[] = [
  {
    id: 'a',
    nama: 'Sawi hijau · Kebun belakang rumah',
    komoditasId: 'sawi',
    judul: 'Sawi hijau',
    sub: 'Kebun belakang rumah',
    segmen: [0.5],
    keterangan: 'Hari ke-14 dari 28',
    terlambat: 0,
  },
  {
    id: 'b',
    nama: 'Sawi hijau · Rak hidroponik teras',
    komoditasId: 'sawi',
    judul: 'Sawi hijau',
    sub: 'Rak hidroponik teras',
    segmen: [0.3],
    keterangan: 'Hari ke-12 dari 35',
    terlambat: 1,
  },
  {
    id: 'pesanan:x',
    nama: 'Bayam untuk Warung Nasi Bu Imas',
    komoditasId: 'bayam',
    judul: 'Bayam',
    sub: 'Untuk Warung Nasi Bu Imas',
    segmen: [1, 1, 0.6, 0],
    keterangan: '4 petak · 2 tumbuh',
    terlambat: 0,
  },
];

function Uji() {
  const [nilai, setNilai] = useState('a');
  return <PemilihSiklus opsi={opsi} nilai={nilai} onPilih={setNilai} />;
}

describe('PemilihSiklus (AG-17)', () => {
  it('radiogroup: satu pilihan, hanya kartu terpilih yang bisa di-Tab', () => {
    render(<Uji />);
    const grup = screen.getByRole('radiogroup', { name: 'Pilih siklus' });
    const radio = screen.getAllByRole('radio');
    expect(grup).toContainElement(radio[0]!);
    expect(radio.map((r) => r.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false']);
    expect(radio.map((r) => r.tabIndex)).toEqual([0, -1, -1]);
    // Chip terlambat ikut dibacakan dan tidak terbungkus ke baris baru.
    expect(screen.getByRole('radio', { name: 'Sawi hijau · Rak hidroponik teras, 1 terlambat' }));
    expect(screen.getByText('1 terlambat').closest('span.whitespace-nowrap')).not.toBeNull();
  });
  it('panah kanan/kiri berpindah pilihan dan fokus, berputar di ujung', () => {
    render(<Uji />);
    const [a, b, c] = screen.getAllByRole('radio');
    a!.focus();
    fireEvent.keyDown(a!, { key: 'ArrowRight' });
    expect(b).toHaveAttribute('aria-checked', 'true');
    expect(b).toHaveFocus();
    fireEvent.keyDown(b!, { key: 'End' });
    expect(c).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(c!, { key: 'ArrowRight' });
    expect(a).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(a!, { key: 'ArrowLeft' });
    expect(c).toHaveAttribute('aria-checked', 'true');
  });
  it('kelompok petak: batang bersegmen, satu segmen per petak', () => {
    render(<Uji />);
    const kartu = screen.getByRole('radio', { name: 'Bayam untuk Warung Nasi Bu Imas' });
    expect(kartu.querySelectorAll('[aria-hidden="true"] > div')).toHaveLength(4);
  });
  it('nama, lahan, dan keterangan berelipsis dengan teks lengkap saat disentuh atau disorot; chip di baris sendiri ([AG-21])', () => {
    render(<Uji />);
    const kartu = screen.getByRole('radio', { name: /Rak hidroponik teras/ });
    expect(kartu.className).toContain('group');
    for (const teks of ['Rak hidroponik teras', 'Hari ke-12 dari 35']) {
      const el = within(kartu).getByText(teks);
      expect(el.className).toContain('truncate');
      expect(el.className).toContain('group-hover:whitespace-normal');
      expect(el.className).toContain('group-focus:whitespace-normal');
    }
    // Chip terlambat tidak berbagi baris dengan keterangan hari.
    const chip = within(kartu)
      .getByText('1 terlambat')
      .closest<HTMLElement>('span.whitespace-nowrap')!;
    expect(chip.parentElement).toBe(kartu);
    expect(within(kartu).getByText('Hari ke-12 dari 35').parentElement).not.toContainElement(chip);
  });
});
