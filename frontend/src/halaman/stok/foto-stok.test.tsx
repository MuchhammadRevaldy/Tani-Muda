import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GambarStok } from '../../komponen/gambar-stok';
import { alamatFotoKomoditas, alamatIlustrasiKomoditas } from '../../komponen/ilustrasi';
import { buatKlienTiruan } from '../../api/tiruan/klien-tiruan';
import { GalatApi } from '../../api/galat';

describe('AG-38: Urutan gambar di kartu dan detail stok', () => {
  it('menampilkan foto unggahan petani tanpa label "Foto contoh"', () => {
    render(
      <GambarStok
        foto="/contoh/foto/contoh-foto-panen.svg"
        komoditasId="bayam"
        namaKomoditas="Bayam"
      />,
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/contoh/foto/contoh-foto-panen.svg');
    expect(img).toHaveAttribute('alt', 'Foto Bayam');
    expect(screen.queryByTestId('label-foto-contoh')).not.toBeInTheDocument();
  });

  it('menampilkan foto bawaan komoditas dengan label "Foto contoh" jika tidak ada foto unggahan', () => {
    render(
      <GambarStok
        foto={null}
        komoditasId="sawi"
        namaKomoditas="Sawi hijau"
      />,
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', alamatFotoKomoditas('sawi'));
    expect(img).toHaveAttribute('alt', 'Foto contoh Sawi hijau');
    const badge = screen.getByTestId('label-foto-contoh');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Foto contoh');
  });

  it('urutan cadangan: jika foto unggahan gagal (onError), beralih ke foto bawaan dengan label "Foto contoh"', () => {
    render(
      <GambarStok
        foto="https://gambar-rusak.example/foto.jpg"
        komoditasId="kangkung"
        namaKomoditas="Kangkung"
      />,
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://gambar-rusak.example/foto.jpg');
    expect(screen.queryByTestId('label-foto-contoh')).not.toBeInTheDocument();

    // Simulasikan gambar unggahan gagal dimuat
    fireEvent.error(img);

    expect(img).toHaveAttribute('src', alamatFotoKomoditas('kangkung'));
    expect(screen.getByTestId('label-foto-contoh')).toHaveTextContent('Foto contoh');
  });

  it('urutan cadangan: jika foto bawaan gagal (onError), beralih ke ilustrasi 3D komoditas', () => {
    render(
      <GambarStok
        foto={null}
        komoditasId="tomat"
        namaKomoditas="Tomat"
      />,
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', alamatFotoKomoditas('tomat'));

    // Simulasikan foto bawaan gagal dimuat
    fireEvent.error(img);

    expect(img).toHaveAttribute('src', alamatIlustrasiKomoditas('tomat'));
    // Pada ilustrasi, label foto contoh tidak lagi ditampilkan karena sudah berupa ilustrasi grafis
    expect(screen.queryByTestId('label-foto-contoh')).not.toBeInTheDocument();
  });
});

describe('AG-38: Validasi unggah foto stok (jenis dan ukuran salah ditolak)', () => {
  async function buatKlienUji(peran: 'petani' | 'pembeli' = 'petani') {
    const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null, jam: () => Date.now() });
    await t.kontrol.masukSebagai(peran === 'petani' ? 'petani-arif' : 'pembeli-ratna');
    return t.klien;
  }

  it('menolak berkas dengan jenis mime yang tidak diizinkan (misal PDF)', async () => {
    const klien = await buatKlienUji('petani');

    await expect(
      klien.berkas.unggah({
        nama: 'dokumen.pdf',
        jenis: 'application/pdf',
        isi: 'data:application/pdf;base64,JVBERi0xLjQK...',
      }),
    ).rejects.toThrow(GalatApi);
  });

  it('menolak berkas foto yang melebihi batas 2 MB', async () => {
    const klien = await buatKlienUji('petani');

    // Buat data base64 lebih dari 2 MB (2 * 1024 * 1024 byte = 2097152 byte)
    // 2.2 MB base64 string
    const stringBesar = 'A'.repeat(Math.ceil((2.2 * 1024 * 1024) / 0.75));
    const dataUrlBesar = `data:image/jpeg;base64,${stringBesar}`;

    await expect(
      klien.berkas.unggah({
        nama: 'foto-raksasa.jpg',
        jenis: 'image/jpeg',
        isi: dataUrlBesar,
      }),
    ).rejects.toThrow(GalatApi);
  });

  it('menerima foto valid (JPEG) di bawah 2 MB dan mengembalikan data berkas', async () => {
    const klien = await buatKlienUji('petani');

    const fotoValid = `data:image/jpeg;base64,${'A'.repeat(1000)}`;
    const hasil = await klien.berkas.unggah({
      nama: 'panen-sawi.jpg',
      jenis: 'image/jpeg',
      isi: fotoValid,
    });

    expect(hasil).toHaveProperty('id');
    expect(hasil.jenis).toBe('image/jpeg');
    expect(hasil.url).toBe(fotoValid);
  });
});
