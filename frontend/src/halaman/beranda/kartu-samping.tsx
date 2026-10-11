/** Kartu pendamping Beranda: tawaran pesanan, hasil ukur terakhir, dan modal siklus (papan 03, 04). */
import { Link } from 'react-router-dom';
import { hasilPengukuranKeDomain } from '../../api/peta';
import type {
  BesaranUkur,
  HasilPengukuran,
  PesananUntukPetani,
  SiklusDetail,
} from '../../api/tipe';
import { ChipStatus } from '../../komponen/chip-status';
import { cx } from '../../komponen/gabung-kelas';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { LabelKecil } from '../../komponen/label-kecil';
import { kelasTombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { hasilUkurTerakhir, persenTerpakai } from '../../lib/beranda';
import {
  formatDesimal,
  formatKisaran,
  formatRupiah,
  formatTanggal,
  titikRibuan,
} from '../../lib/format';
import { hitungRingkasan } from '../../lib/ringkasan';
import { teksBeranda as t } from '../../teks/beranda';
import { teksIsiPesanan, teksPesanan } from '../../teks/pesanan';
import { teksUmum } from '../../teks/umum';

const tautanPanah =
  'fokus-cincin inline-flex min-h-sentuh items-center gap-1 self-start rounded-sm font-semibold no-underline';

/** Angka ukur: desimal satu angka (pH 6,1) atau ribuan (PPM 1.280). */
export const angkaUkur = (n: number) =>
  Number.isInteger(n) ? titikRibuan(n) : formatDesimal(n, 1);

export function KartuTawaran({
  pesanan,
  namaKomoditas,
  utama,
}: {
  pesanan: PesananUntukPetani;
  namaKomoditas: string;
  utama: boolean;
}) {
  return (
    <section
      aria-labelledby="judul-tawaran"
      className="flex flex-col gap-3 rounded-lg border-1.5 border-daun-tua bg-daun-lembut p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 font-semibold text-daun-tua">
          <Ikon nama="pesanan" />
          {t.tawaranPesanan}
        </span>
        <span className="font-medium">{teksPesanan.jarakDariKebun(pesanan.jarak_km)}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h2 id="judul-tawaran" className="m-0 text-uang font-semibold">
          {pesanan.nama_pembeli}
        </h2>
        <p className="m-0">{teksIsiPesanan(pesanan, namaKomoditas)}</p>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <Uang nilai={pesanan.harga_per_kg} besar />
        <span className="text-teks-pendukung">
          {[teksPesanan.perKg, pesanan.boleh_ambil_sebagian ? teksPesanan.bolehSebagian : null]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
      {pesanan.uang_muka_diterima ? (
        <div>
          <ChipStatus status="uang-muka-ditahan" />
        </div>
      ) : null}
      <Link
        to={`/pesanan/${encodeURIComponent(pesanan.id)}`}
        className={kelasTombol(utama ? 'utama' : 'sekunder', true)}
      >
        {teksPesanan.lihatTawaran}
      </Link>
    </section>
  );
}

const WARNA_STATUS = {
  normal: 'text-daun-tua',
  'terlalu-tinggi': 'text-matahari-teks',
  'terlalu-rendah': 'text-tomat',
  kosong: 'text-teks-pendukung',
} as const;

export function KartuHasilUkur({
  siklusId,
  hasil,
  besaran,
  contoh,
}: {
  siklusId: string;
  hasil: HasilPengukuran[];
  besaran: BesaranUkur[];
  contoh: boolean;
}) {
  const terakhir = hasilUkurTerakhir(hasil.map(hasilPengukuranKeDomain));
  if (!terakhir.length) return null;
  const tanggal = terakhir
    .map((h) => h.tanggal)
    .sort()
    .at(-1) as string;
  return (
    <Kartu tingkatJudul={2} judul={t.hasilUkur} keterangan={formatTanggal(tanggal)}>
      <div className="flex flex-col gap-3">
        {contoh ? (
          <LabelKecil nada="contoh" className="self-start">
            {teksUmum.labelContoh}
          </LabelKecil>
        ) : null}
        {terakhir.map((h) => {
          const b = besaran.find((x) => x.nama === h.besaran);
          return (
            <div key={h.besaran} className="flex items-center justify-between gap-3">
              <span className="flex flex-col">
                <span className="text-uang font-semibold tabular-nums">
                  {h.besaran} {angkaUkur(h.nilai)}
                </span>
                {b ? (
                  <span className="text-keterangan text-teks-pendukung">
                    {t.normalRentang(formatKisaran(b.batas_bawah, b.batas_atas, angkaUkur))}
                  </span>
                ) : null}
              </span>
              <span
                className={cx(
                  'inline-flex items-center gap-1.5 font-semibold',
                  WARNA_STATUS[h.status],
                )}
              >
                <Ikon nama={h.status === 'normal' ? 'centang' : 'peringatan'} ukuran={20} />
                {t.statusUkur[h.status]}
              </span>
            </div>
          );
        })}
        {contoh ? null : (
          <p className="m-0 text-keterangan text-teks-pendukung">{t.rentangDariResep}</p>
        )}
        <Link to={`/kebun/${encodeURIComponent(siklusId)}/jadwal`} className={tautanPanah}>
          {t.lihatRiwayatUkur}
          <Ikon nama="panah-kanan" ukuran={20} />
        </Link>
      </div>
    </Kartu>
  );
}

export function KartuModal({ nama, siklus }: { nama: string; siklus: SiklusDetail }) {
  const { sudah_keluar, total_modal } = siklus.modal;
  const persen = persenTerpakai(sudah_keluar, total_modal);
  const ringkasan = hitungRingkasan({
    totalModal: total_modal,
    perkiraanPanenKg: siklus.perkiraan_panen_kg,
    hargaJual: siklus.harga_jual,
  });
  return (
    <Kartu
      tingkatJudul={2}
      judul={t.modalSiklus(nama)}
      keterangan={t.sudahKeluarPersen(persen)}
      nadaKaki="uang"
      kaki={
        ringkasan.ok ? (
          <div className="flex flex-col gap-2">
            <Uang
              label={t.perkiraanUntung}
              nilai={ringkasan.nilai.untung}
              besar
              keterangan={t.kalauPanen(angkaUkur(siklus.perkiraan_panen_kg))}
            />
            {ringkasan.nilai.rugi ? (
              <p className="m-0 flex items-start gap-2 text-keterangan font-medium text-tomat">
                <Ikon nama="peringatan" ukuran={20} className="mt-px" />
                <span>{t.rugi}</span>
              </p>
            ) : null}
          </div>
        ) : null
      }
    >
      <div className="flex flex-col gap-2.5">
        {siklus.resep_contoh ? (
          <LabelKecil nada="contoh" className="self-start">
            {teksUmum.labelContoh}
          </LabelKecil>
        ) : null}
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Uang label={t.sudahKeluar} nilai={sudah_keluar} besar />
          <span className="text-keterangan text-teks-pendukung">
            {t.dariRencana(formatRupiah(total_modal))}
          </span>
        </div>
        <div
          role="img"
          aria-label={t.persenAria(persen)}
          className="h-3 overflow-hidden rounded-full bg-garis"
        >
          <div
            className="h-full rounded-full bg-tanah"
            style={{ width: `${Math.min(persen, 100)}%` }}
          />
        </div>
        <Link to={`/kebun/${encodeURIComponent(siklus.id)}/modal`} className={tautanPanah}>
          {t.lihatRincianModal}
          <Ikon nama="panah-kanan" ukuran={20} />
        </Link>
      </div>
    </Kartu>
  );
}
