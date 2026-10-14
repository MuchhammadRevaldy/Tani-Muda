/**
 * Halaman Peta Petani di sekitar pembeli (PRD Tambahan F-08, D-64).
 * Menampilkan Leaflet map dengan ubin OpenStreetMap (atribusi wajib).
 * Radius 10 km atau 15 km dari pembeli.
 * Titik perkiraan (~1 km) petani yang bersedia tampil dan punya stok/pesanan.
 * Nomor HP tidak ditampilkan (D-64).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { usePetaPetani, useWilayahSatu, useWilayahTerdekat } from '../../api/kueri';
import { useSesi } from '../../api/sesi';
import type { PetaniPeta } from '../../api/tipe';
import { Avatar } from '../../komponen/avatar';
import { Ikon } from '../../komponen/ikon';
import { Kartu } from '../../komponen/kartu';
import { kelasTombol, Tombol } from '../../komponen/tombol';
import { formatRupiah } from '../../lib/format';
import { angkaJarak } from '../../lib/jarak';

// Perbaiki ikon penanda bawaan Leaflet untuk bundler Vite
const ikonPetaniSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="%232c6e49"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
const ikonPembeliSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="%23b85d19"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

const ikonPetani = L.icon({
  iconUrl: ikonPetaniSvg,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const ikonPembeli = L.icon({
  iconUrl: ikonPembeliSvg,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

export function HalamanPetaPetani() {
  const navigate = useNavigate();
  const { akun } = useSesi();
  const [radiusKm, setRadiusKm] = useState<10 | 15>(10);
  const [tampilan, setTampilan] = useState<'peta' | 'daftar'>('peta');
  const [petaniTerpilih, setPetaniTerpilih] = useState<PetaniPeta | null>(null);

  const [lokasiGps, setLokasiGps] = useState<{
    lintang: number;
    bujur: number;
    waktu: string;
  } | null>(null);
  const [pesanIzinDitolak, setPesanIzinDitolak] = useState<string | null>(null);
  const [sedangMencariGps, setSedangMencariGps] = useState(false);

  const pembeli = akun?.pengguna;
  const profilPembeli = akun?.profil_pembeli;
  const terverifikasi = profilPembeli?.status_verifikasi === 'terverifikasi';

  const wilayahQ = useWilayahSatu(profilPembeli?.wilayah_id ?? null);
  const wilayahTerdekatQ = useWilayahTerdekat(
    lokasiGps ? lokasiGps.lintang : null,
    lokasiGps ? lokasiGps.bujur : null,
  );

  const titikPusat = lokasiGps
    ? { lintang: lokasiGps.lintang, bujur: lokasiGps.bujur }
    : wilayahQ.data?.lintang != null && wilayahQ.data?.bujur != null
    ? { lintang: wilayahQ.data.lintang, bujur: wilayahQ.data.bujur }
    : { lintang: -6.8186, bujur: 107.6171 }; // Titik default pilot Lembang

  const namaDesa =
    (lokasiGps ? wilayahTerdekatQ.data?.desa : null) ??
    wilayahQ.data?.desa ??
    'Lembang';
  const namaKecamatan =
    (lokasiGps ? wilayahTerdekatQ.data?.kecamatan : null) ??
    wilayahQ.data?.kecamatan ??
    'Lembang';
  const sumberLokasi = lokasiGps
    ? `dari GPS perangkat, pukul ${lokasiGps.waktu}`
    : 'dari alamat usaha';

  function mintaLokasiGps() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPesanIzinDitolak(
        'Izinkan lokasi untuk melihat petani terdekat, atau kami pakai alamat usaha Anda.',
      );
      return;
    }
    setSedangMencariGps(true);
    setPesanIzinDitolak(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSedangMencariGps(false);
        // Koordinat dibulatkan 2 desimal (~1 km) sebelum dikirim
        const lat = Math.round(pos.coords.latitude * 100) / 100;
        const lng = Math.round(pos.coords.longitude * 100) / 100;
        const now = new Date();
        const jam = `${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
        setLokasiGps({ lintang: lat, bujur: lng, waktu: jam });
        setPesanIzinDitolak(null);
      },
      () => {
        setSedangMencariGps(false);
        setPesanIzinDitolak(
          'Izinkan lokasi untuk melihat petani terdekat, atau kami pakai alamat usaha Anda.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const petaQ = usePetaPetani(
    {
      radius_km: radiusKm,
      lintang: titikPusat.lintang,
      bujur: titikPusat.bujur,
    },
    Boolean(terverifikasi && pembeli),
  );

  const daftarPetani = useMemo(() => petaQ.data ?? [], [petaQ.data]);

  // Leaflet map ref
  const wadahPetaRef = useRef<HTMLDivElement | null>(null);
  const petaInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (tampilan !== 'peta' || !terverifikasi || !wadahPetaRef.current) return;

    // Bersihkan peta lama jika ada
    if (petaInstanceRef.current) {
      petaInstanceRef.current.remove();
      petaInstanceRef.current = null;
    }

    const map = L.map(wadahPetaRef.current).setView(
      [titikPusat.lintang, titikPusat.bujur],
      radiusKm === 10 ? 12 : 11,
    );
    petaInstanceRef.current = map;

    // Atribusi wajib OpenStreetMap (F-08)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Lingkaran radius
    L.circle([titikPusat.lintang, titikPusat.bujur], {
      radius: radiusKm * 1000,
      color: 'green',
      fillColor: 'lightgreen',
      fillOpacity: 0.2,
      weight: 2,
    }).addTo(map);

    // Marker pembeli di pusat
    L.marker([titikPusat.lintang, titikPusat.bujur], { icon: ikonPembeli })
      .addTo(map)
      .bindPopup(
        `<b>Lokasimu sekarang</b><br/>Desa ${namaDesa}, Kec. ${namaKecamatan}<br/><span style="opacity:0.8;">(${sumberLokasi})</span>`,
      );

    // Marker petani-petani sekitar
    for (const p of daftarPetani) {
      const marker = L.marker([p.titik.lintang, p.titik.bujur], { icon: ikonPetani }).addTo(map);

      const jumlahStok = p.stok_tersedia.reduce((acc, s) => acc + s.sisa_kg, 0);
      const labelStok = jumlahStok > 0 ? `${jumlahStok} kg stok siap jual` : 'Menerima pesanan';

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 14px;">
          <b>${p.nama}</b> (${p.level.ikon} Level ${p.level.level})<br/>
          <span>Jarak: ~${p.jarak_km} km</span><br/>
          <span>${labelStok}</span>
        </div>
      `);

      marker.on('click', () => {
        setPetaniTerpilih(p);
      });
    }

    return () => {
      map.remove();
      petaInstanceRef.current = null;
    };
  }, [
    tampilan,
    terverifikasi,
    titikPusat.lintang,
    titikPusat.bujur,
    radiusKm,
    daftarPetani,
    namaDesa,
    namaKecamatan,
    sumberLokasi,
  ]);

  // Bila pembeli belum terverifikasi, tampilkan kartu penolakan / syarat sesuai PRD F-08
  if (!terverifikasi) {
    return (
      <div className="mx-auto flex max-w-pembeli flex-col gap-6 py-4">
        <div>
          <h1 className="m-0 text-judul-halaman font-semibold text-teks">Peta Petani Sekitar</h1>
          <p className="m-0 text-teks-pendukung">
            Temukan petani mitra Tani Muda di radius 10–15 km dari tempat usahamu.
          </p>
        </div>

        <Kartu judul="Verifikasi dibutuhkan" tingkatJudul={2}>
          <div className="flex flex-col gap-4">
            <p className="m-0 text-isi text-teks">
              Sesuai aturan pelindungan privasi dan keamanan petani mitra (UU No. 27 Tahun 2022 & D-64),
              peta sebaran petani hanya dapat dilihat oleh <strong>pembeli yang usahanya sudah terverifikasi</strong> oleh admin Tani Muda.
            </p>
            <p className="m-0 text-keterangan text-teks-pendukung">
              Status usahamu saat ini:{' '}
              <span className="font-semibold text-tanah capitalize">
                {profilPembeli?.status_verifikasi ?? 'Belum mengisi profil'}
              </span>
            </p>
            <div className="pt-2">
              <Link to="/pembeli/daftar" className={kelasTombol('utama')}>
                Lengkapi Data Usaha
              </Link>
            </div>
          </div>
        </Kartu>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-pembeli flex-col gap-6 py-4">
      {/* Baris judul dan filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="m-0 text-judul-halaman font-semibold text-teks">Peta Petani Sekitar</h1>
          <p className="m-0 text-keterangan text-teks-pendukung">
            Petani mitra terdekat dengan stok siap panen dan pesanan aktif (~1 km dari titik persis).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Pilihan radius */}
          <div className="flex rounded-lg border border-garis bg-putih p-1">
            <button
              type="button"
              onClick={() => setRadiusKm(10)}
              className={`rounded-md px-3 py-1.5 font-medium ${
                radiusKm === 10
                  ? 'bg-daun text-putih'
                  : 'text-teks hover:bg-embun-pagi'
              }`}
            >
              Radius 10 km
            </button>
            <button
              type="button"
              onClick={() => setRadiusKm(15)}
              className={`rounded-md px-3 py-1.5 font-medium ${
                radiusKm === 15
                  ? 'bg-daun text-putih'
                  : 'text-teks hover:bg-embun-pagi'
              }`}
            >
              Radius 15 km
            </button>
          </div>

          {/* Toggle Peta / Daftar */}
          <div className="flex rounded-lg border border-garis bg-putih p-1">
            <button
              type="button"
              onClick={() => setTampilan('peta')}
              className={`rounded-md px-3 py-1.5 font-medium ${
                tampilan === 'peta'
                  ? 'bg-tanah text-putih'
                  : 'text-teks hover:bg-embun-pagi'
              }`}
            >
              Peta
            </button>
            <button
              type="button"
              onClick={() => setTampilan('daftar')}
              className={`rounded-md px-3 py-1.5 font-medium ${
                tampilan === 'daftar'
                  ? 'bg-tanah text-putih'
                  : 'text-teks hover:bg-embun-pagi'
              }`}
            >
              Daftar ({daftarPetani.length})
            </button>
          </div>
        </div>
      </div>

      {/* Kartu Lokasimu sekarang (F-08, AG-35) */}
      <div
        id="kartu-lokasi-pembeli"
        className="rounded-xl border border-garis bg-putih p-4 shadow-kartu"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="text-judul-bagian" aria-hidden="true">
              📍
            </span>
            <div>
              <h2 className="text-isi font-bold text-teks">
                Lokasimu sekarang: Desa {namaDesa}, Kec. {namaKecamatan}
              </h2>
              <p className="mt-0.5 text-keterangan text-teks-pendukung">
                Sumber lokasi:{' '}
                <span className="font-medium text-teks">{sumberLokasi}</span>
              </p>
            </div>
          </div>
          <button
            id="tombol-perbarui-lokasi"
            type="button"
            onClick={mintaLokasiGps}
            disabled={sedangMencariGps}
            className="fokus-cincin inline-flex items-center justify-center gap-1.5 rounded-lg border border-garis bg-embun-pagi px-3.5 py-2 text-keterangan font-semibold text-daun-tua hover:bg-daun-lembut transition-colors disabled:opacity-50"
          >
            <Ikon nama="putar" ukuran={16} />
            <span>{sedangMencariGps ? 'Mencari lokasi…' : 'Perbarui lokasi'}</span>
          </button>
        </div>
        {pesanIzinDitolak ? (
          <div className="mt-3 rounded-lg border border-tanah/30 bg-tanah-lembut/40 px-3 py-2 text-keterangan text-tanah-tua">
            {pesanIzinDitolak}
          </div>
        ) : null}
      </div>

      {petaQ.isPending ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-garis bg-putih p-8 text-teks-pendukung">
          Memuat titik petani di radius {radiusKm} km...
        </div>
      ) : null}

      {/* Tampilan Peta */}
      {tampilan === 'peta' ? (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="relative min-h-96 flex-1 overflow-hidden rounded-2xl border border-garis bg-putih">
            <div
              id="wadah-leaflet"
              ref={wadahPetaRef}
              className="h-96 w-full z-0"
            />
            <div className="border-t border-garis bg-putih p-3 text-keterangan text-teks-pendukung">
              Penanda hijau: Petani mitra (~1 km). Penanda cokelat: Lokasimu sekarang.
            </div>
          </div>

          {/* Panel detail petani terpilih */}
          <div className="w-full lg:w-80">
            {petaniTerpilih ? (
              <Kartu judul={petaniTerpilih.nama} tingkatJudul={2}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar nama={petaniTerpilih.nama} ukuran={44} />
                    <div className="flex flex-col">
                      <span className="font-semibold text-teks">{petaniTerpilih.nama}</span>
                      <span className="text-keterangan text-teks-pendukung">
                        {petaniTerpilih.level.ikon} Level {petaniTerpilih.level.level} • Jarak ~{angkaJarak(petaniTerpilih.jarak_km)} km
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="m-0 mb-2 font-medium text-teks">Stok Siap Jual</h3>
                    {petaniTerpilih.stok_tersedia.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {petaniTerpilih.stok_tersedia.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between rounded-lg border border-garis bg-embun-pagi/40 p-2.5"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-teks">{s.komoditas_nama}</span>
                              <span className="text-keterangan text-teks-pendukung">
                                Sisa: {s.sisa_kg} kg
                              </span>
                            </div>
                            <span className="font-semibold text-daun-tua">
                              {formatRupiah(s.harga_per_kg)}/kg
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="m-0 text-keterangan text-teks-pendukung">
                        Belum ada stok siap jual saat ini (menerima pesanan tanam).
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <Tombol
                      varian="utama"
                      onClick={() => navigate(`/pembeli/stok`)}
                    >
                      Beli Stok
                    </Tombol>
                    <button
                      type="button"
                      onClick={() => {
                        // Di F-09 tombol ini akan membuka percakapan chat dengan petani
                        navigate(`/chat?tujuan=${petaniTerpilih.id}`);
                      }}
                      className={kelasTombol('sekunder')}
                    >
                      Tanya lewat Chat
                    </button>
                  </div>
                </div>
              </Kartu>
            ) : (
              <Kartu judul="Pilih petani" tingkatJudul={2}>
                <p className="m-0 text-keterangan text-teks-pendukung">
                  Klik penanda petani di peta untuk melihat level petani dan stok hasil panen yang siap dijual.
                </p>
              </Kartu>
            )}
          </div>
        </div>
      ) : (
        /* Tampilan Daftar */
        <div className="flex flex-col gap-4">
          {daftarPetani.length === 0 ? (
            <Kartu judul="Tidak ada petani" tingkatJudul={2}>
              <p className="m-0 text-teks-pendukung">
                Belum ada petani di radius {radiusKm} km yang menampilkan lokasi atau memiliki stok aktif.
              </p>
            </Kartu>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {daftarPetani.map((p) => (
                <Kartu key={p.id} judul={p.nama} tingkatJudul={2}>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar nama={p.nama} ukuran={40} />
                      <div className="flex flex-col">
                        <span className="font-semibold text-teks">{p.nama}</span>
                        <span className="text-keterangan text-teks-pendukung">
                          {p.level.ikon} Level {p.level.level} • ~{angkaJarak(p.jarak_km)} km
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-garis pt-2">
                      <span className="font-medium text-teks">
                        {p.stok_tersedia.length} komoditas siap panen
                      </span>
                      {p.stok_tersedia.map((s) => (
                        <div key={s.id} className="mt-1 flex justify-between text-keterangan">
                          <span className="text-teks-pendukung">{s.komoditas_nama} ({s.sisa_kg} kg)</span>
                          <span className="font-semibold text-daun-tua">{formatRupiah(s.harga_per_kg)}/kg</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/chat?tujuan=${p.id}`)}
                        className={kelasTombol('sekunder', true)}
                      >
                        Tanya lewat Chat
                      </button>
                    </div>
                  </div>
                </Kartu>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
