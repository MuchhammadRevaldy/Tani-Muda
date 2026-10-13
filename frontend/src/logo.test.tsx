import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { warna } from '../tailwind.config';
import { buatQueryClient, PenyediaKlienApi } from './api/penyedia-klien';
import { buatKlienTiruan } from './api/tiruan/klien-tiruan';
import { daftarRute } from './rute';

/* Logo merek baru di setiap kerangka (D-63, [AG-24]). */

async function buka(url: string, pengguna: string | null) {
  const t = buatKlienTiruan({ tampilkanResepContoh: true, kv: null });
  if (pengguna) await t.kontrol.masukSebagai(pengguna);
  render(
    <PenyediaKlienApi klien={t.klien} kontrol={t.kontrol} queryClient={buatQueryClient()}>
      <RouterProvider router={createMemoryRouter(daftarRute, { initialEntries: [url] })} />
    </PenyediaKlienApi>,
  );
}

describe('logo merek', () => {
  it.each([
    ['petani (sidebar)', '/beranda', 'petani-arif'],
    ['pembeli (header)', '/pembeli', 'pembeli-ratna'],
    ['panel admin', '/admin', 'admin-tani'],
    ['panel mentor', '/mentor', 'mentor-rahmat'],
    ['publik (halaman depan)', '/', null],
    ['publik (halaman statis)', '/aturan-pakai', null],
    ['Masuk', '/masuk', null],
  ] as const)('%s menampilkan tanda merek baru di sebelah nama', async (_, url, pengguna) => {
    await buka(url, pengguna);
    await screen.findAllByText('Tani Muda');
    const tanda = document.querySelectorAll<HTMLImageElement>('img[data-logo="tanda"]');
    expect(tanda.length).toBeGreaterThan(0);
    for (const img of tanda) {
      expect(img.getAttribute('src')).toBe('/logo/logo-tanda.svg');
      // Nama "Tani Muda" ada di sebelahnya, jadi tanda hanya hiasan.
      expect(img.getAttribute('alt')).toBe('');
      expect(img.parentElement).toHaveTextContent('Tani Muda');
    }
  });

  it('favicon dan theme-color memakai logo dan token limau', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(html).toContain('href="/favicon.svg"');
    expect(html).toContain('href="/favicon.ico"');
    expect(html).toContain('href="/apple-touch-icon.png"');
    expect(html).toContain(`<meta name="theme-color" content="${warna.limau}" />`);
    const ikon = readFileSync('public/logo/logo-ikon.svg', 'utf8').trim();
    expect(readFileSync('public/favicon.svg', 'utf8').trim()).toBe(ikon);
  });
});
