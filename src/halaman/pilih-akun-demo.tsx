/**
 * Pemilih akun demo (turunan, papan 43, T4.01). Hanya mode pengembangan dengan data tiruan: rute ini
 * didaftarkan dan dimuat hanya bila `import.meta.env.DEV`, dan kontrol pengembangan bernilai null
 * di luar klien tiruan. Tidak pernah ikut build produksi (D-36; dicek scripts/cek-build.mjs).
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useKontrolPengembangan } from '../api/penyedia-klien';
import { berandaPeran, useGantiPengguna } from '../api/sesi';
import type { Peran } from '../api/tipe';
import { Avatar } from '../komponen/avatar';
import { Kartu } from '../komponen/kartu';
import { LabelKecil } from '../komponen/label-kecil';
import { Logo } from '../komponen/navigasi';
import { kelasTombol, Tombol } from '../komponen/tombol';
import { teksPengembangan as t } from '../teks/pengembangan';
import { namaPeran } from '../teks/sesi';

export default function HalamanPilihAkunDemo() {
  const kontrol = useKontrolPengembangan();
  const gantiPengguna = useGantiPengguna();
  const navigate = useNavigate();
  const [sedang, setSedang] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function masuk(id: string, peran: string) {
    if (!kontrol) return;
    setSedang(id);
    await kontrol.masukSebagai(id);
    await gantiPengguna();
    navigate(berandaPeran(peran as Peran), { replace: true });
  }

  async function aturUlang() {
    if (!kontrol) return;
    setSedang('atur-ulang');
    await kontrol.aturUlang();
    await gantiPengguna();
    setSedang(null);
    setInfo(t.sudahDiaturUlang);
  }

  return (
    <div className="min-h-layar bg-embun-pagi text-teks">
      <main className="mx-auto flex max-w-konten flex-col gap-6 px-4 pb-12 pt-4 lg:px-10 lg:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Logo />
          <LabelKecil nada="contoh">{t.penanda}</LabelKecil>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-judul-halaman font-semibold">{t.judulAkunDemo}</h1>
          <p className="m-0 max-w-teks text-keterangan text-teks-pendukung">
            {kontrol ? t.subAkunDemo : t.hanyaTiruan}
          </p>
        </div>

        {kontrol ? (
          <>
            <section aria-label={t.daftarAkun} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {kontrol.penggunaUji().map((p) => (
                <Kartu key={p.id} className="flex flex-col">
                  <div className="flex items-start gap-3">
                    <Avatar nama={p.nama} gaya="inisial" />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-semibold">{p.nama}</span>
                      <span className="text-keterangan text-teks-pendukung">
                        {namaPeran[p.peran as Peran] ?? p.peran} · {p.keterangan}
                      </span>
                    </div>
                  </div>
                  <Tombol
                    varian="sekunder"
                    penuh
                    className="mt-4"
                    disabled={sedang !== null}
                    onClick={() => void masuk(p.id, p.peran)}
                  >
                    {t.masukSebagai(p.nama.split(' ')[0] ?? p.nama)}
                  </Tombol>
                </Kartu>
              ))}
            </section>
            <Kartu judul={t.aturUlang} keterangan={t.aturUlangKeterangan}>
              <div className="flex flex-wrap items-center gap-4">
                <Tombol
                  varian="sekunder"
                  disabled={sedang !== null}
                  onClick={() => void aturUlang()}
                >
                  {t.aturUlang}
                </Tombol>
                {info ? (
                  <p role="status" className="m-0 text-daun-tua">
                    {info}
                  </p>
                ) : null}
              </div>
            </Kartu>
          </>
        ) : null}

        <Link to="/masuk" className={kelasTombol('utama') + ' self-start'}>
          {t.keMasuk}
        </Link>
      </main>
    </div>
  );
}
