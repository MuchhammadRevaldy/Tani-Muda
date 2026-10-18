/**
 * Ekspor laporan deteksi penyakit tanaman AI ke format PDF (F-04).
 * Menghasilkan berkas PDF 1.4 murni tanpa pustaka eksternal agar ukuran bundel tetap di bawah 200 kB.
 */
export interface DugaanPdf {
  nama: string;
  keyakinan: string;
  alasan: string;
}

export interface DataLaporanDeteksi {
  id: string;
  dibuat_pada: string;
  hasil: {
    dugaan: DugaanPdf[];
    gejala_terlihat?: string[];
    langkah_aman?: string[];
    perlu_penyuluh?: boolean;
    catatan?: string | null;
  };
}

function bersihkanTeksPdf(teks: string): string {
  return (teks || '')
    .replace(/[()\\]/g, '\\$&')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

function pecahBaris(teks: string, batasKarakter = 80): string[] {
  const kata = (teks || '').replace(/\s+/g, ' ').trim().split(' ');
  const daftarBaris: string[] = [];
  let barisSaatIni = '';

  for (const k of kata) {
    if (!barisSaatIni) {
      barisSaatIni = k;
    } else if (barisSaatIni.length + 1 + k.length <= batasKarakter) {
      barisSaatIni += ' ' + k;
    } else {
      daftarBaris.push(barisSaatIni);
      barisSaatIni = k;
    }
  }
  if (barisSaatIni) {
    daftarBaris.push(barisSaatIni);
  }
  return daftarBaris;
}

export function buatPdfDeteksiBytes(deteksi: DataLaporanDeteksi, catatanPetani?: string): Uint8Array {
  const perintahGrafis: string[] = [];

  const tambahTeks = (teks: string, x: number, y: number, ukuran = 10, tebal = false) => {
    const font = tebal ? '/F2' : '/F1';
    perintahGrafis.push(
      `BT ${font} ${ukuran} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${bersihkanTeksPdf(teks)}) Tj ET`,
    );
  };

  const tambahKotak = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    g: number,
    b: number,
    isi = true,
  ) => {
    perintahGrafis.push(
      `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} ${isi ? 'rg' : 'RG'} ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${isi ? 'f' : 's'}`,
    );
  };

  let posisiY = 785;

  // Header banner hijau Tani Muda (3D6B0E -> 0.239, 0.420, 0.055)
  tambahKotak(40, posisiY - 12, 515, 48, 0.239, 0.42, 0.055, true);
  perintahGrafis.push('1.000 1.000 1.000 rg');
  tambahTeks('TANI MUDA', 55, posisiY + 16, 16, true);
  tambahTeks('Laporan Hasil Analisis Kesehatan Tanaman (AI)', 55, posisiY - 2, 10, false);

  posisiY -= 42;

  // Metadata dokumen
  perintahGrafis.push('0.180 0.208 0.278 rg');
  const waktuTeks = new Date(deteksi.dibuat_pada).toLocaleString('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  });
  tambahTeks(`Waktu Analisis: ${waktuTeks} WIB`, 55, posisiY, 9, false);
  tambahTeks(`ID Analisis: ${deteksi.id}`, 380, posisiY, 9, false);
  posisiY -= 16;

  // Garis pemisah
  tambahKotak(40, posisiY, 515, 1, 0.933, 0.941, 0.953, true);
  posisiY -= 22;

  // Catatan petani bila ada
  if (catatanPetani?.trim()) {
    tambahKotak(45, posisiY - 26, 505, 34, 0.969, 0.973, 0.98, true);
    tambahKotak(45, posisiY - 26, 505, 34, 0.933, 0.941, 0.953, false);
    perintahGrafis.push('0.239 0.420 0.055 rg');
    tambahTeks('Catatan Gejala Tambahan dari Petani:', 55, posisiY - 4, 9, true);
    perintahGrafis.push('0.180 0.208 0.278 rg');
    tambahTeks(`"${catatanPetani.trim()}"`, 55, posisiY - 18, 9, false);
    posisiY -= 42;
  }

  // Bagian: Dugaan Masalah
  perintahGrafis.push('0.180 0.208 0.278 rg');
  tambahTeks('DUGAAN MASALAH UTAMA', 55, posisiY, 11, true);
  posisiY -= 18;

  for (const d of deteksi.hasil.dugaan) {
    const barisAlasan = pecahBaris(d.alasan, 85);
    const tinggiKotak = Math.max(48, 28 + barisAlasan.length * 12);

    // Kotak kartu dugaan
    tambahKotak(45, posisiY - tinggiKotak + 12, 505, tinggiKotak, 0.969, 0.973, 0.98, true);
    tambahKotak(45, posisiY - tinggiKotak + 12, 505, tinggiKotak, 0.933, 0.941, 0.953, false);

    // Judul dugaan
    perintahGrafis.push('0.180 0.208 0.278 rg');
    tambahTeks(d.nama.slice(0, 60), 55, posisiY - 2, 10, true);

    // Kapsul Keyakinan
    let warnaKapsul = [0.239, 0.42, 0.055];
    if (d.keyakinan === 'sedang') warnaKapsul = [0.541, 0.322, 0.0];
    else if (d.keyakinan === 'rendah') warnaKapsul = [0.408, 0.439, 0.514];

    perintahGrafis.push(`${warnaKapsul[0]} ${warnaKapsul[1]} ${warnaKapsul[2]} rg`);
    tambahTeks(`Keyakinan: ${d.keyakinan.toUpperCase()}`, 425, posisiY - 2, 9, true);

    // Alasan penjelasan
    perintahGrafis.push('0.408 0.439 0.514 rg');
    let offsetY = posisiY - 18;
    for (const b of barisAlasan) {
      tambahTeks(b, 55, offsetY, 8.5, false);
      offsetY -= 12;
    }

    posisiY -= tinggiKotak + 12;
  }

  // Bagian: Gejala Terlihat
  if (deteksi.hasil.gejala_terlihat && deteksi.hasil.gejala_terlihat.length > 0) {
    perintahGrafis.push('0.180 0.208 0.278 rg');
    tambahTeks('GEJALA YANG TERAMATI', 55, posisiY, 10, true);
    posisiY -= 15;
    for (const g of deteksi.hasil.gejala_terlihat) {
      const barisG = pecahBaris(g, 90);
      for (const [idx, bg] of barisG.entries()) {
        tambahTeks(idx === 0 ? `•  ${bg}` : `   ${bg}`, 60, posisiY, 8.5, false);
        posisiY -= 12;
      }
    }
    posisiY -= 8;
  }

  // Bagian: Langkah Penanganan Aman
  if (deteksi.hasil.langkah_aman && deteksi.hasil.langkah_aman.length > 0) {
    perintahGrafis.push('0.180 0.208 0.278 rg');
    tambahTeks('LANGKAH PENANGANAN AMAN', 55, posisiY, 10, true);
    posisiY -= 15;
    for (const l of deteksi.hasil.langkah_aman) {
      const barisL = pecahBaris(l, 90);
      for (const [idx, bl] of barisL.entries()) {
        tambahTeks(idx === 0 ? `•  ${bl}` : `   ${bl}`, 60, posisiY, 8.5, false);
        posisiY -= 12;
      }
    }
    posisiY -= 8;
  }

  // Banner Peringatan & Konsultasi PPL
  tambahKotak(45, posisiY - 30, 505, 38, 1.0, 0.961, 0.878, true);
  tambahKotak(45, posisiY - 30, 505, 38, 0.961, 0.647, 0.141, false);
  perintahGrafis.push('0.541 0.322 0.000 rg');
  tambahTeks('PERHATIAN & SARAN KONSULTASI PPL:', 55, posisiY - 4, 9, true);
  tambahTeks(
    'Rekomendasi ini bersifat pendukung awal budidaya. Dilarang menggunakan obat atau pestisida',
    55,
    posisiY - 17,
    8,
    false,
  );
  tambahTeks(
    'keras tanpa rekomendasi dari Penyuluh Pertanian Lapangan (PPL) desa setempat.',
    55,
    posisiY - 27,
    8,
    false,
  );

  // Footer resmi Tani Muda
  perintahGrafis.push('0.600 0.600 0.600 rg');
  tambahTeks('Platform Pertanian Presisi Tani Muda · Dokumen ini sah dicetak sebagai arsip kebun.', 55, 30, 8, false);

  const isiAliran = perintahGrafis.join('\n');
  const panjangAliran = new TextEncoder().encode(isiAliran).length;

  let dokumenPdf = `%PDF-1.4\n`;
  const offsetObjek: number[] = [];

  const tambahObjek = (str: string) => {
    offsetObjek.push(new TextEncoder().encode(dokumenPdf).length);
    dokumenPdf += str + '\n';
  };

  tambahObjek(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);
  tambahObjek(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`);
  tambahObjek(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`,
  );
  tambahObjek(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);
  tambahObjek(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);
  tambahObjek(`6 0 obj\n<< /Length ${panjangAliran} >>\nstream\n${isiAliran}\nendstream\nendobj`);

  const offsetTabelXref = new TextEncoder().encode(dokumenPdf).length;
  dokumenPdf += `xref\n0 7\n0000000000 65535 f \n`;
  for (const off of offsetObjek) {
    dokumenPdf += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  dokumenPdf += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${offsetTabelXref}\n%%EOF\n`;

  return new TextEncoder().encode(dokumenPdf);
}

/**
 * Menyimpan / mengunduh berkas laporan deteksi PDF langsung ke perangkat pengguna.
 */
export function unduhLaporanDeteksiPdf(deteksi: DataLaporanDeteksi, catatanPetani?: string): void {
  const bytePdf = buatPdfDeteksiBytes(deteksi, catatanPetani);
  const blob = new Blob([bytePdf.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const tautan = document.createElement('a');
  tautan.href = url;
  const tanggalFormat = new Date(deteksi.dibuat_pada).toISOString().slice(0, 10);
  tautan.download = `laporan-deteksi-tani-muda-${tanggalFormat}.pdf`;
  document.body.appendChild(tautan);
  tautan.click();

  setTimeout(() => {
    document.body.removeChild(tautan);
    URL.revokeObjectURL(url);
  }, 1000);
}
