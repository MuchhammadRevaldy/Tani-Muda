/**
 * Daftar resep mentor (turunan, T4.38, PRD P0-04, US-19): satu baris per tanaman dan cara tanam
 * dengan versi terbaru, status validasi, validator, dan versi sebelumnya yang bisa dibuka. Resep
 * contoh tidak bisa divalidasi langsung; ubah dulu menjadi versi baru (K3). Desktop saja (D-07).
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adalahGalatApi } from '../../api/galat';
import { useResepMentor, useValidasiResep } from '../../api/kueri';
import type { ResepTanam } from '../../api/tipe';
import { Ikon } from '../../komponen/ikon';
import { PesanKolom } from '../../komponen/kolom-isian';
import { LabelKecil } from '../../komponen/label-kecil';
import { Kepala, Sel, Tabel } from '../../komponen/tabel';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { formatTanggal } from '../../lib/format';
import { teksPanel } from '../../teks/panel';
import { teksUmum } from '../../teks/umum';
import { teksGagalMuat } from '../../teks/galat-api';
import { Memuat } from '../memuat';
import { KerangkaPanelSesi } from '../panel/kerangka-panel-sesi';
import { kelompokResep, useNamaResep } from './form-resep';

const t = teksPanel.mentor;

function Status({ r }: { r: ResepTanam }) {
  if (r.contoh) return <LabelKecil nada="contoh">{t.contoh}</LabelKecil>;
  return r.status === 'divalidasi' ? (
    <LabelKecil nada="hijau" ikon="centang">
      {t.divalidasi}
    </LabelKecil>
  ) : (
    <LabelKecil nada="garis">{t.draf}</LabelKecil>
  );
}

export function HalamanDaftarResep() {
  const resepQ = useResepMentor();
  const validasi = useValidasiResep();
  const nama = useNamaResep();
  const lokasi = useLocation();
  const [info, setInfo] = useState<string | null>(
    () => (lokasi.state as { info?: string } | null)?.info ?? null,
  );
  const [galat, setGalat] = useState<string | null>(null);

  async function tandai(r: ResepTanam) {
    setInfo(null);
    setGalat(null);
    try {
      const v = await validasi.mutateAsync(r.id);
      setInfo(t.tervalidasi(nama(v), v.versi));
    } catch (e) {
      setGalat(adalahGalatApi(e) ? e.message : teksUmum.galatIsi);
    }
  }

  const kelompok = kelompokResep(resepQ.data ?? []).sort((a, b) =>
    nama(a[0]!).localeCompare(nama(b[0]!)),
  );
  return (
    <KerangkaPanelSesi judul={t.resepJudul} keterangan={t.resepKet}>
      <Link to="/mentor/resep/baru" className={`${kelasTombol('utama')} self-start`}>
        <Ikon nama="tambah" ukuran={20} />
        {t.buatResep}
      </Link>
      {info ? (
        <p role="status" className="m-0 flex items-center gap-2 font-medium text-daun-tua">
          <Ikon nama="centang" ukuran={20} />
          {info}
        </p>
      ) : null}
      {galat ? <PesanKolom id="galat-resep" galat={galat} /> : null}
      {resepQ.isPending ? (
        <Memuat />
      ) : resepQ.isError ? (
        <p className="m-0 text-teks-pendukung">{teksGagalMuat(resepQ.error)}</p>
      ) : (
        <Tabel
          label={t.resepJudul}
          kepala={
            <>
              <Kepala>{t.kolomResep}</Kepala>
              <Kepala>{t.kolomVersi}</Kepala>
              <Kepala>{t.kolomStatus}</Kepala>
              <Kepala>{t.kolomValidator}</Kepala>
              <Kepala>{t.kolomTindakan}</Kepala>
            </>
          }
        >
          {kelompok.map((versi) => {
            const r = versi[0]!;
            const n = nama(r);
            return (
              <tr key={`${r.komoditas_id}|${r.metode_id}`}>
                <Sel>
                  <p className="m-0 font-semibold">{n}</p>
                  {versi.length > 1 ? (
                    <details className="mt-1">
                      <summary className="fokus-cincin inline-flex min-h-sentuh cursor-pointer items-center rounded-sm text-teks-pendukung">
                        {t.versiLama(versi.length - 1)}
                      </summary>
                      <ul className="m-0 flex list-none flex-col gap-1 p-0">
                        {versi.slice(1).map((v) => (
                          <li key={v.id} className="flex items-center gap-2">
                            <span>{t.versi(v.versi)}</span>
                            <Status r={v} />
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </Sel>
                <Sel className="whitespace-nowrap">{t.versi(r.versi)}</Sel>
                <Sel>
                  <Status r={r} />
                  {r.contoh ? (
                    <p className="m-0 mt-1 max-w-pilihan-kotak text-keterangan text-teks-pendukung">
                      {t.contohKet}
                    </p>
                  ) : null}
                </Sel>
                <Sel>
                  {r.validator && r.tanggal_validasi
                    ? t.olehPada(r.validator, formatTanggal(r.tanggal_validasi))
                    : '–'}
                </Sel>
                <Sel>
                  <div className="flex gap-2">
                    <Link
                      to={`/mentor/resep/${encodeURIComponent(r.id)}`}
                      aria-label={t.ubahAria(n)}
                      className={kelasTombol('sekunder')}
                    >
                      {t.ubah}
                    </Link>
                    {!r.contoh && r.status === 'draf' ? (
                      <Tombol
                        aria-label={t.tandaiAria(n)}
                        disabled={validasi.isPending}
                        onClick={() => void tandai(r)}
                      >
                        {t.tandaiValidasi}
                      </Tombol>
                    ) : null}
                  </div>
                </Sel>
              </tr>
            );
          })}
        </Tabel>
      )}
    </KerangkaPanelSesi>
  );
}
