/**
 * Modal Deteksi Penyakit Tanaman dari Foto (PRD Tambahan F-04).
 */
import { useState } from 'react';
import { adalahGalatApi } from '../api/galat';
import { useAkun, useDeteksiTanaman, useSetujuAi } from '../api/kueri';
import type { DeteksiTanaman } from '../api/tipe';
import { AmbilFoto, type FotoKecil } from './ambil-foto';
import { Banner } from './banner';
import { Dialog } from './dialog';
import { Ikon } from './ikon';
import { LabelKecil } from './label-kecil';
import { Tombol } from './tombol';

interface Props {
  terbuka: boolean;
  onTutup: () => void;
  siklusId?: string;
  tugasId?: string;
}

export function ModalDeteksiTanaman({ terbuka, onTutup, siklusId, tugasId }: Props) {
  const { data: akun } = useAkun();
  const mutasiSetuju = useSetujuAi();
  const mutasiDeteksi = useDeteksiTanaman();

  const [foto, setFoto] = useState<FotoKecil | null>(null);
  const [catatan, setCatatan] = useState('');
  const [centangPersetujuan, setCentangPersetujuan] = useState(false);
  const [hasil, setHasil] = useState<DeteksiTanaman | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  const sudahSetuju = Boolean(akun?.pengguna.setuju_ai_pada);

  function resetState() {
    setFoto(null);
    setCatatan('');
    setHasil(null);
    setGalat(null);
  }

  function handleTutup() {
    resetState();
    onTutup();
  }

  async function setujuiFitur() {
    try {
      setGalat(null);
      await mutasiSetuju.mutateAsync();
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : 'Gagal menyimpan persetujuan AI');
    }
  }

  async function lakukanDeteksi() {
    if (!foto) {
      setGalat('Silakan ambil atau pilih foto tanaman terlebih dahulu');
      return;
    }
    setGalat(null);
    try {
      const res = await mutasiDeteksi.mutateAsync({
        foto_base64: foto.dataUrl,
        catatan: catatan.trim() || undefined,
        siklus_id: siklusId,
        tugas_id: tugasId,
      });
      setHasil(res);
    } catch (e) {
      setGalat(
        adalahGalatApi(e)
          ? e.message
          : 'Fitur deteksi penyakit sedang tidak bisa dipakai. Coba lagi nanti',
      );
    }
  }

  return (
    <Dialog terbuka={terbuka} onTutup={handleTutup} judul="Deteksi Gejala Tanaman">
      <div className="flex flex-col gap-4">
        {galat && (
          <Banner jenis="bahaya" judul="Perhatian">
            {galat}
          </Banner>
        )}

        {!sudahSetuju ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-garis bg-daun-lembut p-4">
            <div className="flex items-start gap-2.5">
              <Ikon nama="info" ukuran={20} className="mt-0.5 text-daun-tua" />
              <div className="flex flex-col gap-1 text-isi">
                <p className="m-0 font-medium text-daun-tua">Persetujuan Bantuan Pintar AI</p>
                <p className="m-0 text-keterangan text-teks-pendukung">
                  Fitur ini menggunakan kecerdasan buatan untuk membantu menganalisis gejala pada
                  foto tanamanmu. Rekomendasi bersifat pendukung dan bukan pengganti saran resmi
                  Penyuluh Pertanian Lapangan (PPL).
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 pt-2 text-isi">
              <input
                type="checkbox"
                checked={centangPersetujuan}
                onChange={(e) => setCentangPersetujuan(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-garis text-daun-tua"
              />
              <span className="text-keterangan leading-relaxed">
                Saya memahami bahwa analisis AI ini adalah panduan awal dan saya menyetujui foto
                dianalisis oleh asisten pintar Tani Muda.
              </span>
            </label>

            <div className="flex justify-end pt-2">
              <Tombol
                varian="utama"
                onClick={setujuiFitur}
                disabled={!centangPersetujuan || mutasiSetuju.isPending}
              >
                {mutasiSetuju.isPending ? 'Menyimpan...' : 'Saya Setuju & Mulai'}
              </Tombol>
            </div>
          </div>
        ) : hasil ? (
          <div className="flex flex-col gap-4">
            {hasil.model === 'tiruan' && (
              <LabelKecil nada="contoh" className="self-start">
                Contoh jawaban (Mode Demo)
              </LabelKecil>
            )}

            <div className="rounded-2xl border border-garis bg-putih p-4">
              <p className="m-0 text-keterangan font-medium text-teks-pendukung">Dugaan Masalah:</p>
              <div className="mt-2 flex flex-col gap-2">
                {hasil.hasil.dugaan.map((d, idx) => (
                  <div key={idx} className="rounded-xl border border-garis bg-embun-pagi p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-teks">{d.nama}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-keterangan font-medium ${
                          d.keyakinan === 'tinggi'
                            ? 'bg-daun-lembut text-daun-tua'
                            : d.keyakinan === 'sedang'
                              ? 'bg-matahari-lembut text-matahari-teks'
                              : 'bg-embun-pagi text-teks-pendukung'
                        }`}
                      >
                        Keyakinan {d.keyakinan}
                      </span>
                    </div>
                    {d.alasan && (
                      <p className="m-0 mt-1 text-keterangan text-teks-pendukung">{d.alasan}</p>
                    )}
                  </div>
                ))}
              </div>

              {hasil.hasil.gejala_terlihat.length > 0 && (
                <div className="mt-3">
                  <p className="m-0 text-keterangan font-medium text-teks-pendukung">
                    Gejala Terlihat:
                  </p>
                  <ul className="m-0 mt-1 list-disc pl-5 text-isi text-teks">
                    {hasil.hasil.gejala_terlihat.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {hasil.hasil.langkah_aman.length > 0 && (
                <div className="mt-3 border-t border-garis pt-3">
                  <p className="m-0 text-keterangan font-medium text-teks-pendukung">
                    Langkah Penanganan Aman:
                  </p>
                  <ul className="m-0 mt-1 list-disc pl-5 text-isi text-teks">
                    {hasil.hasil.langkah_aman.map((l, idx) => (
                      <li key={idx}>{l}</li>
                    ))}
                  </ul>
                </div>
              )}

              {hasil.hasil.catatan && (
                <p className="m-0 mt-3 text-keterangan italic text-teks-pendukung">
                  {hasil.hasil.catatan}
                </p>
              )}
            </div>

            {hasil.hasil.perlu_penyuluh && (
              <Banner jenis="peringatan" judul="Saran Konsultasi">
                Kondisi ini disarankan untuk dikonfirmasikan dengan Penyuluh Pertanian Lapangan (PPL)
                desa Anda sebelum memberikan perlakuan obat keras.
              </Banner>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Tombol varian="sekunder" onClick={resetState}>
                Periksa Foto Lain
              </Tombol>
              <Tombol varian="utama" onClick={handleTutup}>
                Selesai
              </Tombol>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="m-0 text-isi text-teks-pendukung">
              Ambil foto daun atau bagian tanaman yang sakit secara jelas dengan pencahayaan cukup.
            </p>

            {foto ? (
              <div className="flex flex-col gap-2">
                <img
                  src={foto.dataUrl}
                  alt="Tanaman"
                  className="aspect-foto w-full rounded-2xl border border-garis object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFoto(null)}
                  className="self-start text-keterangan font-medium text-tomat-teks"
                >
                  Ganti foto
                </button>
              </div>
            ) : (
              <AmbilFoto
                label="Ambil Foto Tanaman"
                labelMemuat="Mengecilkan foto..."
                onFoto={setFoto}
              />
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="catatan-gejala" className="text-isi font-medium text-teks">
                Catatan Gejala Tambahan (Opsional)
              </label>
              <textarea
                id="catatan-gejala"
                rows={2}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Bercak cokelat mulai muncul 2 hari lalu setelah hujan deras..."
                className="w-full rounded-md border border-garis bg-putih p-3 text-isi placeholder:text-teks-pendukung focus:border-daun-tua focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Tombol varian="sekunder" onClick={handleTutup}>
                Batal
              </Tombol>
              <Tombol
                varian="utama"
                onClick={lakukanDeteksi}
                disabled={!foto || mutasiDeteksi.isPending}
              >
                {mutasiDeteksi.isPending ? 'Menganalisis (AI)...' : 'Analisis Gejala (AI)'}
              </Tombol>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
