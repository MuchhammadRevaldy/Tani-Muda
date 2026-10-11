/// <reference types="vite/client" />

/** Variabel lingkungan publik frontend (.env.example). Tidak ada rahasia di sini (D-19). */
interface ImportMetaEnv {
  readonly VITE_SUMBER_DATA?: 'tiruan' | 'http';
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly VITE_TAMPILKAN_RESEP_CONTOH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
