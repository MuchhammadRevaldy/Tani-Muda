/**
 * Editor resep (turunan, T4.39, PRD P0-03, P0-04, US-19): tanaman dan hasil, bahan dan alat
 * (dosis, dasar dosis, kemasan, harga contoh), tugas (sekali, berulang, ukur dengan rentang dan
 * saran). Simpan selalu menjadi versi baru berstatus draf (K3); siklus berjalan tetap memakai versi
 * lamanya. Isian diperiksa `validasiResep` sebelum dikirim. Desktop saja, tabel sederhana (D-07).
 */
import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import { useKomoditas, useMetode, useResepMentor, useSimpanResep } from '../../api/kueri';
import type { DasarDosis, ResepTanam, TipeTugas } from '../../api/tipe';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import {
  KolomIsian,
  KolomTeks,
  PesanKolom,
} from '../../komponen/kolom-isian';
import { PilihanDropdown } from '../../komponen/pilihan-dropdown';
import { Kepala, Sel, Tabel } from '../../komponen/tabel';
import { Tombol } from '../../komponen/tombol';
import type { MasalahResep } from '../../lib/validasi-resep';
import { teksGalat } from '../../teks/galat';
import { teksPanel } from '../../teks/panel';
import { teksUmum } from '../../teks/umum';
import { Memuat } from '../memuat';
import { KerangkaPanelSesi } from '../panel/kerangka-panel-sesi';
import {
  formDariResep,
  formKosong,
  inputKosong,
  keMasukan,
  kunciMasalah,
  periksaForm,
  tugasKosong,
  ukurKosong,
  useNamaResep,
  type BarisInput,
  type BarisTugas,
  type BarisUkur,
  type FormResep,
} from './form-resep';

const t = teksPanel.mentor;

