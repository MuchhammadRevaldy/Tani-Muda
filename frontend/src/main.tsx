import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { PenyediaKlienApi } from './api/penyedia-klien';
import { siapkanKlien } from './api/sumber';
import { tutupLayarMemuat } from './lib/layar-memuat';
import { router } from './rute';
import './index.css';

// Label "Mode demo" hanya di build demo (D-48); dibuang dari build produksi.
const LabelModeDemo =
  import.meta.env.MODE === 'demo' ? lazy(() => import('./komponen/label-mode-demo')) : null;

// Sakelar animasi (D-61, [AG-23]): `mati` mematikan semua animasi, setara prefers-reduced-motion.
if (import.meta.env.VITE_ANIMASI === 'mati')
  document.documentElement.classList.add('tanpa-animasi');

const akar = document.getElementById('root');
if (!akar) throw new Error('Elemen #root tidak ditemukan');

// Klien API dipilih dari VITE_SUMBER_DATA (D-20): tiruan sampai backend tersambung di Tahap 6.
void siapkanKlien(import.meta.env).then(({ klien, sumber, kontrol }) => {
  createRoot(akar).render(
    <StrictMode>
      <PenyediaKlienApi klien={klien} sumber={sumber} kontrol={kontrol}>
        <RouterProvider router={router} />
        {LabelModeDemo ? (
          <Suspense fallback={null}>
            <LabelModeDemo />
          </Suspense>
        ) : null}
      </PenyediaKlienApi>
    </StrictMode>,
  );
  // Layar memuat dari index.html memudar setelah render pertama tergambar [AG-55].
  requestAnimationFrame(() => requestAnimationFrame(tutupLayarMemuat));
});
