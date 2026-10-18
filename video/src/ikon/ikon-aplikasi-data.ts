/**
 * Ikon yang dipakai ulang dari aplikasi [AG-44].
 * SALINAN APA ADANYA dari frontend/src/komponen/ikon.tsx (grid 24, garis 1,7).
 * Jangan diubah di sini: scripts/cek-ikon-aplikasi.mjs gagal bila isinya berbeda
 * dari sumbernya. Bila ikon aplikasi berubah, salin ulang string-nya.
 */
export const IKON_APLIKASI = {
  uang:
    '<ellipse cx="9" cy="6.5" rx="6" ry="2.5"/><path d="M3 6.5v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/><path d="M3 10.5v4c0 1.4 2.7 2.5 6 2.5"/><ellipse cx="15" cy="14.5" rx="6" ry="2.5"/><path d="M9 14.5v3c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-3"/>',
  pin:
    '<path d="M12 21s-6.5-5.4-6.5-10.8a6.5 6.5 0 0 1 13 0C18.5 15.6 12 21 12 21Z"/><path d="M12 13.4v-2.6"/><path d="M12 11c0-1.5-1-2.5-2.6-2.5 0 1.5 1 2.5 2.6 2.5Z"/><path d="M12 11c0-1.5 1-2.5 2.6-2.5 0 1.5-1 2.5-2.6 2.5Z"/>',
  panen:
    '<path d="M3.8 10.2h16.4l-1.7 8.6c-.2.9-1 1.5-1.9 1.5H7.4c-.9 0-1.7-.6-1.9-1.5Z"/><path d="M8 10.2 11 4.6"/><path d="M16 10.2 13 4.6"/><path d="M9.6 13.6v3.2"/><path d="M14.4 13.6v3.2"/>',
  kamera:
    '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  chat:
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  kebun:
    '<path d="M12 21v-9"/><path d="M12 12c0-4 3-7 8-7 0 4-3 7-8 7z"/><path d="M12 14c0-3-2.5-5.5-7-5.5 0 3 2.5 5.5 7 5.5z"/>',
  belajar:
    '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4-2.5-4-2.5z"/>',
  kunci:
    '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/><path d="M12 14.4v2.4"/>',
  centang:
    '<path d="M5 12.6 9.6 17.2 19 7.6"/>',
  pengukur:
    '<path d="M3.5 16.5a8.5 8.5 0 0 1 17 0"/><path d="M12 16.5l4-5"/><circle cx="12" cy="16.5" r="1.4"/><path d="M6.2 12.4l1 .8M17.8 12.4l-1 .8M12 8v1.3"/>',
  peta:
    '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
} as const;

export type NamaIkonAplikasi = keyof typeof IKON_APLIKASI;
