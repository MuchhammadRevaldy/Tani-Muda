/**
 * Kiriman saya (papan 33; T4.21, PRD P0-25, US-14): kiriman hari ini dengan tahap uang (Uang muka
 * ditahan → Menunggu konfirmasi → Dana cair), foto kualitas wajib sebelum ditandai dikirim, lalu
 * daftar berikutnya dan sebelumnya (termasuk sebagian ditolak). Kelompok dari `kelompokKiriman`.
 * Desktop: kiriman hari ini di kiri, berikutnya dan sebelumnya di kanan.
 */
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import {
  useKirimanSaya,
  useKonfigurasi,
  usePesananUntukPetaniBanyak,
  useTandaiDikirim,
  useUnggahBerkas,
  useUnggahFotoKualitas,
} from '../../api/kueri';
import { useHariIni, useSesi } from '../../api/sesi';
import type { Konfigurasi, Pengiriman, PesananUntukPetani } from '../../api/tipe';
import { AmbilFoto } from '../../komponen/ambil-foto';
import { ChipStatus } from '../../komponen/chip-status';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon, type NamaIkon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { PesanKolom } from '../../komponen/kolom-isian';
import { DaftarSyarat } from '../../komponen/pelengkap';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { bulatkanRupiah, formatJam, formatRupiah, formatTanggal } from '../../lib/format';
import { kelompokKiriman, tahapUang } from '../../lib/pesanan-tampil';
import { jamLokal, ZONA_BAWAAN } from '../../lib/zona-waktu';
import { teksPesanan as t } from '../../teks/pesanan';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { KerangkaPesanan, useKomoditasPeta } from './kerangka-pesanan';

interface KirimanLengkap {
  x: Pengiriman;
  p: PesananUntukPetani;
  /** Kiriman pertama dari alokasi ini (ke terkecil). */
  pertama: boolean;
}

/** Jumlah butir awal daftar Berikutnya dan Sebelumnya. */
const BATAS_DAFTAR = 3;

const nilaiKiriman = (x: Pengiriman) => bulatkanRupiah(x.jumlah_kg * x.harga_per_kg);

function TahapUang({
  x,
  jamPeriksa,
  jamBatas,
}: {
  x: Pengiriman;
  jamPeriksa: number;
  jamBatas: string | null;
}) {
  const tahap = tahapUang(x.status);
  if (tahap === null) return null;
  const langkah: { ikon: NamaIkon; judul: string; ket: string }[] = [
    { ikon: 'kunci', judul: t.tahap1, ket: t.tahap1Ket },
    {
      ikon: 'jam-pasir',
      judul: t.tahap2,
      ket: jamBatas ? t.tahap2Sampai(jamBatas) : t.tahap2Ket,
    },
    {
      ikon: 'uang',
      judul: t.tahap3(x.nilai_diterima ?? nilaiKiriman(x)),
      ket: t.tahap3Ket(jamPeriksa),
    },
  ];
  return (
    <ol aria-label={t.tahapLabel} className="m-0 grid list-none grid-cols-3 gap-1 p-0">
      {langkah.map((l, i) => {
        const aktif = i === tahap;
        const lewat = i < tahap;
        return (
          <li
            key={l.judul}
            aria-current={aktif ? 'step' : undefined}
            className="relative flex flex-col items-center gap-1 text-center"
          >
            {i > 0 ? (
              <span
                aria-hidden="true"
                className={cx(
                  'absolute right-1/2 top-5 h-0.5 w-full',
                  lewat || aktif ? 'bg-daun-tua' : 'bg-garis',
                )}
              />
            ) : null}
            <span
              className={cx(
                'relative grid h-10 w-10 place-items-center rounded-full border-2',
                aktif
                  ? i === 2
                    ? 'border-daun-tua bg-daun-tua text-putih'
                    : 'border-tanah bg-tanah text-putih'
                  : lewat
                    ? 'border-daun-tua bg-daun-lembut text-daun-tua'
                    : 'border-garis-kuat bg-putih text-teks-pendukung',
              )}
            >
              <Ikon nama={lewat ? 'centang' : l.ikon} ukuran={20} />
            </span>
            <span className={cx('leading-5', aktif ? 'font-semibold' : 'font-medium')}>
              {l.judul}
            </span>
            <span className="text-keterangan text-teks-pendukung">{l.ket}</span>
          </li>
        );
      })}
    </ol>
  );
}

