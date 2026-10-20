import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Memuat } from '../halaman/memuat';
import { useMunculGulir } from '../halaman/landing/muncul-gulir';
import { gayaBertahap, useBertahap } from './bertahap';
import { FaqLipat } from './pelengkap';

/* Gerak (D-61, [AG-22]). */

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.documentElement.classList.remove('js-gulir');
});

describe('kartu bertahap', () => {
  it('jeda 50 ms per item untuk 8 item pertama, sisanya langsung; tanpa kelas bila tidak aktif', () => {
    expect(gayaBertahap(false, 3)).toEqual({});
    expect(gayaBertahap(true, 3)).toEqual({
      className: 'muncul-bertahap',
      style: { '--urutan': 3 },
    });
    expect(gayaBertahap(true, 7).style).toEqual({ '--urutan': 7 });
    expect(gayaBertahap(true, 8).style).toEqual({ '--urutan': 0 });
  });
  it('hanya selama jendela pertama setelah siap; tidak menyala lagi saat data diperbarui', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ siap }) => useBertahap(siap), {
      initialProps: { siap: false },
    });
    expect(result.current).toBe(false);
    rerender({ siap: true });
    expect(result.current).toBe(true);
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
    rerender({ siap: false });
    rerender({ siap: true });
    expect(result.current).toBe(false);
  });
});

describe('muncul saat digulir', () => {
  it('tanpa IntersectionObserver konten tetap terlihat (kelas js-gulir tidak dipasang)', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    renderHook(() => useMunculGulir());
    expect(document.documentElement.classList.contains('js-gulir')).toBe(false);
  });
  it('dengan observer: ditandai terlihat saat masuk, dilepas saat keluar layar, lalu diulang [AG-55]', () => {
    const pengamat: IntersectionObserverCallback[] = [];
    class PengamatTiruan {
      constructor(cb: IntersectionObserverCallback) {
        pengamat.push(cb);
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal('IntersectionObserver', PengamatTiruan);
    const { container } = render(<div className="muncul-gulir">isi</div>);
    renderHook(() => useMunculGulir());
    expect(document.documentElement.classList.contains('js-gulir')).toBe(true);
    const el = container.firstElementChild!;
    const [masuk, keluar] = pengamat;
    const kirim = (cb: IntersectionObserverCallback | undefined, isIntersecting: boolean) =>
      act(() =>
        cb?.(
          [{ isIntersecting, target: el } as unknown as IntersectionObserverEntry],
          {} as IntersectionObserver,
        ),
      );
    kirim(masuk, true);
    expect(el.classList.contains('terlihat')).toBe(true);
    kirim(keluar, false);
    expect(el.classList.contains('terlihat')).toBe(false);
    kirim(masuk, true);
    expect(el.classList.contains('terlihat')).toBe(true);
  });
});

describe('tanya jawab', () => {
  it('tombol dengan aria-expanded; butir pertama terbuka, isi tertutup tidak bisa difokus', async () => {
    render(
      <FaqLipat
        butir={[
          { tanya: 'Pertanyaan satu', jawab: 'Jawaban satu' },
          { tanya: 'Pertanyaan dua', jawab: 'Jawaban dua' },
        ]}
      />,
    );
    const satu = screen.getByRole('button', { name: 'Pertanyaan satu' });
    const dua = screen.getByRole('button', { name: 'Pertanyaan dua' });
    expect(satu).toHaveAttribute('aria-expanded', 'true');
    expect(dua).toHaveAttribute('aria-expanded', 'false');
    const isiDua = document.getElementById(dua.getAttribute('aria-controls')!)!;
    expect(isiDua).toHaveAttribute('data-terbuka', 'false');
    expect(isiDua.hasAttribute('inert')).toBe(true);
    await userEvent.click(dua);
    expect(dua).toHaveAttribute('aria-expanded', 'true');
    expect(isiDua).toHaveAttribute('data-terbuka', 'true');
    expect(isiDua.hasAttribute('inert')).toBe(false);
    await userEvent.click(satu);
    expect(satu).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('memuat', () => {
  it('tunas beranimasi dengan teks untuk pembaca layar', () => {
    render(<Memuat />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Sedang memuat');
    expect(status.querySelector('img')).toHaveAttribute('src', '/ilustrasi/memuat-tunas.svg');
  });
});
