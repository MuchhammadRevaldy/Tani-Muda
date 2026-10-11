/**
 * Buat pesanan (papan 37; T4.23 rutin dan T4.24 sekali panen, PRD P0-19, P0-02, US-15, US-30).
 * Komoditas hanya yang punya panduan tanam (P0-19; papan menampilkan Selada dan Pakcoy yang belum
 * punya resep, PRD berlaku). Ringkasan biaya dari `hitungNilaiPesanan` (pratinjau; server menghitung
 * ulang, D-08). Pembeli belum terverifikasi: tombol nonaktif dengan penjelasan (T4.28).
 * Desktop: formulir di kiri, ringkasan biaya dan tombol di panel kanan. `?ulang=<id>` mengisi dari
 * pesanan sebelumnya ("Pesan lagi", T4.26).
 */
import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import {
  useBuatPesanan,
  useDaftarResep,
  useKomoditas,
  useKonfigurasi,
  usePesananPembeli,
  useWilayahSatu,
} from '../../api/kueri';
import { konfigurasiKeDomain } from '../../api/peta';
import { useHariIni, useSesi } from '../../api/sesi';
import type { Komoditas, Konfigurasi, PesananDenganKebun, ProfilPembeli } from '../../api/tipe';
import { Ikon } from '../../komponen/ikon';
import { InputRupiah } from '../../komponen/input-rupiah';
import { Kartu } from '../../komponen/kartu';
import { KolomIsian, kelasBingkai, kelasInput, PesanKolom } from '../../komponen/kolom-isian';
import { GrupRadio, KartuPilihan } from '../../komponen/pilihan';
import { Tombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { useLayarLebar } from '../../komponen/use-layar-lebar';
import { formatBulan, formatTanggal, parseAngka } from '../../lib/format';
import { jumlahKirimanRutin, hitungNilaiPesanan } from '../../lib/pesanan-nilai';
import { kirimanPertamaPalingCepat, pilihanBulanPanen } from '../../lib/pesanan-pembeli';
import { teksPembeli as t } from '../../teks/pembeli';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { StatusVerifikasi } from './status-verifikasi';

type Jenis = 'rutin' | 'sekali_panen';
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const LAMA = [1, 2, 3] as const;

/** Pilihan radio berbentuk kartu dengan bulatan, seperti papan 37. */
function OpsiKartu({
  dipilih,
  onPilih,
  judul,
  ket,
}: {
  dipilih: boolean;
  onPilih: () => void;
  judul: string;
  ket?: string;
}) {
  return (
    <KartuPilihan
      dipilih={dipilih}
      onPilih={onPilih}
      labelAksesibel={ket ? `${judul}, ${ket}` : judul}
    >
      <span className="flex min-h-kontrol items-center gap-3 px-4 py-2">
        <span
          aria-hidden="true"
          className={
            dipilih
              ? 'grid h-5 w-5 flex-none place-items-center rounded-full border-2 border-daun-tua'
              : 'h-5 w-5 flex-none rounded-full border-1.5 border-garis-kuat bg-putih'
          }
        >
          {dipilih ? <span className="h-2.5 w-2.5 rounded-full bg-daun-tua" /> : null}
        </span>
        <span className="flex flex-col">
          <span className={dipilih ? 'font-semibold text-daun-tua' : 'font-medium'}>{judul}</span>
          {ket ? <span className="text-keterangan text-teks-pendukung">{ket}</span> : null}
        </span>
      </span>
    </KartuPilihan>
  );
}

function Pilihan({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="m-0 font-medium">{label}</p>
      <GrupRadio label={label} className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {children}
      </GrupRadio>
    </div>
  );
}

function Formulir({
  komoditas,
  konfigurasi,
  profil,
  desa,
  ulang,
  jenisAwal,
}: {
  komoditas: Komoditas[];
  konfigurasi: Konfigurasi;
  profil: ProfilPembeli;
  desa: string;
  ulang: PesananDenganKebun | null;
  jenisAwal: Jenis;
}) {
  const lebar = useLayarLebar();
  const navigate = useNavigate();
  const hariIni = useHariIni();
  const buat = useBuatPesanan();
  const [jenis, setJenis] = useState<Jenis>(ulang?.jenis ?? jenisAwal);
  const [komoditasId, setKomoditasId] = useState(ulang?.komoditas_id ?? komoditas[0]?.id ?? '');
  const [jumlahTeks, setJumlahTeks] = useState(
    String(ulang?.jumlah_per_kiriman_kg ?? ulang?.jumlah_total_kg ?? ''),
  );
  const [hariKirim, setHariKirim] = useState(1);
  const [jam, setJam] = useState(ulang?.batas_jam_antar ?? '07:00');
  const [frek, setFrek] = useState<7 | 14>(ulang?.frekuensi_hari === 14 ? 14 : 7);
  const [bulanLama, setBulanLama] = useState<1 | 2 | 3>(3);
  const [harga, setHarga] = useState<number | null>(ulang?.harga_per_kg ?? null);
  const [standarPilihan, setStandarPilihan] = useState<string[] | null>(
    ulang ? [...ulang.standar_kualitas] : null,
  );
  const [syaratBaru, setSyaratBaru] = useState('');
  const [tambahan, setTambahan] = useState<string[]>([]);
  const [alamat, setAlamat] = useState(ulang?.alamat_antar ?? profil.alamat);
  const [patokan, setPatokan] = useState(ulang?.patokan ?? '');
  const [galat, setGalat] = useState<Record<string, string>>({});

  const k = komoditas.find((x) => x.id === komoditasId) ?? null;
  const resepQ = useDaftarResep({ komoditas_id: komoditasId || undefined });
  const standarResep = [...new Set((resepQ.data ?? []).flatMap((r) => r.standar_kualitas))];
  const standar = standarPilihan ?? standarResep;
  const bulanPilihan = k ? pilihanBulanPanen(hariIni, k.umur_panen_hari) : [];
  const [bulan, setBulan] = useState<string | null>(ulang?.perkiraan_bulan_panen ?? null);
  const bulanPanen = bulan && bulanPilihan.includes(bulan) ? bulan : (bulanPilihan[0] ?? null);
  const hargaPakai = harga ?? k?.harga_jual_contoh ?? null;
  const jumlah = parseAngka(jumlahTeks);
  const mulai = k ? kirimanPertamaPalingCepat(hariIni, k.umur_panen_hari, hariKirim) : null;
  const durasi = bulanLama * 28;
  const n =
    jenis === 'rutin'
      ? jumlahKirimanRutin(frek, durasi, konfigurasi.maks_durasi_rutin_hari)
      : { ok: true as const, nilai: 1 };
  const nilai =
    jumlah && hargaPakai && n.ok
      ? hitungNilaiPesanan(
          jenis === 'rutin'
            ? {
                jenis: 'rutin',
                jumlahPerKirimanKg: jumlah,
                jumlahKiriman: n.nilai,
                hargaPerKg: hargaPakai,
              }
            : { jenis: 'sekali_panen', jumlahTotalKg: jumlah, hargaPerKg: hargaPakai },
          konfigurasiKeDomain(konfigurasi),
        )
      : null;
  const terverifikasi = profil.status_verifikasi === 'terverifikasi';
  const semuaStandar = [...new Set([...standarResep, ...(standarPilihan ?? []), ...tambahan])];

  function ganti(kId: string) {
    setKomoditasId(kId);
    setStandarPilihan(null);
    setHarga(null);
  }

  async function kirim() {
    const g: Record<string, string> = {};
    if (!jumlah || jumlah <= 0) g.jumlah = t.isiJumlah;
    if (!hargaPakai) g.harga = t.isiHarga;
    if (!alamat.trim()) g.alamat = t.isiAlamatAntar;
    setGalat(g);
    if (Object.keys(g).length || !k || !jumlah || !hargaPakai) return;
    const dasar = {
      komoditas_id: k.id,
      harga_per_kg: hargaPakai,
      standar_kualitas: standar,
      wilayah_id: profil.wilayah_id,
      alamat_antar: alamat.trim(),
      patokan: patokan.trim() || null,
      batas_jam_antar: jam || null,
    };
    try {
      const p = await buat.mutateAsync(
        jenis === 'rutin'
          ? {
              jenis: 'rutin',
              ...dasar,
              jumlah_per_kiriman_kg: jumlah,
              frekuensi_hari: frek,
              durasi_hari: durasi,
              tanggal_mulai: mulai as string,
            }
          : {
              jenis: 'sekali_panen',
              ...dasar,
              jumlah_total_kg: jumlah,
              perkiraan_bulan_panen: bulanPanen as string,
            },
      );
      navigate(`/pembeli/pesanan/${encodeURIComponent(p.id)}/bayar`);
    } catch (e) {
      setGalat({ kirim: adalahGalatApi(e) ? e.message : teksUmum.galatIsi });
    }
  }

  const kartuSayur = (
    <Kartu judul={t.sayurApa} tingkatJudul={2}>
      <div className="flex flex-col gap-4">
        <Pilihan label={t.jenisLabel}>
          <OpsiKartu
            dipilih={jenis === 'rutin'}
            onPilih={() => setJenis('rutin')}
            judul={t.jenisRutin}
            ket={t.jenisRutinKet}
          />
          <OpsiKartu
            dipilih={jenis === 'sekali_panen'}
            onPilih={() => setJenis('sekali_panen')}
            judul={t.jenisSekali}
            ket={t.jenisSekaliKet}
          />
        </Pilihan>
        <Pilihan label={t.komoditasLabel}>
          {komoditas.map((x) => (
            <OpsiKartu
              key={x.id}
              dipilih={x.id === komoditasId}
              onPilih={() => ganti(x.id)}
              judul={x.nama}
            />
          ))}
        </Pilihan>
        <p className="m-0 text-keterangan text-teks-pendukung">
          {k && mulai
            ? jenis === 'rutin'
              ? t.komoditasKet(k.nama, k.umur_panen_hari, formatTanggal(mulai))
              : t.komoditasKet(
                  k.nama,
                  k.umur_panen_hari,
                  bulanPilihan[0] ? formatBulan(bulanPilihan[0], { denganTahun: true }) : '',
                )
            : null}{' '}
          {t.hanyaBerresep}
        </p>
      </div>
    </Kartu>
  );

  const kartuJadwal = (
    <Kartu judul={t.jumlahJadwal} tingkatJudul={2}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <KolomIsian
            label={jenis === 'rutin' ? t.jumlahPerKiriman : t.jumlahTotal}
            inputMode="decimal"
            value={jumlahTeks}
            onChange={(e) => setJumlahTeks(e.target.value)}
            akhiran="kg"
            bantuan={jenis === 'rutin' ? t.jumlahPerKirimanKet : undefined}
            galat={galat.jumlah}
          />
          {jenis === 'rutin' ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="hari-kirim" className="font-medium">
                {t.hariKirim}
              </label>
              <div className={kelasBingkai(false)}>
                <select
                  id="hari-kirim"
                  value={hariKirim}
                  onChange={(e) => setHariKirim(Number(e.target.value))}
                  className={`${kelasInput} cursor-pointer`}
                >
                  {HARI.map((h, i) => (
                    <option key={h} value={i}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <label htmlFor="bulan-panen" className="font-medium">
                {t.bulanPanen}
              </label>
              <div className={kelasBingkai(false)}>
                <select
                  id="bulan-panen"
                  value={bulanPanen ?? ''}
                  onChange={(e) => setBulan(e.target.value)}
                  className={`${kelasInput} cursor-pointer`}
                >
                  {bulanPilihan.map((b) => (
                    <option key={b} value={b}>
                      {formatBulan(b, { denganTahun: true })}
                    </option>
                  ))}
                </select>
              </div>
              <p className="m-0 text-keterangan text-teks-pendukung">{t.bulanPanenKet}</p>
            </div>
          )}
        </div>
        <KolomIsian
          label={t.antarSebelum}
          type="time"
          value={jam}
          onChange={(e) => setJam(e.target.value)}
          bantuan={t.antarSebelumKet}
          className="md:max-w-dialog"
        />
        {jenis === 'rutin' ? (
          <>
            <Pilihan label={t.seberapaSering}>
              <OpsiKartu dipilih={frek === 7} onPilih={() => setFrek(7)} judul={t.semingguSekali} />
              <OpsiKartu
                dipilih={frek === 14}
                onPilih={() => setFrek(14)}
                judul={t.duaMingguSekali}
              />
            </Pilihan>
            <Pilihan label={t.berapaLama}>
              {LAMA.map((b) => {
                const j = jumlahKirimanRutin(frek, b * 28, konfigurasi.maks_durasi_rutin_hari);
                return (
                  <OpsiKartu
                    key={b}
                    dipilih={bulanLama === b}
                    onPilih={() => setBulanLama(b)}
                    judul={t.lamaPilihan(b)}
                    ket={j.ok ? t.jumlahKirimanKet(j.nilai) : undefined}
                  />
                );
              })}
            </Pilihan>
          </>
        ) : null}
      </div>
    </Kartu>
  );

  const kartuHarga = (
    <Kartu judul={t.hargaKualitas} tingkatJudul={2}>
      <div className="flex flex-col gap-4">
        <InputRupiah
          label={t.hargaPerKg}
          nilai={hargaPakai}
          onUbah={setHarga}
          akhiran="/kg"
          bantuan={k?.harga_jual_contoh ? t.hargaContoh(k.harga_jual_contoh) : undefined}
          galat={galat.harga}
          className="md:max-w-dialog"
        />
        <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
          <legend className="mb-1 p-0 font-medium">{t.standarKualitas}</legend>
          {semuaStandar.map((s) => (
            <label key={s} className="flex min-h-sentuh cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={standar.includes(s)}
                onChange={(e) =>
                  setStandarPilihan(
                    e.target.checked ? [...standar, s] : standar.filter((x) => x !== s),
                  )
                }
                className="fokus-cincin h-6 w-6 flex-none cursor-pointer accent-daun-tua"
              />
              <span>{s}</span>
            </label>
          ))}
        </fieldset>
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <KolomIsian
            label={t.syaratBaru}
            placeholder={t.syaratBaruContoh}
            value={syaratBaru}
            onChange={(e) => setSyaratBaru(e.target.value)}
            className="flex-1"
          />
          <Tombol
            varian="sekunder"
            ikon="tambah"
            disabled={!syaratBaru.trim()}
            onClick={() => {
              const s = syaratBaru.trim();
              setTambahan([...tambahan, s]);
              setStandarPilihan([...standar, s]);
              setSyaratBaru('');
            }}
          >
            {t.tambahSyarat}
          </Tombol>
        </div>
      </div>
    </Kartu>
  );

  const kartuTitik = (
    <Kartu judul={jenis === 'rutin' ? t.titikAntar : t.titikAmbil} tingkatJudul={2}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <KolomIsian
            label={jenis === 'rutin' ? t.alamatAntar : t.alamatAmbil}
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            galat={galat.alamat}
          />
          <KolomIsian
            label={t.patokan}
            placeholder={t.patokanContoh}
            value={patokan}
            onChange={(e) => setPatokan(e.target.value)}
          />
        </div>
        <p className="m-0 text-keterangan text-teks-pendukung">
          {t.titikKet(desa, konfigurasi.radius_km)}
        </p>
      </div>
    </Kartu>
  );

  const ringkasan = (
    <div className="flex flex-col gap-4">
      <Kartu
        judul={t.ringkasanBiaya}
        keterangan={k && jumlah && n.ok ? t.ringkasanIsi(k.nama, jumlah, n.nilai) : undefined}
        tingkatJudul={2}
        nadaKaki="uang"
        kaki={
          nilai?.ok ? (
            <div className="flex flex-col gap-3">
              <Uang
                nilai={nilai.nilai.dibayarSekarang}
                label={t.dibayarSekarang}
                keterangan={t.dibayarSekarangKet}
                besar
              />
              <Uang
                nilai={nilai.nilai.nilaiPerKiriman}
                label={t.perKiriman}
                keterangan={t.perKirimanKet}
                besar
              />
            </div>
          ) : undefined
        }
      >
        {nilai?.ok ? (
          <dl className="m-0 flex flex-col gap-3">
            <div className="flex justify-between gap-3">
              <dt>{t.nilaiPesanan}</dt>
              <dd className="m-0">
                <Uang nilai={nilai.nilai.nilaiPesanan} />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="flex flex-col">
                <span>{t.uangMukaPersen(konfigurasi.persen_uang_muka)}</span>
                <span className="text-keterangan text-teks-pendukung">{t.uangMukaKet}</span>
              </dt>
              <dd className="m-0">
                <Uang nilai={nilai.nilai.uangMuka} />
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>{t.biayaLayananPersen(konfigurasi.persen_layanan)}</dt>
              <dd className="m-0">
                <Uang nilai={nilai.nilai.biayaLayanan} />
              </dd>
            </div>
          </dl>
        ) : (
          <p className="m-0 text-teks-pendukung">{t.isiJumlah}</p>
        )}
      </Kartu>
      <p className="m-0 text-keterangan text-teks-pendukung">
        {t.aturanBayar(
          100 - konfigurasi.persen_uang_muka,
          konfigurasi.persen_uang_muka,
          konfigurasi.hari_kembali_uang_muka,
        )}
      </p>
      {!terverifikasi ? <StatusVerifikasi profil={profil} /> : null}
      {galat.kirim ? <PesanKolom id="galat-buat" galat={galat.kirim} /> : null}
      <Tombol penuh disabled={!terverifikasi || buat.isPending} onClick={() => void kirim()}>
        {buat.isPending ? t.menyimpan : t.lanjutBayar(nilai?.ok ? nilai.nilai.dibayarSekarang : 0)}
      </Tombol>
    </div>
  );

  const kepala = (
    <div className="flex flex-col gap-3">
      <Link
        to="/pembeli"
        className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
      >
        <Ikon nama="panah-kiri" ukuran={20} />
        <span>{t.kembaliDasbor}</span>
      </Link>
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 text-judul-halaman font-semibold">{t.judulBuat}</h1>
        <p className="m-0 text-keterangan text-teks-pendukung">
          {t.ketBuat(konfigurasi.radius_km)}
        </p>
      </div>
    </div>
  );

  const formulir = (
    <>
      {kartuSayur}
      {kartuJadwal}
      {kartuHarga}
      {kartuTitik}
    </>
  );

  return lebar ? (
    <>
      {kepala}
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-6">{formulir}</div>
        <aside className="sticky top-6 flex w-panel flex-none flex-col gap-4">{ringkasan}</aside>
      </div>
    </>
  ) : (
    <>
      {kepala}
      {formulir}
      {ringkasan}
    </>
  );
}

export function HalamanBuatPesanan() {
  const [cari] = useSearchParams();
  const { akun } = useSesi();
  const komoditasQ = useKomoditas();
  const konfigurasiQ = useKonfigurasi();
  const pesananQ = usePesananPembeli();
  const profil = akun?.profil_pembeli ?? null;
  const wilayahQ = useWilayahSatu(profil?.wilayah_id ?? null);
  const ulangId = cari.get('ulang');
  if (!profil) return <Memuat />;
  if (!komoditasQ.data || !konfigurasiQ.data || (ulangId && !pesananQ.data)) return <Memuat />;
  const tersedia = komoditasQ.data.filter((k) => k.status_resep === 'tersedia');
  const ulang = pesananQ.data?.find((p) => p.id === ulangId) ?? null;
  return (
    <Formulir
      komoditas={tersedia}
      konfigurasi={konfigurasiQ.data}
      profil={profil}
      desa={wilayahQ.data?.desa ?? ''}
      ulang={ulang}
      jenisAwal={cari.get('jenis') === 'sekali_panen' ? 'sekali_panen' : 'rutin'}
    />
  );
}
