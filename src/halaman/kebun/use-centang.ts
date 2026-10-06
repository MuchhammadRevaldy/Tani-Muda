/** Menandai tugas selesai dari daftar (Beranda, Jadwal) dengan tampilan langsung tercentang. */
import { useState } from 'react';
import { kunciIdempotenBaru, useSelesaikanTugas } from '../../api/kueri';

export function useCentangTugas() {
  const selesaikan = useSelesaikanTugas();
  const [sedang, setSedang] = useState<Set<string>>(new Set());
  const [gagal, setGagal] = useState(false);
  async function centang(id: string) {
    setGagal(false);
    setSedang((s) => new Set(s).add(id));
    try {
      await selesaikan.mutateAsync({ id, kunci_idempoten: kunciIdempotenBaru() });
    } catch {
      setGagal(true);
    } finally {
      setSedang((s) => {
        const b = new Set(s);
        b.delete(id);
        return b;
      });
    }
  }
  return { centang, sedang, gagal };
}
