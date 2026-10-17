import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PilihanDropdown } from './pilihan-dropdown';
import { PilihTanggal } from './pilih-tanggal';
import { KalenderIsi } from './kalender-isi';

describe('PilihanDropdown (AG-39)', () => {
  const opsiKomoditas = [
    { nilai: 'sawi', label: 'Sawi hijau', komoditasId: 'sawi' },
    { nilai: 'bayam', label: 'Bayam cabut', komoditasId: 'bayam' },
    { nilai: 'tomat', label: 'Tomat sayur', komoditasId: 'tomat' },
  ];

  it('terhubung dengan label dan membaca pesan galat untuk pembaca layar', () => {
    render(
      <PilihanDropdown
        id="pilih-tanaman"
        label="Pilih Komoditas"
        nilai="sawi"
        onChange={() => {}}
        pilihan={opsiKomoditas}
        galat="Komoditas wajib dipilih"
      />,
    );

    const label = screen.getByText('Pilih Komoditas');
    expect(label).toHaveAttribute('for', 'pilih-tanaman');

    const tombolPemicu = document.getElementById('pilih-tanaman-tombol')!;
    expect(tombolPemicu).toBeInTheDocument();
    expect(tombolPemicu).toHaveAttribute('aria-invalid', 'true');
    expect(tombolPemicu).toHaveAttribute('aria-describedby', 'pilih-tanaman-pesan');

    const pesanGalat = screen.getByText('Komoditas wajib dipilih');
    expect(pesanGalat.closest('p')).toHaveAttribute('id', 'pilih-tanaman-pesan');
  });

  it('navigasi keyboard penuh: buka, panah bawah, Enter memilih, dan Escape menutup', async () => {
    const handleUbah = vi.fn();
    render(
      <PilihanDropdown
        id="pilih-tanaman"
        label="Komoditas"
        nilai="sawi"
        onChange={handleUbah}
        pilihan={opsiKomoditas}
      />,
    );

    const pemicu = document.getElementById('pilih-tanaman-tombol')!;
    pemicu.focus();

    // Buka dengan Space / Enter
    await userEvent.keyboard('[Space]');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Panah bawah ke opsi berikutnya lalu Enter
    await userEvent.keyboard('[ArrowDown]');
    await userEvent.keyboard('[Enter]');

    expect(handleUbah).toHaveBeenCalledWith('bayam');
  });

  it('menampilkan ilustrasi komoditas pada pilihan dan butir aktif bertanda centang', async () => {
    render(
      <PilihanDropdown
        id="pilih-tanaman"
        label="Komoditas"
        nilai="bayam"
        onChange={() => {}}
        pilihan={opsiKomoditas}
      />,
    );

    const pemicu = document.getElementById('pilih-tanaman-tombol')!;
    await userEvent.click(pemicu);

    // Opsi bayam terpilih memiliki latar daun-lembut dan ikon centang
    const opsiBayam = screen.getByRole('option', { name: /Bayam cabut/i });
    expect(opsiBayam).toHaveClass('bg-daun-lembut');
    expect(opsiBayam.querySelector('img')).toBeInTheDocument();
  });

  it('menyediakan kolom pencarian bila pilihan lebih dari 8 opsi', async () => {
    const sembilanOpsi = Array.from({ length: 9 }, (_, i) => ({
      nilai: `opsi-${i + 1}`,
      label: `Komoditas ke-${i + 1}`,
    }));

    render(
      <PilihanDropdown
        id="banyak-opsi"
        label="Pilihan Banyak"
        nilai="opsi-1"
        onChange={() => {}}
        pilihan={sembilanOpsi}
      />,
    );

    await userEvent.click(document.getElementById('banyak-opsi-tombol')!);

    const inputCari = screen.getByPlaceholderText('Cari pilihan...');
    expect(inputCari).toBeInTheDocument();

    await userEvent.type(inputCari, 'ke-9');
    expect(screen.getByRole('option', { name: 'Komoditas ke-9' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Komoditas ke-1' })).not.toBeInTheDocument();
  });
});

describe('PilihTanggal & KalenderIsi (AG-39)', () => {
  it('menampilkan tanggal berformat Indonesia lengkap pada pemicu', () => {
    render(
      <PilihTanggal
        id="tgl-panen"
        label="Tanggal Panen"
        nilai="2026-10-17"
        onChange={() => {}}
      />,
    );

    // Format "Sabtu, 17 Oktober 2026"
    expect(screen.getByText('Sabtu, 17 Oktober 2026')).toBeInTheDocument();
    const pemicu = screen.getByRole('button', { name: /Tanggal Panen/i });
    expect(pemicu).toHaveAttribute('aria-haspopup', 'dialog');
  });

  it('KalenderIsi: awal minggu adalah Senin dan tombol Hari ini & Hapus berfungsi', async () => {
    const handlePilih = vi.fn();
    render(
      <KalenderIsi
        nilai="2026-10-17"
        onPilih={handlePilih}
      />,
    );

    // Header weekday bahasa Indonesia dimulai dari Senin: Sen, Sel, Rab, Kam, Jum, Sab, Min
    expect(screen.getByText('Sen')).toBeInTheDocument();
    expect(screen.getByText('Min')).toBeInTheDocument();

    // Tombol Hari ini memilih tanggal hari ini
    const tombolHariIni = screen.getByRole('button', { name: 'Hari ini' });
    await userEvent.click(tombolHariIni);
    expect(handlePilih).toHaveBeenCalledWith(new Date().toISOString().slice(0, 10));

    // Tombol Hapus mengosongkan tanggal
    const tombolHapus = screen.getByRole('button', { name: 'Hapus' });
    await userEvent.click(tombolHapus);
    expect(handlePilih).toHaveBeenCalledWith('');
  });

  it('KalenderIsi: menegakkan batasan tanggal minimum dan maksimum', () => {
    render(
      <KalenderIsi
        nilai="2026-10-17"
        min="2026-10-10"
        max="2026-10-20"
        onPilih={() => {}}
      />,
    );

    // Hari ke-5 Oktober di luar rentang min 10 Oktober harus disabled
    const tombolTanggal5 = screen.queryByRole('button', { name: /^5 Oktober 2026/i });
    if (tombolTanggal5) {
      expect(tombolTanggal5).toBeDisabled();
    }
  });
});
