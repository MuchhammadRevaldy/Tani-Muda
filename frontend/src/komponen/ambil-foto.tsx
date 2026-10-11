/**
 * Ambil foto dari kamera atau galeri, lalu dikecilkan di HP sebelum diunggah (aturan-proyek 6.7):
 * sisi terpanjang paling besar 1280px, JPEG mutu 0,8 (`src/lib/kecilkan-foto.ts`).
 */
import { useRef, useState, type ReactNode } from 'react';
import { MUTU_FOTO, ukuranKecil } from '../lib/kecilkan-foto';
import { cx } from './gabung-kelas';
import { Ikon } from './ikon';

export interface FotoKecil {
  dataUrl: string;
  nama: string;
  jenis: 'image/jpeg';
}

async function kecilkan(berkas: File): Promise<FotoKecil> {
  const url = URL.createObjectURL(berkas);
  try {
    const img = await new Promise<HTMLImageElement>((ok, gagal) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = gagal;
      i.src = url;
    });
    const u = ukuranKecil(img.naturalWidth, img.naturalHeight);
    const kanvas = document.createElement('canvas');
    kanvas.width = u.lebar;
    kanvas.height = u.tinggi;
    const ctx = kanvas.getContext('2d');
    if (!ctx) throw new Error('kanvas');
    ctx.drawImage(img, 0, 0, u.lebar, u.tinggi);
    return {
      dataUrl: kanvas.toDataURL('image/jpeg', MUTU_FOTO),
      nama: berkas.name.replace(/\.[^.]+$/, '') + '.jpg',
      jenis: 'image/jpeg',
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function AmbilFoto({
  label,
  onFoto,
  onGagal,
  labelMemuat,
  className,
  ikon = 'kamera',
}: {
  label: ReactNode;
  onFoto: (foto: FotoKecil) => void;
  onGagal?: () => void;
  labelMemuat: string;
  className?: string;
  ikon?: 'kamera';
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [sedang, setSedang] = useState(false);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-saja"
        tabIndex={-1}
        aria-hidden="true"
        onChange={async (e) => {
          const berkas = e.target.files?.[0];
          e.target.value = '';
          if (!berkas) return;
          setSedang(true);
          try {
            onFoto(await kecilkan(berkas));
          } catch {
            onGagal?.();
          } finally {
            setSedang(false);
          }
        }}
      />
      <button
        type="button"
        disabled={sedang}
        onClick={() => ref.current?.click()}
        className={cx(
          'fokus-cincin flex min-h-sentuh cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-garis-kuat bg-putih p-4 text-center font-semibold text-teks hover:border-daun-tua hover:text-daun-tua disabled:cursor-wait',
          className,
        )}
      >
        <Ikon nama={ikon} />
        <span>{sedang ? labelMemuat : label}</span>
      </button>
    </>
  );
}
