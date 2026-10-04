import { teksUmum } from '../teks/umum';

export function Memuat() {
  return (
    <p role="status" className="p-4 text-teks-pendukung">
      {teksUmum.memuat}
    </p>
  );
}
