/**
 * Skrip satu kali untuk mengambil titik tengah 576 kecamatan Jawa Tengah dari Nominatim OpenStreetMap (D-67, AG-41).
 * 
 * Aturan pemakaian Nominatim:
 * - User-Agent yang jelas dan bermakna.
 * - Paling banyak 1 permintaan per detik (diatur dengan jeda minimal 1.050 ms).
 * - Hasil disimpan di shared/wilayah/titik-kecamatan-jateng.json.
 * - Bersifat incremental/resumable: jika skrip terhenti, akan melanjutkan dari data yang sudah tersimpan.
 */
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AKAR_PROYEK = path.resolve(__dirname, '../..');

const JALUR_WILAYAH_SQL = path.join(AKAR_PROYEK, 'shared/wilayah/wilayah.sql');
const JALUR_OUTPUT = path.join(AKAR_PROYEK, 'shared/wilayah/titik-kecamatan-jateng.json');

const USER_AGENT = 'TaniMuda-Jateng-Init/1.0 (https://tanimuda.id; kontak: admin@tanimuda.id)';
const JEDA_MS = 1100; // Paling banyak 1 permintaan per detik

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function bacaWilayahJateng() {
  const fileStream = fs.createReadStream(JALUR_WILAYAH_SQL, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const kabMap = new Map();
  const kecList = [];

  const regex = /\('([0-9.]+)','((?:[^']|'')*)'\)/g;

  for await (const line of rl) {
    let match;
    while ((match = regex.exec(line)) !== null) {
      const [, kode, namaRaw] = match;
      const nama = namaRaw.replace(/''/g, "'");

      if (kode.startsWith('33.')) {
        const parts = kode.split('.');
        if (parts.length === 2) {
          kabMap.set(kode, nama);
        } else if (parts.length === 3) {
          kecList.push({
            kode,
            nama,
            kabupaten_id: `${parts[0]}.${parts[1]}`,
            kabupaten: kabMap.get(`${parts[0]}.${parts[1]}`) || '',
          });
        }
      }
    }
  }

  return { kabMap, kecList };
}

async function cariNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'id',
      },
    });
    if (!res.ok) {
      console.warn(`[HTTP ${res.status}] untuk kueri: ${query}`);
      return null;
    }
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lintang: parseFloat(parseFloat(data[0].lat).toFixed(4)),
        bujur: parseFloat(parseFloat(data[0].lon).toFixed(4)),
        osm_id: data[0].osm_id,
        osm_type: data[0].osm_type,
        display_name: data[0].display_name,
      };
    }
  } catch (err) {
    console.error(`Gagal menghubungi Nominatim untuk "${query}":`, err.message);
  }
  return null;
}

