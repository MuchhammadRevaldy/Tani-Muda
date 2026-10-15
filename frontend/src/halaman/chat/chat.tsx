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
  useDaftarPermintaanKontak,
  useKirimPesan,
  useKirimPermintaanKontak,
  usePesanPercakapan,
  useTandaiDibaca,
  useTerimaPermintaanKontak,
  useTolakPermintaanKontak,
} from '../../api/kueri';
import { useSesi } from '../../api/sesi';
import type { JenisPercakapan, Percakapan } from '../../api/tipe';
import { Avatar } from '../../komponen/avatar';
import { Dialog } from '../../komponen/dialog';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { Tombol } from '../../komponen/tombol';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { normalisasiNomorHp } from '../../lib/nomor-hp';
import { Memuat } from '../memuat';

function labelKonteks(jenis: JenisPercakapan): string {
  switch (jenis) {
    case 'alokasi':
      return 'Alokasi Pesanan';
    case 'pesanan_stok':
      return 'Stok Siap Jual';
    case 'peta':
      return 'Peta Petani';
    case 'kontak':
      return 'Kontak Langsung';
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
  const [dialogNomorBuka, setDialogNomorBuka] = useState(false);
  const [nomorHpInput, setNomorHpInput] = useState('');
  const [pesanPerkenalanInput, setPesanPerkenalanInput] = useState('');
  const [galatNomorHp, setGalatNomorHp] = useState('');
  const [statusKirimPermintaan, setStatusKirimPermintaan] = useState('');
  const sudahBukaRef = useRef(false);

  const daftarQ = useDaftarPercakapan({ refetchInterval: 5000 });
  const permintaanQ = useDaftarPermintaanKontak({ refetchInterval: 5000 });
  const bukaMutasi = useBukaPercakapan();
  const kirimPermintaanMutasi = useKirimPermintaanKontak();
  const terimaPermintaanMutasi = useTerimaPermintaanKontak();
  const tolakPermintaanMutasi = useTolakPermintaanKontak();
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

  async function tanganiMulaiChatNomor(e: React.FormEvent) {
    e.preventDefault();
    setGalatNomorHp('');
    setStatusKirimPermintaan('');
    const norm = normalisasiNomorHp(nomorHpInput);
    if (!norm.ok) {
      setGalatNomorHp('Nomor ini belum bisa dihubungi lewat Tani Muda');
      return;
    }
    try {
      const res = await kirimPermintaanMutasi.mutateAsync({
        nomor_hp: norm.nilai,
        pesan: pesanPerkenalanInput.trim() || undefined,
      });

      if (res.percakapan_id || res.status === 'sudah_terhubung' || res.status === 'diterima') {
        const idBuka = res.percakapan_id ?? res.id;
        setDialogNomorBuka(false);
        void daftarQ.refetch();
        void permintaanQ.refetch();
        if (idBuka) {
          navigate(`${location.pathname}?id=${encodeURIComponent(idBuka)}`, { replace: true });
        }
      } else {
        setStatusKirimPermintaan(
          res.pesan || 'Permintaan kontak berhasil dikirim. Obrolan akan aktif setelah diterima.',
        );
        void permintaanQ.refetch();
        setTimeout(() => {
          setDialogNomorBuka(false);
          setStatusKirimPermintaan('');
        }, 1800);
      }
    } catch (err) {
      const pesanGalat = err instanceof Error ? err.message : 'Nomor ini belum bisa dihubungi lewat Tani Muda';
      setGalatNomorHp(pesanGalat);
    }
  }

  async function tanganiTerimaPermintaan(id: string) {
    try {
      const res = await terimaPermintaanMutasi.mutateAsync(id);
      void daftarQ.refetch();
      void permintaanQ.refetch();
      if (res?.id) {
        navigate(`${location.pathname}?id=${encodeURIComponent(res.id)}`);
      }
    } catch {
      // Abaikan bila ada galat jaringan
    }
  }

  async function tanganiTolakPermintaan(id: string) {
    try {
      await tolakPermintaanMutasi.mutateAsync(id);
      void permintaanQ.refetch();
    } catch {
      // Abaikan bila ada galat jaringan
    }
  }

  function pilihPercakapan(p: Percakapan) {
    navigate(`${location.pathname}?id=${encodeURIComponent(p.id)}`);
  }

  if (daftarQ.isLoading && !percakapanDipilih) {
    return <Memuat />;
  }

  const permintaanMasuk = permintaanQ.data?.masuk ?? [];
  const permintaanKeluarMenunggu = (permintaanQ.data?.keluar ?? []).filter(
    (x) => x.status === 'menunggu',
  );

  // Tampilan Daftar Percakapan
  const panelDaftar = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-garis pb-2">
        <div>
          <h2 className="m-0 text-judul-bagian font-semibold text-teks">Percakapan</h2>
          <span className="text-keterangan text-teks-pendukung">{daftar.length} kontak</span>
        </div>
        <button
          id="tombol-chat-nomor-hp"
          type="button"
          onClick={() => {
            setDialogNomorBuka(true);
            setNomorHpInput('');
            setPesanPerkenalanInput('');
            setGalatNomorHp('');
            setStatusKirimPermintaan('');
          }}
          className="fokus-cincin inline-flex items-center gap-1.5 rounded-full border border-daun-tua bg-putih px-4 py-2 text-isi font-semibold text-daun-tua hover:bg-daun-lembut shadow-kartu transition-all"
        >
          <Ikon nama="tambah" ukuran={16} />
          <span>Tambah kontak / nomor HP</span>
        </button>
      </div>

      {/* Bagian Permintaan Kontak Masuk (Jika Ada) */}
      {permintaanMasuk.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-daun-tua/40 bg-daun-lembut/60 p-3.5 shadow-kartu">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-daun-tua text-putih">
                <Ikon nama="lonceng" ukuran={14} />
              </span>
              <span className="text-isi font-semibold text-daun-tua">
                Permintaan Kontak Masuk ({permintaanMasuk.length})
              </span>
            </div>
            <span className="text-keterangan font-medium text-daun-tua">Perlu respon</span>
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            {permintaanMasuk.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-2xl border border-garis bg-putih p-3.5 shadow-kartu"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar nama={item.pemohon?.nama ?? 'Pemohon'} ukuran={40} />
                    <div>
                      <p className="m-0 font-semibold text-teks text-isi">
                        {item.pemohon?.nama ?? 'Pengguna Tani Muda'}
                      </p>
                      <span className="capitalize text-keterangan text-teks-pendukung">
                        · {item.pemohon?.peran ?? 'Pengguna'}
                      </span>
                    </div>
                  </div>
                  <span className="text-keterangan text-teks-pendukung flex-none">
                    {formatWaktuPesan(item.dibuat_pada)}
                  </span>
                </div>

                {item.pesan ? (
                  <p className="m-0 rounded-xl bg-embun-pagi px-3 py-2 text-keterangan italic text-teks">
                    "{item.pesan}"
                  </p>
                ) : null}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={tolakPermintaanMutasi.isPending}
                    onClick={() => void tanganiTolakPermintaan(item.id)}
                    className="fokus-cincin inline-flex items-center gap-1 rounded-full border border-garis bg-putih px-3.5 py-1.5 text-keterangan font-semibold text-teks-pendukung hover:bg-embun-pagi transition-colors"
                  >
                    <Ikon nama="silang" ukuran={14} />
                    <span>Tolak</span>
                  </button>
                  <button
                    type="button"
                    disabled={terimaPermintaanMutasi.isPending}
                    onClick={() => void tanganiTerimaPermintaan(item.id)}
                    className="fokus-cincin inline-flex items-center gap-1 rounded-full bg-daun-tua px-3.5 py-1.5 text-keterangan font-semibold text-putih hover:bg-daun-tekan shadow-kartu transition-colors"
                  >
                    <Ikon nama="centang" ukuran={14} />
                    <span>Terima</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Indikator Permintaan Terkirim yang Sedang Menunggu */}
      {permintaanKeluarMenunggu.length > 0 ? (
        <div className="flex items-center gap-2 rounded-2xl border border-garis bg-putih px-4 py-2.5 text-keterangan text-teks-pendukung shadow-kartu">
          <span className="text-oranye">
            <Ikon nama="jam" ukuran={15} />
          </span>
          <span>
            {permintaanKeluarMenunggu.length} permintaan kontak terkirim sedang menunggu respon penerima.
          </span>
        </div>
      ) : null}

      {daftar.length === 0 && permintaanMasuk.length === 0 ? (
        <Kartu judul="Belum ada pesan" tingkatJudul={3}>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-daun-lembut text-daun-tua">
              <Ikon nama="chat" ukuran={24} />
            </div>
            <p className="m-0 font-medium text-teks">Belum ada obrolan aktif</p>
            <p className="m-0 max-w-sm text-keterangan text-teks-pendukung">
              Mulai percakapan dengan petani lewat peta sekitar, atau tambahkan kontak lewat nomor HP untuk mengirim permintaan obrolan.
            </p>
          </div>
        </Kartu>
      ) : (
        <div className="flex flex-col gap-2.5">
          {daftar.map((p) => {
            const aktif = p.id === percakapanDipilih;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => pilihPercakapan(p)}
                className={`fokus-cincin flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
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
    <div className="flex h-panel flex-col overflow-hidden rounded-3xl border border-garis bg-putih shadow-kartu">
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
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-isi leading-relaxed shadow-kartu ${
                    saya
                      ? 'rounded-br-xs bg-daun-tua text-putih'
                      : 'rounded-bl-xs border border-garis bg-putih text-teks'
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
          className="fokus-cincin flex-1 rounded-full border border-garis bg-embun-pagi px-5 py-2.5 text-isi text-teks outline-none placeholder:text-teks-pendukung focus:border-daun-tua focus:bg-putih"
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
    <div className="flex h-panel flex-col items-center justify-center rounded-3xl border border-garis bg-putih p-6 text-center text-teks-pendukung shadow-kartu">
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

      <Dialog
        terbuka={dialogNomorBuka}
        onTutup={() => setDialogNomorBuka(false)}
        judul="Tambah Kontak / Chat Nomor HP"
        keterangan="Kirim permintaan kontak ke pengguna lewat nomor HP. Lawan bicara akan menerima notifikasi dan tombol untuk menyetujui permintaan Anda."
      >
        <form onSubmit={(e) => void tanganiMulaiChatNomor(e)} className="flex flex-col gap-4">
          {statusKirimPermintaan ? (
            <div className="flex items-center gap-2 rounded-xl border border-daun/40 bg-daun-lembut p-3 text-isi text-daun-tua">
              <span className="flex-none">
                <Ikon nama="centang" ukuran={18} />
              </span>
              <span>{statusKirimPermintaan}</span>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="masukan-nomor-hp-chat" className="text-isi font-semibold text-teks">
              Nomor HP Lawan Bicara
            </label>
            <input
              id="masukan-nomor-hp-chat"
              type="tel"
              value={nomorHpInput}
              onChange={(e) => setNomorHpInput(e.target.value)}
              placeholder="Contoh: 0812-3456-7890"
              autoFocus
              className="fokus-cincin rounded-xl border border-garis bg-putih px-3.5 py-2.5 text-isi text-teks outline-none placeholder:text-teks-pendukung"
            />
            {galatNomorHp ? (
              <p role="alert" className="m-0 text-keterangan font-medium text-merah">
                {galatNomorHp}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="masukan-pesan-pengantar" className="text-isi font-semibold text-teks">
              Pesan Perkenalan <span className="font-normal text-teks-pendukung">(opsional)</span>
            </label>
            <textarea
              id="masukan-pesan-pengantar"
              rows={2}
              value={pesanPerkenalanInput}
              onChange={(e) => setPesanPerkenalanInput(e.target.value)}
              placeholder="Contoh: Halo, saya tertarik berdiskusi mengenai ketersediaan komoditas Anda..."
              className="fokus-cincin rounded-xl border border-garis bg-putih px-3.5 py-2 text-isi text-teks outline-none placeholder:text-teks-pendukung resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Tombol
              type="button"
              varian="sekunder"
              onClick={() => setDialogNomorBuka(false)}
            >
              Batal
            </Tombol>
            <Tombol
              id="tombol-kirim-buka-nomor"
              type="submit"
              varian="utama"
              disabled={!nomorHpInput.trim() || kirimPermintaanMutasi.isPending}
            >
              {kirimPermintaanMutasi.isPending ? 'Mengirim...' : 'Kirim Permintaan'}
            </Tombol>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
