/**
 * Muncul saat digulir di halaman depan (D-61): elemen `.muncul-gulir` diberi kelas `terlihat` sekali
 * saat masuk layar, lalu tidak diamati lagi (tidak berulang saat digulir naik). Kelas `js-gulir` di
 * <html> baru dipasang bila IntersectionObserver tersedia, jadi konten tetap terlihat bila
 * JavaScript atau observer gagal.
 */
import { useEffect } from 'react';

export function useMunculGulir() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const html = document.documentElement;
    let io: IntersectionObserver;
    try {
      io = new IntersectionObserver(
        (entri) => {
          for (const e of entri) {
            if (!e.isIntersecting) continue;
            e.target.classList.add('terlihat');
            io.unobserve(e.target);
          }
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      document.querySelectorAll('.muncul-gulir').forEach((el) => io.observe(el));
      html.classList.add('js-gulir');
    } catch {
      html.classList.remove('js-gulir');
      return;
    }
    return () => {
      io.disconnect();
      html.classList.remove('js-gulir');
    };
  }, []);
}