async function main() {
  console.log('Membaca dataset wilayah Jawa Tengah (provinsi 33)...');
  const { kabMap, kecList } = await bacaWilayahJateng();
  console.log(`Ditemukan ${kabMap.size} kabupaten/kota dan ${kecList.length} kecamatan di Jawa Tengah.`);

  let hasil = {
    sumber: 'Nominatim OpenStreetMap',
    tanggal_ambil: new Date().toISOString().slice(0, 10),
    lisensi: 'ODbL 1.0 (c) kontributor OpenStreetMap',
    atribusi: '© kontributor OpenStreetMap',
    keterangan: 'Titik tengah kecamatan Jawa Tengah (576 kecamatan) dari Nominatim OpenStreetMap. Kecamatan yang tidak ditemukan diisi titik tengah kabupatennya.',
    kabupaten: {},
    kecamatan: {},
    tidak_ditemukan: [],
  };

  if (fs.existsSync(JALUR_OUTPUT)) {
    try {
      const dataLama = JSON.parse(fs.readFileSync(JALUR_OUTPUT, 'utf8'));
      if (dataLama.kecamatan) {
        hasil = { ...hasil, ...dataLama };
        console.log(`Melanjutkan dari berkas yang ada: ${Object.keys(hasil.kecamatan).length} kecamatan sudah tersimpan.`);
      }
    } catch {
      console.warn('Berkas output lama rusak, memulai baru.');
    }
  }

  // 1. Ambil titik tengah kabupaten/kota jika belum ada
  console.log('\n--- Memeriksa / mengambil titik tengah 35 Kabupaten/Kota ---');
  for (const [kodeKab, namaKab] of kabMap.entries()) {
    if (!hasil.kabupaten[kodeKab]) {
      console.log(`Mengambil titik kabupaten: ${namaKab} (${kodeKab})...`);
      const q = `${namaKab}, Jawa Tengah, Indonesia`;
      const res = await cariNominatim(q);
      await sleep(JEDA_MS);

      if (res) {
        hasil.kabupaten[kodeKab] = {
          nama: namaKab,
          lintang: res.lintang,
          bujur: res.bujur,
          osm_id: res.osm_id,
        };
        console.log(`  ✓ ${namaKab}: [${res.lintang}, ${res.bujur}]`);
      } else {
        console.warn(`  ✗ Kabupaten tidak ditemukan: ${namaKab}`);
      }
      fs.writeFileSync(JALUR_OUTPUT, JSON.stringify(hasil, null, 2), 'utf8');
    }
  }

  // 2. Ambil titik tengah setiap kecamatan
  console.log(`\n--- Memeriksa / mengambil titik tengah ${kecList.length} Kecamatan ---`);
  let diproses = 0;
  for (const kec of kecList) {
    diproses++;
    if (hasil.kecamatan[kec.kode]) {
      continue;
    }

    const namaKabBersih = kec.kabupaten.replace(/^(Kabupaten|Kota)\s+/i, '');
    let res;

    // Upaya 1: "Kecamatan {nama}, {kabupaten}, Jawa Tengah"
    const q1 = `Kecamatan ${kec.nama}, ${kec.kabupaten}, Jawa Tengah`;
    res = await cariNominatim(q1);
    await sleep(JEDA_MS);

    // Upaya 2: "{nama}, {kabupaten}, Jawa Tengah"
    if (!res) {
      const q2 = `${kec.nama}, ${namaKabBersih}, Jawa Tengah`;
      res = await cariNominatim(q2);
      await sleep(JEDA_MS);
    }

    if (res) {
      hasil.kecamatan[kec.kode] = {
        nama: kec.nama,
        kabupaten_id: kec.kabupaten_id,
        kabupaten: kec.kabupaten,
        lintang: res.lintang,
        bujur: res.bujur,
        ditemukan: true,
        osm_id: res.osm_id,
      };
      console.log(`[${diproses}/${kecList.length}] ✓ ${kec.nama} (${kec.kabupaten}): [${res.lintang}, ${res.bujur}]`);
    } else {
      // Fallback ke kabupaten
      const kabTitik = hasil.kabupaten[kec.kabupaten_id];
      hasil.kecamatan[kec.kode] = {
        nama: kec.nama,
        kabupaten_id: kec.kabupaten_id,
        kabupaten: kec.kabupaten,
        lintang: kabTitik?.lintang ?? -7.15,
        bujur: kabTitik?.bujur ?? 110.14,
        ditemukan: false,
        keterangan: 'Memakai titik tengah kabupaten karena tidak ditemukan di Nominatim',
      };
      if (!hasil.tidak_ditemukan.includes(kec.kode)) {
        hasil.tidak_ditemukan.push({
          kode: kec.kode,
          nama: kec.nama,
          kabupaten: kec.kabupaten,
        });
      }
      console.log(`[${diproses}/${kecList.length}] ✗ ${kec.nama} (${kec.kabupaten}) -> FALLBACK KABUPATEN`);
    }

    // Simpan berkala setiap item
    fs.writeFileSync(JALUR_OUTPUT, JSON.stringify(hasil, null, 2), 'utf8');
  }

  console.log('\nSelesai! Berkas tersimpan di:', JALUR_OUTPUT);
  console.log(`Total kecamatan diproses: ${Object.keys(hasil.kecamatan).length}`);
  console.log(`Tidak ditemukan (memakai titik kabupaten): ${hasil.tidak_ditemukan.length}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