function KartuHariIni({
  d,
  nama,
  hariIni,
  zona,
  konfigurasi,
}: {
  d: KirimanLengkap;
  nama: string;
  hariIni: string;
  zona: string;
  konfigurasi: Konfigurasi;
}) {
  const { x, p } = d;
  const unggah = useUnggahBerkas();
  const simpanFoto = useUnggahFotoKualitas();
  const tandai = useTandaiDikirim();
  const [galat, setGalat] = useState<string | null>(null);
  const jam = (iso: string | null) => {
    if (!iso) return null;
    const j = jamLokal(Date.parse(iso), zona);
    return formatJam(j.jam, j.menit);
  };
  const jamPeriksa =
    p.jenis === 'rutin' ? konfigurasi.jam_periksa_rutin : konfigurasi.jam_periksa_sekali_panen;
  const terlambat = x.status === 'terjadwal' && x.tanggal_jadwal < hariIni;

  async function kirimFoto(dataUrl: string, namaBerkas: string) {
    setGalat(null);
    try {
      const url = (
        await unggah.mutateAsync({ nama: namaBerkas, jenis: 'image/jpeg', isi: dataUrl })
      ).url;
      await simpanFoto.mutateAsync({ id: x.id, foto: url });
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  async function tandaiDikirim() {
    setGalat(null);
    if (!x.foto_kualitas) return setGalat(t.fotoDulu);
    try {
      await tandai.mutateAsync(x.id);
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  const sibuk = unggah.isPending || simpanFoto.isPending;
  return (
    <Kartu
      judul={t.judulKiriman(nama, x.jumlah_kg)}
      keterangan={t.subKiriman(p.nama_pembeli, p.desa_antar, p.alamat_antar, p.jarak_km)}
      kanan={
        terlambat ? (
          <ChipStatus status="terlambat">
            {t.jadwalTerlewat(formatTanggal(x.tanggal_jadwal, { tanpaHari: true }))}
          </ChipStatus>
        ) : null
      }
    >
      <div className="flex flex-col gap-4">
        <TahapUang x={x} jamPeriksa={jamPeriksa} jamBatas={jam(x.batas_periksa_pada)} />
        <div className="flex flex-col gap-3 border-t border-garis pt-4">
          {x.status === 'terjadwal' ? (
            <div className="flex flex-col gap-0.5">
              <h3 className="m-0 font-semibold">{t.fotoJudul}</h3>
              <p className="m-0 text-keterangan text-teks-pendukung">{t.fotoKet}</p>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            {x.foto_kualitas ? (
              <img
                src={x.foto_kualitas}
                alt={t.fotoKualitasAlt(nama.toLowerCase())}
                className="aspect-foto w-full rounded-md border border-garis bg-daun-lembut object-cover"
              />
            ) : null}
            {x.status === 'terjadwal' ? (
              <AmbilFoto
                label={x.foto_kualitas ? t.gantiFoto : t.ambilFoto}
                labelMemuat={t.memprosesFoto}
                onFoto={(f) => void kirimFoto(f.dataUrl, f.nama)}
                onGagal={() => setGalat(t.fotoGagal)}
                className={cx('aspect-foto', !x.foto_kualitas && 'col-span-2')}
              />
            ) : null}
          </div>
          <DaftarSyarat butir={p.standar_kualitas} />
          {x.status === 'dikirim' ? (
            <p className="m-0 text-keterangan text-teks-pendukung">
              {t.sudahDikirim(jam(x.dikirim_pada) ?? '', jam(x.batas_periksa_pada) ?? '')}
            </p>
          ) : null}
          {galat ? <PesanKolom id={`galat-${x.id}`} galat={galat} /> : null}
          {x.status === 'terjadwal' ? (
            <>
              {!x.foto_kualitas ? (
                <p className="m-0 text-keterangan text-teks-pendukung">{t.fotoDulu}</p>
              ) : null}
              <Tombol
                penuh
                ikon="centang"
                disabled={!x.foto_kualitas || tandai.isPending || sibuk}
                onClick={() => void tandaiDikirim()}
              >
                {tandai.isPending ? t.mengirim : t.tandaiDikirim}
              </Tombol>
            </>
          ) : null}
        </div>
      </div>
    </Kartu>
  );
}

function BarisKiriman({ d, nama }: { d: KirimanLengkap; nama: string }) {
  const { x, p } = d;
  const selesai = x.status === 'diterima' || x.status === 'ditolak_sebagian';
  const ditolak = x.jumlah_ditolak_kg > 0;
  let ket: string;
  if (x.status === 'gagal') ket = `${t.judulKiriman(nama, x.jumlah_kg)} · ${t.gagalPanen}`;
  else if (selesai)
    ket = ditolak
      ? t.diterimaSebagian(nama, Math.round((x.jumlah_kg - x.jumlah_ditolak_kg) * 100) / 100)
      : `${t.judulKiriman(nama, x.jumlah_kg)} · ${t.diterimaSemua}`;
  else
    ket = [t.judulKiriman(nama, x.jumlah_kg), p.nama_pembeli, d.pertama ? t.kirimanPertama : null]
      .filter(Boolean)
      .join(' · ');
  return (
    <li className="flex flex-col gap-1.5 border-b border-garis py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">{formatTanggal(x.tanggal_jadwal)}</span>
        {x.status !== 'gagal' ? (
          <span className="font-semibold text-tanah tabular-nums">
            {formatRupiah(selesai ? (x.nilai_diterima ?? 0) : nilaiKiriman(x))}
          </span>
        ) : null}
      </div>
      <span className="text-teks-pendukung">{ket}</span>
      {selesai && ditolak ? (
        <span className="flex items-start gap-1.5 font-medium text-tomat">
          <Ikon nama="peringatan" ukuran={20} className="mt-0.5" />
          {t.ditolak(
            x.jumlah_ditolak_kg,
            t.alasanTolak(x.alasan_penolakan, x.keterangan_penolakan),
          )}
        </span>
      ) : null}
      {x.status !== 'gagal' ? (
        <span>
          <ChipStatus status={selesai ? 'dana-cair' : 'uang-muka-ditahan'} />
        </span>
      ) : null}
    </li>
  );
}

/** Daftar kiriman yang mula-mula hanya menampilkan beberapa butir teratas. */
function DaftarRingkas({
  butir,
  nama,
}: {
  butir: KirimanLengkap[];
  nama: (d: KirimanLengkap) => string;
}) {
  const [semua, setSemua] = useState(false);
  const tampil = semua ? butir : butir.slice(0, BATAS_DAFTAR);
  return (
    <Kartu>
      <ul className="m-0 list-none p-0">
        {tampil.map((d) => (
          <BarisKiriman key={d.x.id} d={d} nama={nama(d)} />
        ))}
      </ul>
      {butir.length > BATAS_DAFTAR ? (
        <Tombol varian="sekunder" penuh className="mt-3" onClick={() => setSemua(!semua)}>
          {semua ? t.tampilkanSedikit : t.tampilkanSemua(butir.length)}
        </Tombol>
      ) : null}
    </Kartu>
  );
}

function Bagian({ judul, children }: { judul: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3" aria-label={judul}>
      <h2 className="m-0 text-judul-bagian font-semibold">{judul}</h2>
      {children}
    </section>
  );
}

export function HalamanKirimanSaya() {
  const lebar = useLayarLebar();
  const hariIni = useHariIni();
  const { akun } = useSesi();
  const zona = akun?.pengguna.zona_waktu ?? ZONA_BAWAAN;
  const k = useKomoditasPeta();
  const kirimanQ = useKirimanSaya();
  const konfigurasiQ = useKonfigurasi();
  const idPesanan = [...new Set((kirimanQ.data ?? []).map((x) => x.pesanan_id))];
  const pesananQ = usePesananUntukPetaniBanyak(idPesanan);

  let isi: ReactNode;
  if (kirimanQ.isError) isi = <p className="m-0 text-teks-pendukung">{teksUmum.galatIsi}</p>;
  else if (!kirimanQ.data || !konfigurasiQ.data || !pesananQ.data) isi = <Memuat />;
  else if (!kirimanQ.data.length)
    isi = (
      <section className="flex flex-col items-start gap-3 rounded-lg border border-garis bg-putih p-4 lg:max-w-dialog">
        <h2 className="m-0 text-judul-bagian font-semibold">{t.kirimanKosongJudul}</h2>
        <p className="m-0 text-teks-pendukung">{t.kirimanKosongIsi}</p>
        <Link to="/pesanan" className={kelasTombol('sekunder')}>
          {t.lihatDiSekitar}
        </Link>
      </section>
    );
  else {
    const pesanan = new Map(pesananQ.data.map((p) => [p.id, p]));
    const pertamaKe = new Map<string, number>();
    for (const x of kirimanQ.data)
      pertamaKe.set(x.alokasi_id, Math.min(pertamaKe.get(x.alokasi_id) ?? Infinity, x.ke));
    const lengkap: (KirimanLengkap & { tanggal_jadwal: string; status: Pengiriman['status'] })[] =
      kirimanQ.data.flatMap((x) => {
        const p = pesanan.get(x.pesanan_id);
        return p
          ? [
              {
                x,
                p,
                pertama: pertamaKe.get(x.alokasi_id) === x.ke,
                tanggal_jadwal: x.tanggal_jadwal,
                status: x.status,
              },
            ]
          : [];
      });
    const g = kelompokKiriman(lengkap, hariIni);
    const konfigurasi = konfigurasiQ.data;
    const nama = (d: KirimanLengkap) => k.nama(d.p.komoditas_id);
    const hariIniEl = (
      <Bagian judul={t.hariIni(formatTanggal(hariIni))}>
        {g.hariIni.length ? (
          g.hariIni.map((d) => (
            <KartuHariIni
              key={d.x.id}
              d={d}
              nama={nama(d)}
              hariIni={hariIni}
              zona={zona}
              konfigurasi={konfigurasi}
            />
          ))
        ) : (
          <p className="m-0 rounded-lg border border-garis bg-putih p-4 text-teks-pendukung">
            {t.tidakAdaHariIni}
          </p>
        )}
      </Bagian>
    );
    const daftar = (judul: string, butir: KirimanLengkap[]) =>
      butir.length ? (
        <Bagian judul={judul}>
          <DaftarRingkas butir={butir} nama={nama} />
        </Bagian>
      ) : null;
    const samping = (
      <>
        {daftar(t.berikutnya, g.berikutnya)}
        {daftar(t.sebelumnya, g.sebelumnya)}
      </>
    );
    isi = lebar ? (
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">{hariIniEl}</div>
        <div className="flex w-dialog flex-none flex-col gap-6">{samping}</div>
      </div>
    ) : (
      <div className="flex flex-col gap-6">
        {hariIniEl}
        {samping}
      </div>
    );
  }

  return <KerangkaPesanan>{isi}</KerangkaPesanan>;
}
