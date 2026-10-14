/**
 * Halaman Chat Petani & Pembeli (F-09, D-64).
 * Mendukung percakapan alokasi pesanan, pesanan stok siap jual, dan dari peta petani.
 * Polling setiap 5 detik saat obrolan terbuka.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  useBukaPercakapan,
  useDaftarPercakapan,
  useKirimPesan,
  usePesanPercakapan,
  useTandaiDibaca,
} from '../../api/kueri';
import { useSesi } from '../../api/sesi';
import type { JenisPercakapan, Percakapan } from '../../api/tipe';
import { Avatar } from '../../komponen/avatar';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { Tombol } from '../../komponen/tombol';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { Memuat } from '../memuat';

function labelKonteks(jenis: JenisPercakapan): string {
  switch (jenis) {
    case 'alokasi':
      return 'Alokasi Pesanan';
    case 'pesanan_stok':
      return 'Stok Siap Jual';
    case 'peta':
      return 'Peta Petani';
    default:
      return 'Umum';
  }
}

function formatWaktuPesan(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function HalamanChat() {
  const { akun } = useSesi();
  const lebar = useLayarLebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const idDariUrl = searchParams.get('id');
  const tujuanParam = searchParams.get('tujuan');
  const jenisParam = searchParams.get('jenis') as JenisPercakapan | null;
  const rujukanParam = searchParams.get('rujukan');

  const percakapanDipilih = idDariUrl;
  const [teksPesan, setTeksPesan] = useState('');
  const sudahBukaRef = useRef(false);

  const daftarQ = useDaftarPercakapan({ refetchInterval: 5000 });
  const bukaMutasi = useBukaPercakapan();
  const kirimMutasi = useKirimPesan();
  const tandaiDibacaMutasi = useTandaiDibaca();

  // Buka percakapan dari parameter URL (tujuan / rujukan)
  useEffect(() => {
    if ((tujuanParam || rujukanParam) && !sudahBukaRef.current) {
      sudahBukaRef.current = true;
      void bukaMutasi
        .mutateAsync({
          lawan_bicara_id: tujuanParam ?? undefined,
          jenis: jenisParam ?? 'peta',
          rujukan_id: rujukanParam ?? null,
        })
        .then((res) => {
          void daftarQ.refetch();
          navigate(`${location.pathname}?id=${encodeURIComponent(res.id)}`, { replace: true });
        })
        .catch(() => {
          // Bila gagal membuka, biarkan daftar tampil
        });
    }
  }, [tujuanParam, rujukanParam, jenisParam, bukaMutasi, navigate, location.pathname, daftarQ]);

  const daftar = daftarQ.data ?? [];
  const percakapanAktif =
    daftar.find((p) => p.id === percakapanDipilih) ??
    (bukaMutasi.data && bukaMutasi.data.id === percakapanDipilih
      ? {
          id: bukaMutasi.data.id,
          jenis: bukaMutasi.data.jenis,
          rujukan_id: bukaMutasi.data.rujukan_id,
          lawan_bicara: bukaMutasi.data.lawan_bicara,
          jumlah_belum_dibaca: 0,
          dibuat_pada: bukaMutasi.data.dibuat_pada,
        }
      : null);

  // Polling pesan untuk percakapan aktif setiap 5 detik
  const pesanQ = usePesanPercakapan(percakapanDipilih, undefined, {
    enabled: Boolean(percakapanDipilih),
    refetchInterval: 5000,
  });

  const daftarPesan = useMemo(() => pesanQ.data ?? [], [pesanQ.data]);
  const refPesanBawah = useRef<HTMLDivElement>(null);

  // Tandai dibaca saat pesan dimuat
  const ditandaiRef = useRef<string | null>(null);
  useEffect(() => {
    if (percakapanDipilih && daftarPesan.length > 0) {
      const adaBelumDibaca = daftarPesan.some(
        (p) => p.pengirim_id !== akun?.pengguna.id && !p.dibaca_pada,
      );
      if (adaBelumDibaca && ditandaiRef.current !== percakapanDipilih) {
        ditandaiRef.current = percakapanDipilih;
        tandaiDibacaMutasi.mutate(percakapanDipilih);
      }
    }
  }, [percakapanDipilih, daftarPesan, akun?.pengguna.id, tandaiDibacaMutasi]);

  // Gulir ke bawah saat ada pesan baru
  useEffect(() => {
    refPesanBawah.current?.scrollIntoView({ behavior: 'smooth' });
  }, [daftarPesan.length]);

  async function tanganiKirim(e: React.FormEvent) {
    e.preventDefault();
    const isi = teksPesan.trim();
    if (!isi || !percakapanDipilih || kirimMutasi.isPending) return;

    setTeksPesan('');
    try {
      await kirimMutasi.mutateAsync({
        id: percakapanDipilih,
        isi,
        kunci_idempoten: globalThis.crypto.randomUUID(),
      });
      await pesanQ.refetch();
    } catch {
      setTeksPesan(isi);
    }
  }

  function pilihPercakapan(p: Percakapan) {
    navigate(`${location.pathname}?id=${encodeURIComponent(p.id)}`);
  }

  if (daftarQ.isLoading && !percakapanDipilih) {
    return <Memuat />;
  }

  // Tampilan Daftar Percakapan
  const panelDaftar = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between pb-2">
        <h2 className="m-0 text-judul-bagian font-semibold text-teks">Percakapan</h2>
        <span className="text-keterangan text-teks-pendukung">{daftar.length} kontak</span>
      </div>

      {daftar.length === 0 ? (
        <Kartu judul="Belum Ada Pesan" tingkatJudul={3}>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-daun-lembut text-daun-tua">
              <Ikon nama="chat" ukuran={24} />
            </div>
            <p className="m-0 font-medium text-teks">Belum ada obrolan aktif</p>
            <p className="m-0 max-w-sm text-keterangan text-teks-pendukung">
              Mulai percakapan dengan petani lewat peta sekitar, atau hubungi pembeli lewat rincian
              kesepakatan pesanan.
            </p>
          </div>
        </Kartu>
      ) : (
        <div className="flex flex-col gap-2">
          {daftar.map((p) => {
            const aktif = p.id === percakapanDipilih;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => pilihPercakapan(p)}
                className={`fokus-cincin flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition ${
                  aktif
                    ? 'border-daun-tua bg-daun-lembut shadow-kartu'
                    : 'border-garis bg-putih hover:bg-embun-pagi'
                }`}
              >
                <Avatar nama={p.lawan_bicara.nama} ukuran={44} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold text-teks">{p.lawan_bicara.nama}</span>
                    {p.pesan_terakhir ? (
                      <span className="text-keterangan text-teks-pendukung flex-none">
                        {formatWaktuPesan(p.pesan_terakhir.dibuat_pada)}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-embun-pagi px-2 py-0.5 text-keterangan font-medium text-teks-pendukung">
                      {labelKonteks(p.jenis)}
                    </span>
                    <span className="capitalize text-keterangan text-teks-pendukung">
                      · {p.lawan_bicara.peran ?? 'Pengguna'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <p className="m-0 line-clamp-1 min-w-0 flex-1 text-keterangan text-teks-pendukung">
                      {p.pesan_terakhir?.isi ?? 'Mulai percakapan baru...'}
                    </p>
                    {p.jumlah_belum_dibaca > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-tanah px-1.5 text-keterangan font-bold text-putih">
                        {p.jumlah_belum_dibaca > 99 ? '99+' : p.jumlah_belum_dibaca}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  // Tampilan Ruang Obrolan
  const panelObrolan = percakapanAktif ? (
    <div className="flex h-panel flex-col overflow-hidden rounded-2xl border border-garis bg-putih shadow-kartu">
      {/* Header Obrolan */}
      <div className="flex items-center justify-between border-b border-garis bg-putih px-4 py-3">
        <div className="flex items-center gap-3">
          {!lebar ? (
            <button
              type="button"
              onClick={() => navigate(location.pathname)}
              aria-label="Kembali ke daftar percakapan"
              className="flex h-9 w-9 items-center justify-center rounded-full text-teks-pendukung hover:bg-embun-pagi hover:text-teks"
            >
              <Ikon nama="panah-kiri" ukuran={20} />
            </button>
          ) : null}
          <Avatar nama={percakapanAktif.lawan_bicara.nama} ukuran={40} />
          <div className="flex flex-col">
            <span className="font-semibold text-teks">
              {percakapanAktif.lawan_bicara.nama}
            </span>
            <div className="flex items-center gap-1.5 text-keterangan text-teks-pendukung">
              <span className="capitalize">{percakapanAktif.lawan_bicara.peran ?? 'Pengguna'}</span>
              <span>·</span>
              <span className="text-daun-tua font-medium">
                {labelKonteks(percakapanAktif.jenis)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Pesan */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-embun-pagi p-4">
        {daftarPesan.length === 0 ? (
          <div className="my-auto flex flex-col items-center gap-2 text-center text-teks-pendukung">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-putih text-daun-tua shadow-garis">
              <Ikon nama="chat" ukuran={20} />
            </div>
            <p className="m-0 font-medium text-teks">Belum ada riwayat pesan</p>
            <p className="m-0 text-keterangan">Kirim pesan pertama Anda untuk memulai obrolan.</p>
          </div>
        ) : (
          daftarPesan.map((pesan) => {
            const saya = pesan.pengirim_id === akun?.pengguna.id;
            return (
              <div
                key={pesan.id}
                className={`flex flex-col ${saya ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-isi leading-relaxed shadow-garis ${
                    saya
                      ? 'bg-daun-tua text-putih'
                      : 'border border-garis bg-putih text-teks'
                  }`}
                >
                  <p className="m-0 whitespace-pre-wrap break-words">{pesan.isi}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-keterangan ${
                      saya ? 'text-daun-lembut' : 'text-teks-pendukung'
                    }`}
                  >
                    <span>{formatWaktuPesan(pesan.dibuat_pada)}</span>
                    {saya ? (
                      <span className="font-medium">
                        {pesan.dibaca_pada ? '· Dibaca' : '· Terkirim'}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={refPesanBawah} />
      </div>

      {/* Formulir Kirim Pesan */}
      <form
        onSubmit={(e) => void tanganiKirim(e)}
        className="flex items-center gap-2 border-t border-garis bg-putih p-3"
      >
        <input
          type="text"
          id="masukan-pesan-chat"
          value={teksPesan}
          onChange={(e) => setTeksPesan(e.target.value)}
          placeholder="Tulis pesan Anda..."
          maxLength={1000}
          className="fokus-cincin flex-1 rounded-xl border border-garis bg-embun-pagi px-4 py-2.5 text-isi text-teks outline-none placeholder:text-teks-pendukung"
        />
        <Tombol
          id="tombol-kirim-pesan"
          type="submit"
          varian="utama"
          disabled={!teksPesan.trim() || kirimMutasi.isPending}
        >
          Kirim
        </Tombol>
      </form>
    </div>
  ) : (
    <div className="flex h-panel flex-col items-center justify-center rounded-2xl border border-garis bg-putih p-6 text-center text-teks-pendukung shadow-kartu">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-daun-lembut text-daun-tua">
        <Ikon nama="chat" ukuran={28} />
      </div>
      <h3 className="m-0 mt-3 text-judul-bagian font-semibold text-teks">Pilih Percakapan</h3>
      <p className="m-0 mt-1 max-w-sm text-keterangan text-teks-pendukung">
        Pilih salah satu kontak di sisi kiri untuk melihat dan membalas obrolan.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 text-judul-halaman font-semibold text-teks">Chat & Pesan</h1>
        <p className="m-0 text-keterangan text-teks-pendukung">
          Komunikasi langsung antara petani dan pembeli untuk koordinasi pesanan dan stok.
        </p>
      </div>

      {lebar ? (
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-5">{panelDaftar}</div>
          <div className="col-span-7">{panelObrolan}</div>
        </div>
      ) : percakapanDipilih ? (
        panelObrolan
      ) : (
        panelDaftar
      )}
    </div>
  );
}
