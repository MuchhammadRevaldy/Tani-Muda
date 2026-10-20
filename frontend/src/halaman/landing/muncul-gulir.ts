/**
 * Muncul saat digulir di halaman depan (D-61): elemen `.muncul-gulir` diberi kelas `terlihat` saat
 * masuk layar. [AG-55] Diulang setiap kali dilihat lagi: kelas dilepas begitu elemen benar-benar
 * keluar layar (animasi direset tanpa terlihat), lalu dipasang lagi saat masuk sehingga anak-anaknya
 * (kartu bergiliran, garis tergambar, penggaris) diputar ulang. Masuk dihitung dengan margin bawah
 * 10% supaya animasi tidak dimulai tepat di tepi layar; keluar dihitung tanpa margin supaya tidak
 * berkedip di tepi. Kelas `js-gulir` di <html> baru dipasang bila IntersectionObserver tersedia,
 * jadi konten tetap terlihat bila JavaScript atau observer gagal.
 */
import { useEffect } from 'react';

export function useMunculGulir() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const html = document.documentElement;
    let masuk: IntersectionObserver;
    let keluar: IntersectionObserver;
    try {
      masuk = new IntersectionObserver(
        (entri) => {
          for (const e of entri) if (e.isIntersecting) e.target.classList.add('terlihat');
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      keluar = new IntersectionObserver((entri) => {
        for (const e of entri) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting || !el.classList.contains('terlihat')) continue;
          // Reset instan: transisi dimatikan selama satu bingkai supaya tidak berjalan mundur.
          el.classList.add('reset-gerak');
          el.classList.remove('terlihat');
          void el.offsetWidth;
          requestAnimationFrame(() => el.classList.remove('reset-gerak'));
        }
      });
      document.querySelectorAll('.muncul-gulir').forEach((el) => {
        masuk.observe(el);
        keluar.observe(el);
      });
      html.classList.add('js-gulir');
    } catch {
      html.classList.remove('js-gulir');
      return;
    }
    return () => {
      masuk.disconnect();
      keluar.disconnect();
      html.classList.remove('js-gulir');
    };
  }, []);
}
