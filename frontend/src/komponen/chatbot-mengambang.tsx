/**
 * Komponen Chatbot "Tanya Tani Muda" (PRD Tambahan F-05, AG-35).
 * - Sapaan dijawab ramah tanpa panggil AI + 3 contoh pertanyaan.
 * - Keadaan kosong menampilkan 3 contoh pertanyaan yang sama.
 * - Jawaban "Belum ada di panduan" disertai tombol "Tanya penyuluh" ke WhatsApp admin.
 * - Di HP (< 768px): lembar layar penuh dari bawah dengan tombol tutup 48px dan input menempel di bawah.
 * - Desktop: panel mengambang di kanan bawah.
 */
import { useEffect, useRef, useState } from 'react';
import { adalahGalatApi } from '../api/galat';
import { useAkun, useKonfigurasi, useRiwayatChatbot, useSetujuAi, useTanyaChatbot } from '../api/kueri';
import type { PesanObrolanBot } from '../api/tipe';
import { fiturAktif } from '../lib/fitur';
import { Banner } from './banner';
import { Ikon } from './ikon';
import { Tombol } from './tombol';

const POLA_SAPAAN =
  /^(halo|hai|hei|hi|hello|selamat\s+(pagi|siang|sore|malam)|assalamu['a]?laikum|pagi|siang|sore|malam)[\s!,.]*$/i;

const CONTOH_PERTANYAAN = [
  'Kapan pupuk pertama sawi?',
  'Kenapa daun sawi berlubang?',
  'Berapa pH yang baik untuk hidroponik?',
];

export function ChatbotMengambang() {
  const aktif = fiturAktif('CHATBOT') && fiturAktif('AI');
  const { data: akun } = useAkun();
  const { data: konfigurasi } = useKonfigurasi();
  const mutasiSetuju = useSetujuAi();
  const mutasiTanya = useTanyaChatbot();
  const kueriRiwayat = useRiwayatChatbot(undefined, Boolean(akun?.pengguna.id));

  const [terbuka, setTerbuka] = useState(false);
  const [pesan, setPesan] = useState('');
  const [pesanLokal, setPesanLokal] = useState<PesanObrolanBot[]>([]);
  const [galat, setGalat] = useState<string | null>(null);
  const [centangPersetujuan, setCentangPersetujuan] = useState(false);
  const akhirObrolanRef = useRef<HTMLDivElement>(null);
  const idPesanRef = useRef(1);

  const sudahSetuju = Boolean(akun?.pengguna.setuju_ai_pada);
  const daftarPesan = [...(kueriRiwayat.data ?? []), ...pesanLokal];
  const noWa = (konfigurasi?.kontak_admin?.whatsapp ?? '+62 812-0000-0099').replace(/\D/g, '');

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

  async function kirimPertanyaan(teksManual?: string) {
    const teks = (teksManual ?? pesan).trim();
    if (!teks || mutasiTanya.isPending) return;

    setGalat(null);
    setPesan('');

    const pesanPengguna: PesanObrolanBot = {
      id: `lokal-user-${idPesanRef.current++}`,
      percakapan_bot_id: 'aktif',
      peran: 'user',
      isi: teks,
      sumber: null,
      dibuat_pada: 'H0T12:00',
    };

    // Sapaan ramah tanpa memanggil AI (AG-35)
    if (POLA_SAPAAN.test(teks)) {
      const balasanSapaan: PesanObrolanBot = {
        id: `bot-sapaan-${idPesanRef.current++}`,
        percakapan_bot_id: 'aktif',
        peran: 'assistant',
        isi: 'Halo! Senang bisa menyapa Anda. Saya asisten Tanya Tani Muda, siap menjawab pertanyaan seputar budidaya tanaman dan panduan pertanian. Berikut beberapa hal yang sering ditanyakan:',
        sumber: null,
        dibuat_pada: 'H0T12:00',
      };
      setPesanLokal((prev) => [...prev, pesanPengguna, balasanSapaan]);
      return;
    }

    setPesanLokal((prev) => [...prev, pesanPengguna]);

    try {
      const res = await mutasiTanya.mutateAsync({ pesan: teks });
      const pesanBot: PesanObrolanBot = {
        id: `bot-${idPesanRef.current++}`,
        percakapan_bot_id: res.percakapan_id,
        peran: 'assistant',
        isi: res.jawaban,
        sumber: res.sumber,
        dibuat_pada: 'H0T12:00',
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

  if (!aktif) {
    return null;
  }

  return (
    <>
      {/* Tombol Mengambang (FAB) */}
      <div className="fixed bottom-22 right-4 z-40 lg:bottom-6 lg:right-6 [html:not(:has([data-nav-bawah]))_&]:bottom-4">
        <button
          id="tombol-buka-chatbot"
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

      {/* Jendela Obrolan (Panel rounded-3xl elegan di HP dan desktop) */}
      {terbuka && (
        <div
          id="panel-chatbot"
          role="dialog"
          aria-label="Panel Tanya Tani Muda"
          className="fixed inset-x-3 bottom-3 top-16 z-50 flex flex-col overflow-hidden rounded-3xl border border-garis bg-putih shadow-kartu-angkat md:inset-auto md:bottom-22 md:right-6 md:h-tab-siklus md:w-panel md:max-w-dialog md:rounded-3xl"
        >
          {/* Header */}
          <div className="flex min-h-14 items-center justify-between border-b border-garis bg-daun-tua px-4 py-3 text-putih">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-daun-lembut text-daun-tua">
                <Ikon nama="kebun" ukuran={20} />
              </div>
              <div>
                <h2 className="m-0 text-isi font-semibold leading-tight text-putih">Tanya Tani Muda</h2>
                <p className="m-0 text-keterangan text-teks-redup">Asisten Budidaya & Pengetahuan</p>
              </div>
            </div>
            <button
              id="tombol-tutup-chatbot"
              type="button"
              onClick={() => setTerbuka(false)}
              aria-label="Tutup Tanya Tani Muda"
              className="flex h-10 w-10 min-h-sentuh min-w-sentuh cursor-pointer items-center justify-center rounded-full text-putih hover:bg-daun-tekan focus:outline-none transition-colors"
            >
              <Ikon nama="silang" ukuran={20} />
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
              <div className="flex flex-col gap-3 rounded-2xl border border-garis bg-daun-lembut p-4">
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
                  <div className="my-auto flex flex-col items-center gap-3 text-center text-teks-pendukung">
                    <Ikon nama="info" ukuran={32} />
                    <div>
                      <p className="m-0 text-isi font-semibold text-teks">
                        Halo Petani Muda! Ada yang bisa kami bantu?
                      </p>
                      <p className="m-0 mt-0.5 text-keterangan">
                        Pilih contoh pertanyaan di bawah atau ketik pertanyaanmu sendiri:
                      </p>
                    </div>
                    <div className="mt-2 flex flex-col gap-2 w-full text-left">
                      {CONTOH_PERTANYAAN.map((tanya, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => void kirimPertanyaan(tanya)}
                          className="fokus-cincin rounded-xl border border-garis bg-daun-lembut/80 p-2.5 text-keterangan font-medium text-daun-tua hover:bg-daun-lembut transition-colors"
                        >
                          💡 {tanya}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {daftarPesan.map((p, idx) => {
                  const adalahSapaanBot =
                    p.peran === 'assistant' &&
                    p.isi.includes('Berikut beberapa hal yang sering ditanyakan');
                  const perluTombolPenyuluh =
                    p.peran === 'assistant' &&
                    (p.isi.toLowerCase().includes('belum ada') ||
                      p.isi.toLowerCase().includes('tanya penyuluh'));

                  return (
                    <div
                      key={p.id}
                      className={`flex flex-col ${p.peran === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-panel rounded-2xl px-4 py-2.5 text-isi shadow-kartu ${
                          p.peran === 'user'
                            ? 'rounded-br-xs bg-daun-tua text-putih'
                            : 'rounded-bl-xs border border-garis bg-embun-pagi text-teks'
                        }`}
                      >
                        <p className="m-0 whitespace-pre-wrap leading-relaxed">{p.isi}</p>

                        {/* 3 contoh pertanyaan jika bot membalas sapaan */}
                        {adalahSapaanBot && (
                          <div className="mt-3 flex flex-col gap-1.5 border-t border-garis/60 pt-2.5">
                            {CONTOH_PERTANYAAN.map((tanya, tIdx) => (
                              <button
                                key={tIdx}
                                type="button"
                                onClick={() => void kirimPertanyaan(tanya)}
                                className="fokus-cincin rounded-xl border border-garis bg-putih p-2 text-left text-keterangan font-medium text-daun-tua hover:bg-daun-lembut transition-colors"
                              >
                                💡 {tanya}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Tombol Tanya Penyuluh (WhatsApp) */}
                        {perluTombolPenyuluh && (
                          <div className="mt-3 border-t border-garis/60 pt-2">
                            <a
                              href={`https://wa.me/${noWa}?text=${encodeURIComponent(
                                `Halo Penyuluh Tani Muda, saya ingin berkonsultasi seputar pertanian: "${
                                  daftarPesan
                                    .slice(0, idx)
                                    .findLast((x) => x.peran === 'user')?.isi ?? 'panduan budidaya'
                                }"`,
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="fokus-cincin inline-flex items-center gap-1.5 rounded-full bg-daun-tua px-4 py-2 text-keterangan font-semibold text-putih shadow-kartu hover:bg-daun-tekan transition-all"
                            >
                              <span>💬 Tanya penyuluh</span>
                            </a>
                          </div>
                        )}

                        {p.sumber && p.sumber.length > 0 && (
                          <div className="mt-2 border-t border-garis pt-2 text-keterangan">
                            <p className="m-0 font-medium text-teks-pendukung">Sumber Rujukan:</p>
                            {p.sumber.map((s, sIdx) => (
                              <div
                                key={sIdx}
                                className="mt-1 rounded-xl border border-garis bg-putih p-2 text-keterangan text-teks"
                              >
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
                  );
                })}

                {mutasiTanya.isPending && (
                  <div className="flex items-start">
                    <div className="rounded-2xl rounded-bl-xs border border-garis bg-embun-pagi px-4 py-2 text-keterangan text-teks-pendukung shadow-kartu">
                      Sedang mencari di modul dan resep...
                    </div>
                  </div>
                )}

                <div ref={akhirObrolanRef} />
              </>
            )}
          </div>

          {/* Form Kirim (Menempel di bawah di atas keyboard) */}
          {sudahSetuju && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void kirimPertanyaan();
              }}
              className="sticky bottom-0 flex items-center gap-2 border-t border-garis bg-putih p-3 shadow-kartu"
            >
              <input
                id="input-chatbot"
                type="text"
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                placeholder="Tanyakan sesuatu seputar tanaman..."
                className="flex-1 rounded-full border border-garis bg-embun-pagi px-4 py-2.5 text-isi text-teks placeholder:text-teks-pendukung focus:border-daun-tua focus:bg-putih focus:outline-none"
              />
              <button
                id="tombol-kirim-chatbot"
                type="submit"
                disabled={!pesan.trim() || mutasiTanya.isPending}
                aria-label="Kirim pesan"
                className="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full bg-daun-tua text-putih transition duration-cepat ease-keluar hover:bg-daun-tekan disabled:cursor-not-allowed disabled:bg-garis disabled:text-teks-pendukung"
              >
                <Ikon nama="panah-kanan" ukuran={18} />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
