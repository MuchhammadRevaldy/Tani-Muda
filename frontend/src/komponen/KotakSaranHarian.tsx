import { Link } from 'react-router-dom';
import { Ikon } from './ikon';
import { Kartu } from './kartu';
import { fiturAktif } from '../lib/fitur';
import type { HasilRingkasanHarian } from '../lib/ringkasan-harian';

export function KotakSaranHarian({
  ringkasan,
}: {
  ringkasan: HasilRingkasanHarian;
}) {
  if (!fiturAktif('SARAN_HARIAN')) {
    return null;
  }

  // Tampilkan bila semua tugas hari ini selesai atau setidaknya ada tugas yang selesai
  if (!ringkasan.semuaSelesai && ringkasan.jumlahTugasHariIni > 0) {
    return null;
  }

  const tugasBesokPertama = ringkasan.tugasBesok[0];

  return (
    <div id="kotak-saran-harian" className="fade-in">
      <Kartu
        judul="Tugas Hari Ini Beres!"
        tingkatJudul={2}
        className="border-daun-tua/30 bg-gradient-to-br from-daun-lembut/60 via-putih to-daun-lembut/30 shadow-kartu"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-daun-tua text-putih shadow-garis">
              <Ikon nama="centang" ukuran={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-teks">
                {ringkasan.jumlahTugasSelesai} dari {ringkasan.jumlahTugasHariIni} tugas tuntas
              </span>
              <span className="text-keterangan text-teks-pendukung">
                Kerja bagus! Seluruh tugas terjadwal hari ini telah selesai dikerjakan.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-garis bg-putih p-2.5 text-center shadow-garis">
              <span className="text-keterangan text-teks-pendukung">Poin didapat</span>
              <p className="m-0 text-judul-bagian font-bold text-daun-tua">+{ringkasan.poinDiperoleh}</p>
            </div>
            <div className="rounded-xl border border-garis bg-putih p-2.5 text-center shadow-garis">
              <span className="text-keterangan text-teks-pendukung">Foto bukti</span>
              <p className="m-0 text-judul-bagian font-bold text-teks">{ringkasan.jumlahFotoBukti}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-xl border border-garis bg-putih p-2.5 text-center shadow-garis">
              <span className="text-keterangan text-teks-pendukung">Tugas besok</span>
              <p className="m-0 line-clamp-1 text-isi font-semibold text-teks">
                {tugasBesokPertama ? tugasBesokPertama.judul : 'Tidak ada'}
              </p>
            </div>
          </div>

          {ringkasan.saranTahap.length > 0 ? (
            <div className="rounded-xl border border-garis bg-putih/80 p-3 shadow-garis">
              <div className="flex items-center gap-1.5 pb-1 font-semibold text-daun-tua">
                <Ikon nama="kebun" ukuran={16} />
                <span className="text-isi">Saran untuk tahap saat ini:</span>
              </div>
              <ul className="m-0 list-disc pl-5 text-isi text-teks-pendukung space-y-1">
                {ringkasan.saranTahap.map((saran, idx) => (
                  <li key={idx} className="text-isi text-teks">
                    {saran}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {ringkasan.bisaCekKesehatan ? (
            <div className="pt-1">
              <Link
                to="/deteksi"
                className="fokus-cincin inline-flex items-center gap-2 rounded-xl bg-daun-tua px-4 py-2.5 text-isi font-semibold text-putih no-underline hover:bg-daun transition shadow-kartu"
              >
                <Ikon nama="kamera" ukuran={18} />
                <span>Cek kesehatan tanaman dari foto ini</span>
              </Link>
            </div>
          ) : null}
        </div>
      </Kartu>
    </div>
  );
}
