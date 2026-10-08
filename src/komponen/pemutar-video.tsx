/**
 * Pemutar video modul (T4.31): kontrol sendiri berteks Indonesia dengan target sentuh ≥ 48px (bukan
 * kontrol bawaan peramban yang kecil dan berbahasa peramban). Melanjutkan dari posisi terakhir,
 * melaporkan posisi berkala, dan memanggil `onSelesai` saat video habis ditonton.
 * Video WebM dari MediaRecorder tidak menyimpan durasi; durasinya dicari dengan melompat ke ujung
 * lalu kembali (trik standar untuk Chrome).
 */
import { useEffect, useRef, useState } from 'react';
import { teksBelajar as t, waktuVideo } from '../teks/belajar';
import { cx } from './gabung-kelas';
import { Ikon, type NamaIkon } from './ikon';

const kelasKontrol =
  'fokus-cincin inline-flex min-h-sentuh min-w-sentuh cursor-pointer items-center justify-center gap-1.5 rounded-md border-0 bg-transparent px-2 font-semibold text-putih hover:bg-teks';

function TombolKontrol({
  ikon,
  label,
  tampilLabel,
  onClick,
}: {
  ikon?: NamaIkon;
  label: string;
  tampilLabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={tampilLabel === label ? undefined : label}
      title={tampilLabel === label ? undefined : label}
      onClick={onClick}
      className={kelasKontrol}
    >
      {ikon ? <Ikon nama={ikon} className={ikon === 'putar' ? 'fill-current' : undefined} /> : null}
      {tampilLabel ? <span>{tampilLabel}</span> : null}
    </button>
  );
}

export function PemutarVideo({
  src,
  judul,
  mulaiDari = 0,
  onWaktu,
  onSelesai,
  className,
}: {
  src: string;
  judul: string;
  mulaiDari?: number;
  /** Dipanggil berkala (±2 detik) dan saat jeda: posisi dan durasi dalam detik. */
  onWaktu?: (detik: number, durasi: number) => void;
  onSelesai?: () => void;
  className?: string;
}) {
  const wadah = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [main, setMain] = useState(false);
  const [posisi, setPosisi] = useState(0);
  const [durasi, setDurasi] = useState(0);
  const [gagal, setGagal] = useState(false);
  const terakhirLapor = useRef(0);
  const layarPenuhDidukung = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  const sudahMulai = useRef(false);

  // Callback terbaru tanpa memasang ulang pendengar video.
  const lapor = useRef({ onWaktu, onSelesai });
  useEffect(() => {
    lapor.current = { onWaktu, onSelesai };
  });

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const pakaiDurasi = () => {
      if (!Number.isFinite(v.duration) || v.duration <= 0) return false;
      setDurasi(v.duration);
      if (!sudahMulai.current) {
        sudahMulai.current = true;
        v.currentTime = mulaiDari < v.duration - 1 ? mulaiDari : 0;
      }
      return true;
    };
    const metadata = () => {
      // WebM tanpa durasi: lompat jauh ke depan supaya peramban menghitung durasinya.
      if (!pakaiDurasi()) v.currentTime = 1e9;
    };
    const waktu = () => {
      if (!sudahMulai.current) {
        pakaiDurasi();
        return;
      }
      setPosisi(v.currentTime);
      const sekarang = Date.now();
      if (sekarang - terakhirLapor.current > 2000) {
        terakhirLapor.current = sekarang;
        lapor.current.onWaktu?.(v.currentTime, v.duration);
      }
    };
    const jeda = () => {
      setMain(false);
      if (sudahMulai.current) lapor.current.onWaktu?.(v.currentTime, v.duration);
    };
    const habis = () => {
      setMain(false);
      lapor.current.onSelesai?.();
    };
    const putar = () => setMain(true);
    const salah = () => setGagal(true);
    v.addEventListener('loadedmetadata', metadata);
    v.addEventListener('durationchange', waktu);
    v.addEventListener('timeupdate', waktu);
    v.addEventListener('pause', jeda);
    v.addEventListener('ended', habis);
    v.addEventListener('play', putar);
    v.addEventListener('error', salah);
    return () => {
      v.removeEventListener('loadedmetadata', metadata);
      v.removeEventListener('durationchange', waktu);
      v.removeEventListener('timeupdate', waktu);
      v.removeEventListener('pause', jeda);
      v.removeEventListener('ended', habis);
      v.removeEventListener('play', putar);
      v.removeEventListener('error', salah);
    };
  }, [src, mulaiDari]);

  const geser = (detik: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(durasi || v.duration || 0, detik));
    setPosisi(v.currentTime);
  };

  if (gagal)
    return (
      <div
        className={cx(
          'grid aspect-video place-items-center rounded-lg bg-teks p-6 text-center text-putih',
          className,
        )}
      >
        <p role="status" className="m-0">
          {t.videoGagal}
        </p>
      </div>
    );

  return (
    <div ref={wadah} className={cx('overflow-hidden rounded-lg bg-teks', className)}>
      <video
        ref={video}
        src={src}
        preload="metadata"
        playsInline
        aria-label={t.videoJudul(judul)}
        className="block aspect-video w-full bg-teks"
        onClick={() => (main ? video.current?.pause() : void video.current?.play())}
      />
      <div className="flex flex-col gap-1 px-2 pb-2 pt-1">
        <input
          type="range"
          aria-label={t.posisi}
          aria-valuetext={t.waktu(waktuVideo(posisi), waktuVideo(durasi))}
          min={0}
          max={Math.max(1, Math.floor(durasi))}
          step={1}
          value={Math.floor(posisi)}
          onChange={(e) => geser(Number(e.target.value))}
          className="fokus-cincin h-sentuh w-full cursor-pointer accent-matahari"
        />
        <div className="flex flex-wrap items-center gap-1">
          <TombolKontrol
            ikon={main ? 'jeda' : 'putar'}
            label={main ? t.jeda : t.putar}
            tampilLabel={main ? t.jeda : t.putar}
            onClick={() => (main ? video.current?.pause() : void video.current?.play())}
          />
          <TombolKontrol label={t.mundur} tampilLabel="−10" onClick={() => geser(posisi - 10)} />
          <TombolKontrol label={t.maju} tampilLabel="+10" onClick={() => geser(posisi + 10)} />
          {/* Waktu sudah dibacakan penggeser (aria-valuetext); disembunyikan supaya tidak ganda. */}
          <span aria-hidden="true" className="flex-1 px-2 text-putih tabular-nums">
            {waktuVideo(posisi)} / {waktuVideo(durasi)}
          </span>
          {layarPenuhDidukung ? (
            <TombolKontrol
              ikon="layar-penuh"
              label={t.layarPenuh}
              onClick={() => void wadah.current?.requestFullscreen?.()}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
