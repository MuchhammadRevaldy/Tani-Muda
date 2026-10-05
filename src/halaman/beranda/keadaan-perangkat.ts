/** Keadaan perangkat untuk banner Beranda: sinyal (papan 06) dan izin notifikasi (papan 07). */
import { useEffect, useState } from 'react';

/** False saat browser offline; berubah langsung saat sinyal hilang atau kembali. */
export function useDaring(): boolean {
  const [daring, setDaring] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  useEffect(() => {
    const naik = () => setDaring(true);
    const turun = () => setDaring(false);
    window.addEventListener('online', naik);
    window.addEventListener('offline', turun);
    return () => {
      window.removeEventListener('online', naik);
      window.removeEventListener('offline', turun);
    };
  }, []);
  return daring;
}

/** Izin notifikasi browser; "tidak-didukung" bila Notification tidak ada (mis. iPhone di Safari). */
export function useIzinNotifikasi(): NotificationPermission | 'tidak-didukung' {
  const [izin] = useState<NotificationPermission | 'tidak-didukung'>(() =>
    typeof Notification === 'undefined' ? 'tidak-didukung' : Notification.permission,
  );
  return izin;
}
