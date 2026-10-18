import React from 'react';
import {
  IkonBenihTunas,
  IkonBukuTerbuka,
  IkonKalkulator,
  IkonGembor,
  IkonKeranjang,
  IkonTimbangan,
  IkonGrafikTurun,
  IkonDaunUlat,
  IkonRantai,
  IkonTruk,
  IkonKameraDaun,
  IkonGelembungChat,
  IkonCuaca,
  IkonKotakStok,
  IkonPetaniMuda,
  IkonKoin,
  IkonPinBertunas,
} from './koleksi-ikon';
import { WARNA_IKON } from './tipe';

export const DAFTAR_IKON = [
  { id: 'benih-tunas', nama: 'Benih & Tunas', peran: 'Awal siklus / germinasi', Komp: IkonBenihTunas },
  { id: 'buku-terbuka', nama: 'Buku Terbuka', peran: 'Pilar 1: Belajar & Resep', Komp: IkonBukuTerbuka },
  { id: 'kalkulator', nama: 'Kalkulator', peran: 'Pilar 2: Hitung modal & BEP', Komp: IkonKalkulator },
  { id: 'gembor', nama: 'Gembor Penyiram', peran: 'Pilar 3: Rawat harian', Komp: IkonGembor },
  { id: 'keranjang', nama: 'Keranjang Panen', peran: 'Pilar 4: Panen & Jual', Komp: IkonKeranjang },
  { id: 'timbangan', nama: 'Timbangan Hasil', peran: 'Bobot panen & keadilan', Komp: IkonTimbangan },
  { id: 'grafik-turun', nama: 'Grafik Harga Jatuh', peran: 'Krisis panen melimpah', Komp: IkonGrafikTurun },
  { id: 'daun-ulat', nama: 'Daun & Hama Ulat', peran: 'Risiko gagal panen', Komp: IkonDaunUlat },
  { id: 'rantai', nama: 'Rantai Tengkulak', peran: 'Potongan rantai pasok', Komp: IkonRantai },
  { id: 'truk', nama: 'Truk Pengiriman', peran: 'Distribusi panen tanpa tujuan', Komp: IkonTruk },
  { id: 'kamera-daun', nama: 'Kamera Tanaman', peran: 'Deteksi gejala daun (AI)', Komp: IkonKameraDaun },
  { id: 'gelembung-chat', nama: 'Gelembung Chat', peran: 'Chatbot & pesan petani', Komp: IkonGelembungChat },
  { id: 'cuaca', nama: 'Cuaca Terpadu', peran: 'BMKG, hujan & matahari', Komp: IkonCuaca },
  { id: 'kotak-stok', nama: 'Kotak Stok', peran: 'Stok siap jual sekitar', Komp: IkonKotakStok },
  { id: 'petani-muda', nama: 'Petani Muda', peran: 'Generasi penerus 2045', Komp: IkonPetaniMuda },
  { id: 'koin', nama: 'Koin Emas', peran: 'Uang muka & dana aman', Komp: IkonKoin },
  { id: 'pin-bertunas', nama: 'Pin Bertunas', peran: 'Peta petani & privasi', Komp: IkonPinBertunas },
];

export const LembarPratinjauIkon: React.FC = () => {
  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: '#faf8f5',
        backgroundImage: 'radial-gradient(#e5ded2 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        padding: '50px 70px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
        color: '#1b4332',
      }}
    >
      {/* Header Lembar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: '2px solid #e5ded2',
          paddingBottom: 24,
          marginBottom: 36,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: WARNA_IKON.daunTerang,
              marginBottom: 6,
            }}
          >
            Spesifikasi Desain Tani Muda [AG-43]
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#1b4332' }}>
            Set Ikon SVG Buatan Sendiri (Handcrafted)
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: 15, color: '#6b7280', lineHeight: 1.5 }}>
          <div><strong>Grid:</strong> 64 × 64 px · <strong>Garis:</strong> 4 px · <strong>Ujung:</strong> Membulat</div>
          <div>Dua warna token · Path terpisah untuk animasi kinetik (evolvePath)</div>
        </div>
      </div>

      {/* Grid 17 Ikon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 20,
          flex: 1,
        }}
      >
        {DAFTAR_IKON.map((item, index) => {
          const Komp = item.Komp;
          return (
            <div
              key={item.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #eae3d7',
                borderRadius: 16,
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(27, 67, 50, 0.04)',
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  backgroundColor: '#f7f4ee',
                  borderRadius: 12,
                }}
              >
                <Komp size={60} strokeWidth={4} />
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 2 }}>
                #{String(index + 1).padStart(2, '0')} · {item.id}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1b4332', marginBottom: 2 }}>
                {item.nama}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {item.peran}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Catatan Anti-Slop */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid #e5ded2',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 14,
          color: '#6b7280',
        }}
      >
        <div>
          ✓ 100% SVG orisinal Tani Muda · Tanpa pustaka ikon luar (anti-slop) · Tanpa emoji
        </div>
        <div>
          Tani Muda Video Teaser [AG-43]
        </div>
      </div>
    </div>
  );
};
