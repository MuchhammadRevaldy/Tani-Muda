import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { PenyediaKlienApi } from './api/penyedia-klien';
import { siapkanKlien } from './api/sumber';
import { router } from './rute';
import './index.css';

const akar = document.getElementById('root');
if (!akar) throw new Error('Elemen #root tidak ditemukan');

// Klien API dipilih dari VITE_SUMBER_DATA (D-20): tiruan sampai backend tersambung di Tahap 6.
void siapkanKlien(import.meta.env).then(({ klien, sumber, kontrol }) => {
  createRoot(akar).render(
    <StrictMode>
      <PenyediaKlienApi klien={klien} sumber={sumber} kontrol={kontrol}>
        <RouterProvider router={router} />
      </PenyediaKlienApi>
    </StrictMode>,
  );
});
