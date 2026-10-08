/**
 * Bayar uang muka (halaman turunan 44; T4.41, PRD P0-23, D-02, D-10, D-41). Nominal dari klien API
 * (dihitung server dengan `pesanan-nilai.ts`), bukan dari halaman. Mode uji coba: label "Mode uji
 * coba" dan pilihan hasil yang diperagakan (berhasil, gagal, menunggu). Kunci idempoten tetap
 * selama satu percobaan, sehingga klik ganda tidak membayar dua kali; percobaan baru memakai kunci
 * baru.
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import {
  kunciIdempotenBaru,
  useBayarUangMuka,
  useKonfigurasi,
  usePesananPembeli,
} from '../../api/kueri';
import type { PesananDenganKebun } from '../../api/tipe';
import { Banner } from '../../komponen/banner';
import { ChipStatus } from '../../komponen/chip-status';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { LabelKecil } from '../../komponen/label-kecil';
import { PilPilihan } from '../../komponen/pilihan';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { Uang } from '../../komponen/uang';
import { teksPembeli as t } from '../../teks/pembeli';
import { kg } from '../../teks/pesanan';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { useKomoditasPeta } from '../pesanan/kerangka-pesanan';

type Simulasi = 'berhasil' | 'gagal' | 'menunggu';
type Hasil = 'berhasil' | 'gagal' | 'menunggu' | null;

function Isi({ p, ujiCoba }: { p: PesananDenganKebun; ujiCoba: boolean }) {
  const bayar = useBayarUangMuka();
  const k = useKomoditasPeta();
  const [simulasi, setSimulasi] = useState<Simulasi>('berhasil');
  const [kunci, setKunci] = useState(kunciIdempotenBaru);
  const [hasil, setHasil] = useState<Hasil>(p.status === 'menunggu_pembayaran' ? null : 'berhasil');
  const [pesan, setPesan] = useState<string | null>(null);
  const total = p.uang_muka + p.biaya_layanan;

  async function kirim() {
    setPesan(null);
    try {
      const baris = await bayar.mutateAsync({
        id: p.id,
        kunci_idempoten: kunci,
        ...(ujiCoba ? { simulasi } : {}),
      });
      setHasil(baris.some((b) => b.status === 'menunggu') ? 'menunggu' : 'berhasil');
    } catch (e) {
      setHasil('gagal');
      setPesan(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
    // Percobaan berikutnya (coba lagi, cek lagi) adalah permintaan baru.
    setKunci(kunciIdempotenBaru());
  }

  if (hasil === 'berhasil')
    return (
      <section className="flex flex-col items-start gap-3 rounded-lg border-1.5 border-daun-tua bg-daun-lembut p-6">
        <ChipStatus status="uang-muka-ditahan" />
        <h2 className="m-0 flex items-center gap-2 text-judul-bagian font-semibold text-daun-tua">
          <Ikon nama="centang" tebal={2.5} />
          {t.berhasilJudul}
        </h2>
        <p className="m-0">{t.berhasilIsi}</p>
        <Link to="/pembeli" className={kelasTombol('utama')}>
          {t.lihatPesanan}
        </Link>
      </section>
    );

  const rutin = p.jenis === 'rutin' && p.jumlah_per_kiriman_kg;
  return (
    <div className="flex flex-col gap-4 lg:max-w-dialog">
      {hasil === 'gagal' ? (
        <Banner jenis="bahaya" judul={t.gagalJudul}>
          {pesan ? `${pesan}. ${t.gagalIsi}` : t.gagalIsi}
        </Banner>
      ) : null}
      {hasil === 'menunggu' ? <Banner judul={t.menungguJudul}>{t.menungguIsi}</Banner> : null}
      <Kartu
        judul={t.rincianBayar}
        keterangan={
          rutin
            ? t.ringkasanIsi(k.nama(p.komoditas_id), p.jumlah_per_kiriman_kg ?? 0, p.jumlah_kiriman)
            : `${k.nama(p.komoditas_id)} ${kg(p.jumlah_total_kg)} kg`
        }
        tingkatJudul={2}
        nadaKaki="uang"
        kaki={<Uang nilai={total} label={t.totalBayar} besar />}
      >
        <dl className="m-0 flex flex-col gap-3">
          <div className="flex justify-between gap-3">
            <dt>{t.nilaiPesanan}</dt>
            <dd className="m-0">
              <Uang nilai={p.nilai_pesanan} />
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="flex flex-col">
              <span>{t.jenisBayar('uang_muka')}</span>
              <span className="text-keterangan text-teks-pendukung">{t.uangMukaKet}</span>
            </dt>
            <dd className="m-0">
              <Uang nilai={p.uang_muka} />
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>{t.jenisBayar('biaya_layanan')}</dt>
            <dd className="m-0">
              <Uang nilai={p.biaya_layanan} />
            </dd>
          </div>
        </dl>
      </Kartu>
      {ujiCoba ? (
        <div className="flex flex-col gap-3 rounded-md border-1.5 border-dashed border-garis-kuat bg-putih p-4">
          <LabelKecil nada="contoh" className="self-start">
            {t.modeUjiCoba}
          </LabelKecil>
          <p className="m-0 text-keterangan text-teks-pendukung">{t.ujiCobaKet}</p>
          <PilPilihan<Simulasi>
            label={t.hasilDiperagakan}
            gaya="segmen"
            nilai={simulasi}
            onPilih={setSimulasi}
            opsi={[
              { nilai: 'berhasil', label: t.hasilBerhasil },
              { nilai: 'gagal', label: t.hasilGagal },
              { nilai: 'menunggu', label: t.hasilMenunggu },
            ]}
          />
        </div>
      ) : null}
      <Tombol penuh disabled={bayar.isPending} onClick={() => void kirim()}>
        {bayar.isPending
          ? t.memproses
          : hasil === 'gagal'
            ? t.cobaLagi
            : hasil === 'menunggu'
              ? t.cekLagi
              : t.bayarSekarang(total)}
      </Tombol>
    </div>
  );
}

export function HalamanBayar() {
  const { id } = useParams();
  const pesananQ = usePesananPembeli();
  const konfigurasiQ = useKonfigurasi();
  if (pesananQ.isError) return <p className="m-0 text-teks-pendukung">{teksUmum.galatIsi}</p>;
  if (!pesananQ.data || !konfigurasiQ.data) return <Memuat />;
  const p = pesananQ.data.find((x) => x.id === id);
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
        <div className="flex flex-col gap-0.5">
          <h1 className="m-0 text-judul-halaman font-semibold">{t.judulBayar}</h1>
          <p className="m-0 text-keterangan text-teks-pendukung">{t.ketBayar}</p>
        </div>
      </div>
      {p ? (
        <Isi p={p} ujiCoba={konfigurasiQ.data.pembayaran_uji_coba} />
      ) : (
        <p className="m-0 text-teks-pendukung">{teksUmum.galatIsi}</p>
      )}
    </>
  );
}
