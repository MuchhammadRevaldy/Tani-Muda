/**
 * Komponen Chatbot "Tanya Tani Muda" (PRD Tambahan F-05).
 */
import { useEffect, useRef, useState } from 'react';
import { adalahGalatApi } from '../api/galat';
import { useAkun, useRiwayatChatbot, useSetujuAi, useTanyaChatbot } from '../api/kueri';
import type { PesanObrolanBot } from '../api/tipe';
import { Banner } from './banner';
import { Ikon } from './ikon';
import { Tombol } from './tombol';

export function ChatbotMengambang() {
  const { data: akun } = useAkun();
  const mutasiSetuju = useSetujuAi();
  const mutasiTanya = useTanyaChatbot();
  const kueriRiwayat = useRiwayatChatbot(undefined, Boolean(akun?.pengguna.id));

  const [terbuka, setTerbuka] = useState(false);
  const [pesan, setPesan] = useState('');
  const [pesanLokal, setPesanLokal] = useState<PesanObrolanBot[]>([]);
  const [galat, setGalat] = useState<string | null>(null);
  const [centangPersetujuan, setCentangPersetujuan] = useState(false);
  const akhirObrolanRef = useRef<HTMLDivElement>(null);

  const sudahSetuju = Boolean(akun?.pengguna.setuju_ai_pada);
  const daftarPesan = [...(kueriRiwayat.data ?? []), ...pesanLokal];

  useEffect(() => {
    if (terbuka) {
      akhirObrolanRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [daftarPesan.length, terbuka]);

  async function setujuiFitur() {
    try {
      setGalat(null);
      await mutasiSetuju.mutateAsync();
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : 'Gagal menyimpan persetujuan AI');
    }
  }

  async function kirimPertanyaan(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const teks = pesan.trim();
    if (!teks || mutasiTanya.isPending) return;

    setGalat(null);
    setPesan('');

    const pesanPengguna: PesanObrolanBot = {
      id: `lokal-${Date.now()}`,
      percakapan_bot_id: 'aktif',
      peran: 'user',
      isi: teks,
      sumber: null,
      dibuat_pada: new Date().toISOString(),
    };

    setPesanLokal((prev) => [...prev, pesanPengguna]);

    try {
      const res = await mutasiTanya.mutateAsync({ pesan: teks });
      const pesanBot: PesanObrolanBot = {
        id: `bot-${Date.now()}`,
        percakapan_bot_id: res.percakapan_id,
        peran: 'assistant',
        isi: res.jawaban,
        sumber: res.sumber,
        dibuat_pada: new Date().toISOString(),
      };
      setPesanLokal((prev) => [...prev, pesanBot]);
    } catch (err) {
      setGalat(
        adalahGalatApi(err)
          ? err.message
          : 'Fitur asisten tanya tani sedang tidak bisa dipakai. Coba lagi nanti',
      );
    }
  }

  return (
    <>
      {/* Tombol Mengambang (FAB) */}
      <div className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6">
        <button
          type="button"
          onClick={() => setTerbuka(!terbuka)}
          aria-label={terbuka ? 'Tutup Tanya Tani Muda' : 'Buka Tanya Tani Muda'}
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-daun-tua text-putih shadow-kartu transition duration-cepat ease-keluar hover:-translate-y-px active:translate-y-px focus:outline-none"
        >
          {terbuka ? (
            <Ikon nama="silang" ukuran={24} />
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Jendela Obrolan */}
      {terbuka && (
        <div className="fixed bottom-36 right-4 z-40 flex h-tab-siklus w-panel max-w-dialog flex-col overflow-hidden rounded-2xl border border-garis bg-putih shadow-kartu lg:bottom-22 lg:right-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-garis bg-daun-tua px-4 py-3 text-putih">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-daun-lembut text-daun-tua">
                <Ikon nama="kebun" ukuran={18} />
              </div>
              <div>
                <h3 className="m-0 text-isi font-semibold leading-tight">Tanya Tani Muda</h3>
                <p className="m-0 text-keterangan text-teks-redup">Asisten Budidaya & Pengetahuan</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTerbuka(false)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-putih hover:bg-daun-tekan"
            >
              <Ikon nama="silang" ukuran={18} />
            </button>
          </div>

          {/* Isi Pesan */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 text-isi">
            {galat && (
              <Banner jenis="bahaya" judul="Perhatian">
                {galat}
              </Banner>
            )}

            {!sudahSetuju ? (
              <div className="flex flex-col gap-3 rounded-xl border border-garis bg-daun-lembut p-4">
                <p className="m-0 font-medium text-daun-tua">Persetujuan Fitur Pintar AI</p>
                <p className="m-0 text-keterangan text-teks-pendukung">
                  Chatbot “Tanya Tani Muda” menjawab pertanyaan seputar modul budidaya dan resep
                  tanam berdasarkan data panduan resmi.
                </p>
                <label className="flex cursor-pointer items-start gap-2 text-keterangan">
                  <input
                    type="checkbox"
                    checked={centangPersetujuan}
                    onChange={(e) => setCentangPersetujuan(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-garis text-daun-tua"
                  />
                  <span>Saya menyetujui pemakaian asisten tanya pintar Tani Muda.</span>
                </label>
                <Tombol
                  varian="utama"
                  onClick={setujuiFitur}
                  disabled={!centangPersetujuan || mutasiSetuju.isPending}
                >
                  Saya Setuju & Mulai Tanya
                </Tombol>
              </div>
            ) : (
              <>
                {daftarPesan.length === 0 && (
                  <div className="my-auto flex flex-col items-center gap-2 text-center text-teks-pendukung">
                    <Ikon nama="info" ukuran={32} />
                    <p className="m-0 text-isi font-medium text-teks">
                      Halo Petani Muda! Ada yang bisa kami bantu?
                    </p>
                    <p className="m-0 text-keterangan">
                      Tanyakan tentang hama sawi, takaran nutrisi hidroponik, atau modul perawatan.
                    </p>
                  </div>
                )}

                {daftarPesan.map((p) => (
                  <div
                    key={p.id}
                    className={`flex flex-col ${p.peran === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-panel rounded-2xl px-4 py-2.5 text-isi ${
                        p.peran === 'user'
                          ? 'bg-daun-tua text-putih'
                          : 'border border-garis bg-embun-pagi text-teks'
                      }`}
                    >
                      <p className="m-0 whitespace-pre-wrap leading-relaxed">{p.isi}</p>

                      {p.sumber && p.sumber.length > 0 && (
                        <div className="mt-2 border-t border-garis pt-2 text-keterangan">
                          <p className="m-0 font-medium text-teks-pendukung">Sumber Rujukan:</p>
                          {p.sumber.map((s, idx) => (
                            <div key={idx} className="mt-1 rounded border border-garis bg-putih p-2 text-keterangan text-teks">
                              <span className="font-semibold">{s.judul}</span>
                              {s.potongan && (
                                <p className="m-0 mt-0.5 line-clamp-2 italic text-teks-pendukung">
                                  "{s.potongan}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {mutasiTanya.isPending && (
                  <div className="flex items-start">
                    <div className="rounded-2xl border border-garis bg-embun-pagi px-4 py-2 text-keterangan text-teks-pendukung">
                      Sedang mencari di modul dan resep...
                    </div>
                  </div>
                )}

                <div ref={akhirObrolanRef} />
              </>
            )}
          </div>

          {/* Form Kirim */}
          {sudahSetuju && (
            <form onSubmit={kirimPertanyaan} className="flex items-center gap-2 border-t border-garis bg-putih p-3">
              <input
                type="text"
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                placeholder="Tanyakan sesuatu seputar tanaman..."
                className="flex-1 rounded-full border border-garis bg-embun-pagi px-4 py-2 text-isi text-teks placeholder:text-teks-pendukung focus:border-daun-tua focus:bg-putih focus:outline-none"
              />
              <button
                type="submit"
                disabled={!pesan.trim() || mutasiTanya.isPending}
                aria-label="Kirim pesan"
                className="flex h-10 w-10 flex-none cursor-pointer items-center justify-center rounded-full bg-daun-tua text-putih transition duration-cepat ease-keluar hover:-translate-y-px active:translate-y-px disabled:cursor-not-allowed disabled:bg-garis disabled:text-teks-pendukung"
              >
                <Ikon nama="panah-kanan" ukuran={16} />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
