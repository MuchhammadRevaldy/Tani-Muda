/**
 * Periksa kiriman (papan 38; T4.25, PRD P0-25, P0-26, US-17). Foto dari petani (hasil panen dan
 * timbangan), hasil pemeriksaan (terima semua atau tolak sebagian dengan berat, alasan D-14, catatan,
 * foto bukti), rincian pembayaran kiriman dari `konfirmasiKiriman` (pratinjau; server menghitung
 * final), batas periksa sesuai jenis pesanan (D-01). Penolakan sebagian membuat sengketa untuk admin.
 * Sesudah dikonfirmasi: ringkasan, rating (T4.26), dan "Pesan lagi".
 * HP diturunkan dari papan desktop (D-07): rincian pembayaran dan tombol di bawah pemeriksaan.
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import {
  kunciIdempotenBaru,
  useKiriman,
  useKonfigurasi,
  useKonfirmasiKiriman,
  usePesananPembeli,
  useUnggahBerkas,
} from '../../api/kueri';
import { useSesi } from '../../api/sesi';
import type { AlasanPenolakan, Konfigurasi, Pengiriman, PesananDenganKebun } from '../../api/tipe';
import { AmbilFoto, type FotoKecil } from '../../komponen/ambil-foto';
import { Banner } from '../../komponen/banner';
import { ChipStatus } from '../../komponen/chip-status';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { KolomIsian, PesanKolom } from '../../komponen/kolom-isian';
import { GrupRadio, KartuPilihan, PilPilihan } from '../../komponen/pilihan';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { bulatkanRupiah, formatJam, formatTanggal, parseAngka } from '../../lib/format';
import { konfirmasiKiriman, type KeputusanKiriman } from '../../lib/kiriman';
import { jamLokal, tanggalLokal, ZONA_BAWAAN } from '../../lib/zona-waktu';
import { teksGalat } from '../../teks/galat';
import { teksPembeli as t } from '../../teks/pembeli';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { BeriRating } from '../pesanan/beri-rating';
import { useKomoditasPeta } from '../pesanan/kerangka-pesanan';

const ALASAN: AlasanPenolakan[] = [
  'layu_atau_busuk',
  'jumlah_kurang',
  'tidak_sesuai_standar',
  'lainnya',
];

function useWaktu() {
  const { akun } = useSesi();
  const zona = akun?.pengguna.zona_waktu ?? ZONA_BAWAAN;
  return {
    jam: (iso: string | null) => {
      if (!iso) return '';
      const j = jamLokal(Date.parse(iso), zona);
      return formatJam(j.jam, j.menit);
    },
    tanggal: (iso: string | null) =>
      iso ? formatTanggal(tanggalLokal(Date.parse(iso), zona)) : '',
  };
}

function Foto({ src, alt, judul }: { src: string; alt: string; judul: string }) {
  return (
    <figure className="m-0 flex flex-col gap-1">
      <img
        src={src}
        alt={alt}
        className="aspect-foto w-full rounded-md border border-garis bg-daun-lembut object-cover"
      />
      <figcaption>{judul}</figcaption>
    </figure>
  );
}

function Selesai({ x, p, petani }: { x: Pengiriman; p: PesananDenganKebun; petani: string }) {
  const diterima = Math.round((x.jumlah_kg - x.jumlah_ditolak_kg) * 100) / 100;
  return (
    <div className="flex flex-col gap-4 lg:max-w-dialog">
      <section className="flex flex-col items-start gap-3 rounded-lg border-1.5 border-daun-tua bg-daun-lembut p-6">
        <ChipStatus status="dana-cair" />
        <p className="m-0 font-semibold">{t.sudahDikonfirmasi(diterima, x.nilai_diterima ?? 0)}</p>
        {x.dianggap_diterima ? <p className="m-0">{t.dianggapDiterima}</p> : null}
      </section>
      <Kartu>
        <BeriRating
          kirimanId={x.id}
          ratingSaya={x.rating_saya}
          keterangan={t.ratingKetPembeli(petani)}
        />
      </Kartu>
      <div className="flex flex-wrap gap-2">
        <Link to="/pembeli" className={kelasTombol('utama')}>
          {t.lihatPesanan}
        </Link>
        <Link
          to={`/pembeli/pesanan/baru?ulang=${encodeURIComponent(p.id)}`}
          className={kelasTombol('sekunder')}
        >
          {t.pesanLagi}
        </Link>
      </div>
    </div>
  );
}

function Periksa({
  x,
  p,
  komoditas,
  petani,
  konfigurasi,
}: {
  x: Pengiriman;
  p: PesananDenganKebun;
  komoditas: string;
  petani: string;
  konfigurasi: Konfigurasi;
}) {
  const lebar = useLayarLebar();
  const konfirmasi = useKonfirmasiKiriman();
  const unggah = useUnggahBerkas();
  const [keputusan, setKeputusan] = useState<'terima' | 'tolak'>('terima');
  const [beratTeks, setBeratTeks] = useState('');
  const [alasan, setAlasan] = useState<AlasanPenolakan | null>(null);
  const [catatan, setCatatan] = useState('');
  const [foto, setFoto] = useState<FotoKecil | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [kunci] = useState(kunciIdempotenBaru);

  const berat = parseAngka(beratTeks) ?? 0;
  const putusan: KeputusanKiriman =
    keputusan === 'terima'
      ? { jenis: 'terima_semua' }
      : {
          jenis: 'tolak_sebagian',
          jumlahDitolakKg: berat,
          alasan: alasan ?? ('' as AlasanPenolakan),
          keterangan: catatan.trim() || null,
        };
  // Pratinjau: server tahu apakah ini kiriman terakhir dan menghitung angka finalnya.
  const r = konfirmasiKiriman(
    {
      jumlahDikirimKg: x.jumlah_kg,
      hargaPerKg: x.harga_per_kg,
      saldoUangMuka: p.saldo_uang_muka,
      kirimanTerakhir: false,
    },
    putusan,
    konfigurasi.persen_uang_muka,
  );
  const terimaSemua = konfirmasiKiriman(
    {
      jumlahDikirimKg: x.jumlah_kg,
      hargaPerKg: x.harga_per_kg,
      saldoUangMuka: p.saldo_uang_muka,
      kirimanTerakhir: false,
    },
    { jenis: 'terima_semua' },
    konfigurasi.persen_uang_muka,
  );
  const diterimaKg = r.ok ? r.nilai.jumlahDiterimaKg : x.jumlah_kg - berat;

  async function kirim() {
    setGalat(null);
    if (!r.ok) return setGalat(teksGalat[r.galat]);
    try {
      const fotoUrl = foto
        ? (await unggah.mutateAsync({ nama: foto.nama, jenis: foto.jenis, isi: foto.dataUrl })).url
        : null;
      await konfirmasi.mutateAsync({
        id: x.id,
        masukan:
          keputusan === 'terima'
            ? { kunci_idempoten: kunci, keputusan: 'terima_semua' }
            : {
                kunci_idempoten: kunci,
                keputusan: 'tolak_sebagian',
                jumlah_ditolak_kg: berat,
                alasan_penolakan: alasan as AlasanPenolakan,
                keterangan_penolakan: catatan.trim() || null,
                foto_penolakan: fotoUrl,
              },
      });
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  const fotoPetani = (
    <Kartu judul={t.fotoPetani} keterangan={t.fotoPetaniKet} tingkatJudul={2}>
      <div className="grid grid-cols-2 gap-3">
        {x.foto_kualitas ? (
          <Foto
            src={x.foto_kualitas}
            alt={t.fotoHasilAlt(komoditas.toLowerCase())}
            judul={t.fotoHasil}
          />
        ) : null}
        {x.foto_timbangan ? (
          <Foto
            src={x.foto_timbangan}
            alt={t.fotoTimbanganAlt(komoditas.toLowerCase())}
            judul={t.fotoTimbangan}
          />
        ) : null}
      </div>
    </Kartu>
  );

  const pemeriksaan = (
    <Kartu judul={t.hasilPeriksa} tingkatJudul={2}>
      <div className="flex flex-col gap-4">
        <GrupRadio label={t.hasilPeriksa} className="grid gap-2 md:grid-cols-2">
          {(
            [
              [
                'terima',
                t.terimaSemua,
                terimaSemua.ok
                  ? t.terimaSemuaKet(x.jumlah_kg, terimaSemua.nilai.danaCairPetani)
                  : '',
              ],
              ['tolak', t.tolakSebagian, t.tolakSebagianKet],
            ] as const
          ).map(([nilai, judul, ket]) => (
            <KartuPilihan
              key={nilai}
              dipilih={keputusan === nilai}
              onPilih={() => {
                setKeputusan(nilai);
                setGalat(null);
              }}
              labelAksesibel={judul}
            >
              <span className="flex min-h-kontrol flex-col justify-center px-4 py-2">
                <span
                  className={keputusan === nilai ? 'font-semibold text-daun-tua' : 'font-medium'}
                >
                  {judul}
                </span>
                <span className="text-keterangan text-teks-pendukung">{ket}</span>
              </span>
            </KartuPilihan>
          ))}
        </GrupRadio>
        {keputusan === 'tolak' ? (
          <>
            <KolomIsian
              label={t.beratDitolak}
              inputMode="decimal"
              value={beratTeks}
              onChange={(e) => setBeratTeks(e.target.value)}
              akhiran="kg"
              bantuan={berat > 0 && berat < x.jumlah_kg ? t.diterimaKg(diterimaKg) : undefined}
            />
            <div className="flex flex-col gap-2">
              <p className="m-0 font-medium">{t.alasanLabel}</p>
              <PilPilihan<AlasanPenolakan | ''>
                label={t.alasanLabel}
                className="flex-wrap"
                nilai={alasan ?? ''}
                onPilih={(a) => setAlasan(a || null)}
                opsi={ALASAN.map((a) => ({ nilai: a, label: t.alasan(a) }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="catatan-tolak" className="font-medium">
                {t.catatanPetani}
              </label>
              {alasan === 'lainnya' ? (
                <p className="m-0 text-keterangan text-teks-pendukung">{t.catatanWajib}</p>
              ) : null}
              <textarea
                id="catatan-tolak"
                rows={2}
                value={catatan}
                placeholder={t.catatanContoh}
                onChange={(e) => setCatatan(e.target.value)}
                className="fokus-cincin w-full rounded-md border-1.5 border-garis-kuat bg-putih px-4 py-3 text-isi text-teks outline-none placeholder:text-teks-pendukung"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="m-0 font-medium">{t.fotoBukti}</p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {foto ? (
                  <img
                    src={foto.dataUrl}
                    alt={t.fotoBukti}
                    className="aspect-foto w-full rounded-md border border-garis object-cover"
                  />
                ) : null}
                <AmbilFoto
                  label={t.ambilFotoBukti}
                  labelMemuat={t.memprosesFoto}
                  onFoto={setFoto}
                  onGagal={() => setGalat(t.fotoGagal)}
                  className="aspect-foto"
                />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Kartu>
  );

  const pembayaran = (
    <div className="flex flex-col gap-4">
      <Kartu
        judul={t.pembayaranKiriman}
        keterangan={t.hargaKg(komoditas, x.harga_per_kg)}
        tingkatJudul={2}
        nadaKaki="uang"
        kaki={
          r.ok ? (
            <Uang
              nilai={r.nilai.danaCairPetani}
              label={t.danaCairKe(petani)}
              keterangan={t.setelahKonfirmasi}
              besar
            />
          ) : undefined
        }
      >
        {r.ok ? (
          <dl className="m-0 flex flex-col gap-3">
            <div className="flex justify-between gap-3">
              <dt>{t.barisDiterima(r.nilai.jumlahDiterimaKg)}</dt>
              <dd className="m-0">
                <Uang nilai={r.nilai.danaCairPetani} />
              </dd>
            </div>
            {r.nilai.jumlahDitolakKg > 0 ? (
              <div className="flex justify-between gap-3">
                <dt>{t.barisDitolak(r.nilai.jumlahDitolakKg)}</dt>
                <dd className="m-0 text-teks-pendukung">
                  {t.tidakDibayar(bulatkanRupiah(r.nilai.jumlahDitolakKg * x.harga_per_kg))}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-3 border-t border-garis pt-3">
              <dt>{t.andaBayar(100 - konfigurasi.persen_uang_muka)}</dt>
              <dd className="m-0">
                <Uang nilai={r.nilai.dibayarPembeli} />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>{t.dariUangMuka(konfigurasi.persen_uang_muka)}</dt>
              <dd className="m-0">
                <Uang nilai={r.nilai.dariUangMuka} />
              </dd>
            </div>
          </dl>
        ) : (
          <p className="m-0 text-teks-pendukung">{t.tolakSebagianKet}</p>
        )}
      </Kartu>
      {keputusan === 'tolak' ? (
        <p className="m-0 text-keterangan text-teks-pendukung">{t.tolakKet(petani)}</p>
      ) : null}
      {galat ? <PesanKolom id="galat-konfirmasi" galat={galat} /> : null}
      <Tombol
        penuh
        ikon="centang"
        disabled={konfirmasi.isPending || unggah.isPending}
        onClick={() => void kirim()}
      >
        {konfirmasi.isPending ? t.mengonfirmasi : t.konfirmasiTerima(diterimaKg)}
      </Tombol>
    </div>
  );

  return lebar ? (
    <div className="flex items-start gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {fotoPetani}
        {pemeriksaan}
      </div>
      <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4">{pembayaran}</aside>
    </div>
  ) : (
    <>
      {fotoPetani}
      {pemeriksaan}
      {pembayaran}
    </>
  );
}

export function HalamanKonfirmasiKiriman() {
  const { id } = useParams();
  const kirimanQ = useKiriman(id ?? null);
  const pesananQ = usePesananPembeli();
  const konfigurasiQ = useKonfigurasi();
  const k = useKomoditasPeta();
  const w = useWaktu();
  if (kirimanQ.isError) return <p className="m-0 text-teks-pendukung">{teksUmum.galatIsi}</p>;
  if (!kirimanQ.data || !pesananQ.data || !konfigurasiQ.data) return <Memuat />;
  const x = kirimanQ.data;
  const p = pesananQ.data.find((y) => y.id === x.pesanan_id);
  if (!p) return <p className="m-0 text-teks-pendukung">{teksUmum.galatIsi}</p>;
  const kebun = p.kebun.find((y) => y.alokasi_id === x.alokasi_id);
  const petani = kebun?.nama_petani ?? '';
  const komoditas = k.nama(p.komoditas_id);
  const selesai = x.status === 'diterima' || x.status === 'ditolak_sebagian';

  return (
    <>
      <div className="flex flex-col gap-3">
        <Link
          to="/pembeli"
          className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
        >
          <Ikon nama="panah-kiri" ukuran={20} />
          <span>{t.kembaliDasbor}</span>
        </Link>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-judul-halaman font-semibold">
              {t.judulPeriksa(komoditas.toLowerCase())}
            </h1>
            {x.status === 'dikirim' ? <ChipStatus status="menunggu-konfirmasi" /> : null}
          </div>
          <p className="m-0 text-keterangan text-teks-pendukung">
            {t.subPeriksa(
              petani,
              kebun?.desa ?? '',
              x.ke,
              p.jumlah_kiriman,
              `${w.tanggal(x.dikirim_pada)} pukul ${w.jam(x.dikirim_pada)}`,
            )}
          </p>
        </div>
      </div>
      {x.status === 'dikirim' ? (
        <Banner judul={t.periksaSebelum(w.jam(x.batas_periksa_pada))}>{t.periksaSebelumKet}</Banner>
      ) : null}
      {selesai ? (
        <Selesai x={x} p={p} petani={petani} />
      ) : x.status === 'dikirim' ? (
        <Periksa
          x={x}
          p={p}
          komoditas={komoditas}
          petani={petani}
          konfigurasi={konfigurasiQ.data}
        />
      ) : (
        <p className="m-0 text-teks-pendukung">{t.belumDikirim}</p>
      )}
    </>
  );
}