function Pilih<T extends string>({
  label,
  nilai,
  opsi,
  onUbah,
  galat,
  labelTersembunyi,
}: {
  label: string;
  nilai: T;
  opsi: { nilai: T; label: string }[];
  onUbah: (v: T) => void;
  galat?: string;
  labelTersembunyi?: boolean;
}) {
  const id = `pilih-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <PilihanDropdown<T>
      id={id}
      label={label}
      labelTersembunyi={labelTersembunyi}
      nilai={nilai}
      onChange={onUbah}
      galat={galat}
      pilihan={opsi.map((o) => ({
        nilai: o.nilai,
        label: o.label,
        komoditasId: o.nilai,
      }))}
    />
  );
}

function Centang({
  label,
  nilai,
  onUbah,
}: {
  label: string;
  nilai: boolean;
  onUbah: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-sentuh cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={nilai}
        onChange={(e) => onUbah(e.target.checked)}
        className="fokus-cincin h-6 w-6 flex-none cursor-pointer accent-daun-tua"
      />
      <span>{label}</span>
    </label>
  );
}

function TombolHapus({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="fokus-cincin grid h-sentuh w-sentuh cursor-pointer place-items-center rounded-md border-0 bg-transparent text-tomat-teks hover:bg-tomat-lembut"
    >
      <Ikon nama="hapus" ukuran={20} />
    </button>
  );
}

function Editor({ awal, asal }: { awal: FormResep; asal: ResepTanam | null }) {
  const navigate = useNavigate();
  const simpan = useSimpanResep();
  const komoditasQ = useKomoditas();
  const metodeQ = useMetode();
  const nama = useNamaResep();
  const [f, setF] = useState<FormResep>(awal);
  const [masalah, setMasalah] = useState<MasalahResep[]>([]);
  const [galatUmum, setGalatUmum] = useState<string | null>(null);

  const metode = metodeQ.data?.find((m) => m.id === f.metode_id) ?? null;
  const dasar = metode?.dasar_ukuran ?? 'luas';
  const galat = (k: string) => {
    const x = masalah.find((m) => kunciMasalah(m) === k);
    return x ? teksGalat[x.kode] : undefined;
  };
  const ubah = (u: Partial<FormResep>) => setF((l) => ({ ...l, ...u }));
  const ubahInput = (i: number, u: Partial<BarisInput>) =>
    setF((l) => ({ ...l, input: l.input.map((x, k) => (k === i ? { ...x, ...u } : x)) }));
  const ubahTugas = (i: number, u: Partial<BarisTugas>) =>
    setF((l) => ({ ...l, tugas: l.tugas.map((x, k) => (k === i ? { ...x, ...u } : x)) }));
  const ubahUkur = (i: number, j: number, u: Partial<BarisUkur>) =>
    setF((l) => ({
      ...l,
      tugas: l.tugas.map((x, k) =>
        k === i ? { ...x, ukur: x.ukur.map((b, n) => (n === j ? { ...b, ...u } : b)) } : x,
      ),
    }));

  async function kirim() {
    setGalatUmum(null);
    if (!f.komoditas_id || !f.metode_id) {
      setMasalah([]);
      return setGalatUmum(t.periksaIsian);
    }
    const masukan = keMasukan(f, dasar, asal?.id ?? null);
    const m = periksaForm(masukan);
    setMasalah(m);
    if (m.length) return setGalatUmum(t.periksaIsian);
    try {
      const v = await simpan.mutateAsync(masukan);
      navigate('/mentor', { state: { info: `${nama(v)}: ${t.tersimpan(v.versi)}` } });
    } catch (e) {
      setGalatUmum(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  const lokasiMasalah = (m: MasalahResep) => {
    const bagian =
      m.kolom === 'input' ? t.bagianInput : m.kolom === 'tugas' ? t.bagianTugas : t.bagianUmum;
    return m.indeks !== undefined ? t.masalahDi(bagian, m.indeks + 1) : bagian;
  };

  const umum = (
    <Kartu judul={t.bagianUmum} tingkatJudul={2}>
      <div className="grid gap-4 lg:grid-cols-3">
        {asal ? (
          <p className="m-0 font-semibold lg:col-span-3">{nama(asal)}</p>
        ) : (
          <>
            <Pilih
              label={t.komoditas}
              nilai={f.komoditas_id}
              onUbah={(v) => ubah({ komoditas_id: v })}
              opsi={[
                { nilai: '', label: t.pilih },
                ...(komoditasQ.data ?? []).map((k) => ({ nilai: k.id, label: k.nama })),
              ]}
              galat={galatUmum && !f.komoditas_id ? t.pilih : undefined}
            />
            <Pilih
              label={t.metode}
              nilai={f.metode_id}
              onUbah={(v) => ubah({ metode_id: v })}
              opsi={[
                { nilai: '', label: t.pilih },
                ...(metodeQ.data ?? []).map((m) => ({ nilai: m.id, label: m.nama })),
              ]}
              galat={galatUmum && !f.metode_id ? t.pilih : undefined}
            />
            <span className="hidden lg:block" />
          </>
        )}
        <KolomIsian
          label={t.hasilPerSatuan(t.dasar[dasar] ?? dasar)}
          inputMode="decimal"
          value={f.hasil}
          onChange={(e) => ubah({ hasil: e.target.value })}
          galat={galat('hasilPerSatuan')}
        />
        <KolomIsian
          label={t.umurPanen}
          inputMode="numeric"
          value={f.umur}
          onChange={(e) => ubah({ umur: e.target.value })}
          galat={galat('umurPanenHari')}
        />
        {dasar === 'lubang' ? (
          <KolomIsian
            label={t.pengisianLarutan}
            inputMode="numeric"
            value={f.pengisian}
            onChange={(e) => ubah({ pengisian: e.target.value })}
          />
        ) : (
          <span className="hidden lg:block" />
        )}
        <KolomIsian
          label={t.persenJelek}
          inputMode="decimal"
          value={f.persenJelek}
          onChange={(e) => ubah({ persenJelek: e.target.value })}
          galat={galat('persenPanenJelek')}
        />
        <KolomIsian
          label={t.alasanJelek}
          value={f.alasanJelek}
          onChange={(e) => ubah({ alasanJelek: e.target.value })}
          className="lg:col-span-2"
        />
        <KolomTeks
          label={t.standar}
          value={f.standar}
          onChange={(e) => ubah({ standar: e.target.value })}
          className="lg:col-span-3"
        />
      </div>
    </Kartu>
  );

  const sel = (
    i: number,
    kolom: keyof BarisInput,
    label: string,
    bagian: string,
    mode?: 'decimal' | 'numeric',
  ) => (
    <KolomIsian
      label={`${label} ${t.baris(i + 1)}`}
      labelTersembunyi
      inputMode={mode}
      value={String(f.input[i]![kolom] ?? '')}
      onChange={(e) => ubahInput(i, { [kolom]: e.target.value } as Partial<BarisInput>)}
      galat={galat(`input.${i}.${bagian}`)}
      className={kolom === 'nama' || kolom === 'grup' ? 'w-sidebar' : 'w-24'}
    />
  );

  const bahan = (
    <section className="flex flex-col gap-3">
      <h2 className="m-0 text-judul-bagian font-semibold">{t.bagianInput}</h2>
      <Tabel
        label={t.bagianInput}
        kepala={
          <>
            <Kepala>{t.kolomNamaInput}</Kepala>
            <Kepala>{t.kolomGrup}</Kepala>
            <Kepala>{t.kolomDosis}</Kepala>
            <Kepala>{t.kolomSatuanDosis}</Kepala>
            <Kepala>{t.kolomDasarDosis}</Kepala>
            <Kepala>{t.kolomSatuanBeli}</Kepala>
            <Kepala>{t.kolomIsi}</Kepala>
            <Kepala>{t.kolomKemasan}</Kepala>
            <Kepala>{t.kolomHarga}</Kepala>
            <Kepala>{t.kolomAlat}</Kepala>
            <Kepala>
              <span className="sr-saja">{teksUmum.tutup}</span>
            </Kepala>
          </>
        }
      >
        {f.input.map((x, i) => (
          <tr key={x.id}>
            <Sel>{sel(i, 'nama', t.kolomNamaInput, 'nama')}</Sel>
            <Sel>{sel(i, 'grup', t.kolomGrup, 'grup')}</Sel>
            <Sel>{sel(i, 'dosis', t.kolomDosis, 'dosis', 'decimal')}</Sel>
            <Sel>{sel(i, 'satuan_dosis', t.kolomSatuanDosis, 'satuanDosis')}</Sel>
            <Sel>
              <Pilih<DasarDosis>
                label={`${t.kolomDasarDosis} ${t.baris(i + 1)}`}
                labelTersembunyi
                nilai={x.dasar_dosis}
                onUbah={(v) => ubahInput(i, { dasar_dosis: v })}
                opsi={(['per_m2', 'per_tanaman', 'per_liter', 'per_siklus'] as const).map((d) => ({
                  nilai: d,
                  label: t.dasarDosis[d] ?? d,
                }))}
              />
            </Sel>
            <Sel>{sel(i, 'satuan_beli', t.kolomSatuanBeli, 'satuanBeli')}</Sel>
            <Sel>{sel(i, 'isi', t.kolomIsi, 'isiSatuanBeli', 'decimal')}</Sel>
            <Sel>{sel(i, 'kemasan', t.kolomKemasan, 'ukuranKemasan', 'decimal')}</Sel>
            <Sel>{sel(i, 'harga', t.kolomHarga, 'hargaContoh', 'numeric')}</Sel>
            <Sel>
              <Centang
                label={`${t.kolomAlat} ${t.baris(i + 1)}`}
                nilai={x.alat}
                onUbah={(v) => ubahInput(i, { alat: v })}
              />
            </Sel>
            <Sel>
              <TombolHapus
                label={t.hapusBaris(i + 1)}
                onClick={() => ubah({ input: f.input.filter((_, k) => k !== i) })}
              />
            </Sel>
          </tr>
        ))}
      </Tabel>
      <Tombol
        varian="sekunder"
        ikon="tambah"
        className="self-start"
        onClick={() => ubah({ input: [...f.input, inputKosong()] })}
      >
        {t.tambahInput}
      </Tombol>
    </section>
  );

  const tugas = (
    <section className="flex flex-col gap-3">
      <h2 className="m-0 text-judul-bagian font-semibold">{t.bagianTugas}</h2>
      {galat('tugas') ? <PesanKolom id="galat-tugas" galat={galat('tugas')} /> : null}
      {f.tugas.map((x, i) => {
        const ulang = x.tipe !== 'sekali';
        return (
          <fieldset
            key={x.id}
            className="m-0 flex min-w-0 flex-col gap-4 rounded-lg border border-garis bg-putih p-4"
          >
            <legend className="sr-saja">{`${t.bagianTugas} ${t.baris(i + 1)}`}</legend>
            <div className="grid items-start gap-4 lg:grid-cols-6">
              <Pilih<TipeTugas>
                label={`${t.kolomTipe} (${t.baris(i + 1)})`}
                nilai={x.tipe}
                onUbah={(v) =>
                  ubahTugas(i, {
                    tipe: v,
                    ukur: v === 'ukur' && !x.ukur.length ? [ukurKosong()] : x.ukur,
                  })
                }
                opsi={(['sekali', 'berulang', 'ukur'] as const).map((v) => ({
                  nilai: v,
                  label: t.tipe[v] ?? v,
                }))}
              />
              <KolomIsian
                label={t.kolomJudul}
                value={x.judul}
                onChange={(e) => ubahTugas(i, { judul: e.target.value })}
                galat={galat(`tugas.${i}.judul`)}
                className="lg:col-span-2"
              />
              <KolomIsian
                label={t.kolomHstMulai}
                inputMode="numeric"
                value={x.mulai}
                onChange={(e) => ubahTugas(i, { mulai: e.target.value })}
                galat={galat(`tugas.${i}.hstMulai`)}
              />
              {ulang ? (
                <>
                  <KolomIsian
                    label={t.kolomHstSelesai}
                    inputMode="numeric"
                    value={x.selesai}
                    onChange={(e) => ubahTugas(i, { selesai: e.target.value })}
                    galat={galat(`tugas.${i}.hstSelesai`)}
                  />
                  <KolomIsian
                    label={t.kolomInterval}
                    inputMode="numeric"
                    value={x.interval}
                    onChange={(e) => ubahTugas(i, { interval: e.target.value })}
                    galat={galat(`tugas.${i}.interval`)}
                  />
                </>
              ) : null}
            </div>
            <div className="grid items-start gap-4 lg:grid-cols-2">
              <KolomTeks
                label={t.caraMengerjakan}
                value={x.cara}
                onChange={(e) => ubahTugas(i, { cara: e.target.value })}
              />
              <div className="flex flex-col gap-2">
                <KolomIsian
                  label={t.saranTerlambat}
                  value={x.saran}
                  onChange={(e) => ubahTugas(i, { saran: e.target.value })}
                />
                <Centang
                  label={t.kolomGeser}
                  nilai={x.geser}
                  onUbah={(v) => ubahTugas(i, { geser: v })}
                />
              </div>
            </div>
            {x.tipe === 'ukur' ? (
              <div className="flex flex-col gap-2">
                <h3 className="m-0 font-semibold">{t.bagianUkur(x.judul)}</h3>
                <Tabel
                  label={t.bagianUkur(x.judul)}
                  kepala={
                    <>
                      {[
                        t.kolomBesaran,
                        t.kolomSatuan,
                        t.kolomBawah,
                        t.kolomAtas,
                        t.kolomSkalaMin,
                        t.kolomSkalaMaks,
                        t.kolomSaranRendah,
                        t.kolomSaranTinggi,
                      ].map((k) => (
                        <Kepala key={k}>{k}</Kepala>
                      ))}
                      <Kepala>
                        <span className="sr-saja">{teksUmum.tutup}</span>
                      </Kepala>
                    </>
                  }
                >
                  {x.ukur.map((b, j) => {
                    const g = galat(`tugas.${i}.ukur.${j}`);
                    const isi = (kolom: keyof BarisUkur, label: string, mode?: 'decimal') => (
                      <KolomIsian
                        label={`${label} ${t.baris(j + 1)}`}
                        labelTersembunyi
                        inputMode={mode}
                        value={b[kolom]}
                        onChange={(e) => ubahUkur(i, j, { [kolom]: e.target.value })}
                        className="w-24"
                      />
                    );
                    return (
                      <tr key={j}>
                        <Sel>
                          {isi('nama', t.kolomBesaran)}
                          {g ? <PesanKolom id={`galat-ukur-${i}-${j}`} galat={g} /> : null}
                        </Sel>
                        <Sel>{isi('satuan', t.kolomSatuan)}</Sel>
                        <Sel>{isi('bawah', t.kolomBawah, 'decimal')}</Sel>
                        <Sel>{isi('atas', t.kolomAtas, 'decimal')}</Sel>
                        <Sel>{isi('skalaMin', t.kolomSkalaMin, 'decimal')}</Sel>
                        <Sel>{isi('skalaMaks', t.kolomSkalaMaks, 'decimal')}</Sel>
                        <Sel>{isi('saranRendah', t.kolomSaranRendah)}</Sel>
                        <Sel>{isi('saranTinggi', t.kolomSaranTinggi)}</Sel>
                        <Sel>
                          <TombolHapus
                            label={`${t.hapusBaris(j + 1)} ${t.bagianUkur(x.judul)}`}
                            onClick={() => ubahTugas(i, { ukur: x.ukur.filter((_, n) => n !== j) })}
                          />
                        </Sel>
                      </tr>
                    );
                  })}
                </Tabel>
                <Tombol
                  varian="sekunder"
                  ikon="tambah"
                  className="self-start"
                  onClick={() => ubahTugas(i, { ukur: [...x.ukur, ukurKosong()] })}
                >
                  {t.tambahUkur}
                </Tombol>
              </div>
            ) : null}
            <div className="flex justify-end">
              <Tombol
                varian="sekunder"
                ikon="hapus"
                onClick={() => ubah({ tugas: f.tugas.filter((_, k) => k !== i) })}
              >
                {t.hapusBaris(i + 1)}
              </Tombol>
            </div>
          </fieldset>
        );
      })}
      <Tombol
        varian="sekunder"
        ikon="tambah"
        className="self-start"
        onClick={() => ubah({ tugas: [...f.tugas, tugasKosong()] })}
      >
        {t.tambahTugas}
      </Tombol>
    </section>
  );

  return (
    <>
      {umum}
      {bahan}
      {tugas}
      {galatUmum ? (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-md border-2 border-tomat bg-tomat-lembut p-4"
        >
          <p className="m-0 font-semibold text-tomat-teks">{galatUmum}</p>
          {masalah.length ? (
            <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
              {masalah.map((m, i) => (
                <li key={i}>
                  {lokasiMasalah(m)}: {teksGalat[m.kode]}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="flex gap-3">
        <Tombol disabled={simpan.isPending} onClick={() => void kirim()}>
          {simpan.isPending ? teksPanel.menyimpan : t.simpan}
        </Tombol>
        <Link
          to="/mentor"
          className="fokus-cincin inline-flex min-h-kontrol items-center rounded-md px-4 font-semibold text-daun-tua"
        >
          {teksPanel.batal}
        </Link>
      </div>
    </>
  );
}

export function HalamanEditorResep() {
  const { id = 'baru' } = useParams();
  const resepQ = useResepMentor();
  const nama = useNamaResep();
  const asal = id === 'baru' ? null : (resepQ.data?.find((r) => r.id === id) ?? null);
  const kembali = (
    <Link
      to="/mentor"
      className="fokus-cincin -ml-2 inline-flex min-h-sentuh items-center gap-1 self-start rounded-md pl-1 pr-3 font-medium text-daun-tua no-underline"
    >
      <Ikon nama="panah-kiri" ukuran={20} />
      <span>{t.kembali}</span>
    </Link>
  );
  let isi: ReactNode;
  if (id !== 'baru' && resepQ.isPending) isi = <Memuat />;
  else if (id !== 'baru' && !asal)
    isi = <p className="m-0 text-teks-pendukung">{teksUmum.tidakDitemukanIsi}</p>;
  else isi = <Editor key={id} awal={asal ? formDariResep(asal) : formKosong()} asal={asal} />;
  return (
    <KerangkaPanelSesi
      judul={asal ? t.editorUbah(nama(asal), asal.versi) : t.editorBaru}
      keterangan={t.editorKet}
    >
      {kembali}
      {isi}
    </KerangkaPanelSesi>
  );
}
